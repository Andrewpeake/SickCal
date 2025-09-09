// Simple test to verify Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iokadfmtoqletjlafwwg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlva2FkZm10b3FsZXRqbGFmd3dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODU3NTUsImV4cCI6MjA3Mjg2MTc1NX0.HeKdbBGB2PQYXze2K6LIwagl-sZu_JE0AXLqQoXNQY0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error);
  } else {
    console.log('✅ Supabase connection successful!');
    console.log('Current session:', data.session ? 'User logged in' : 'No user logged in');
  }
});

export default supabase;

