const TTL = 5 * 60 * 1000; // 5 minutes

const cache = new Map<string, { data: unknown; timestamp: number }>();
const pending = new Map<string, Promise<unknown>>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cachedFetch(url: string): Promise<any> {
  const now = Date.now();
  const hit = cache.get(url);
  if (hit && now - hit.timestamp < TTL) {
    return Promise.resolve(hit.data);
  }

  const inflight = pending.get(url);
  if (inflight) return inflight;

  const promise = fetch(url)
    .then((res) => res.json())
    .then((data) => {
      cache.set(url, { data, timestamp: Date.now() });
      pending.delete(url);
      return data;
    })
    .catch((err) => {
      pending.delete(url);
      throw err;
    });

  pending.set(url, promise);
  return promise;
}

export function invalidateCache(urlPattern?: string) {
  if (!urlPattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(urlPattern)) cache.delete(key);
  }
}
