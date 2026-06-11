import { useState, useEffect } from 'react';
import { cachedFetch } from '@/lib/apiCache';

export type PatternTagItem = {
  id: string;
  label: string;
  count: number;
};

type RawTag = Record<string, unknown>;

function mapTag(raw: RawTag): PatternTagItem | null {
  const tag = raw.tag as Record<string, unknown> | undefined;
  if (!tag) {
    const id = String(raw.id ?? raw.slug ?? '');
    if (!id) return null;
    const label = String(raw.name ?? raw.label ?? '');
    const count = Number(raw.count ?? raw.patterns_count ?? 0);
    return { id, label, count };
  }
  const id = String(tag.id ?? '');
  if (!id) return null;
  const label = String(tag.name ?? '');
  const count = Number(raw.screen_count ?? 0);
  return { id, label, count };
}

/**
 * Fetches pattern tags (categories) from GET /tags/patterns/with-count for the Patterns page sidebar.
 */
export function usePatternTags() {
  const [tags, setTags] = useState<PatternTagItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    cachedFetch(`${apiUrl}/tags/patterns/with-count`)
      .then((json) => {
          const data = json?.data ?? json;
          const list = Array.isArray(data)
            ? data
            : Array.isArray((data as { items?: unknown[] })?.items)
              ? (data as { items: unknown[] }).items
              : [];
          const ok = json?.success === true || (json?.status_code >= 200 && json?.status_code < 300);
          const mapped =
            ok && list.length > 0
              ? (list as RawTag[]).map((x) => mapTag(x)).filter((t): t is PatternTagItem => t != null)
              : [];
          setTags(mapped);
        })
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, []);

  return { tags, loading };
}
