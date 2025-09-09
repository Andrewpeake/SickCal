#!/bin/bash

# SickCal Environment Setup Script

echo "🚀 Setting up SickCal environment variables..."

# Create .env file
cat > .env << EOF
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://iokadfmtoqletjlafwwg.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here

# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
EOF

echo "✅ Created .env file with your Supabase URL"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Supabase dashboard: https://supabase.com/dashboard"
echo "2. Select your project: iokadfmtoqletjlafwwg"
echo "3. Go to Settings > API"
echo "4. Copy the 'anon public' key"
echo "5. Replace 'your_anon_key_here' in the .env file with your actual key"
echo ""
echo "🔧 To get your API key:"
echo "   - Visit: https://supabase.com/dashboard/project/iokadfmtoqletjlafwwg/settings/api"
echo "   - Copy the 'anon public' key"
echo ""
echo "📊 To set up the database:"
echo "   - Go to SQL Editor in your Supabase dashboard"
echo "   - Copy and paste the contents of backend/database/schema.sql"
echo "   - Execute the SQL to create all tables"
echo ""
echo "🎉 Once you've added your API key, run 'npm start' to launch the app!"

