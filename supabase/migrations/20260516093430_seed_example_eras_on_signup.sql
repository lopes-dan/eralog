/*
  # Seed example eras on new user signup

  Updates the handle_new_user trigger function to insert two example eras
  (The Smiths and Nirvana) for every new user so their timeline isn't empty
  on first login.

  1. Modified
    - `public.handle_new_user()` — now also inserts two example eras after
      creating the profile row.

  2. Example eras added per new user
    - The Smiths  (ended era, alt-rock / indie, obsession level 5)
    - Nirvana     (ended era, grunge / alt-rock, obsession level 5)

  3. Notes
    - Both eras use fixed past dates so they appear as "Past Eras".
    - Image URLs are stable Deezer CDN artist picture URLs.
    - The trigger runs as SECURITY DEFINER so it can write to public.eras
      on behalf of the new user even before their session exists.
    - ON CONFLICT (id) DO NOTHING on profiles ensures idempotency.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile row
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  -- Seed: The Smiths era
  INSERT INTO public.eras (
    user_id, band_name, band_mbid, genres,
    start_date, end_date,
    obsession_level, note, band_image_url
  ) VALUES (
    NEW.id,
    'The Smiths',
    'b8f20108-e6f0-4c8c-82c0-2c7e30bbf2f7',
    ARRAY['alternative rock', 'indie pop', 'post-punk'],
    '2023-03-01',
    '2023-06-15',
    5,
    'Morrissey''s lyricism hit different at 2am. Every song felt like it was written specifically to ruin me.',
    'https://e-cdns-images.dzcdn.net/images/artist/ce4de4e0396cff87ee2e76e11d37b9b5/500x500-000000-80-0-0.jpg'
  );

  -- Seed: Nirvana era
  INSERT INTO public.eras (
    user_id, band_name, band_mbid, genres,
    start_date, end_date,
    obsession_level, note, band_image_url
  ) VALUES (
    NEW.id,
    'Nirvana',
    '5b11f4ce-a62d-471e-81fc-a69a8278c7da',
    ARRAY['grunge', 'alternative rock', 'hard rock'],
    '2023-09-10',
    '2023-12-01',
    4,
    'Went back to Nevermind after years and it absolutely floored me again. In Utero is the better album though.',
    'https://e-cdns-images.dzcdn.net/images/artist/1289b5d13a2dbbdcefc7f9eb2df31ed5/500x500-000000-80-0-0.jpg'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
