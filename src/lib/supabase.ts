import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Thay thế bằng credentials từ Supabase project của bạn
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);