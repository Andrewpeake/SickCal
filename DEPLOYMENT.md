# SickCal Deployment Guide

This guide covers deploying the SickCal application with its cloud database and API layer.

## Overview

The SickCal application now consists of:
- **Frontend**: React app (port 3000)
- **Backend**: Node.js/Express API (port 3001)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **GitHub Account**: For code repository
3. **Deployment Platform Account**: Choose from options below

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `sickcal-production`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
5. Click "Create new project"

### 1.2 Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `backend/database/schema.sql`
3. Paste and execute the SQL to create all tables and policies
4. Verify tables are created in the Table Editor

### 1.3 Get API Keys

1. Go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key (keep this secret!)

## Step 2: Deploy Backend API

### Option A: Deploy to Heroku

1. **Install Heroku CLI** and login:
```bash
heroku login
```

2. **Create Heroku app**:
```bash
cd backend
heroku create sickcal-api
```

3. **Set environment variables**:
```bash
heroku config:set SUPABASE_URL=your_supabase_url
heroku config:set SUPABASE_ANON_KEY=your_anon_key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend-domain.com
```

4. **Deploy**:
```bash
git add .
git commit -m "Deploy backend"
git push heroku main
```

### Option B: Deploy to Railway

1. **Connect GitHub**:
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the `backend` folder

2. **Set environment variables** in Railway dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NODE_ENV=production`
   - `FRONTEND_URL`

3. **Deploy**: Railway will automatically deploy on push

### Option C: Deploy to DigitalOcean App Platform

1. **Create App**:
   - Go to DigitalOcean App Platform
   - Connect GitHub repository
   - Select `backend` folder as source

2. **Configure**:
   - Runtime: Node.js
   - Build Command: `npm install`
   - Run Command: `npm start`

3. **Set environment variables** in the dashboard

### Option D: Deploy with Docker

1. **Build and push to registry**:
```bash
cd backend
docker build -t your-registry/sickcal-api .
docker push your-registry/sickcal-api
```

2. **Deploy to your container platform** (AWS ECS, Google Cloud Run, etc.)

## Step 3: Deploy Frontend

### Option A: Deploy to Vercel

1. **Connect GitHub**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Configure build settings**:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

3. **Set environment variables**:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_API_URL` (your backend URL)

4. **Deploy**: Vercel will automatically deploy

### Option B: Deploy to Netlify

1. **Connect GitHub**:
   - Go to [netlify.com](https://netlify.com)
   - Connect your repository

2. **Configure build settings**:
   - Build Command: `npm run build`
   - Publish Directory: `build`

3. **Set environment variables** in Site Settings

### Option C: Deploy to GitHub Pages

1. **Install gh-pages**:
```bash
npm install --save-dev gh-pages
```

2. **Add scripts to package.json**:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

3. **Deploy**:
```bash
npm run deploy
```

## Step 4: Configure Environment Variables

### Frontend Environment Variables

Create `.env.production` in your frontend root:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_API_URL=https://your-backend-domain.com/api
```

### Backend Environment Variables

Set these in your deployment platform:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
PORT=3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Step 5: Test Deployment

### 5.1 Test Backend

1. **Health check**:
```bash
curl https://your-backend-domain.com/health
```

2. **Test authentication** (requires frontend):
   - Sign up for a new account
   - Verify user is created in Supabase Auth

### 5.2 Test Frontend

1. **Visit your frontend URL**
2. **Sign up for a new account**
3. **Create an event or task**
4. **Verify data persists** after refresh
5. **Test on different devices** to verify sync

## Step 6: Set Up Custom Domain (Optional)

### For Frontend (Vercel/Netlify)

1. **Add domain** in your platform dashboard
2. **Configure DNS**:
   - Add CNAME record pointing to your platform
   - Or use A records for apex domains

### For Backend

1. **Configure custom domain** in your platform
2. **Update CORS settings** to include your custom domain
3. **Update frontend environment variables**

## Step 7: Monitoring and Maintenance

### 7.1 Set Up Monitoring

- **Uptime monitoring**: Use UptimeRobot or similar
- **Error tracking**: Consider Sentry for error monitoring
- **Analytics**: Add Google Analytics or similar

### 7.2 Database Maintenance

- **Monitor usage** in Supabase dashboard
- **Set up backups** (automatic with Supabase)
- **Monitor performance** and optimize queries if needed

### 7.3 Security

- **Regular security updates** for dependencies
- **Monitor for vulnerabilities**
- **Review access logs** regularly

## Troubleshooting

### Common Issues

1. **CORS errors**:
   - Check `FRONTEND_URL` in backend environment variables
   - Ensure frontend URL matches exactly

2. **Authentication not working**:
   - Verify Supabase URL and keys
   - Check RLS policies are enabled
   - Verify user is created in Supabase Auth

3. **Data not syncing**:
   - Check network requests in browser dev tools
   - Verify API endpoints are accessible
   - Check backend logs for errors

4. **Build failures**:
   - Check environment variables are set
   - Verify all dependencies are installed
   - Check build logs for specific errors

### Getting Help

1. **Check logs** in your deployment platform
2. **Test locally** with production environment variables
3. **Verify Supabase** dashboard for database issues
4. **Check browser console** for frontend errors

## Cost Optimization

### Supabase
- **Free tier**: 500MB database, 2GB bandwidth
- **Pro tier**: $25/month for more resources

### Hosting Platforms
- **Vercel**: Free tier with generous limits
- **Netlify**: Free tier available
- **Heroku**: $7/month for basic dyno
- **Railway**: Pay-per-use pricing

### Recommendations
- Start with free tiers
- Monitor usage and upgrade as needed
- Consider serverless options for cost efficiency

## Next Steps

1. **Set up CI/CD** for automatic deployments
2. **Add automated testing** to your pipeline
3. **Implement backup strategies**
4. **Set up monitoring and alerting**
5. **Plan for scaling** as your user base grows

## Support

For issues with this deployment guide:
1. Check the troubleshooting section
2. Review platform-specific documentation
3. Check Supabase documentation
4. Open an issue in the repository

