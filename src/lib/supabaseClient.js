// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdhopbgiuttrhcqpghyc.supabase.co';
const SUPABASE_ANON_KEY = 
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkaG9wYmdpdXR0cmhjcXBnaHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5NjE1MDIsImV4cCI6MjA0NDUzNzUwMn0.a_ALUkOTpKCva7o18_WyJiPjF6EQmjBhCsXQPkT9i1I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
