# TradeLink LK

A small web app that helps informal tradespeople in Sri Lanka become hireable, and helps customers describe a job and see ranked matches.

## Problem

Tilers, painters, masons, electricians, plumbers, and carpenters often have no professional profile. Customers struggle to explain a job in a structured way and to find someone nearby with the right skill. Hiring then depends on word of mouth.

## Solution

A worker speaks or types in Sinhala, Tamil, or English. AI drafts a profile they can edit and save, with optional photos. A customer describes a job in plain language. AI turns that into fields (trade, area, size, timeframe). The app then filters workers in SQLite and asks AI to rank the top matches, each with a one-sentence reason.

## Features

- Worker profile from voice or text, then an editable draft
- Photo upload (images only, 5 MB max)
- Worker directory with trade and area filters
- Public profile with portfolio photos and demo reviews
- Plain-language job post, structured by AI, confirmed by the customer
- Ranked matches with a score and a short reason
- Rough LKR price guide, labelled as a guide
- Demo inbox: a worker picks their own name (no real login)
- English, Sinhala, and Tamil UI

## How AI is used

All model calls go through `src/lib/ai.ts`. Prompts live in `src/lib/prompts.ts`. The browser never sees the API key.

1. **Profile draft** — raw description in Sinhala, Tamil, or English becomes JSON: name, trade, headline, English summary, skills, years, area, languages. The model must not invent facts. Unknown fields stay null.
2. **Job structure** — plain job text becomes trade, area, size, timeframe, summary, and a list of missing questions.
3. **Ranking** — SQL first keeps workers with the same trade and area. The model ranks at most five of those ids and gives one sentence each. Ids that were not in the SQL list are dropped.
4. **Price guide** — a wide LKR range labelled as a rough guide, not a quote.

If `GEMINI_API_KEY` is missing, `ai.ts` returns clearly labelled mock JSON so judges can click through the app without a private key. Phone numbers are not sent to the model.

## Tech stack

- Next.js (App Router) and TypeScript
- Tailwind CSS
- SQLite via `better-sqlite3` (`data/app.db`, created on first run)
- Google Gemini over `fetch` (no SDK), behind one wrapper
- Browser Web Speech API for voice, with a textarea fallback

## Setup instructions

Requires Node.js 22 or newer (better-sqlite3 needs it).

```bash
git clone <your-repo-url>
cd hackothon
npm install
cp .env.example .env.local
npm run seed
npm run dev
```

Open http://localhost:3000

`npm run seed` deletes existing rows and inserts fictional workers, jobs, reviews, and one request. Run it again any time you want a clean demo.

A fresh clone should work after `npm install && npm run seed`. Leave the API key blank to use mock AI.

## Environment variables

| Name | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Google AI Studio key. Empty means labelled mock responses. |
| `GEMINI_MODEL` | Model id, for example `gemini-2.0-flash`. Not hardcoded in source. Required only when a key is set. |

Copy `.env.example` to `.env.local`. Do not commit `.env.local`.

## AI tools disclosure

Cursor’s AI coding assistant was used to help generate this application’s code, seed data, and documentation.

## Limitations and responsible-AI notes

- AI output can be wrong, incomplete, or too confident. Every AI screen asks the user to review it. It is not professional, legal, or medical advice.
- The price range is a rough guide in LKR, not a quote.
- There is no real authentication. The inbox is a demo: anyone can pick a name.
- Seed data is fictional. Names and phone numbers are fake. Do not treat them as real people.
- Photos are stored on the local disk under `public/uploads`.
- Voice input depends on the browser. Chrome usually works. If speech is missing, type instead.
- Matching only considers workers already saved with the same trade and city. It is not a background check.

## Future work

- Chat between customer and worker
- Reviews written by real customers
- Verification of identity and skills
- SMS for workers who do not have a smartphone

## Credits

Built as a hackathon prototype. UI copy is short on purpose so it can be read on a phone. Stack: Next.js, React, Tailwind CSS, better-sqlite3, and the Google Gemini API. Voice uses the browser Web Speech API.
