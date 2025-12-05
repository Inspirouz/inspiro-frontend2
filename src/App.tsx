import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/pages';
import ErrorBoundary from '@/components/ErrorBoundary';
import PageLoader from '@/components/PageLoader';
import ProtectedRoute from '@/components/ProtectedRoute';

// Code splitting - Lazy loading pages for better performance
const HomePage = lazy(() => import('@/pages/HomePage'));
const PatternsPage = lazy(() => import('@/pages/PatternsPage'));
const UiElementsPage = lazy(() => import('@/pages/UiElementsPage'));
const SubscriptionPage = lazy(() => import('@/pages/SubscriptionPage'));
const DetailPage = lazy(() => import('@/pages/DetailPage'));

const App = () => {
  return (
    <div className="container">
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="patterns" element={<PatternsPage />} />
              <Route path="scenarios" element={<UiElementsPage />} />
              <Route path="ui_elements" element={<UiElementsPage />} />
              <Route path="detail/:id" element={<DetailPage />} />
              <Route
                path="subscription"
                element={
                  <ProtectedRoute>
                    <SubscriptionPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default App;

