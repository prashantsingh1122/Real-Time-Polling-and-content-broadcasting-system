# pollController

## Overview

`src/controllers/pollController.js` manages polls: creation, listing active polls, recording votes, and poll lifecycle operations.

---

## What this controller does

- Creates and updates polls (teacher-only actions).
- Returns active polls for users to view.
- Accepts and records votes, updating totals and enforcing voting rules.

---

## Main logic flow

### Create / Manage polls
1. Teacher routes (`POST /api/polls`, `GET /api/polls/my-polls`, `PATCH /api/polls/:id/toggle`, etc.) run `authenticate` + `authorize('teacher')`.
2. Controller validates business rules (options present, end_time in future), creates or updates poll records, and returns responses.

### Vote
1. Public route `POST /api/polls/:id/vote` receives vote payload.
2. Controller validates payload, enforces vote uniqueness rules (per user/ip), and records the vote via `Vote` model.
3. Controller returns updated totals or success status.

---

## Project flow summary

1. Routes in `src/routes/pollRoutes.js` attach authentication and RBAC where needed.
2. Controllers keep vote and poll logic, while models persist counts and enforce data constraints.
3. Consider middleware or services for rate limiting and anti-abuse on voting endpoints.

---

## Error handling

- Missing or invalid poll data → `400 Bad Request`.
- Poll not found → `404`.
- Duplicate vote or rule violation → `409 Conflict` (or `400` depending on policy).
- Unexpected DB or service error → `500`.

Implement uniqueness constraints in the DB where applicable to avoid race conditions.

---

## Important files involved

- `src/controllers/pollController.js`
- `src/routes/pollRoutes.js`
- `src/models/Poll.js` and `src/models/Vote.js`
- `src/middlewares/auth.js` and `src/middlewares/rbac.js`

---

## In short

Keep controller logic focused on poll rules and persistence; use middleware and DB constraints to enforce request shape and uniqueness.
