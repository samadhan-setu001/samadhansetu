# Samadhan Setu — Frontend

A runnable Next.js implementation of the three portals described in
`Samadhan_Setu_System_Design.md`: the Citizen app, the Authority dashboard, and
the Officer portal. It works immediately with in-memory mock data, and is
structured so you can paste in real Supabase calls later without touching
any page component.

## Run it now (mock data, no backend needed)

```bash
npm install
npm run dev
```

Open http://localhost:3000. Pick a role from the landing page:

- **Citizen** → any phone number, then verification code `000000`.
- **Authority** → email `pwd@city.gov`, `electric@city.gov`, `water@city.gov`,
  or `swachhcorp@city.gov`, any password.
- **Officer** → Officer ID `OFF-1042` or `OFF-2011`, any password.

Try the full loop: file a complaint as a citizen (camera + GPS permission
required by the browser), assign it as the matching authority, accept and
complete it as the officer, approve it back as the authority, then confirm
it as the citizen. Everything is held in a single in-memory store
(`lib/mockStore.ts`) that resets on a full page reload.

## Connecting your real Supabase backend

Every backend call lives in **`lib/api.ts`** — nowhere else. Each function
has:

1. A `MOCK` branch (currently active) that reads/writes `lib/mockStore.ts`.
2. A commented-out `REAL` block showing the exact Supabase / PostgREST /
   Edge Function call implied by section 6 of the design doc.

To go live:

1. Create a Supabase project, run the schema from section 3 of the design
   doc as a migration (`supabase/migrations/...sql`), and deploy the Edge
   Functions from section 2.3 (`supabase/functions/...`).
2. Copy `.env.local.example` to `.env.local` and fill in
   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   `lib/supabaseClient.ts` flips `HAS_SUPABASE` to `true` automatically.
3. Open `lib/api.ts` function by function: delete the mock body, uncomment
   the `REAL` block above it, and adjust the Edge Function/table names to
   match whatever you actually deployed.
4. `HMAC_SECRET` and the service-role key are **server-only** — they belong
   inside your Edge Functions' environment, never in `.env.local` (which is
   bundled to the client for `NEXT_PUBLIC_*` values only).

## Structure

```
app/
  citizen/          login, file a complaint, my complaints, complaint detail
  authority/         login, queue, assign/review, officers, portfolio
  officer/           login, my cases, case detail + completion
components/
  camera/           LiveCameraCapture — getUserMedia only, no gallery upload
  status/           ComplaintTimeline — the section 7.1 lifecycle, visualized
  layout/           RoleShell (nav shell), route guard hook
  ui/               Button, Card, Input, StatusBadge, EmptyState
lib/
  api.ts            single point of contact with the backend (see above)
  mockStore.ts       in-memory stand-in for the Postgres schema
  supabaseClient.ts  Supabase client, only constructed once env vars exist
  hash.ts            SHA-256 helper for the resolution hash chain
  hooks/             useGeolocation, useAuthRole, useRequireRole
```

## Notes

- Camera capture is live-only by design (section 11) — there's no file
  picker fallback anywhere evidence is submitted.
- The GPS accuracy check (section 11: reject if worse than ~50m) is
  surfaced as a soft warning in `LiveCameraCapture`; wire the hard reject
  into `complaints-create` / `officer-cases-complete` server-side once real
  Edge Functions exist, since a client-side check alone isn't trustworthy.
- Citizen identity never appears in any authority/officer-facing screen —
  only `derived_citizen_id`, matching section 4.
