# approvalController

## Overview

`src/controllers/approvalController.js` handles workflows for reviewing and approving content. It exposes endpoints to list pending items and to approve or reject content.

---

## What this controller does

- Lists content that requires approval.
- Approves or rejects content and updates its published state.
- Triggers side effects (notifications, audit logs) via services — controller orchestrates these actions.

---

## Main logic flow

### List pending
1. Route `GET /api/approval/pending` runs `authenticate` and `authorize('principal')`.
2. Controller queries DB for content with pending status and returns results.

### Approve / Reject
1. Routes to `PATCH /api/approval/:id/approve` and `/reject` run `authenticate` + `authorize('principal')`.
2. Controller updates content status, records approver metadata (who/when), and calls notification/audit services.
3. Controller returns success or error response based on the operation.

---

## Project flow summary

1. Approval routes in `src/routes/approvalRoutes.js` protect endpoints with `authenticate` and `authorize('principal')`.
2. Controller updates DB and delegates notifications to services (email, sockets).
3. Approved items become visible in published content flows; rejections may notify the uploader.

---

## Error handling

- Unauthorized access → `401`/`403` (handled by middleware).
- Content not found → `404`.
- Unexpected failures in side-effect services → log and return `500`.

Record approver and timestamp for traceability; keep notification logic separated for easier testing.

---

## Important files involved

- `src/controllers/approvalController.js`
- `src/routes/approvalRoutes.js`
- `src/middlewares/auth.js`
- `src/middlewares/rbac.js`
- `src/services` (notification/audit services)

---

## In short

The controller enforces approval workflows and delegates notifications and audits to services; middleware ensures only authorized principals can act.
