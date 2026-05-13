import { useState, useEffect, useCallback } from 'react';
import type { ContentItem } from '@/types';

function getImageBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  // Remove trailing /api or /api/ if present, then append /images/
  const root = apiUrl.replace(/\/api\/?$/, '');
  return `${root}/images/`;
}

function toImageUrl(image: string): string {
  if (!image) return '';
  let cleaned = image;
  const matches = [...image.matchAll(/https?:\/+/gi)];
  const last = matches.length > 0 ? matches[matches.length - 1] : undefined;
  if (last && last.index !== undefined && last.index > 0) cleaned = image.slice(last.index);
  cleaned = cleaned.replace(/^(https?:)\/+/i, '$1//');
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  const path = cleaned.startsWith('/') ? cleaned.slice(1) : cleaned;
  return `${getImageBaseUrl()}${path}`;
}

type ImageItem = string | { path?: string; file_name?: string };

function getImagePaths(raw: Record<string, unknown>): string[] {
  const images = raw.images as ImageItem[] | undefined;
  if (Array.isArray(images) && images.length > 0) {
    return images
      .map((img) => {
        if (typeof img === 'string') return img;
        return (img.path ?? img.file_name ?? '') as string;
      })
      .filter(Boolean);
  }
  const single = raw.image as string | undefined;
  return single ? [single] : [];
}

function formatDateDDMMYYYYHHMM(isoString: string | undefined): string | undefined {
  if (!isoString) return undefined;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return undefined;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

function mapProjectToContentItem(raw: Record<string, unknown>): ContentItem {
  const id = (raw.id as string) ?? '';
  const paths = getImagePaths(raw);
  const logoUrl = (raw.logo as string) ? toImageUrl(raw.logo as string) : undefined;
  const app_name = (raw.app_name ?? raw.name ?? raw.title ?? '') as string;
  const description = (raw.description as string) ?? '';
  const categories = (raw.categories as Array<{ name?: string }>) ?? [];
  const text_info = description || categories[0]?.name || '';
  const platforms = raw.platforms as string[] | undefined;
  const updated_at = raw.updated_at as string | undefined;

  const firstImageUrl = paths[0] ? toImageUrl(paths[0]) : '';
  const imagesUrls =
    paths.length > 1 ? paths.map(toImageUrl) : firstImageUrl ? [firstImageUrl] : [];



  return {
    id,
    app_name,
    // img1,
    // img2,
    ...(logoUrl && { logo: logoUrl }),
    ...(imagesUrls.length > 0 && { images: imagesUrls }),
    ...(text_info && { text_info }),
    ...(description && { description }),
    ...(platforms && platforms.length > 0 && { platforms }),
    ...(categories.length > 0 && { categories }),
    ...(updated_at && { updated_at }),
  };
}

export function useProjects(category?: string) {
  const [projects, setProjects] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category_id', category);
      const res = await fetch(`${apiUrl}/projects${params.toString() ? `?${params.toString()}` : ''}`);
      const json = await res.json().catch(() => ({}));
      const payload = json?.data ?? json;
      const list = Array.isArray(payload?.items) ? payload.items : [];
      const ok = json?.success === true || (json?.status_code >= 200 && json?.status_code < 300);
      if (!ok && res.ok === false) {
        throw new Error(json?.message || 'Ошибка загрузки');
      }
      setProjects(list.map((item: Record<string, unknown>) => mapProjectToContentItem(item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
}

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setProject(null);
      setLoading(false);
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    setError(null);
    fetch(`${apiUrl}/projects/${id}`)
      .then((res) => res.json())
      .then((json) => {
        const ok = json?.success === true || (json?.status_code >= 200 && json?.status_code < 300);
        const data = json?.data;
        // Response: { success, data: { id, name, description, platforms, categories, images } }
        const raw =
          data && typeof data === 'object' && !Array.isArray(data) && (data as Record<string, unknown>).id
            ? (data as Record<string, unknown>)
            : Array.isArray(data?.items) && data.items[0]
              ? (data.items[0] as Record<string, unknown>)
              : null;
        if (ok && raw) {
          setError(null);
          setProject(mapProjectToContentItem(raw));
        } else {
          setProject(null);
          if (!ok) setError((json?.message as string) || 'Ошибка загрузки');
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
        setProject(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { project, loading, error };
}

export type ScreenItem = {
  /** Unique image id (for modal and keys) */
  id: string | number;
  /** Backend screen id used in /projects/{projectId}/screens/{id} */
  screenId: string | number;
  title: string;
  image: string;
};

type ApiScreen = {
  id?: string;
  screensCategory?: { name?: string };
  images?: Array<string | { id?: string; path?: string; file_name?: string }>;
};

function flattenScreensFromApi(list: ApiScreen[]): ScreenItem[] {
  const result: ScreenItem[] = [];
  for (const screen of list) {
    const categoryName = (screen.screensCategory?.name ?? screen.id ?? '') as string;
    const images = screen.images ?? [];
    for (const img of images) {
      const path =
        typeof img === 'string' ? img : ((img.path ?? img.file_name ?? '') as string);
      if (path) {
        result.push({
          id: (typeof img === 'string' ? undefined : (img.id as string)) ?? `${screen.id}-${result.length}`,
          screenId: (screen.id as string) ?? `${screen.id ?? 'screen'}-${result.length}`,
          title: categoryName,
          image: toImageUrl(path),
        });
      }
    }
  }
  return result;
}

export function useProjectScreens(projectId: string | undefined) {
  const [screens, setScreens] = useState<ScreenItem[]>([]);
  const [loading, setLoading] = useState(!!projectId);

  useEffect(() => {
    if (!projectId) {
      setScreens([]);
      setLoading(false);
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    fetch(`${apiUrl}/projects/${projectId}/screens`)
      .then((res) => res.json())
      .then((json) => {
        const data = json?.data ?? json;
        const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        const ok = json?.success === true || (json?.status_code >= 200 && json?.status_code < 300);
        if (ok && list.length > 0) {
          setScreens(flattenScreensFromApi(list as ApiScreen[]));
        } else {
          setScreens([]);
        }
      })
      .catch(() => setScreens([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  return { screens, loading };
}

export type ScenarioItem = ScreenItem & {
  categoryId?: string;
  projectId?: string;
  projectName?: string;
  projectLogo?: string;
};

type ApiScenarioCategory = {
  id?: string;
  is_deleted?: boolean;
  parent_id?: string | null;
  tag?: { id?: string; name?: string };
  scenarios?: ApiScenario[];
};

type ApiScenario = {
  id?: string;
  is_deleted?: boolean;
  scenario_category_id?: string;
  images?: Array<{ id?: string; path?: string; file_name?: string }>;
};

/**
 * Fetches scenarios for a project from GET /projects/:projectId/scenarios.
 * API returns data = array of categories; each has id, tag.name, scenarios[]; each scenario has id, images[].
 * Returns screens grouped by category id (one card per image).
 */
export function useProjectScenarios(projectId: string | undefined) {
  const [scenariosByCategoryId, setScenariosByCategoryId] = useState<Record<string, ScenarioItem[]>>({});
  const [allScenarios, setAllScenarios] = useState<ScenarioItem[]>([]);
  const [loading, setLoading] = useState(!!projectId);

  useEffect(() => {
    if (!projectId) {
      setScenariosByCategoryId({});
      setAllScenarios([]);
      setLoading(false);
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    fetch(`${apiUrl}/projects/${projectId}/scenarios`)
      .then((res) => res.json())
      .then((json) => {
        const data = json?.data ?? json;
        const categories: ApiScenarioCategory[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        const ok = json?.success === true || (json?.status_code >= 200 && json?.status_code < 300);
        if (!ok || !Array.isArray(categories)) {
          setScenariosByCategoryId({});
          setAllScenarios([]);
          return;
        }
        const byCategory: Record<string, ScenarioItem[]> = {};
        const all: ScenarioItem[] = [];
        for (const cat of categories) {
          if (cat.is_deleted) continue;
          const categoryId = String(cat.id ?? '');
          const categoryName = (cat.tag && typeof cat.tag === 'object' && cat.tag.name) ? String(cat.tag.name) : categoryId;
          const scenarioList = Array.isArray(cat.scenarios) ? cat.scenarios : [];
          for (const scenario of scenarioList) {
            if (scenario.is_deleted) continue;
            const scenarioId = String(scenario.id ?? '');
            const images = Array.isArray(scenario.images) ? scenario.images : [];
            for (const img of images) {
              const path = (img.path ?? img.file_name) as string | undefined;
              if (!path) continue;
              const item: ScenarioItem = {
                id: String(img.id ?? `${scenarioId}-${path}`),
                screenId: scenarioId,
                title: categoryName,
                image: toImageUrl(path),
                categoryId,
              };
              if (!byCategory[categoryId]) byCategory[categoryId] = [];
              byCategory[categoryId].push(item);
              all.push(item);
            }
          }
        }
        setScenariosByCategoryId(byCategory);
        setAllScenarios(all);
      })
      .catch(() => {
        setScenariosByCategoryId({});
        setAllScenarios([]);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  return { scenariosByCategoryId, allScenarios, loading };
}

// Per-screen details for ImagePreviewModal side panel (API may return objects with id/name/type)
export interface ScreenDetails {
  uploadDate?: string;
  resolution?: string;
  scenarios?: (string | Record<string, unknown>)[];
  uiElements?: (string | Record<string, unknown>)[];
  patterns?: (string | Record<string, unknown>)[];
}

type TagLike = { id?: unknown; name?: unknown; type?: unknown };

/**
 * Normalizes an API tag entry into `{ id, name, type }`.
 * Handles items shaped like `{ tag: { id, name } }` (e.g. senarys/scenarios from /projects/:id/scenarios/:scenarioId)
 * and falls back to top-level `id`/`name` when no nested `tag` is present.
 */
function normalizeTagEntries(raw: unknown): (string | { id?: string; name?: string; type?: string })[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: (string | { id?: string; name?: string; type?: string })[] = [];
  for (const item of raw) {
    if (item == null) continue;
    if (typeof item === 'string') {
      out.push(item);
      continue;
    }
    if (typeof item !== 'object') continue;
    const obj = item as Record<string, unknown>;
    const nestedTag = (obj.tag && typeof obj.tag === 'object') ? (obj.tag as TagLike) : undefined;
    const name =
      (nestedTag?.name as string | undefined) ??
      (obj.name as string | undefined) ??
      (obj.label as string | undefined);
    const id =
      (obj.id as string | undefined) ??
      (nestedTag?.id as string | undefined);
    const type =
      (nestedTag?.type as string | undefined) ??
      (obj.type as string | undefined);
    if (name || id) {
      out.push({
        ...(id ? { id: String(id) } : {}),
        ...(name ? { name: String(name) } : {}),
        ...(type ? { type: String(type) } : {}),
      });
    }
  }
  return out;
}

function pickArrayField(data: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    const val = data[key];
    if (Array.isArray(val)) return val;
  }
  return undefined;
}

export function useScreenDetails(
  projectId: string | undefined,
  screenId: string | null
) {
  const [details, setDetails] = useState<ScreenDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId || !screenId) {
      setDetails(null);
      setLoading(false);
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    fetch(`${apiUrl}/projects/${projectId}/screens/${screenId}`)
      .then((res) => res.json())
      .then((json) => {
        const data = json?.data ?? json;
        if (!data || typeof data !== 'object') {
          setDetails(null);
          return;
        }
        const d = data as Record<string, unknown>;
        const rawDate =
          (d.upload_date as string | undefined) ??
          (d.uploadDate as string | undefined) ??
          (d.created_at as string | undefined) ??
          (d.updated_at as string | undefined);
        const uploadDate = formatDateDDMMYYYYHHMM(rawDate);
        const resolution = d.resolution as string | undefined;
        const scenarios = normalizeTagEntries(pickArrayField(d, 'senarys', 'scenarios', 'senary'));
        const uiElements = normalizeTagEntries(pickArrayField(d, 'ui_elements', 'uiElements', 'uiElement'));
        const patterns = normalizeTagEntries(pickArrayField(d, 'patterns', 'pattern'));
        setDetails({
          uploadDate,
          resolution,
          scenarios,
          uiElements,
          patterns,
        });
      })
      .catch(() => {
        setDetails(null);
      })
      .finally(() => setLoading(false));
  }, [projectId, screenId]);

  return { details, loading };
}

/**
 * Fetches a single scenario for the preview modal from GET /projects/:projectId/scenarios/:scenarioId.
 * Maps response to the same ScreenDetails shape as useScreenDetails for the modal sidebar.
 */
export function useScenarioDetails(
  projectId: string | undefined,
  scenarioId: string | null
) {
  const [details, setDetails] = useState<ScreenDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId || !scenarioId) {
      setDetails(null);
      setLoading(false);
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    fetch(`${apiUrl}/projects/${projectId}/scenarios/${scenarioId}`)
      .then((res) => res.json())
      .then((json) => {
        const data = json?.data ?? json;
        if (!data || typeof data !== 'object') {
          setDetails(null);
          return;
        }
        const d = data as Record<string, unknown>;
        const rawDate =
          (d.upload_date as string | undefined) ??
          (d.uploadDate as string | undefined) ??
          (d.created_at as string | undefined) ??
          (d.updated_at as string | undefined);
        const uploadDate = formatDateDDMMYYYYHHMM(rawDate);
        const resolution = d.resolution as string | undefined;
        const scenarios = normalizeTagEntries(pickArrayField(d, 'senarys', 'scenarios', 'senary'));
        const uiElements = normalizeTagEntries(pickArrayField(d, 'ui_elements', 'uiElements', 'uiElement'));
        const patterns = normalizeTagEntries(pickArrayField(d, 'patterns', 'pattern'));
        setDetails({
          uploadDate,
          resolution,
          scenarios,
          uiElements,
          patterns,
        });
      })
      .catch(() => {
        setDetails(null);
      })
      .finally(() => setLoading(false));
  }, [projectId, scenarioId]);

  return { details, loading };
}
