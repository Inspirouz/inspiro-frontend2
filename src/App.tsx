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
// import ProtectedRoute from '@/components/ProtectedRoute';

const App = () => {
  return (
    <div className="container">
      <ErrorBoundary>
          <Routes>
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

