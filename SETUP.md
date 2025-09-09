# SickCal Setup Guide

This guide will help you set up SickCal with cloud database and API integration.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here

# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the schema from `backend/database/schema.sql`
3. Copy your project URL and anon key to the `.env` file

### 4. Start the Application

```bash
npm start
```

The app will run on `http://localhost:3000`

## Features

### Without Authentication (Local Mode)
- All data stored in localStorage
- Works offline
- No cross-device sync

### With Authentication (Cloud Mode)
- Data synced to cloud database
- Cross-device synchronization
- User isolation and security
- Automatic backups

## Backend Setup (Optional)

To run the full stack with API:

1. Navigate to the backend directory:
```bash
cd backend
npm install
```

2. Create `.env` file in backend directory:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

3. Start the backend server:
```bash
npm run dev
```

## Troubleshooting

### Common Issues

1. **"Cannot find module '@supabase/supabase-js'"**
   - Run `npm install @supabase/supabase-js`

2. **Authentication not working**
   - Check your Supabase URL and keys in `.env`
   - Ensure RLS policies are enabled in Supabase

3. **API calls failing**
   - Make sure the backend server is running on port 3001
   - Check CORS settings in backend

4. **Data not syncing**
   - Verify you're signed in (check the header for user email)
   - Check browser console for API errors

### Getting Help

1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Ensure Supabase project is active and accessible
4. Check network requests in browser dev tools

## Next Steps

- Set up production deployment (see DEPLOYMENT.md)
- Configure custom domain
- Set up monitoring and analytics
- Add automated testing

