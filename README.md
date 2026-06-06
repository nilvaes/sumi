# Sumi — Track & Explore New Anime

> **墨** — Explore anime with a calm, warm, editorial UI.

Sumi is a full-stack portfolio project for browsing and discovering anime:
home spotlight, filtered browse, airing schedule, and anime detail pages — powered
by [AniList](https://anilist.co) live data, with fast partial search backed by
Supabase and an openly licensed offline catalog.

**Live demo:** [_(Sumi * Track & Explore New Anime)_](https://sumi-xi.vercel.app/)

Full product plan: [`docs/project-brief.md`](prob not gonna deploy it.)

## Features (Phase 1)

- **Home** — hero carousel (8 popular new cours this year), Airing / Trending / Upcoming rows
- **Browse** — genre, format, status, season, year, sort + infinite scroll
- **Search** — partial/fuzzy title match (type `daemon` → *Daemons of the Shadow Realm*)
- **Schedule** — next 7 days, local time, episode countdowns
- **Detail** — synopsis, score (0–10), trailer, links, relations
- **About** — stack, credits, architecture notes

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4, warm-dark editorial theme |
| Browse / detail / schedule | AniList GraphQL + `graphql-codegen` |
| Search index | Supabase Postgres + `pg_trgm` |
| Search catalog source | [anime-offline-database](https://github.com/manami-project/anime-offline-database) (ODbL 1.0) |
| Client state | TanStack Query (search, browse pagination) |
| UI | Radix / shadcn-style `Select` for filters |
| Tests | Vitest |

## Architecture

```text
Browser
  ├─ Server pages (home, browse, detail, schedule, about)
  │     └─ AniList client → GraphQL (cached with revalidate)
  │
  ├─ /api/browse → AniList (filters, infinite scroll)
  │
  └─ /api/search → Supabase (trigram index)
                        ▲
                        │ npm run sync (weekly, manual or CI)
              anime-offline-database (ODbL)
```

**Why two data sources?**

- **AniList** — live, rich media for browse and detail. All calls go through
  `src/lib/anilist/client.ts` (throttle + `429` backoff). The browser never hits
  AniList directly.
- **Offline dataset + Supabase** — AniList search only matches whole words. Sumi
  does **not** bulk-copy the AniList API (their terms prohibit hoarding). Instead,
  `scripts/sync-anime.ts` downloads the weekly
  [anime-offline-database](https://github.com/manami-project/anime-offline-database)
  release and upserts ~20k titles (with AniList IDs) into Postgres for fast
  substring search. Detail pages still load live from AniList when you click a result.

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/nilvaes/sumi.git
cd sumi
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

| Variable | Required | Notes |
|----------|----------|--------|
| `ANILIST_API_URL` | No | Defaults to `https://graphql.anilist.co` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (for search) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (for search) | Publishable / anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (for sync) | Server-only — never commit |
| `SUPABASE_DB_PASSWORD` | Optional | Only for direct DB admin |

### 3. Supabase setup (search)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the full [`supabase/schema.sql`](supabase/schema.sql)
   (table, `pg_trgm` index, `search_anime()` function, RLS read policy).
3. Fill Supabase keys in `.env.local`.

### 4. Sync the search catalog

```bash
npm run sync
```

Downloads the latest weekly dataset release and upserts anime with AniList IDs
(~1 minute). Re-run periodically to refresh titles. A scheduled
[GitHub Action](#automated-weekly-sync) can do this for you.

### 5. Run locally

```bash
npm run dev    # http://localhost:3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run sync` | Refresh Supabase search index from offline dataset |
| `npm run codegen` | Regenerate typed GraphQL after editing `queries.ts` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test` | Vitest |

## Deploy to Vercel

You need a [Vercel](https://vercel.com) account (free tier is fine) and your repo on GitHub.

### Step 1 — Push code to GitHub

If the project is not on GitHub yet:

```bash
git add .
git commit -m "Prepare Sumi for deploy"
git push -u origin main
```

### Step 2 — Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. **Import** your `sumi` GitHub repository.
3. Framework preset should detect **Next.js** automatically.
4. Leave build command as `npm run build` and output as default.

### Step 3 — Environment variables

In the Vercel project → **Settings → Environment Variables**, add the same keys as
`.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (needed if you run sync from CI later; not required for
  the web app runtime unless you add a sync API route)
- `ANILIST_API_URL` (optional)

Apply to **Production** (and Preview if you want PR previews to work with search).

### Step 4 — Deploy

Click **Deploy**. Vercel builds and gives you a URL like `sumi-xxx.vercel.app`.

### Step 5 — After first deploy

1. Confirm **search** works (Supabase schema must already be applied).
2. If search is empty in production, run `npm run sync` locally with production
   Supabase keys in `.env.local`, or add a one-off sync from your machine.
3. Add the live URL to this README (`Live demo:` line above).

### Custom domain (optional)

Vercel → Project → **Settings → Domains** → add your domain and follow DNS instructions.

## Performance & cold starts

Sumi is deployed on Vercel's serverless platform. A few things worth knowing:

- **Cold starts** — after a period of no traffic, the first request wakes the
  serverless function and fetches fresh AniList data, so the initial load can
  take a second or two. This is normal for serverless and not a bug.
- **Warm navigation** — once warm, the app feels fast: routes stream a skeleton
  immediately (`loading.tsx` + Suspense), anime links are prefetched on hover,
  and AniList reads are cached with a `revalidate` window, so repeat visits are
  near-instant.
- **AniList rate limits** — all AniList traffic is funneled through one
  server-side client (`src/lib/anilist/client.ts`) with request spacing and
  `429` backoff, so navigation patterns never blow the upstream budget.

## Automated weekly sync

The search catalog is refreshed by a scheduled GitHub Action
([`.github/workflows/sync.yml`](.github/workflows/sync.yml)) that runs
`npm run sync:ci` once a week (and on-demand via the **Run workflow** button).

Set these as **GitHub repository secrets**
(Settings → Secrets and variables → Actions → New repository secret):

| Secret | Value |
|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **service-role** key (server-only) |

The service-role key lives only in GitHub's encrypted secrets and is never
committed. To run the sync manually, open the **Actions** tab → **Weekly catalog
sync** → **Run workflow**.

## Roadmap

- **Phase 1:** browse/discover — **shipped**
- **Phase 2:** AniList OAuth — personal lists (watching / completed / planning)
- **Phase 3:** richer calendar, stats & insights

## Credits

- Anime data from [AniList](https://anilist.co). Sumi is unofficial and not
  affiliated with AniList.
- Search index from
  [anime-offline-database](https://github.com/manami-project/anime-offline-database)
  by [manami-project](https://github.com/manami-project) — Open Database License
  (ODbL) 1.0.
