import { useState, useEffect } from 'react';
import { cachedFetch } from '@/lib/apiCache';

export type NavCounts = {
  apps: number | null;
  patterns: number | null;
  scenarios: number | null;
  uiElements: number | null;
};

async function fetchCount(url: string, extractor: (json: unknown) => number | null): Promise<number | null> {
  try {
    const json = await cachedFetch(url);
    return extractor(json);
  } catch {
    return null;
  }
}

function countArrayOrItems(json: unknown): number | null {
  if (!json || typeof json !== 'object') return null;
  const j = json as Record<string, unknown>;
  const data = j.data ?? j;
  if (Array.isArray(data)) return data.length;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.total === 'number') return d.total;
    if (typeof d.count === 'number') return d.count;
    if (Array.isArray(d.items)) return d.items.length;
  }
  return null;
}

function countNonDeleted(json: unknown): number | null {
  if (!json || typeof json !== 'object') return null;
  const j = json as Record<string, unknown>;
  const data = j.data ?? j;
  const list = Array.isArray(data) ? data : Array.isArray((data as Record<string, unknown>)?.items) ? (data as Record<string, unknown[]>).items : null;
  if (!list) return null;
  return (list as Array<Record<string, unknown>>).filter((x) => !x.is_deleted).length;
}

function countGroups(json: unknown): number | null {
  if (!json || typeof json !== 'object') return null;
  const j = json as Record<string, unknown>;
  const data = j.data;
  if (!Array.isArray(data)) return null;
  return (data as Array<Record<string, unknown>>).filter(
    (x) => x.tag && !(x.tag as Record<string, unknown>).is_deleted
  ).length;
}

export function useNavCounts(): NavCounts {
  const [counts, setCounts] = useState<NavCounts>({
    apps: null,
    patterns: null,
    scenarios: null,
    uiElements: null,
  });

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL as string;

    Promise.all([
      fetchCount(`${apiUrl}/projects`, countArrayOrItems),
      fetchCount(`${apiUrl}/screens-categories/with-screens`, countGroups),
      fetchCount(`${apiUrl}/scenarios-categories`, countNonDeleted),
      fetchCount(`${apiUrl}/tags/ui-elements/with-screens`, countGroups),
    ]).then(([apps, patterns, scenarios, uiElements]) => {
      setCounts({ apps, patterns, scenarios, uiElements });
    });
  }, []);

  return counts;
}
