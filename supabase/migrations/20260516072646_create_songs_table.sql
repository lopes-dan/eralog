/*
  # Create songs table

  1. New Tables
    - `songs`
      - `id` (uuid, primary key)
      - `album_id` (uuid, foreign key to albums.id, cascade delete)
      - `user_id` (uuid, foreign key to auth.users.id)
      - `title` (text, required) - the song name
      - `track_number` (integer, optional) - position in album
      - `note` (text, optional) - personal note about the song
      - `is_favorite` (boolean, default false) - marks standout tracks
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `songs` table
    - Add policies for authenticated users to manage their own songs
*/

CREATE TABLE IF NOT EXISTS songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  track_number integer,
  note text DEFAULT '',
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own songs"
  ON songs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own songs"
  ON songs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own songs"
  ON songs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own songs"
  ON songs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
