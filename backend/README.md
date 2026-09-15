# Samadhan Setu backend

This is a Supabase backend for the Samadhan Setu civic-issue workflow. It provides the database schema, privacy-aware RLS boundary, evidence storage, audit trail, and Edge Functions for the citizen, authority, and officer flows.

## Configure

1. Create a Supabase project.
2. Copy `.env.example` to `.env` and paste your project values. Do not expose `SUPABASE_SERVICE_ROLE_KEY`, `HMAC_SECRET`, or `CRON_SECRET` to a browser.
3. The project already includes the Supabase CLI. Run this once to log in, then use the one-command deploy script:

```powershell
./tools/supabase-cli/supabase.exe login
./scripts/deploy.ps1 -ProjectRef YOUR_PROJECT_REF
```

The script links the project, applies the database migrations, uploads secrets from `.env`, and deploys every Edge Function.

## Endpoints

All endpoints need `Authorization: Bearer <Supabase access token>` except the scheduled score job.

| Function URL suffix | Operation |
|---|---|
| `otp-verify-hook` | `POST` initializes a citizen wallet after OTP |
| `complaints` | `POST` creates a complaint; `GET /nearby` checks duplicates; `POST /:id/upvote`; `POST /:id/verify` |
| `authority-officers` | `POST` provisions an officer and returns the one-time temporary password |
| `authority-assignments` | `GET /suggestions?complaint_id=`; `POST` creates assignment; `POST /:id/review` |
| `officer-cases` | `POST /:assignmentId/accept`; `POST /:assignmentId/complete` |
| `auth-password-change` | `POST { password }` |
| `score-recompute` | `POST` with `x-cron-secret` |

Evidence objects must be uploaded to the private `complaint-evidence` bucket under a folder named exactly after the authenticated user UUID, e.g. `<user-id>/before/<uuid>.jpg`. Pass that **object path** (not a signed URL) to the functions. This prevents one user from submitting another user's evidence object.

## Important production notes

- Enable Phone Auth in Supabase for citizens. For real deployments, apply `role: citizen` through a trusted server-side onboarding step; never allow a client to set app metadata.
- Create authority accounts with the Supabase Admin API and assign `app_metadata.role = authority` before they can use authority routes.
- A future frontend should enforce `must_reset_password` before showing protected screens.
- The function service role is deliberately the only writer for state transitions, which prevents clients from bypassing duplicate checks, status validation, hashes, and audit logging.
