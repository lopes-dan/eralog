/*
  # Fix example era image URLs

  The previous migration used Deezer CDN URLs which are unreliable and often
  return 403/404. This migration replaces them with stable Wikimedia Commons
  URLs for the two seeded example eras (The Smiths and Nirvana).

  Because we cannot identify which rows belong to which user reliably in a
  migration, we update the trigger function so all future sign-ups get the
  correct URLs. Existing seeded rows with the broken Deezer URLs are also
  patched directly.

  1. Updates trigger: handle_new_user() — new Wikimedia image URLs
  2. Patches existing rows with the old broken Deezer URLs
*/

-- Patch any existing rows that have the broken Deezer URLs
UPDATE public.eras
SET band_image_url = 'https://upload.wikimedia.org/wikipedia/commons/6/68/The_Smiths_%281984_Sire_publicity_photo%29_002.jpg'
WHERE band_name = 'The Smiths'
  AND band_image_url = 'https://e-cdns-images.dzcdn.net/images/artist/ce4de4e0396cff87ee2e76e11d37b9b5/500x500-000000-80-0-0.jpg';

UPDATE public.eras
SET band_image_url = 'https://upload.wikimedia.org/wikipedia/commons/1/19/Nirvana_around_1992.jpg'
WHERE band_name = 'Nirvana'
  AND band_image_url = 'https://e-cdns-images.dzcdn.net/images/artist/1289b5d13a2dbbdcefc7f9eb2df31ed5/500x500-000000-80-0-0.jpg';

-- Update the trigger function with correct image URLs for future sign-ups
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
    'https://upload.wikimedia.org/wikipedia/commons/6/68/The_Smiths_%281984_Sire_publicity_photo%29_002.jpg'
  );

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
    'https://upload.wikimedia.org/wikipedia/commons/1/19/Nirvana_around_1992.jpg'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
