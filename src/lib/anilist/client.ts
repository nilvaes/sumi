import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import type { TypedDocumentString } from "./gql/graphql";

const ANILIST_API_URL =
  process.env.ANILIST_API_URL ?? "https://graphql.anilist.co";

/*
  Single place that owns all AniList traffic. Rate-limit handling lives here only:
  - Requests are serialized and spaced (server-side throttle) so a traffic spike
    can't blow AniList's budget (~30 req/min while degraded, 90 normally).
  - A 429 is retried using the Retry-After header, falling back to exponential
    backoff. Reads are cached (see anilistRequest) in front of the throttle, so
    real outbound calls are rare and cache hits never wait.
*/

const MIN_INTERVAL_MS = 700;
const MAX_RETRIES = 3;
/**
 * Max requests waiting in the throttle queue. At 700ms spacing, 60 queued calls
 * is ~42s of backlog; beyond that we fail fast (AniListError → "unavailable" UI)
 * instead of letting a flood of uncached queries stall every page on the instance
 * until the function times out.
 */
const MAX_QUEUED = 60;

let lastRequestAt = 0;
let queue: Promise<unknown> = Promise.resolve();
let queued = 0;

function spaceRequests(): Promise<void> {
  if (queued >= MAX_QUEUED) {
    return Promise.reject(new AniListError("AniList request queue is full"));
  }
  queued++;
  const run = () =>
    new Promise<void>((resolve) => {
      const delay = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastRequestAt));
      setTimeout(() => {
        lastRequestAt = Date.now();
        queued--;
        resolve();
      }, delay);
    });
  const next = queue.then(run, run);
  queue = next.catch(() => undefined);
  return next;
}

async function throttledFetch(url: string, init: RequestInit): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    await spaceRequests();
    const res = await fetch(url, init);
    if (res.status !== 429 || attempt >= MAX_RETRIES) return res;

    const retryAfter = Number(res.headers.get("retry-after"));
    const delayMs =
      Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : Math.min(2 ** attempt * 1000, 8000);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

export class AniListError extends Error {}

/**
 * Execute a typed AniList query.
 *
 * The cache is checked *before* the throttle: cached responses return
 * immediately, and only real outbound calls wait in the 700ms-spaced queue.
 * (Previously the throttle ran first and `fetch`'s cache was checked after,
 * so even cache hits queued — 10 concurrent cached requests took ~6s.)
 *
 * Responses are stored in Next's data cache via `unstable_cache`, which
 * persists across serverless instances on Vercel. Errors are never cached.
 *
 * @param document  A TypedDocumentString produced by graphql-codegen.
 * @param variables Query variables (typed against the document).
 * @param revalidate Seconds to cache the response (default 1h). `0` skips the
 *   cache entirely — used by the sync scripts, which run outside Next.
 */
export async function anilistRequest<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  variables?: TVariables,
  revalidate = 3600,
): Promise<TResult> {
  const body = JSON.stringify({ query: document.toString(), variables });
  if (revalidate <= 0) return executeRequest<TResult>(body);

  const key = createHash("sha256").update(body).digest("hex");
  return unstable_cache(() => executeRequest<TResult>(body), ["anilist", key], {
    revalidate,
    tags: ["anilist"],
  })();
}

async function executeRequest<TResult>(body: string): Promise<TResult> {
  const res = await throttledFetch(ANILIST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
    // Caching happens in anilistRequest(); don't cache the raw fetch twice.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new AniListError(`AniList request failed (${res.status})`);
  }

  const json = (await res.json()) as {
    data?: TResult;
    errors?: { message: string }[];
  };

  if (json.errors?.length) {
    throw new AniListError(json.errors.map((e) => e.message).join("; "));
  }
  if (!json.data) {
    throw new AniListError("AniList returned no data");
  }
  return json.data;
}
