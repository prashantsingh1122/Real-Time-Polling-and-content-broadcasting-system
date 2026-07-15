# Controllers — Overview

This document summarizes the controllers in `src/controllers`, their responsibilities, common middleware they rely on, and how to add or test controllers.

## Purpose
Controllers receive validated and authenticated requests from routes, call services or models to perform business logic, and send back HTTP responses. Keep controllers thin: validate and authorize in middleware, put business logic in services or models.

## Controllers
- `authController.js`
  - Responsibilities: register, login, profile retrieval, token issuance/validation.
  - Common middleware: `registerValidation`, `loginValidation` from `src/middlewares/validators.js`; `authenticate` for protected routes.
  - Typical routes: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.

- `broadcastController.js`
  - Responsibilities: create and manage broadcasts, trigger broadcasts to clients (WebSocket/sockets), and persist broadcast metadata.
  - Common middleware: rate limiting for broadcast endpoints, `authenticate`, RBAC where appropriate.

- `contentController.js`
  - Responsibilities: upload content (S3), list user content, and provide content metadata for approval/publishing.
  - Common middleware: `authenticate`, `authorize('teacher')`, file upload middleware (S3 config via `src/config/s3`).
  - Typical flow: route -> `authenticate` -> `authorize` -> `upload` -> `contentController.uploadContent`.

- `approvalController.js`
  - Responsibilities: list pending content, approve/reject content, and move content to published state.
  - Common middleware: `authenticate`, `authorize('principal')`.

- `pollController.js`
  - Responsibilities: create polls, list active polls, accept votes, and manage poll lifecycle.
  - Common middleware: `authenticate`, `authorize('teacher')` for poll creation/management; public read/vote routes are unauthenticated in some cases.

## Error handling
- Controllers should `throw` or `next(err)` for unexpected errors so the global error handler in `src/app.js` can format the response.
- For validation/auth errors, prefer returning a clear status (e.g., `400`, `401`, `403`) from middleware before the controller runs.

## Adding a new controller
1. Create `src/controllers/myNewController.js` and export functions for each route (e.g., `create`, `get`, `update`).
2. Keep logic minimal; delegate business rules to services or models.
3. Add routes in `src/routes` and attach appropriate middleware (`validators`, `authenticate`, `authorize`).
4. Add unit tests for controller functions and integration tests for routes.

## Testing
- Unit-test controller functions by mocking services/models and request/response objects.
- Integration tests should run against the routes defined in `src/routes` and can use an in-memory DB or test DB.

## Example controller structure
```js
// src/controllers/exampleController.js
module.exports = {
  async create(req, res, next) {
    try {
      const result = await someService.create(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
};
```

## Where controllers are used
Routes in `src/routes` map HTTP endpoints to controller functions — see files like `src/routes/authRoutes.js`, `src/routes/contentRoutes.js`, `src/routes/pollRoutes.js`, and `src/routes/approvalRoutes.js` for examples.

---
Created to help contributors quickly understand responsibilities and patterns for controllers in this codebase.
