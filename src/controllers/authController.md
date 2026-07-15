# authController — Overview

Responsibilities
- Handle user registration, login, and profile retrieval.
- Issue JWTs and validate credentials via the `User` model.

Main functions
- `register(req, res, next)` — validate input, create user, return success or error.
- `login(req, res, next)` — verify credentials, return access token.
- `getProfile(req, res, next)` — return the authenticated user's profile (requires `authenticate` middleware).

Routes
- `POST /api/auth/register` — uses `registerValidation` middleware.
- `POST /api/auth/login` — uses `loginValidation` middleware.
- `GET /api/auth/me` — protected by `authenticate` middleware.

Middleware used
- Input validation: `src/middlewares/validators.js`
- Authentication: `src/middlewares/auth.js`

Typical flow
1. Request -> route (`/api/auth/login`) -> `loginValidation`.
2. Controller verifies credentials via models/services.
3. On success: controller responds with token and user info; on failure: respond `401` or pass error to `next(err)`.

Notes
- Keep token generation and verification in a shared helper (e.g., `src/config/jwt.js`).
- Throw or `next(err)` for unexpected errors so global handler in `src/app.js` formats the response.
