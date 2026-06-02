import { useState, useEffect } from 'react';

export type UiElementTagItem = {
  id: string;
  label: string;
  count: number;
};

type RawEntry = {
  tag?: {
    id?: string;
    name?: string;
    is_deleted?: boolean;
  };
  count?: number;
  screen_count?: number;
};

function mapEntry(raw: RawEntry): UiElementTagItem | null {
  const tag = raw.tag;
  if (!tag) return null;
  const id = String(tag.id ?? '');
  if (!id) return null;
  if (tag.is_deleted) return null;
  const label = String(tag.name ?? '');
  const count = Number(raw.count ?? raw.screen_count ?? 0);
  if (count === 0) return null;
  return { id, label, count };
}

/**
 * Fetches UI element tags with counts from GET /tags/ui-elements/with-count.
 * Used for the left sidebar.
 */
export function useUiElementsTags() {
  const [tags, setTags] = useState<UiElementTagItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    fetch(`${apiUrl}/tags/ui-elements/with-count`)
      .then((res) =>
        res.json().then((json) => {
          const ok =
            res.ok ||
            json?.success === true ||
            (json?.status_code >= 200 && json?.status_code < 300);
          const data = json?.data;
          const list: RawEntry[] = Array.isArray(data) ? data : [];
          setTags(
            ok && list.length > 0
              ? list.map(mapEntry).filter((t): t is UiElementTagItem => t != null)
              : []
          );
        })
      )
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, []);

  return { tags, loading };
}
