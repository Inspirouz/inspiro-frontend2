import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/pages';
import ErrorBoundary from '@/components/ErrorBoundary';
import HomePage from '@/pages/HomePage';
import PatternsPage from '@/pages/PatternsPage';
import ScenariosPage from '@/pages/ScenariosPage';
import UiElementsPage from '@/pages/UiElementsPage';
import DetailPage from '@/pages/DetailPage';
import SearchPage from '@/pages/SearchPage';
import TagDetailPage from '@/pages/TagDetailPage';
import ScenarioTreePage from '@/pages/ScenarioTreePage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import MobileUnavailablePage from '@/pages/MobileUnavailablePage';
import { usePageViewTracking } from '@/hooks/useAnalytics';
// import ProtectedRoute from '@/components/ProtectedRoute';

const MOBILE_QUERY = '(max-width: 768px)';

/** Mounted inside the Router; emits a page_view on each route change. */
const AnalyticsTracker = () => {
  usePageViewTracking();
  return null;
};

const App = () => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  if (isMobile) {
    return <MobileUnavailablePage />;
  }

  return (
    <div className="container">
      <ErrorBoundary>
          <AnalyticsTracker />
          <Routes>
            <Route path="/mobile-unavailable" element={<MobileUnavailablePage />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="patterns" element={<PatternsPage />} />
              <Route path="scenarios" element={<ScenariosPage />} />
              <Route path="ui_elements" element={<UiElementsPage />} />
              <Route path="detail/:id" element={<DetailPage />} />
              <Route path="detail/:id/scenarios" element={<ScenarioTreePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="patterns/:id" element={<TagDetailPage />} />
              <Route path="ui-elements/:id" element={<TagDetailPage />} />
              <Route path="scenarios/:id" element={<TagDetailPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="terms" element={<TermsPage />} />
              {/* Hozircha subscription page o'chiq
              <Route
                path="subscription"
                element={
                  <ProtectedRoute>
                    <SubscriptionPage />
                  </ProtectedRoute>
                }
              />
              */}
            </Route>
          </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;

