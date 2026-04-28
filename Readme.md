# Content Broadcasting System

Backend system for educational content distribution with role-based access control and content scheduling.

## Tech Stack

- Node.js + Express
- PostgreSQL
- JWT Authentication
- Multer (File Upload)

## Setup Instructions

1. Clone repository
2. Install dependencies: `npm install`
3. Create PostgreSQL database
4. Copy `.env.example` to `.env` and configure
5. Run seed: `node scripts/seed.js`
6. Start server: `npm run dev`

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login

### Content (Teacher)
- POST `/api/content/upload` - Upload content (requires file)
- GET `/api/content/my-content` - View uploaded content

### Approval (Principal)
- GET `/api/approval/pending` - View pending content
- GET `/api/approval/all` - View all content
- PATCH `/api/approval/:id/approve` - Approve content
- PATCH `/api/approval/:id/reject` - Reject content

### Broadcasting (Public)
- GET `/api/broadcast/live/:teacherId` - Get active content
- GET `/api/broadcast/live/:teacherId?subject=maths` - Filter by subject

## deployement 
Health Check: https://content-broadcasting-system-h4uo.onrender.com/health 

## Testing Flow

1. Register principal and teacher
2. Login as teacher, upload content with time window
3. Login as principal, approve content
4. Access public endpoint to see rotating content