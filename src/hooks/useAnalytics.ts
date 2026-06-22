import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  trackPageView,
  trackSearch,
  trackTagClick,
  trackPatternView,
} from '@/lib/analytics';

/**
 * Fires a single page_view on every route change. Deduplicates against the
 * last tracked path so React StrictMode's double-render (and rapid re-renders)
 * never produce duplicate events.
 */
export function usePageViewTracking(): void {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname + location.search;
    if (lastPath.current === path) return;
    lastPath.current = path;
    trackPageView(path);
  }, [location.pathname, location.search]);
}

/** Convenience accessor for the event helpers. */
export function useAnalytics() {
  return { trackSearch, trackTagClick, trackPatternView };
}
