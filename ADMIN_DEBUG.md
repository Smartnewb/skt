# Admin Troubleshooting Guide (Phase-0 auth model)

## How admin auth works now

- Login: `POST /api/admin/login` with `{ username, password }` — compared
  server-side in constant time against `ADMIN_USERNAME` / `ADMIN_PASSWORD`
  env vars. Never stored in the browser or shipped in `NEXT_PUBLIC_*` vars.
- Session: `admin_session` httpOnly cookie holding an HMAC-signed JWT
  (`ADMIN_SESSION_SECRET`), 12h expiry, `sameSite=lax`, `Secure` in
  production. No `localStorage` flag — the old `admin_authenticated` key is
  gone and does nothing.
- Gate: `proxy.ts` (Next.js 16's renamed `middleware` convention) protects
  `/admin/*` (redirects to `/admin/login`) and `/api/admin/*` (returns 401).
- Logout: `POST /api/admin/logout` clears the cookie.
- Rate limiting: 5 login attempts per 10 minutes per IP (in-memory,
  best-effort — resets on redeploy / per serverless instance).
- Data: admin pages fetch only `/api/admin/*`, which uses
  `lib/supabaseServer.ts` (service role). The browser never queries
  Supabase directly.

## Diagnosing problems

### Login fails with "서버 설정 오류" (500)
`ADMIN_USERNAME`, `ADMIN_PASSWORD`, or `ADMIN_SESSION_SECRET` is missing.
Check Vercel env vars and redeploy.

### Login always returns 401 with correct credentials
- Confirm `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars match exactly
  (watch for trailing whitespace — Vercel trims nothing).
- `ADMIN_SESSION_SECRET` must be set; without it no cookie can be issued.

### Logged in but immediately bounced back to /admin/login
- Cookie not being sent: in dev, `Secure` is off; in prod it requires HTTPS.
- Session expired (12h) — log in again.
- `ADMIN_SESSION_SECRET` changed between deploys → all old sessions invalid.

### /api/admin/* returns 401 in browser fetch
- Requests must include credentials: `fetch(url, { credentials: 'include' })`
  (all admin pages already do this).
- If curl-testing manually: `-b "admin_session=<jwt>"`.

### Login returns 429
In-memory rate limit tripped — wait `Retry-After` seconds, or redeploy to
reset (the limiter is per-instance by design).

### Applications/consultations lists are empty but data exists
- `SUPABASE_SERVICE_ROLE_KEY` must be set — without it the server falls back
  to the anon key, which is locked out by `006_rls_lockdown.sql` (by design).
- Check that the operator applied `supabase/migrations/006_rls_lockdown.sql`;
  after it, only the service role can read PII tables.

### Memos don't persist
Memos live in `consultation_logs` via
`/api/admin/applications/[id]/logs` (service role). If the table is missing,
apply `supabase/migrations/002_admin_enhancement.sql`.

### Health check `/api/health/supabase` returns 503
Supabase unreachable or `SUPABASE_SERVICE_ROLE_KEY` missing/invalid —
the endpoint only reports `ok:false` (no internals leak).

## Verifying auth quickly

```bash
# 1. Login → cookie should come back as admin_session (httpOnly)
curl -i -X POST https://<host>/api/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"<user>","password":"<pass>"}'

# 2. Unauthenticated admin API → must be 401
curl -i https://<host>/api/admin/applications

# 3. Unauthenticated admin page → must redirect to /admin/login
curl -i https://<host>/admin
```
