import { useState, useEffect, useCallback } from 'react';
import type { ContentItem } from '@/types';

const IMAGE_BASE_URL = 'https://dev.api.inspiro.uz/images/';

function toImageUrl(image: string): string {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  const path = image.startsWith('/') ? image.slice(1) : image;
  return `${IMAGE_BASE_URL}${path}`;
}

type ImageItem = { path?: string; file_name?: string };

function getImagePaths(raw: Record<string, unknown>): string[] {
  const images = raw.images as ImageItem[] | undefined;
  if (Array.isArray(images) && images.length > 0) {
    return images.map((img) => (img.path ?? img.file_name ?? '') as string).filter(Boolean);
  }
  const single = raw.image as string | undefined;
  return single ? [single] : [];
}

function mapProjectToContentItem(raw: Record<string, unknown>): ContentItem {
  const id = (raw.id as string) ?? '';
  const paths = getImagePaths(raw);
  const img1 = paths[0] ? toImageUrl(paths[0]) : '';
  const logoUrl = (raw.logo as string) ? toImageUrl(raw.logo as string) : undefined;
  const img2 = logoUrl ?? img1;
  const app_name = (raw.app_name ?? raw.name ?? raw.title ?? '') as string;
  const description = (raw.description as string) ?? '';
  const categories = (raw.categories as Array<{ name?: string }>) ?? [];
  const text_info = description || categories[0]?.name || '';
  const platforms = raw.platforms as string[] | undefined;
  const updated_at = raw.updated_at as string | undefined;

  const imagesUrls = paths.length > 1 ? paths.map(toImageUrl) : undefined;

  return {
    id,
    img1,
    img2,
    ...(logoUrl && { logo: logoUrl }),
    ...(imagesUrls && imagesUrls.length > 0 && { images: imagesUrls }),
    app_name,
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

export type ScreenItem = { id: string | number; title: string; image: string };

type ApiScreen = {
  id?: string;
  screensCategory?: { name?: string };
  images?: Array<{ id?: string; path?: string; file_name?: string }>;
};

function flattenScreensFromApi(list: ApiScreen[]): ScreenItem[] {
  const result: ScreenItem[] = [];
  for (const screen of list) {
    const categoryName = (screen.screensCategory?.name ?? screen.id ?? '') as string;
    const images = screen.images ?? [];
    for (const img of images) {
      const path = (img.path ?? img.file_name ?? '') as string;
      if (path) {
        result.push({
          id: (img.id as string) ?? `${screen.id}-${result.length}`,
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
