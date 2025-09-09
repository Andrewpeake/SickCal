# SickCal Backend

This is the backend API server for the SickCal calendar application, built with Node.js, Express, and Supabase.

## Features

- **Authentication**: User authentication with Supabase Auth
- **CRUD Operations**: Full CRUD operations for events, tasks, settings, and projects
- **Data Persistence**: Cloud database with PostgreSQL via Supabase
- **Security**: Row Level Security (RLS) policies for data isolation
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **CORS**: Configured for frontend integration

## Setup

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
```

3. Configure your `.env` file with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the database schema:
   - Go to your Supabase dashboard
   - Navigate to the SQL Editor
   - Copy and paste the contents of `database/schema.sql`
   - Execute the SQL to create all tables, indexes, and policies

3. Enable Row Level Security (RLS) is automatically configured in the schema

### Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/profile` - Create/update user profile
- `POST /api/auth/signout` - Sign out user

### Events
- `GET /api/events` - Get all events for authenticated user
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Tasks
- `GET /api/tasks` - Get all tasks for authenticated user
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings
- `POST /api/settings/reset` - Reset settings to defaults

### Projects
- `GET /api/projects` - Get all projects for authenticated user
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## Security

- All endpoints require authentication (except health check)
- Row Level Security (RLS) ensures users can only access their own data
- Rate limiting prevents abuse
- CORS configured for frontend integration
- Input validation on all endpoints

## Deployment

### Environment Variables for Production

```env
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Deployment Options

1. **Heroku**: Use the included `Procfile`
2. **Railway**: Connect your GitHub repository
3. **DigitalOcean App Platform**: Deploy from GitHub
4. **AWS/GCP/Azure**: Use container services

### Health Check

The server includes a health check endpoint at `/health` that returns:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

## Development

### Project Structure

```
backend/
├── config/
│   └── supabase.js          # Supabase client configuration
├── database/
│   └── schema.sql           # Database schema and migrations
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── events.js            # Event CRUD routes
│   ├── tasks.js             # Task CRUD routes
│   ├── settings.js          # Settings routes
│   └── projects.js          # Project CRUD routes
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

### Adding New Endpoints

1. Create a new route file in `routes/`
2. Add the route to `server.js`
3. Implement proper authentication and validation
4. Add corresponding database policies if needed

### Testing

```bash
npm test
```

## Troubleshooting

### Common Issues

1. **Authentication errors**: Check your Supabase credentials and RLS policies
2. **CORS errors**: Verify `FRONTEND_URL` in your environment variables
3. **Database connection**: Ensure your Supabase project is active and accessible
4. **Rate limiting**: Adjust rate limit settings if needed

### Logs

The server logs all errors and important events to the console. In production, consider using a logging service like Winston or similar.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see the main project README for details.

