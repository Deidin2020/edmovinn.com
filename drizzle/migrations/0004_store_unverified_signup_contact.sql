CREATE OR REPLACE FUNCTION public.create_student_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE contact_phone text;
BEGIN
 contact_phone := coalesce(nullif(NEW.phone, ''), NEW.raw_user_meta_data->>'contact_phone');
 IF contact_phone IS NOT NULL AND contact_phone !~ '^\+[1-9][0-9]{7,14}$' THEN contact_phone := NULL; END IF;
 INSERT INTO public.profiles (id, full_name, phone, phone_verified)
 VALUES (NEW.id, left(trim(coalesce(NEW.raw_user_meta_data->>'full_name', '')), 100), contact_phone, false);
 RETURN NEW;
END;
$$;