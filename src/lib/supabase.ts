import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Era = {
  id: string;
  user_id: string;
  band_name: string;
  band_mbid: string | null;
  band_image_url: string | null;
  genres: string[];
  start_date: string;
  end_date: string | null;
  obsession_level: number;
  note: string;
  created_at: string;
};

export type Album = {
  id: string;
  era_id: string;
  user_id: string;
  title: string;
  note: string;
  cover_url: string | null;
  listened_on: string | null;
  created_at: string;
};

export type Song = {
  id: string;
  album_id: string;
  user_id: string;
  title: string;
  track_number: number | null;
  note: string;
  is_favorite: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  is_super_fan: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
};
