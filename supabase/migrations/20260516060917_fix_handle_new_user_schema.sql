/*
  # Fix handle_new_user trigger function

  The previous function referenced `profiles` without a schema qualifier.
  When executing as SECURITY DEFINER, the search_path may not include `public`,
  causing a "Database error saving new user" 500 on signup.

  This migration recreates the function with an explicit `public.profiles`
  reference and sets search_path = public to be safe.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
