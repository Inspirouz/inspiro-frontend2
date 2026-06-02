import { useState, useEffect } from 'react';
import type { CategoryItem } from '@/types';
import { CATEGORIES as FALLBACK_NAMES } from '@/constants';

const FALLBACK_CATEGORIES: CategoryItem[] = FALLBACK_NAMES.map((name) => ({ id: name, name }));

export function useCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    fetch(`${apiUrl}/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) {
          const list = (data.data as Array<{ id?: string; name?: string; is_active?: boolean }>)
            .filter((item) => item.is_active !== false)
            .map((item) => ({
              id: item.id ?? '',
              name: item.name ?? '',
            }))
            .filter((item) => item.id && item.name);
          if (list.length) setCategories(list);
        }
      })
      .catch(() => {
        setError('Не удалось загрузить категории');
        setCategories(FALLBACK_CATEGORIES);
      })
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading, error };
}
