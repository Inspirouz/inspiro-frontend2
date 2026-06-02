import { useState, useEffect, useCallback } from 'react';

export type ScreenCategoryItem = { id: string; label: string; count: number };

const DEFAULT_SCREEN_CATEGORIES: ScreenCategoryItem[] = [
  { id: 'all', label: 'Все', count: 12 },
  { id: 'onboarding', label: 'Онбординг', count: 2 },
  { id: 'registration', label: 'Регистрация', count: 3 },
  { id: 'main', label: 'Главный экран', count: 5 },
  { id: 'cart', label: 'Корзина', count: 2 },
];

function mapItem(raw: Record<string, unknown>): ScreenCategoryItem {
  const id = String(raw.id ?? raw.slug ?? '');
  const label = String(raw.label ?? raw.name ?? '');
  const count = Number(raw.count ?? raw.screens_count ?? 0);
  return { id, label, count };
}

export function useScreensCategories(projectId?: string | null) {
  const [categories, setCategories] = useState<ScreenCategoryItem[]>(DEFAULT_SCREEN_CATEGORIES);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (projectId) params.set('project_id', projectId);
      const res = await fetch(`${apiUrl}/screens-categories${params.toString() ? `?${params}` : ''}`);
      const json = await res.json().catch(() => ({}));
      const data = json?.data ?? json;
      const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      const ok = json?.success === true || (json?.status_code >= 200 && json?.status_code < 300);
      if (ok && list.length > 0) {
        setCategories(list.map((x: Record<string, unknown>) => mapItem(x)));
      }
    } catch {
      setCategories(DEFAULT_SCREEN_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { subCategories: categories, loading };
}
