# Supabase Setup for SickCal

Your Supabase project URL: `https://iokadfmtoqletjlafwwg.supabase.co`

## Step 1: Get Your API Keys

1. **Go to your Supabase dashboard**: https://supabase.com/dashboard/project/iokadfmtoqletjlafwwg/settings/api

2. **Copy the API keys**:
   - **Project URL**: `https://iokadfmtoqletjlafwwg.supabase.co` ✅ (already set)
   - **Anon public key**: Copy this key (starts with `eyJ...`)
   - **Service role key**: Copy this key (keep it secret!)

3. **Update your .env file**:
   ```env
   REACT_APP_SUPABASE_URL=https://iokadfmtoqletjlafwwg.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJ...your_actual_anon_key_here
   REACT_APP_API_URL=http://localhost:3001/api
   ```

## Step 2: Set Up Database Schema

1. **Go to SQL Editor**: https://supabase.com/dashboard/project/iokadfmtoqletjlafwwg/sql

2. **Copy the schema**: Open `backend/database/schema.sql` in your project

3. **Paste and execute**: Copy the entire contents and run it in the SQL Editor

4. **Verify tables**: Go to Table Editor to confirm all tables are created:
   - `profiles`
   - `events`
   - `tasks`
   - `user_settings`
   - `projects`
   - `project_tasks`
   - `project_milestones`

## Step 3: Enable Authentication

1. **Go to Authentication**: https://supabase.com/dashboard/project/iokadfmtoqletjlafwwg/auth/providers

2. **Enable Email provider** (should be enabled by default)

3. **Configure settings**:
   - Enable email confirmations (optional)
   - Set up email templates (optional)

## Step 4: Test the Setup

1. **Start the app**:
   ```bash
   npm start
   ```

2. **Test authentication**:
   - Click "Sign In" in the app
   - Try creating a new account
   - Verify the user appears in Supabase Auth

3. **Test data sync**:
   - Create an event or task
   - Check if it appears in your Supabase database
   - Refresh the page to verify data persists

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**:
   - Double-check your anon key in the .env file
   - Make sure there are no extra spaces or quotes

2. **"Table doesn't exist" error**:
   - Run the database schema again
   - Check that all tables were created successfully

3. **Authentication not working**:
   - Verify email provider is enabled
   - Check browser console for errors
   - Ensure RLS policies are active

### Quick Links

- **Dashboard**: https://supabase.com/dashboard/project/iokadfmtoqletjlafwwg
- **API Settings**: https://supabase.com/dashboard/project/iokadfmtoqletjlafwwg/settings/api
- **SQL Editor**: https://supabase.com/dashboard/project/iokadfmtoqletjlafwwg/sql
- **Table Editor**: https://supabase.com/dashboard/project/iokadfmtoqletjlafwwg/editor
- **Authentication**: https://supabase.com/dashboard/project/iokadfmtoqletjlafwwg/auth/users

## Next Steps

Once everything is working:

1. **Set up the backend** (optional): See `backend/README.md`
2. **Deploy to production**: See `DEPLOYMENT.md`
3. **Customize settings**: Modify the app to your preferences

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Ensure your Supabase project is active
4. Check the Supabase dashboard for any service issues

