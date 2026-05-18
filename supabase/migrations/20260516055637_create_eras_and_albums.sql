/*
  # Era Log — Initial Schema

  ## New Tables

  ### eras
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to auth.users)
  - `band_name` (text) — name of the band/artist
  - `band_mbid` (text, nullable) — MusicBrainz ID
  - `genres` (text[], nullable) — tags from MusicBrainz
  - `start_date` (date) — when the obsession began
  - `end_date` (date, nullable) — null means still ongoing
  - `obsession_level` (int2, 1–5) — intensity indicator
  - `note` (text, nullable) — personal note
  - `created_at` (timestamptz)

  ### albums (Super Fan feature)
  - `id` (uuid, primary key)
  - `era_id` (uuid, FK to eras)
  - `user_id` (uuid, FK to auth.users)
  - `title` (text)
  - `note` (text, nullable)
  - `listened_on` (date, nullable)
  - `created_at` (timestamptz)

  ### profiles
  - `id` (uuid, FK to auth.users, primary key)
  - `is_super_fan` (boolean) — paid upgrade status
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_super_fan boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Eras table
CREATE TABLE IF NOT EXISTS eras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  band_name text NOT NULL,
  band_mbid text,
  genres text[] DEFAULT '{}',
  start_date date NOT NULL,
  end_date date,
  obsession_level int2 NOT NULL CHECK (obsession_level BETWEEN 1 AND 5),
  note text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE eras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own eras"
  ON eras FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own eras"
  ON eras FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own eras"
  ON eras FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own eras"
  ON eras FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Albums table (Super Fan only)
CREATE TABLE IF NOT EXISTS albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  era_id uuid NOT NULL REFERENCES eras(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  note text DEFAULT '',
  listened_on date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own albums"
  ON albums FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own albums"
  ON albums FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own albums"
  ON albums FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own albums"
  ON albums FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
