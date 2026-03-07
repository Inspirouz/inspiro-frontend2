import { useState, useEffect } from 'react';
import type { ContentItem } from '@/types';

const IMAGE_BASE_URL = 'https://dev.api.inspiro.uz/images/';

function toImageUrl(image: string): string {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  const path = image.startsWith('/') ? image.slice(1) : image;
  return `${IMAGE_BASE_URL}${path}`;
}

type RawItem = Record<string, unknown>;

function getFirstImageUrl(raw: RawItem): string {
  const img = (raw.image ?? raw.logo ?? raw.cover ?? raw.thumbnail ?? raw.path) as string | undefined;
  if (img) return toImageUrl(img);
  const images = raw.images as string[] | Array<{ path?: string; file_name?: string; url?: string }> | undefined;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (typeof first === 'string') return toImageUrl(first);
    const path = (first as { path?: string }).path ?? (first as { file_name?: string }).file_name ?? (first as { url?: string }).url;
    if (path) return toImageUrl(String(path));
  }
  return '';
}

function mapToContentItem(raw: RawItem, index: number): ContentItem {
  const pattern = (raw.pattern ?? raw.project ?? raw) as Record<string, unknown>;
  const id = String(pattern.id ?? raw.id ?? raw.slug ?? `pattern-${index}`);
  const name = String(
    pattern.app_name ?? pattern.name ?? pattern.title
    ?? raw.app_name ?? raw.name ?? raw.title ?? ''
  );
  const logoStr = (pattern.logo ?? pattern.image ?? raw.logo ?? raw.image ?? raw.cover) as string | undefined;
  const imagesRaw = (pattern.images ?? raw.images) as string[] | Array<{ path?: string; file_name?: string }> | undefined;
  let images: string[] = [];
  if (Array.isArray(imagesRaw)) {
    images = imagesRaw
      .map((img) =>
        typeof img === 'string'
          ? toImageUrl(img)
          : toImageUrl(String((img as { path?: string }).path ?? (img as { file_name?: string }).file_name ?? ''))
      )
      .filter(Boolean);
  }
  const firstImage = getFirstImageUrl(pattern as RawItem) || getFirstImageUrl(raw) || (logoStr ? toImageUrl(logoStr) : '') || images[0];
  const logoUrl = logoStr ? toImageUrl(logoStr) : firstImage;
  return {
    id,
    app_name: name || id,
    logo: logoUrl,
    images: images.length ? images : firstImage ? [firstImage] : undefined,
    text_info: (pattern.description ?? pattern.text_info ?? raw.description ?? raw.text_info) as string | undefined,
    screenId: (raw.screen_id ?? pattern.id ?? raw.id ?? id) as string | undefined,
  };
}

/**
 * Fetches patterns for a tag from GET /tags/patterns/:tagId for the Patterns page grid.
 * When tagId is 'all' or falsy, no request is made and an empty array is returned.
 */
export function usePatternsByTag(tagId: string | null) {
  const [patterns, setPatterns] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tagId || tagId === 'all') {
      setPatterns([]);
      setLoading(false);
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    fetch(`${apiUrl}/tags/patterns/${tagId}`)
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
          const ok = res.ok || json?.success === true || (json?.status_code >= 200 && json?.status_code < 300);
          setPatterns(ok && list.length > 0 ? list.map((item: RawItem, i: number) => mapToContentItem(item, i)) : []);
        })
      )
      .catch(() => setPatterns([]))
      .finally(() => setLoading(false));
  }, [tagId]);

  return { patterns, loading };
}
