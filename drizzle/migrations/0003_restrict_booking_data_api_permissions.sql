REVOKE ALL ON public.bookings, public.booking_quotes FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.bookings, public.booking_quotes TO authenticated;
GRANT ALL ON public.bookings, public.booking_quotes TO service_role;
REVOKE ALL ON FUNCTION public.submit_student_booking(uuid,jsonb,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_student_booking(uuid,jsonb,text) TO authenticated;
CREATE FUNCTION public.validate_booking_student_json() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE k text;
BEGIN
 FOR k IN SELECT unnest(ARRAY['fullName','birthDate','citizenship','turkishId','nationality','identity','phone','email','university','enrollment','requests']) LOOP
  IF jsonb_typeof(NEW.student_info->k) IS DISTINCT FROM 'string' THEN RAISE EXCEPTION 'Student fields must be strings'; END IF;
 END LOOP;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_booking_student_json BEFORE INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.validate_booking_student_json();