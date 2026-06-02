<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sumi — project conventions

See `docs/project-brief.md` for the full plan. Key rules:

- **All AniList traffic goes through `src/lib/anilist/client.ts`.** Never call AniList
  from the browser. Rate-limit handling (throttle + 429 backoff) lives only in that file.
- **Reads** (home, seasonal, detail, schedule) are Server Components using the
  `src/lib/anilist/api.ts` helpers with a `revalidate` window. **Interactive** features
  (search-as-you-type, filters) use Route Handlers + TanStack Query on the client.
- **Typed GraphQL:** write queries in `src/lib/anilist/queries.ts` with the `graphql()`
  tag, then run `npm run codegen` to regenerate types. Don't hand-edit `gql/`.
- **Design:** warm dark editorial. Use semantic theme tokens (`bg-bg`, `text-text`,
  `text-text-muted`, `text-accent`, `font-serif`, `font-jp`). One accent only
  (terracotta `#c45c3e`). No purple/cyan, no glassmorphism.
- Always filter `isAdult: false` on public browse queries.

Scripts: `npm run dev`, `npm run build`, `npm run codegen`, `npm run format`,
`npm run lint`, `npm test`.
