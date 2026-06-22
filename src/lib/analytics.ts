// Lightweight, fire-and-forget analytics client.
// Sends events to the Inspiro backend without ever blocking the UI.

type EventType = 'page_view' | 'search' | 'tag_click' | 'pattern_view';

const SESSION_KEY = 'inspiro_sid';

function getApiBase(): string {
  const apiUrl = (import.meta.env.VITE_API_URL as string) || '';
  return apiUrl.replace(/\/+$/, '');
}

/** Stable per-tab session id, generated on first use and kept in sessionStorage. */
export function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    // sessionStorage blocked (private mode / SSR) — fall back to an ephemeral id
    return 'no-session';
  }
}

function send(eventType: EventType, payload?: Record<string, unknown>, pageUrl?: string): void {
  const base = getApiBase();
  if (!base) return;
  const body = JSON.stringify({
    session_id: getSessionId(),
    event_type: eventType,
    payload,
    page_url: pageUrl ?? (typeof location !== 'undefined' ? location.pathname + location.search : undefined),
    referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
  });
  try {
    // keepalive lets the request finish even if the page is unloading
    void fetch(`${base}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // never let analytics throw into the app
  }
}

export function trackPageView(pageUrl?: string): void {
  send('page_view', undefined, pageUrl);
}

export function trackSearch(query: string, resultsCount: number): void {
  const q = (query ?? '').trim();
  if (!q) return;
  send('search', { query: q, results_count: resultsCount });
}

export function trackTagClick(tagId: string, tagName: string, group?: string): void {
  if (!tagId) return;
  send('tag_click', { tag_id: tagId, tag_name: tagName, group });
}

export function trackPatternView(patternId: string, name?: string): void {
  if (!patternId) return;
  send('pattern_view', { pattern_id: patternId, name });
}
