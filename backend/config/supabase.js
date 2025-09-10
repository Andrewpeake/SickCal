const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase, supabaseAdmin;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url') {
  console.warn('⚠️  Missing Supabase environment variables - using mock values for development');
  // Use mock values for development
  const mockUrl = 'https://mock.supabase.co';
  const mockKey = 'mock-anon-key';
  
  supabase = createClient(mockUrl, mockKey);
  supabaseAdmin = createClient(mockUrl, 'mock-service-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  // Client for general operations
  supabase = createClient(supabaseUrl, supabaseKey);

  // Admin client for server-side operations
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

module.exports = {
  supabase,
  supabaseAdmin
};

