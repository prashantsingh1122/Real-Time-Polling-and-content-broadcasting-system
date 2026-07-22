# contentController

## Overview

`src/controllers/contentController.js` manages content uploads and retrieval of user content metadata. It coordinates file storage (S3) and persistence of metadata in the database.

---

## What this controller does

- Receives uploaded files, saves them to S3, and persists metadata (URL, uploader, timestamps).
- Lists content owned by a user.
- Supports approval/publishing workflows by exposing metadata used by approval controllers.

---

## Main logic flow

### Upload content
1. Route `POST /api/content/upload` receives multipart form data with `file`.
2. Middleware order: `authenticate` -> `authorize('teacher')` -> `upload.single('file')` (S3/multer).
3. Controller saves metadata (S3 URL, filename, uploader) to DB and returns `201` with the content record.

### Get my content
1. Route `GET /api/content/my-content` runs `authenticate` and `authorize('teacher')`.
2. Controller queries DB for the authenticated user's content and returns results.

---

## Project flow summary

1. File upload middleware located in `src/config/s3` handles streaming to S3 and preliminary validation.
2. Controller only stores metadata and delegates file handling to the upload middleware/service.
3. Approval and publishing flows read metadata from DB; approval controllers will update content status.

---

## Error handling

- Invalid or missing file → `400 Bad Request`.
- Authorization failures → `401`/`403` (from `authenticate`/`authorize`).
- S3 upload errors → handle/retry in service, return `500` if unrecoverable.

Validate file type and size in middleware to avoid controller-level complexity.

---

## Important files involved

- `src/controllers/contentController.js`
- `src/config/s3` (upload middleware)
- `src/middlewares/auth.js`
- `src/middlewares/rbac.js`
- `src/routes/contentRoutes.js`

---

## In short

Keep file handling in upload middleware/service; the controller stores metadata, enforces business rules, and returns responses.
