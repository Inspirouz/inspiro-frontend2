import { useState, useEffect } from 'react';

export type PatternTagItem = {
  id: string;
  label: string;
  count: number;
};

type RawTag = Record<string, unknown>;

function mapTag(raw: RawTag): PatternTagItem | null {
  const id = String(raw.id ?? raw.slug ?? '');
  if (!id) return null;
  const label = String(raw.name ?? raw.label ?? '');
  const count = Number(raw.count ?? raw.patterns_count ?? 0);
  return { id, label, count };
}

/**
 * Fetches pattern tags (categories) from GET /tags?type=patterns for the Patterns page sidebar.
 */
export function usePatternTags() {
  const [tags, setTags] = useState<PatternTagItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    fetch(`${apiUrl}/tags?type=patterns`)
      .then((res) =>
        res.json().then((json) => {
          const data = json?.data ?? json;
          const list = Array.isArray(data)
            ? data
            : Array.isArray((data as { items?: unknown[] })?.items)
              ? (data as { items: unknown[] }).items
              : [];
          const ok = res.ok || json?.success === true || (json?.status_code >= 200 && json?.status_code < 300);
          const mapped =
            ok && list.length > 0
              ? (list as RawTag[]).map((x) => mapTag(x)).filter((t): t is PatternTagItem => t != null)
              : [];
          setTags(mapped);
        })
      )
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, []);

  return { tags, loading };
}
