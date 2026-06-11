import { cachedFetch } from '@/lib/apiCache';
import { useState, useEffect } from 'react';
import type { ContentItem } from '@/types';

function getImageBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const root = apiUrl.replace(/\/api\/?$/, '');
  return `${root}/images/`;
}

function toImageUrl(image?: string | null): string {
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

type ScreenRaw = {
  id?: string;
  path?: string;
  project_id?: string;
  project_name?: string;
  project_logo?: string;
};

type TagRaw = {
  id: string;
  name: string;
};

type TagWithScreensRaw = {
  tag: TagRaw;
  screens: ScreenRaw[];
};

function mapScreenToContentItem(screen: ScreenRaw, index: number, tagId: string): ContentItem {
  const id = String(screen.id ?? `screen-${tagId}-${index}`);
  const imageUrl = toImageUrl(screen.path);
  const logoUrl = typeof screen.project_logo === 'string' && screen.project_logo.length > 0
    ? toImageUrl(screen.project_logo)
    : imageUrl;
  
  return {
    id,
    app_name: screen.project_name || 'Unknown',
    logo: logoUrl,
    images: imageUrl ? [imageUrl] : undefined,
    text_info: screen.project_name || '',
    screenId: id,
  };
}

/**
 * Fetches patterns for a tag from GET /api/tags/patterns/with-screens?tag_id=:tagId
 * If tagId is null or 'all', it fetches without the tag_id parameter to get all screens.
 */
export function usePatternsByTag(tagId: string | null) {
  const [patterns, setPatterns] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    
    const query = tagId && tagId !== 'all' ? `?tag_id=${tagId}` : '';
    
    cachedFetch(`${apiUrl}/tags/patterns/with-screens${query}`)
      .then((json) => {
          const data = json?.data ?? json;
          const list: TagWithScreensRaw[] = Array.isArray(data)
            ? data
            : Array.isArray((data as { items?: unknown[] })?.items)
              ? (data as { items: unknown[] }).items
              : Array.isArray((data as { results?: unknown[] })?.results)
                ? (data as { results: unknown[] }).results
                : [];

          const ok = json?.success === true || (json?.status_code >= 200 && json?.status_code < 300);

          if (ok && list.length > 0) {
            const allScreens: ContentItem[] = [];
            list.forEach(tagGroup => {
              if (Array.isArray(tagGroup.screens)) {
                tagGroup.screens.forEach((screen, i) => {
                  allScreens.push(mapScreenToContentItem(screen, i, tagGroup.tag?.id || 'unknown'));
                });
              }
            });
            setPatterns(allScreens);
          } else {
            setPatterns([]);
          }
        })
      .catch(() => setPatterns([]))
      .finally(() => setLoading(false));
  }, [tagId]);

  return { patterns, loading };
}
