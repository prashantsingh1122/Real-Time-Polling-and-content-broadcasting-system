# approvalController — Overview

Responsibilities
- List pending content requiring approval.
- Approve or reject content and update its published state.

Main functions
- `getPendingContent(req, res, next)` — return content awaiting approval.
- `approveContent(req, res, next)` — mark content published and perform necessary side-effects.
- `rejectContent(req, res, next)` — mark content rejected and optionally notify uploader.

Routes
- Mounted under `/api/approval` and protected by `authenticate` and `authorize('principal')` in `src/routes/approvalRoutes.js`.

Middleware used
- `authenticate` — token verification.
- `authorize('principal')` — role check for principal users.

Typical flow
1. Request -> route -> `authenticate` -> `authorize('principal')` -> controller.
2. Controller updates content state in DB and returns status.

Notes
- Keep notification logic (email, socket) in a service and call it from the controller to keep tests focused.
- Audit relevant changes (who approved, when) for traceability.
