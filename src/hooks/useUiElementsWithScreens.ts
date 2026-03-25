import { useState, useEffect } from 'react';

export type UiScreen = {
  path: string;
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
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return getImageBaseUrl() + (path.startsWith('/') ? path.slice(1) : path);
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
    fetch(`${apiUrl}/tags/ui-elements/with-screens`)
      .then((res) =>
        res.json().then((json) => {
          const ok =
            res.ok ||
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
      )
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  return { groups, loading };
}
