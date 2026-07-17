---
title: For His Purpose API
emoji: 🙏
colorFrom: yellow
colorTo: gray
sdk: docker
app_port: 7860
pinned: false
---

# For His Purpose — Backend API

A small, free-tier Express API that receives form submissions from forhispurpose.co
(newsletter, contact, prayer requests, Bible study sign-ups, mentorship applications,
volunteer interest, and testimonies) and stores them in Supabase (free Postgres).

## Endpoints

All endpoints accept `POST` with a JSON body and are mounted under `/api`:

| Endpoint | Table | Required fields |
|---|---|---|
| `POST /api/newsletter` | `newsletter_subscribers` | `email` |
| `POST /api/contact` | `contact_messages` | `name`, `email`, `message` |
| `POST /api/prayer` | `prayer_requests` | `email`, `request` |
| `POST /api/bible-study` | `bible_study_signups` | `name`, `email` |
| `POST /api/mentorship` | `mentorship_applications` | `name`, `email` |
| `POST /api/volunteer` | `volunteer_interest` | `name`, `email` |
| `POST /api/testimony` | `testimonies` | `story` |

`GET /` is a health check — returns `{ ok: true, supabaseConfigured: true/false }`.

## Required Space secrets

Set these under **Space settings → Variables and secrets**:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `FRONTEND_ORIGINS` (comma-separated list of allowed origins, e.g. `https://forhispurpose.co,https://www.forhispurpose.co`)

See `supabase_schema.sql` in this repo for the table definitions to run in the Supabase SQL editor before this API will work.
