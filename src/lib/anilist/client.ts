import type { TypedDocumentString } from "./gql/graphql";

const ANILIST_API_URL =
  process.env.ANILIST_API_URL ?? "https://graphql.anilist.co";

/*
  Single place that owns all AniList traffic. Rate-limit handling lives here only:
  - Requests are serialized and spaced (server-side throttle) so a traffic spike
    can't blow AniList's budget (~30 req/min while degraded, 90 normally).
  - A 429 is retried using the Retry-After header, falling back to exponential
    backoff. Reads are cached by Next on top of this, so real outbound calls are rare.
*/

const MIN_INTERVAL_MS = 700;
const MAX_RETRIES = 3;

let lastRequestAt = 0;
let queue: Promise<unknown> = Promise.resolve();

function spaceRequests(): Promise<void> {
  const run = () =>
    new Promise<void>((resolve) => {
      const delay = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastRequestAt));
      setTimeout(() => {
        lastRequestAt = Date.now();
        resolve();
      }, delay);
    });
  const next = queue.then(run, run);
  queue = next.catch(() => undefined);
  return next;
}

type FetchInit = RequestInit & { next?: { revalidate?: number } };

async function throttledFetch(url: string, init: FetchInit): Promise<Response> {
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
 * @param document  A TypedDocumentString produced by graphql-codegen.
 * @param variables Query variables (typed against the document).
 * @param revalidate Seconds Next should cache this response (default 1h).
 */
export async function anilistRequest<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  variables?: TVariables,
  revalidate = 3600,
): Promise<TResult> {
  const res = await throttledFetch(ANILIST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: document.toString(), variables }),
    next: { revalidate },
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
