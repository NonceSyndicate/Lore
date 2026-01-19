import { Inngest } from 'inngest';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (conditional for build-time safety)
export const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) ||
    (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  ? createClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  : null;