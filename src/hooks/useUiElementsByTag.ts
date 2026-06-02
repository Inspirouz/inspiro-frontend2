import { useState, useEffect } from 'react';
import type { ContentItem } from '@/types';

function getImageBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || '';
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

type RawItem = Record<string, unknown>;

function getFirstImageUrl(raw: RawItem): string {
  const img = (raw.image ?? raw.logo ?? raw.cover ?? raw.thumbnail ?? raw.path) as string | undefined;
  if (img) return toImageUrl(img);
  const images = raw.images as string[] | Array<{ path?: string; file_name?: string; url?: string }> | undefined;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (typeof first === 'string') return toImageUrl(first);
    const path =
      (first as { path?: string }).path ??
      (first as { file_name?: string }).file_name ??
      (first as { url?: string }).url;
    if (path) return toImageUrl(String(path));
  }
  return '';
}

function mapToContentItem(raw: RawItem, index: number): ContentItem {
  const inner = (raw.screen ?? raw.project ?? raw) as Record<string, unknown>;
  const id = String(inner.id ?? raw.id ?? raw.slug ?? `ui-element-${index}`);
  const name = String(
    inner.app_name ?? inner.name ?? inner.title ??
    raw.app_name ?? raw.name ?? raw.title ?? ''
  );
  const logoStr = (inner.logo ?? inner.image ?? raw.logo ?? raw.image ?? raw.cover) as string | undefined;
  const imagesRaw = (inner.images ?? raw.images) as
    | string[]
    | Array<{ path?: string; file_name?: string }>
    | undefined;
  let images: string[] = [];
  if (Array.isArray(imagesRaw)) {
    images = imagesRaw
      .map((img) =>
        typeof img === 'string'
          ? toImageUrl(img)
          : toImageUrl(
              String(
                (img as { path?: string }).path ??
                  (img as { file_name?: string }).file_name ??
                  ''
              )
            )
      )
      .filter(Boolean);
  }
  const firstImage =
    getFirstImageUrl(inner as RawItem) ||
    getFirstImageUrl(raw) ||
    (logoStr ? toImageUrl(logoStr) : '') ||
    images[0];
  const logoUrl = logoStr ? toImageUrl(logoStr) : firstImage;
  return {
    id,
    app_name: name || id,
    logo: logoUrl,
    images: images.length ? images : firstImage ? [firstImage] : undefined,
    text_info: (inner.description ?? inner.text_info ?? raw.description ?? raw.text_info) as
      | string
      | undefined,
    screenId: (raw.screen_id ?? inner.id ?? raw.id ?? id) as string | undefined,
  };
}

/**
 * Fetches UI elements for a tag from GET /tags/ui_elements/:tagId.
 * When tagId is null or 'all', returns an empty array (caller should fall back to content data).
 */
export function useUiElementsByTag(tagId: string | null) {
  const [elements, setElements] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tagId || tagId === 'all') {
      setElements([]);
      setLoading(false);
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    fetch(`${apiUrl}/tags/ui_elements/${tagId}`)
      .then((res) =>
        res.json().then((json) => {
          const data = json?.data ?? json;
          const list = Array.isArray(data)
            ? data
            : Array.isArray((data as { items?: unknown[] })?.items)
              ? (data as { items: unknown[] }).items
              : Array.isArray((data as { results?: unknown[] })?.results)
                ? (data as { results: unknown[] }).results
                : [];
          const ok =
            res.ok || json?.success === true || (json?.status_code >= 200 && json?.status_code < 300);
          setElements(
            ok && list.length > 0
              ? list.map((item: RawItem, i: number) => mapToContentItem(item, i))
              : []
          );
        })
      )
      .catch(() => setElements([]))
      .finally(() => setLoading(false));
  }, [tagId]);

  return { elements, loading };
}
