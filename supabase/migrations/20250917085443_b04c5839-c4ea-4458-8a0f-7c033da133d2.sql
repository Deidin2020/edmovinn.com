-- 1) Add role to profiles with safe defaults
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- Ensure only valid roles are used
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check CHECK (role IN ('user','admin'));
  END IF;
END $$;

-- 2) Create a SECURITY DEFINER helper to get current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- 3) Replace the restrictive SELECT policy on contact_submissions
DROP POLICY IF EXISTS "Only authenticated users can view submissions" ON public.contact_submissions;

CREATE POLICY "Admins can view contact submissions"
ON public.contact_submissions
FOR SELECT
USING (public.get_current_user_role() = 'admin');

-- Keep the existing INSERT policy as-is (anyone can submit contact forms)

-- 4) Prevent self-escalation of roles (only existing admins can change their role)
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Allow role changes only if the current row was already admin
    IF OLD.role <> 'admin' THEN
      RAISE EXCEPTION 'Only admins can change role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_escalation();