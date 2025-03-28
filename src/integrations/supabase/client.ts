
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rqtncenvanahxthockwn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdG5jZW52YW5haHh0aG9ja3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNjEyMzMsImV4cCI6MjA1ODYzNzIzM30.QcAlzMuhNUAEzZnmuQZyJ_LUsPIyENboNbx6SXizgLE";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      storage: localStorage,
      autoRefreshToken: false, // Disable auto-refresh to rely on just the access token
    }
  }
);
