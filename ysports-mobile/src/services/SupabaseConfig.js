import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL    = 'https://ubdsrjeewmzcpxrcqbif.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_F4f9bKP7Wt6tLEl_0eiTPw_NdKwB2P2';

function _make() {
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (e) {
    console.warn('[Supabase] createClient failed:', e.message);
    return null;
  }
}

export const supabase = _make();
