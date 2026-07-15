# broadcastController — Overview

Responsibilities
- Create and manage broadcast messages and metadata.
- Trigger delivery to connected clients (WebSocket / socket service).
- Persist broadcast records for auditing/history.

Main functions
- `createBroadcast(req, res, next)` — accept content, save record, and push to socket service.
- `getBroadcasts(req, res, next)` — list recent broadcasts.

Routes
- Mounted under `/api/broadcast` in `src/app.js` and subject to broadcast rate limits.

Middleware used
- Rate limiting: `src/middlewares/rateLimiter.js` (applied at app level for `/api/broadcast`).
- Authentication/authorization as required (`authenticate`, optional RBAC).

Typical flow
1. Request -> route -> rate limiter -> (optional auth) -> controller.
2. Controller saves metadata, invokes socket/push service, returns `201`.

Notes
- Keep socket push logic in a separate service (e.g., `src/services/schedulingService.js`) so controllers remain thin.
- Ensure broadcast payloads are validated before pushing to sockets to avoid runtime errors.
