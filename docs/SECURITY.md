# Security — Phase 1 prototype

Phase 1 is a **demonstration frontend**. Treat all auth and data persistence as **non-production**. This document states limitations and future requirements so engineers and stakeholders do not over-trust the mock.

---

## Current security posture (mock)

| Area | Phase 1 behaviour | Risk |
|------|-------------------|------|
| Customer auth | Any 10-digit mobile + any 6-digit OTP succeeds | Trivial impersonation; no proof of possession |
| Admin auth | Shared demo password (`cotandcouch2026` in README) | Anyone with URL and password can access admin UI |
| Session storage | Flags/tokens in `localStorage` | XSS on the origin could read or tamper with session |
| Authorization | Team vs Admin is UI-only | No enforcement; URLs may still be reachable |
| Data | Catalogue/enquiries in memory + mock JSON | No encryption at rest; no audit trail |
| Transport | Dev on `http://localhost` | Production must use HTTPS |

**Bottom line:** Do not deploy this prototype to the public internet with real customer data or as an access-controlled operations tool without a full security pass.

---

## Mock OTP limitations

- No SMS, WhatsApp OTP, or email magic links are sent.
- No rate limiting, lockout, or CAPTCHA on login.
- No session expiry or refresh token model.

For demos, state clearly: *“Login is simulated.”*

---

## localStorage is not secure storage

Used for convenience in Phase 1:

- Customer mock session
- Shortlist and recently viewed product IDs
- Optional admin “logged in” flag
- Theme preference

**Properties:**

- Readable by any script on the same origin (XSS risk).
- Not HttpOnly; not suitable for secrets or PII at scale.
- Cleared by user; not synced across devices.

**Do not store:** real passwords, API keys, full enquiry PII archives, or payment-related data.

---

## Future production needs (not implemented)

When moving beyond the prototype, plan for:

### Authentication & OTP

- Verified OTP via regulated provider (SMS/WhatsApp) with rate limits and attempt logging.
- Server-side sessions or signed JWTs with short TTL and secure cookies (`HttpOnly`, `Secure`, `SameSite`).
- Admin: strong passwords + MFA, or SSO for staff.

### Backend & data (e.g. Supabase or equivalent)

- Row-level security (RLS) for enquiries and customer profiles.
- Separate roles for Customer, Team, Admin enforced **on the server**.
- Encrypted connections to DB; secrets in environment variables only.

### WhatsApp & messaging

- Business API with opt-in; template messages compliant with Meta policies.
- No embedding API secrets in client bundles.

### DPDP (India Digital Personal Data Protection)

- Lawful basis and clear consent for phone number and enquiry content.
- Privacy notice, data retention limits, deletion/export requests.
- Data minimization in forms; avoid collecting fields not needed for showroom follow-up.
- Vendor DPAs for hosting, OTP, and analytics.

### Application hardening

- CSP, XSS prevention, dependency scanning, and regular updates.
- No secrets in git; use `.env.local` and platform secret stores.
- Audit log for admin actions on catalogue and enquiries.

---

## Developer practices (now)

1. **Never commit secrets** — `.env`, service keys, or real phone numbers from production.
2. Add `.env*.local` to `.gitignore` if not already present.
3. Do not add “security through obscurity” admin URLs without real auth in production builds.
4. When adding third-party scripts (analytics, chat widgets), review CSP and consent implications.
5. Refer scope questions to `PRD.md` — do not implement real payment or PII pipelines in Phase 1.

---

## Incident expectations

This repo has **no production SLA**. If a public demo leak occurs, rotate demo passwords and take down the deployment — there is no breach notification process tied to this prototype.

---

## Related docs

- `MEMORY.md` — mock OTP and RBAC decisions  
- `ARCHITECTURE.md` — where session data lives  
- Root `README.md` — demo credentials (mock only)
