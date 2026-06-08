import { useState, useEffect } from 'react';

export function useProjectsCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    fetch(`${apiUrl}/projects`)
      .then((res) => res.json())
      .then((json) => {
        const data = json?.data ?? json;
        const total =
          data?.total ??
          data?.count ??
          (Array.isArray(data?.items) ? data.items.length : null) ??
          (Array.isArray(data) ? data.length : null);
        setCount(typeof total === 'number' ? total : null);
      })
      .catch(() => setCount(null));
  }, []);

  return count;
}
