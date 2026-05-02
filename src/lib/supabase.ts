import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://llyzmigaidfzthljriwl.supabase.co';
const supabaseAnonKey = 'sb_publishable_4PjXoyuAsbD5NSmv9h0puw_R5pHUL1i';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
