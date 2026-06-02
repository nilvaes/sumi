# Sumi — Anime Tracking and More

> Discover the season. A dark, warm, editorial anime discovery app built on the
> [AniList](https://anilist.co) GraphQL API.

Sumi is a full-stack portfolio project: browse trending, popular, and seasonal
anime, search, filter, and follow the airing schedule — with a content-first UI
that deliberately avoids the generic "AI app" look. Full plan in
[`docs/project-brief.md`](docs/project-brief.md).

## Tech stack

- **Next.js (App Router) + TypeScript** — full-stack in one repo
- **Tailwind CSS v4** — warm-dark editorial theme via semantic tokens
- **AniList GraphQL** — typed with `graphql-codegen` (client preset)
- **TanStack Query** — client cache for interactive search/filters
- **Vitest** — unit tests

## Architecture

- **All AniList traffic goes through one server-side client**
  (`src/lib/anilist/client.ts`) with request throttling and `429` retry/backoff.
- **Reads** (home, seasonal, detail, schedule) render in Server Components using
  Next's built-in `fetch` cache (per-query `revalidate`), so AniList is rarely hit.
- **Interactive** features (search, filters) use Route Handlers + TanStack Query.
- The browser never calls AniList directly — this keeps the app within AniList's
  rate limits even under portfolio traffic.

## Getting started

```bash
cp .env.example .env.local   # defaults work out of the box (public reads)
npm install
npm run dev                  # http://localhost:3000
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run codegen` | Regenerate typed GraphQL from AniList's schema |
| `npm run format` | Prettier |
| `npm run lint` | ESLint |
| `npm test` | Vitest |

## Roadmap

- **Phase 1 (in progress):** browse/discover — home, seasonal, search, filters,
  detail page, airing schedule. No login.
- **Phase 2:** AniList OAuth — sync personal lists (watching / completed / planning).
- **Phase 3:** richer calendar + stats & insights.

Data and images courtesy of [AniList](https://anilist.co).
