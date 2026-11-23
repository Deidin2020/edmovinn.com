CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 full_name text NOT NULL DEFAULT '' CHECK (char_length(full_name) <= 100),
 phone text CHECK (phone IS NULL OR phone ~ '^\+?[1-9][0-9]{6,14}$'),
 phone_verified boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own student profile" ON public.profiles FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);
CREATE POLICY "Update own student name" ON public.profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);
CREATE FUNCTION public.create_student_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
 INSERT INTO public.profiles (id, full_name, phone, phone_verified) VALUES (NEW.id, left(coalesce(NEW.raw_user_meta_data->>'full_name', ''), 100), nullif(NEW.phone, ''), false);
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.create_student_profile() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER create_student_profile_after_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_student_profile();