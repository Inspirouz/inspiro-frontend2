import { useState, useEffect } from 'react';
import { cachedFetch } from '@/lib/apiCache';

export type UiScreen = {
  path: string;
  screen_id?: string;
  project_id: string;
  project_name: string;
  project_logo: string;
};

export type UiElementGroup = {
  id: string;
  label: string;
  screens: UiScreen[];
};

function getImageBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return apiUrl.replace(/\/api\/?$/, '') + '/images/';
}

function toImageUrl(path: string): string {
  if (!path) return '';
  let cleaned = path;
  const matches = [...path.matchAll(/https?:\/+/gi)];
  const last = matches.length > 0 ? matches[matches.length - 1] : undefined;
  if (last && last.index !== undefined && last.index > 0) cleaned = path.slice(last.index);
  cleaned = cleaned.replace(/^(https?:)\/+/i, '$1//');
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return getImageBaseUrl() + (cleaned.startsWith('/') ? cleaned.slice(1) : cleaned);
}

/**
 * Fetches UI element tags with screens from GET /tags/ui-elements/with-screens.
 * Used for the main content area.
 */
export function useUiElementsWithScreens() {
  const [groups, setGroups] = useState<UiElementGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    cachedFetch(`${apiUrl}/tags/ui-elements/with-screens`)
      .then((json) => {
          const ok =
            json?.success === true ||
            (json?.status_code >= 200 && json?.status_code < 300);
          const data = json?.data;
          if (!ok || !Array.isArray(data)) {
            setGroups([]);
            return;
          }
          const mapped: UiElementGroup[] = data
            .map((entry: { tag?: { id?: string; name?: string; is_deleted?: boolean }; screens?: UiScreen[] }) => {
              const tag = entry.tag;
              if (!tag || tag.is_deleted) return null;
              const id = String(tag.id ?? '');
              if (!id) return null;
              const screens: UiScreen[] = Array.isArray(entry.screens)
                ? entry.screens.map((s) => ({
                    path: toImageUrl(s.path),
                    screen_id: s.screen_id,
                    project_id: s.project_id,
                    project_name: s.project_name,
                    project_logo: toImageUrl(s.project_logo),
                  }))
                : [];
              return { id, label: String(tag.name ?? ''), screens };
            })
            .filter((g): g is UiElementGroup => g != null);
          setGroups(mapped);
        })
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  return { groups, loading };
}
