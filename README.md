# 🎁 Secret Santa

A small self-hosted web app for running a Secret Santa. People register their
names, and the organizer runs a single click to randomly assign everyone a
giftee — with optional "don't pair me with X" exclusions (e.g. couples).

Nobody is ever assigned to themselves, each person is a giftee for exactly one
person, and each person only ever sees their *own* match via a private,
unguessable link.

## Features

- **Register** with just a name (no accounts, no emails).
- **Secret reveal links** — each person gets a private link like
  `/reveal/8f3a…` shown only once at sign-up.
- **Exclusions** — optionally mark people you'd rather not give to (the
  organizer can also see these). Editable any time before the draw.
- **Admin page** (`/admin`) protected by a secret to run the draw, view all
  matches, copy results, resend links, remove people, and reset/redraw.
- **Fair assignment** — a random derangement that respects exclusions.

## Tech

- [Next.js 16](https://nextjs.org) (App Router, React 19, TypeScript)
- [Tailwind CSS 4](https://tailwindcss.com)
- **SQLite** via Node's built-in [`node:sqlite`](https://nodejs.org/api/sqlite.html)
  — no database server, no ORM, no native dependencies.

## Requirements

- **Node.js 24 or later** (for `node:sqlite`).

## Local setup

```bash
git clone <your-repo-url> secret-santa
cd secret-santa

npm install
cp .env.example .env          # then edit .env and set a strong ADMIN_SECRET

npm run dev                   # http://localhost:3000
```

The SQLite database is created automatically at `data/secret-santa.db` on first
run. The data directory is git-ignored.

## How to use it

1. Share the site URL with your group.
2. Everyone registers their name (and optionally marks exclusions).
3. Open `/admin`, enter your `ADMIN_SECRET`, and click **Run draw**.
4. Everyone opens their personal link to see who they're giving to.

## Configuration

| Variable      | Purpose                                        | Default                  |
| ------------- | ---------------------------------------------- | ------------------------ |
| `ADMIN_SECRET`| Password for the `/admin` page and admin API.  | *(required)*             |
| `DB_PATH`     | SQLite file location (relative to project root) | `./data/secret-santa.db` |

## Deployment

The app needs a **persistent filesystem** for the SQLite database, so deploy to
a platform with a disk/volume and Node 24+:

- [Railway](https://railway.app), [Render](https://render.com) (disk), or
  [Fly.io](https://fly.io) (volume)
- Any VPS / Docker host — just run `npm run build && npm start`.

Set `ADMIN_SECRET` (and optionally `DB_PATH`) in the platform's environment
variables.

> **Note on Vercel:** Vercel's serverless functions have an ephemeral
> filesystem, so SQLite data would not persist there. To use Vercel, swap the
> database for a hosted Postgres (e.g. Neon or Supabase) and adjust `lib/db.ts`
> accordingly.

## Project structure

```
app/
  page.tsx                 # registration
  reveal/[token]/page.tsx  # private reveal page
  admin/page.tsx           # admin dashboard
  api/                     # route handlers
lib/
  db.ts                    # SQLite schema + data access
  assignment.ts            # derangement (assignment) algorithm
  auth.ts                  # admin secret check
  types.ts                 # shared API types
```

## Security notes

- Reveal tokens are 24-character cryptographically random strings — not
  enumerable.
- The full assignment is only exposed behind the `ADMIN_SECRET`; reveal pages
  only ever return the viewer's own match.
- Names are case-insensitively unique to keep exclusions unambiguous.
