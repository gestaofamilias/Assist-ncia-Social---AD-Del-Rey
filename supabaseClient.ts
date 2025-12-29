import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eoucrpqfgxmfosjertvd.supabase.co';
const supabaseKey = 'sb_publishable_XFr4mobcVuvhNrexVJxs8g_qiMxv7Wq';

export const supabase = createClient(supabaseUrl, supabaseKey);