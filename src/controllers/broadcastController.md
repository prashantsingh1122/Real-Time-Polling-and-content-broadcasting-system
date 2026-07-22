# broadcastController — Line-by-line explanation

This document explains `src/controllers/broadcastController.js` line by line so contributors can quickly understand the implementation and request flow.

See the source: `src/controllers/broadcastController.js`

---

## Top-level imports

1. `const { User } = require('../models');`
	- Imports the `User` model from the central models index. Used to look up teacher accounts.

2. `const { getActiveContent } = require('../services/schedulingService');`
	- Imports a service function that returns currently active content for a teacher. Business logic for determining "active" content lives in this service.

3. `const { getCache, setCache } = require('../config/redis');`
	- Redis helper functions for simple caching. `getCache(key)` reads cached responses; `setCache(key, value, ttl)` writes with TTL in seconds.

---

## exports.getLiveContent (GET /api/broadcast/live/:teacherId)

The `getLiveContent` function returns live content for a single teacher. Key steps:

1. `const { teacherId } = req.params;`
	- Read `teacherId` from the URL (route param).

2. `const cacheKey = `broadcast:teacher:${teacherId}``
	- Compose a cache key unique to the teacher.

3. `const cached = await getCache(cacheKey)` and `if (cached) { ... return res.json({ ...cached, fromCache: true }) }`
	- Attempt to read cached response. If present, return it immediately with `fromCache: true` to indicate a cache hit.

4. `const teacher = await User.findOne({ where: { id: teacherId, role: 'teacher' }, attributes: ['id', 'name', 'email'] });`
	- Query the DB for the teacher; restrict returned fields for performance/security.

5. `if (!teacher) { return res.status(404).json({ success: false, error: 'Teacher not found' }); }`
	- Early return when teacher is missing.

6. `const activeContent = await getActiveContent(teacherId);`
	- Call the scheduling service to compute active content for that teacher.

7. `if (!activeContent || Object.keys(activeContent).length === 0) { return res.json({ success: true, message: 'No content available', data: { teacher: teacher.name, content: null } }); }`
	- If no active content found, return a clear `success: true` response with a `message` and `content: null`.

8. Build `response` object containing `teacher`, `timestamp`, and `content` and then `await setCache(cacheKey, response, 60)`
	- Construct the payload to return. Cache it for 60 seconds to reduce repeated DB/service calls.

9. `res.json(response)`
	- Send the response to the client.

10. Error handling: the `catch` block logs and returns `500` with an error message.

Notes and rationale
- Cache at controller level keeps service calls fast for high-traffic read patterns.
- Returning `success: true` for "no content" makes client logic simpler (no 404 for empty state).
- The TTL (60s) is a tradeoff between freshness and load; adjust as needed.

---

## exports.getAllLiveContent (GET /api/broadcast/all)

This endpoint collects active content across all teachers and returns a list.

1. `const cacheKey = 'broadcast:all'` and check cache same as above.
	- Global cache for the aggregated view.

2. `const teachers = await User.findAll({ where: { role: 'teacher' }, attributes: ['id', 'name', 'email'] })`
	- Load all teacher accounts (ids and names only).

3. Loop `for (const teacher of teachers) { const activeContent = await getActiveContent(teacher.id) ... }`
	- For each teacher, call `getActiveContent` and push non-empty results into `result` array.

4. Build `response = { success: true, total: result.length, data: result }` and cache with TTL 60s.

5. `res.json(response)` and `catch` returns `500` on errors.

Notes and rationale
- This implementation calls `getActiveContent` sequentially per teacher. For many teachers this can be slow; consider parallelizing with `Promise.all` and throttling for high scale.
- The cache reduces repeated aggregation cost; keep TTL tuned to content update frequency.

---

## exports.getAllApprovedContent (GET /api/broadcast/approved)

This endpoint returns all content where `status === 'approved'`.

1. `const Content = require('../models/Content')`
	- Lazy-require the `Content` model (keeps top-level imports minimal).

2. Check cache `broadcast:approved` and return if present.

3. `const contents = await Content.findAll({ where: { status: 'approved' }, include: [{ model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }], order: [['created_at', 'DESC']] })`
	- Query approved content with eager-loaded teacher relation and sort newest first.

4. Build `response = { success: true, total: contents.length, data: contents }`, cache for 60s, and return it.

5. `catch` logs error and returns `500`.

Notes and rationale
- Returning full `contents` objects is convenient for clients but may include fields you want to exclude; consider data shaping for privacy/performance.
- Caching avoids repeated DB hits for commonly accessed lists.

---

## Implementation suggestions / next improvements

- Parallelize per-teacher calls in `getAllLiveContent` using `Promise.allSettled` or batched concurrency to improve latency.
- Make cache TTL configurable (env var) and consider cache invalidation hooks when content changes (publish/approve) instead of TTL-only.
- Add request-level metrics and monitoring for cache hit/miss ratios and slow service calls.
- Shape or paginate `getAllApprovedContent` results for large datasets.

---

## Quick reference: files involved

- Controller: `src/controllers/broadcastController.js`
- Scheduling service: `src/services/schedulingService.js`
- Redis helpers: `src/config/redis.js`
- Models: `src/models/` (User, Content)

---

If you'd like, I can also add in-file code comments or open a PR to implement parallel fetching and configurable TTLs.
---

## What this controller does

- Stores broadcast metadata (content, sender, timestamp).
- Invokes socket/push services to deliver messages to connected clients.
- Exposes endpoints to list or retrieve broadcasts for clients or admin views.

---

## Main logic flow

### Create broadcast
1. Route receives `POST /api/broadcast` with broadcast payload.
2. App-level rate limiter (`/api/broadcast`) protects against abuse.
3. Controller validates business rules, saves broadcast metadata, and calls socket service to push the message.
4. Controller returns `201 Created` with broadcast record.

### List broadcasts
1. Route receives `GET /api/broadcast` (or similar).
2. Controller queries persisted broadcasts and returns results.

---

## Project flow summary

1. Requests routed via `src/app.js` where `/api/broadcast` has rate limiting applied.
2. Controller interacts with `src/services` or socket layers (e.g., `src/services/schedulingService.js`).
3. Clients receive pushes from socket server; broadcasts are stored in DB for history/audit.

---

## Error handling

- Rate-limited requests → `429 Too Many Requests` (handled by rate limiter middleware).
- Validation or payload issues → `400 Bad Request`.
- Socket push failures → handle gracefully, persist failure details, and return `5xx` if unrecoverable.

Keep socket/push logic in a service so controllers can return quickly and be easier to test.

---

## Important files involved

- `src/controllers/broadcastController.js`
- `src/app.js` (rate limiting middleware mounting)
- `src/services/schedulingService.js` (or socket service)
- `src/middlewares/rateLimiter.js`

---

## In short

This controller records broadcasts and delegates delivery to socket/push services; rate limiting and validation protect it before business logic runs.
