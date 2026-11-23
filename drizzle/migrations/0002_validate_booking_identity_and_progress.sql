ALTER TABLE public.bookings ADD COLUMN availability_status text NOT NULL DEFAULT 'pending' CHECK (availability_status IN ('pending','available','unavailable'));
CREATE OR REPLACE FUNCTION public.guard_booking_progress() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE s jsonb; registered_phone text;
BEGIN
 IF TG_OP = 'INSERT' THEN
  s := NEW.student_info;
  IF jsonb_typeof(s) <> 'object' OR octet_length(s::text) > 12000 THEN RAISE EXCEPTION 'Invalid student details'; END IF;
  IF NOT (s ?& ARRAY['fullName','birthDate','citizenship','turkishId','nationality','identity','phone','email','university','enrollment','requests']) THEN RAISE EXCEPTION 'Missing student details'; END IF;
  IF length(trim(s->>'fullName')) NOT BETWEEN 2 AND 100 OR length(trim(s->>'university')) NOT BETWEEN 2 AND 200 OR length(s->>'requests') > 1000 OR length(s->>'email') > 255 THEN RAISE EXCEPTION 'Invalid field lengths'; END IF;
  IF s->>'birthDate' !~ '^\d{4}-\d{2}-\d{2}$' OR (s->>'birthDate')::date >= CURRENT_DATE THEN RAISE EXCEPTION 'Invalid birth date'; END IF;
  IF s->>'citizenship' NOT IN ('turkish','international') OR s->>'enrollment' NOT IN ('enrolled','accepted','pending') THEN RAISE EXCEPTION 'Invalid student category'; END IF;
  IF s->>'citizenship' = 'turkish' AND s->>'turkishId' !~ '^[1-9]\d{10}$' THEN RAISE EXCEPTION 'Turkish identity required'; END IF;
  IF s->>'citizenship' = 'international' AND (length(trim(s->>'nationality')) NOT BETWEEN 2 AND 100 OR length(trim(s->>'identity')) NOT BETWEEN 4 AND 50 OR s->>'identity' !~ '^[[:alnum:] -]+$') THEN RAISE EXCEPTION 'International identity required'; END IF;
  IF s->>'phone' !~ '^\+[1-9]\d{6,14}$' OR (s->>'email' <> '' AND s->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') THEN RAISE EXCEPTION 'Invalid contact details'; END IF;
  SELECT phone INTO registered_phone FROM public.profiles WHERE id=NEW.student_id;
  IF registered_phone IS NULL OR s->>'phone' IS DISTINCT FROM registered_phone THEN RAISE EXCEPTION 'Registered phone required'; END IF;
 END IF;
 IF TG_OP = 'UPDATE' AND NEW.payment_status = 'received' AND OLD.payment_status <> 'received' THEN NEW.status := 'pending_confirmation'; END IF;
 IF NEW.availability_status = 'unavailable' AND NEW.payment_status IN ('received','refunded') THEN
  NEW.status := 'cancelled';
  IF NEW.payment_status = 'received' AND NEW.refund_status = 'not_requested' THEN NEW.refund_status := 'pending'; END IF;
 END IF;
 IF NEW.payment_status <> 'received' AND NEW.status IN ('pending_confirmation','booking_confirmed','contract_pending','contract_signed','check_in_completed') THEN RAISE EXCEPTION 'Confirmed payment required'; END IF;
 IF NEW.status IN ('booking_confirmed','contract_pending','contract_signed','check_in_completed') AND NEW.availability_status <> 'available' THEN RAISE EXCEPTION 'Final room availability required'; END IF;
 IF NEW.remaining_rent <> NEW.total_rent - NEW.deposit THEN RAISE EXCEPTION 'Deposit must be credited toward rent'; END IF;
 RETURN NEW;
END $$;