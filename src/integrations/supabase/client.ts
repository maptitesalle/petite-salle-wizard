// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gdnrxajpcfbcfmonudwg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbnJ4YWpwY2ZiY2Ztb251ZHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNjk0MzMsImV4cCI6MjA1Njg0NTQzM30.ljLP3If09bn17H0L1IuSTbT0OQBii_lj9vKkaLHhEkM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);