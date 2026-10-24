# TradeLink LK — build plan

This file is the scope for the hackathon build. Do not add chat, a social feed, or a connections graph.

## Purpose

A web platform that helps informal tradespeople in Sri Lanka (tilers, painters, masons, electricians, plumbers, carpenters) become hireable.

- A worker describes skills by voice or text in Sinhala, Tamil, or English. AI drafts a professional profile. The worker edits it, then saves it, and can upload photos.
- A customer posts a job in plain language. AI structures it. The customer confirms, then saves.
- AI matches and ranks workers who already match the trade and area in SQL, with a one-sentence reason each.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, `src/` directory
- SQLite via better-sqlite3. File: `data/app.db`. Created on first run.
- AI: Google Gemini via plain `fetch`, only through `src/lib/ai.ts`, so the provider can be swapped
- Env: `GEMINI_API_KEY`, `GEMINI_MODEL` (read from env, no hardcoded model name)
- If `GEMINI_API_KEY` is missing, `ai.ts` returns clearly labelled mock JSON so the demo runs without a private key

## Routes

- `/` landing: problem statement, two buttons — "I am a worker" and "I need a worker"
- `/worker/new` voice or text, AI draft, edit, save, photo upload
- `/workers` directory, filters `?trade=` and `?area=`
- `/workers/[id]` profile, photos, "Request this worker" (opens the job form with that worker id)
- `/jobs/new` plain words, AI structure, confirm, save
- `/jobs/[id]` structured job, ranked matches, reasons, request buttons, rough LKR price guide
- `/inbox` worker picks themself from a dropdown. No real auth.

## API

- `GET/POST /api/workers`
- `POST /api/workers/generate` — draft only, not saved
- `POST /api/workers/[id]/photos` — image file, max 5 MB, jpeg/png/webp/gif
- `GET/POST /api/jobs`
- `POST /api/jobs/structure`
- `POST /api/jobs/[id]/match` — SQL filter by trade and area, then AI ranks top 5
- `GET/POST /api/requests` — GET uses `?workerId=`

## Tables

- `workers(id, name, phone, trade, headline, summary, skills JSON, years_experience, area, languages JSON, raw_description, created_at)`
- `worker_photos(id, worker_id, path)`
- `jobs(id, customer_name, raw_text, trade, area, size_estimate, timeframe, summary, created_at)`
- `requests(id, job_id, worker_id, status default 'pending', created_at)`
- `reviews(id, worker_id, rating, comment, reviewer_name)` — seed data only, no public create API

## AI JSON tasks

1. `generateWorkerProfile` — do not invent facts; null if unknown; summary in English
2. `structureJob` — includes `missing_info[]` (shown before save, not stored)
3. `rankWorkers` — only candidate ids, score 0–100, one-sentence reason
4. `estimatePriceRange` — `{low, high, currency: "LKR", note}`, labelled a rough guide

## Rules

- Validate and sanitize API input. Helpful errors.
- Never expose the API key to the browser.
- Every page that shows AI output includes `AiDisclaimer`: "AI-generated, please review. Not professional advice."
- Phone-width layout, large buttons.
- Seed script: 10 fictional workers, 3 jobs, a few reviews, one sample request. Fake names and fake phones only.
- `npm run seed` uses tsx.
- UI strings for en / si / ta live in `src/lib/i18n.ts`. Language choice is stored in localStorage inside try/catch.

## Out of scope

Chat, feed, social connections, real authentication, payments, SMS, and a public review form.
