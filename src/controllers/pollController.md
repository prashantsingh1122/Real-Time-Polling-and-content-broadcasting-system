# pollController — Overview

Responsibilities
- Create and manage polls, accept votes, and expose active polls.

Main functions
- `createPoll(req, res, next)` — create a new poll (teacher only).
- `getActivePolls(req, res, next)` — list polls that are currently active.
- `vote(req, res, next)` — record a vote for a poll (public or authenticated depending on route).
- `togglePoll(req, res, next)` / `deletePoll(req, res, next)` — manage poll lifecycle (teacher only).

Routes
- `GET /api/polls/active` — public.
- `POST /api/polls/:id/vote` — public in current design.
- Teacher routes (`POST /api/polls`, `GET /api/polls/my-polls`, etc.) are protected by `authenticate` + `authorize('teacher')`.

Middleware used
- `authenticate` and `authorize('teacher')` for management routes.
- Validation middleware for poll creation input where applicable.

Typical flow (vote)
1. Client POSTs vote -> route -> controller's `vote` validates payload -> `Vote` model increments counts -> controller responds with updated totals.

Notes
- Ensure vote uniqueness where needed (e.g., one vote per user) in controller or model logic.
- Consider rate-limiting vote endpoints to prevent abuse.
