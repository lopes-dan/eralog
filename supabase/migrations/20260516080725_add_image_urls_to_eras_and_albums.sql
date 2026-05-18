/*
  # Add image URL columns for Deezer integration

  1. Modified Tables
    - `eras`
      - `band_image_url` (text, nullable) - Deezer artist picture URL
    - `albums`
      - `cover_url` (text, nullable) - Deezer album cover URL

  2. Notes
    - Both columns are nullable since image fetch is best-effort
    - No default values needed; NULL means no image available
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'eras' AND column_name = 'band_image_url'
  ) THEN
    ALTER TABLE eras ADD COLUMN band_image_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'albums' AND column_name = 'cover_url'
  ) THEN
    ALTER TABLE albums ADD COLUMN cover_url text;
  END IF;
END $$;
