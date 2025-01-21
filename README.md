# Gamified Educational Platform

A secure and interactive learning platform with anti-plagiarism features and gamification elements.

## Features

### For Administrators
- PDF Upload and Auto-Division
- Content Management System
- Student Progress Tracking
- Analytics Dashboard
- Security Controls

### For Students
- Interactive Learning Map
- Progress Tracking
- Achievements and Rewards
- Protected Content Viewing
- Mobile Responsive Interface

### Security Features
- Content Copy Protection
- Screen Capture Prevention
- Invisible Watermarking
- Developer Tools Blocking
- Secure Authentication

## Tech Stack

- Frontend: React.js
- Backend: Supabase
- Database: PostgreSQL (via Supabase)
- Authentication: Supabase Auth
- File Storage: Supabase Storage

## Setup Instructions

1. Install dependencies:
```bash
# Install frontend dependencies
cd client
npm install
```

2. Configure Supabase:
- Create a Supabase project at https://supabase.com
- Copy your project URL and anon key
- Create a `.env` file in the `client` directory with:
  ```
  REACT_APP_SUPABASE_URL=your_project_url
  REACT_APP_SUPABASE_ANON_KEY=your_anon_key
  ```

3. Set up the database:
- Go to the SQL Editor in your Supabase dashboard
- Copy and paste the contents of `supabase/schema.sql`
- Run the SQL queries to create all necessary tables and policies

4. Start the development server:
```bash
cd client
npm start
```

5. Create the first admin user:
- Access the application at http://localhost:3000
- Click on "Criar Usuário Admin Inicial"
- Use the provided credentials to log in
- Change the admin password immediately after first login

## Database Schema

### Tables
- `profiles`: User profiles and roles
- `modules`: Educational content and metadata
- `progress`: Student progress tracking
- `achievements`: User achievements and badges

### Security Policies
- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Secure user data isolation

## Security Notes

This platform implements several layers of content protection:
- Client-side copy prevention
- Server-side authentication
- Content watermarking
- Screen capture prevention
- Developer tools blocking
- Row Level Security in database

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.
