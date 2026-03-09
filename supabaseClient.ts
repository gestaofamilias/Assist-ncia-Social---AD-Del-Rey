
import { createClient } from '@supabase/supabase-js';

// No deploy da Vercel, configure estas variáveis no painel do projeto (Settings > Environment Variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eoucrpqfgxmfosjertvd.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_XFr4mobcVuvhNrexVJxs8g_qiMxv7Wq';

export const supabase = createClient(supabaseUrl, supabaseKey);
