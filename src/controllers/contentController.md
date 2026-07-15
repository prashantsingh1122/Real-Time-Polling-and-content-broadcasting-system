# contentController — Overview

Responsibilities
- Handle content uploads and retrieval of user content metadata.
- Coordinate file upload to S3 and store metadata in the database.

Main functions
- `uploadContent(req, res, next)` — receives file (via `upload.single('file')`), stores metadata, and responds with content record.
- `getMyContent(req, res, next)` — return content uploaded by the authenticated user.

Routes
- `POST /api/content/upload` — protected: `authenticate`, `authorize('teacher')`, `upload.single('file')`.
- `GET /api/content/my-content` — protected: `authenticate`, `authorize('teacher')`.

Middleware used
- `authenticate` (`src/middlewares/auth.js`) — ensures request has valid token.
- `authorize` (`src/middlewares/rbac.js`) — ensures user role is `teacher`.
- File upload middleware: `src/config/s3` (multer/S3 wrapper).

Typical flow
1. Request with multipart form -> route -> `authenticate` -> `authorize('teacher')` -> `upload.single('file')` -> controller.
2. Controller saves metadata (URL, uploader, timestamp) to DB and returns `201`.

Notes
- Validate file size and type in upload middleware.
- Keep S3 logic in `src/config/s3` and avoid embedding S3 calls directly inside the controller to simplify testing.
