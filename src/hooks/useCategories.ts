import { useState, useEffect } from 'react';
import { CATEGORIES as FALLBACK_CATEGORIES } from '@/constants';

export function useCategories() {
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    fetch(`${apiUrl}/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) {
          setCategories(data.data);
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
