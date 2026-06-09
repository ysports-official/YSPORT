import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ubdsrjeewmzcpxrcqbif.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_F4f9bKP7Wt6tLEl_0eiTPw_NdKwB2P2';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,  // Firebase Auth kullanılıyor, Supabase auth değil
    autoRefreshToken: false,
  },
});
