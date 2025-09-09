# Database Setup for SickCal

## Quick Setup

1. **Go to your Supabase SQL Editor**: https://supabase.com/dashboard/project/iokadfmtoqletjlafwwg/sql

2. **Copy the entire contents** of `backend/database/schema.sql`

3. **Paste and execute** in the SQL Editor

4. **Verify tables were created** by going to the Table Editor

## What the Schema Creates

### Tables
- **`profiles`** - User profile information
- **`events`** - Calendar events
- **`tasks`** - Task management
- **`user_settings`** - User preferences and settings
- **`projects`** - Project management
- **`project_tasks`** - Tasks within projects
- **`project_milestones`** - Project milestones

### Security Features
- **Row Level Security (RLS)** - Users can only access their own data
- **Authentication policies** - Secure access control
- **Automatic user profile creation** - When users sign up

### Indexes
- **Performance optimization** for common queries
- **Fast lookups** by user ID and dates

## Step-by-Step Instructions

### 1. Open SQL Editor
- Go to: https://supabase.com/dashboard/project/iokadfmtoqletjlafwwg/sql
- Click "New Query"

### 2. Copy Schema
- Open `backend/database/schema.sql` in your project
- Select all content (Ctrl+A / Cmd+A)
- Copy (Ctrl+C / Cmd+C)

### 3. Paste and Run
- Paste into the SQL Editor
- Click "Run" or press Ctrl+Enter

### 4. Verify Success
You should see output like:
```
CREATE EXTENSION
CREATE TABLE
CREATE TABLE
CREATE TABLE
...
```

### 5. Check Tables
- Go to Table Editor: https://supabase.com/dashboard/project/iokadfmtoqletjlafwwg/editor
- You should see all 7 tables listed

## Troubleshooting

### If you get errors:

1. **"Extension already exists"** - This is normal, ignore it
2. **"Table already exists"** - Drop existing tables first:
   ```sql
   DROP TABLE IF EXISTS project_milestones CASCADE;
   DROP TABLE IF EXISTS project_tasks CASCADE;
   DROP TABLE IF EXISTS projects CASCADE;
   DROP TABLE IF EXISTS user_settings CASCADE;
   DROP TABLE IF EXISTS tasks CASCADE;
   DROP TABLE IF EXISTS events CASCADE;
   DROP TABLE IF EXISTS profiles CASCADE;
   ```

3. **Permission errors** - Make sure you're using the SQL Editor, not the Table Editor

### Verify RLS is enabled:
- Go to each table in the Table Editor
- Check that "RLS" is enabled (should show a shield icon)

## Testing the Setup

Once the schema is created:

1. **Start your app**: `npm start`
2. **Sign up for a new account** in the app
3. **Check Supabase Auth**: https://supabase.com/dashboard/project/iokadfmtoqletjlafwwg/auth/users
4. **Create an event or task** in the app
5. **Check the database**: Look in the `events` or `tasks` table

## Next Steps

After database setup:
- ✅ Your app will sync data to the cloud
- ✅ Users can access their data from any device
- ✅ Data is automatically backed up
- ✅ Each user's data is completely isolated

## Support

If you encounter issues:
1. Check the Supabase dashboard for any service issues
2. Verify your project is active and not paused
3. Make sure you have the correct permissions
4. Check the SQL Editor logs for specific error messages

