# Real-Time-Polling-and-content-broadcasting-system

Professional README — recruiter-focused summary, setup, and docs

**Live Demo Links**

- Health check: https://content-broadcasting-system-h4uo.onrender.com/health
- Production app: https://content-broadcasting-system-three.vercel.app/

<h2>📸 Screenshots</h2>

<p align="center">
  <img src="readme_files/Landing_Page.png" width="45%" />
  <img src="readme_files/Principal's_Dashboard.png" width="45%" />
</p>

<p align="center">
  <img src="readme_files/Teacher's_Poll&Contents.png" width="45%" /> 
  <img src="readme_files/Student's_View.png" width="45%" />
</p>

**Project Overview**

This Content Broadcasting System is an educational platform backend and frontend built to schedule, approve, and broadcast classroom content in real time. It includes role-based workflows (Principal, Teacher, Student), content approval pipelines, scheduled broadcasts, polls, and real-time updates via WebSockets.

**Why it matters (for recruiters)**
- Built for scale and real-time responsiveness using `socket.io` and Redis.
- Secure, standards-based auth and validation (JWT, bcrypt, Joi/express-validator).
- Container-ready: production Dockerfiles and `docker-compose` for repeatable deployment.
- Designed with clear separation of concerns: controllers, services, and middlewares.

**Features**

- Role-based access control: Principal/Teacher/Student flows.
- Content upload and S3-backed storage with approval workflow.
- Scheduled broadcasts and live feed per teacher/subject.
- Real-time polls and live results with persistent votes.
- Input validation, rate limiting, and basic security hardening.
- DB seeding utilities and deployment-ready workflow.

**Architecture Diagram**

```mermaid
graph LR
	subgraph Client
		FE[React + Vite SPA]
	end
	FE -->|REST / Socket| API[Node.js + Express]
	API --> DB[(PostgreSQL)]
	API --> S3[AWS S3]
	API -->|Pub/Sub| Redis[(Redis / ioredis)]
	API -->|WebSocket| Clients[Socket.io Clients]
	subgraph Infra
		API -->|Runs in| AppContainer[Docker]
		DB -->|Runs in| DbContainer[Docker]
	end
```

**Tech Stack**

- Backend: Node.js, Express, Sequelize
- Real-time: socket.io, socket.io-client
- Database: PostgreSQL (pg, pg-hstore)
- Caching/Coordination: Redis (`ioredis` / `redis`)
- File storage: AWS S3 (`aws-sdk`, `multer-s3`)
- Auth & Security: `jsonwebtoken`, `bcrypt`, `express-rate-limit`, `validator`
- Validation: `joi`, `express-validator`
- Frontend: React, Vite, Tailwind CSS, Axios, React Router
- Dev tooling: Docker, docker-compose, Nodemon, ESLint

**Database Schema (high level)**

- `User` — id, name, email, password_hash, role(enum: principal, teacher, student), createdAt, updatedAt
- `Content` — id, title, description, s3_key, teacherId(FK->User), subject, status(enum: pending, approved, rejected), scheduledAt, createdAt
- `Approval` — id, contentId(FK), principalId(FK->User), decision(enum), notes, decidedAt
- `Poll` — id, question, options(json), createdBy(FK->User), startsAt, endsAt
- `Vote` — id, pollId(FK), userId(FK->User), choice, createdAt

See `src/models` for Sequelize model definitions.

**API Documentation (selected endpoints)**

- Authentication
  - `POST /api/auth/register` — body: `{name,email,password,role}`
  - `POST /api/auth/login` — body: `{email,password}` -> returns `{ token }`

- Content
  - `POST /api/content/upload` (teacher) — multipart/form-data: `file`, `title`, `subject`, `scheduledAt`
  - `GET /api/content/my-content` (teacher)
  - `GET /api/content/public` (public feed)

- Approval (principal)
  - `GET /api/approval/pending` — list pending content
  - `PATCH /api/approval/:id/approve` — body: `{notes}`

- Polls
  - `POST /api/polls` — create poll
  - `POST /api/polls/:id/vote` — cast vote (requires auth)

Authentication: send `Authorization: Bearer <token>` header for protected routes.

For full route list and request/response examples see `src/routes` and controller JSDoc comments.

**Deployment Guide**

Prerequisites: Docker (or Node 18+), PostgreSQL, Redis, AWS credentials (S3)

Quick local (Node)

```bash
git clone <repo>
cd content-broadcasting-system
cp .env.example .env
# update .env with DB, REDIS, S3, JWT_SECRET
npm install
node scripts/seed.js   # optional
npm run dev
```

Docker (recommended)

```bash
docker-compose up --build
# API: http://localhost:3000
# Frontend: http://localhost:5173
```

Key environment variables

- `DATABASE_URL` or `DB_HOST, DB_USER, DB_PASS, DB_NAME`
- `REDIS_URL`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`
- `JWT_SECRET`


**Swagger / OpenAPI Docs**

- This repo includes a static `swagger.yaml` file at the repository root.
- Recommended next step: add `swagger-ui-express` or another Swagger UI layer to expose `/api-docs`.
- Once exposed, update this section with the actual Swagger UI URL and spec location.

**WebSocket Events**

- `teacher_content_uploaded`
- `content_approved`
- `poll_created`
- `poll_vote_received`
- `poll_results_updated`

**Caching & Performance (Redis)**

This project uses Redis for caching and optimizing database queries.

- **Configuration**: `src/config/redis.js`
- **URL**: Configured via `REDIS_URL` environment variable (defaults to `redis://localhost:6379`)
- **Fallback**: App gracefully degrades if Redis is unavailable (logs warning and continues)

**Cache API**

```javascript
const { getClient, getCache, setCache, deleteCache } = require('../config/redis');

// Get cached data
const cachedData = await getCache('my-key');

// Set cache with TTL (Time To Live in seconds)
await setCache('my-key', { data: 'value' }, 60); // 60 second TTL

// Delete cache
await deleteCache('my-key');
```

**Rate Limiting**

Rate limiting middleware prevents abuse and protects API endpoints from being overwhelmed. Configured in `src/middlewares/rateLimiter.js`.

**Available Limiters**

- **apiLimiter**: General API endpoints
  - Window: 15 minutes
  - Max requests: 100 per window

- **authLimiter**: Authentication endpoints (login, register)
  - Window: 15 minutes
  - Max requests: 5 per window (strict to prevent brute force)

- **broadcastLimiter**: Real-time broadcast endpoints
  - Window: 1 minute
  - Max requests: 60 per window

**Usage in Routes**

```javascript
const { apiLimiter, authLimiter, broadcastLimiter } = require('../middlewares/rateLimiter');

// Apply to auth routes
router.post('/login', authLimiter, loginController);

// Apply to general API routes
router.get('/content', apiLimiter, getContentController);

// Apply to broadcast routes
router.post('/broadcast', broadcastLimiter, broadcastController);
```

**Response on Rate Limit**

When a user exceeds the rate limit, they receive a 429 (Too Many Requests) response:

```json
{
  "success": false,
  "error": "Too many requests, please try again after [time period]."
}
```

These events are part of the real-time Socket.IO integration and make the system stand out for live classroom updates.

**Automated Tests**

- Current repo test utilities:
  - `test-auth.js`
  - `test-db.js`
  - `test-s3.js`
  - `test-supabase.js`
- These are manual verification scripts and not an automated test suite.
- Recommended next step: add a test framework such as Jest or Mocha and write 10–15 unit/integration tests for auth, content upload, approval, broadcasting, and poll flows.

**CI / CD**

- The repository contains a GitHub Actions workflow: `.github/workflows/deploy.yml`
- Current deployment flow:
  1. Push to `main`
  2. GitHub Action checks out the repo
  3. SSH deploy to EC2 via `appleboy/ssh-action`
  4. Runs `docker compose up -d --build`
- Notes: CI is configured for deployment; add test and lint steps to the workflow to enforce quality before deploy.

**Demo Credentials**

- Principal: `principal@school.com` / `Password123!`
- Teacher: `teacher@school.com` / `Password123!`
- Student: `student@school.com` / `Password123!`

These are seeded in `scripts/seed.js` (adjust passwords and env as needed).

**Testing & Utilities**

- Manual test scripts are available in the repo.
- Run frontend linting via `cd frontend && npm run lint`.



---



