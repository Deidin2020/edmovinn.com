CREATE TABLE public.booking_quotes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 residence_slug text NOT NULL CHECK (length(residence_slug) BETWEEN 1 AND 100),
 room_id text NOT NULL CHECK (length(room_id) BETWEEN 1 AND 100),
 move_in date NOT NULL,
 contract_end date NOT NULL CHECK (extract(month FROM contract_end) = 6),
 payment_plan text NOT NULL CHECK (payment_plan IN ('monthly','annual')),
 currency text NOT NULL CHECK (currency IN ('USD','TRY')),
 total_rent numeric(12,2) NOT NULL CHECK (total_rent > 0),
 deposit numeric(12,2) NOT NULL CHECK (deposit > 0 AND deposit <= total_rent),
 active boolean NOT NULL DEFAULT false,
 CHECK (move_in < contract_end), UNIQUE(residence_slug, room_id, move_in)
);
GRANT SELECT ON public.booking_quotes TO authenticated;
GRANT ALL ON public.booking_quotes TO service_role;
ALTER TABLE public.booking_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read active quotes" ON public.booking_quotes FOR SELECT TO authenticated USING (active);
COMMENT ON TABLE public.booking_quotes IS 'Trusted Edmovinn administrators configure date-specific academic contract quotes; never inherit illustrative room deposits or guess prorating.';
CREATE TABLE public.bookings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 student_id uuid NOT NULL,
 reference text NOT NULL UNIQUE DEFAULT ('EDM-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
 quote_id uuid NOT NULL REFERENCES public.booking_quotes(id),
 residence_slug text NOT NULL,
 room_id text NOT NULL,
 move_in date NOT NULL,
 contract_end date NOT NULL,
 payment_plan text NOT NULL,
 currency text NOT NULL,
 total_rent numeric(12,2) NOT NULL,
 deposit numeric(12,2) NOT NULL,
 remaining_rent numeric(12,2) NOT NULL,
 student_info jsonb NOT NULL,
 terms_version text NOT NULL,
 terms_accepted_at timestamptz NOT NULL DEFAULT now(),
 status text NOT NULL DEFAULT 'awaiting_payment' CHECK (status IN ('awaiting_payment','pending_confirmation','booking_confirmed','contract_pending','contract_signed','check_in_completed','cancelled')),
 payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','awaiting_payment_verification','received','failed','refunded')),
 contract_status text NOT NULL DEFAULT 'not_started' CHECK (contract_status IN ('not_started','pending','signed')),
 check_in_status text NOT NULL DEFAULT 'not_started' CHECK (check_in_status IN ('not_started','pending','completed')),
 refund_status text NOT NULL DEFAULT 'not_requested' CHECK (refund_status IN ('not_requested','pending','processing','refunded','failed')),
 residence_updates jsonb NOT NULL DEFAULT '[]',
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(student_id, quote_id)
);
GRANT SELECT ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own bookings" ON public.bookings FOR SELECT TO authenticated USING (student_id = (SELECT auth.uid()));
CREATE INDEX bookings_student_idx ON public.bookings(student_id, created_at DESC);
CREATE FUNCTION public.submit_student_booking(p_quote_id uuid, p_student_info jsonb, p_terms_version text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE q public.booking_quotes; result uuid; registered_phone text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 IF p_terms_version <> '2026-11-23-v1' THEN RAISE EXCEPTION 'Invalid terms version'; END IF;
 SELECT * INTO q FROM public.booking_quotes WHERE id = p_quote_id AND active FOR SHARE;
 IF q.id IS NULL OR q.move_in < CURRENT_DATE THEN RAISE EXCEPTION 'Quote unavailable'; END IF;
 SELECT phone INTO registered_phone FROM public.profiles WHERE id = auth.uid();
 IF registered_phone IS NULL OR p_student_info->>'phone' IS DISTINCT FROM registered_phone THEN RAISE EXCEPTION 'Registered phone required'; END IF;
 IF jsonb_typeof(p_student_info) <> 'object' OR octet_length(p_student_info::text) > 12000 THEN RAISE EXCEPTION 'Invalid student details'; END IF;
 INSERT INTO public.bookings(student_id,quote_id,residence_slug,room_id,move_in,contract_end,payment_plan,currency,total_rent,deposit,remaining_rent,student_info,terms_version)
 VALUES(auth.uid(),q.id,q.residence_slug,q.room_id,q.move_in,q.contract_end,q.payment_plan,q.currency,q.total_rent,q.deposit,q.total_rent-q.deposit,p_student_info,p_terms_version)
 ON CONFLICT(student_id,quote_id) DO NOTHING RETURNING id INTO result;
 IF result IS NULL THEN SELECT id INTO result FROM public.bookings WHERE student_id=auth.uid() AND quote_id=q.id; END IF;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.submit_student_booking(uuid,jsonb,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_student_booking(uuid,jsonb,text) TO authenticated;
CREATE FUNCTION public.guard_booking_progress() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.payment_status <> 'received' AND NEW.status IN ('pending_confirmation','booking_confirmed','contract_pending','contract_signed','check_in_completed') THEN RAISE EXCEPTION 'Confirmed payment required'; END IF;
 IF NEW.remaining_rent <> NEW.total_rent - NEW.deposit THEN RAISE EXCEPTION 'Deposit must be credited toward rent'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guard_booking_progress BEFORE INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.guard_booking_progress();