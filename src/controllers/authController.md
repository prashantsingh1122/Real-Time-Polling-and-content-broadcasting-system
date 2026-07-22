# authController

## Overview

`src/controllers/authController.js` implements user authentication endpoints: registration, login, and profile retrieval. Controllers here perform business-level checks (DB lookups, password verification, token issuance) and return HTTP responses.

---

## What this controller does

- Registers new users and enforces basic business rules (unique email, allowed roles).
- Authenticates users (verify password) and issues JWTs.
- Returns the authenticated user's profile using information populated by the `authenticate` middleware.

---

## Main logic flow

### Register
1. Route receives `POST /api/auth/register` with payload `{ name, email, password, role }`.
2. Validation middleware should verify payload shape (see `registerValidation`).
3. Controller checks business rules: required fields, allowed `role`, email uniqueness.
4. If valid, create user record (password hashed by model hooks) and return `201` with user info.

### Login
1. Route receives `POST /api/auth/login` with `{ email, password }`.
2. Validation middleware should check presence/format (see `loginValidation`).
3. Controller finds the user, verifies password via `user.comparePassword()`.
4. On success, generate JWT using `src/config/jwt.js` settings and return token + user data.

### Get profile
1. Protected route `GET /api/auth/me` runs `authenticate` first.
2. Controller looks up user by `req.user.id` and returns profile data.

---

## Project flow summary

1. Client registers or logs in via routes in `src/routes/authRoutes.js`.
2. Request payload is validated by middleware in `src/middlewares/validators.js`.
3. Controller executes business logic and interacts with `src/models/User.js`.
4. JWTs are issued using `src/config/jwt.js` and returned to the client.
5. For protected endpoints, `src/middlewares/auth.js` verifies tokens and attaches `req.user`.

---

## Error handling

- Missing or malformed fields → return `400 Bad Request` (handled in validation middleware or controller pre-checks).
- Invalid credentials → return `401 Unauthorized`.
- Unexpected errors → `500 Internal Server Error` and pass message to global handler.

Always prefer early returns from middleware for schema errors to keep controller logic focused on business rules.

---

## Important files involved

- `src/controllers/authController.js`
- `src/routes/authRoutes.js`
- `src/middlewares/validators.js`
- `src/middlewares/auth.js`
- `src/config/jwt.js`
- `src/models/User.js`

---

## In short

Keep validation (shape, required fields, formats) in middleware; keep business checks and token logic in this controller.
