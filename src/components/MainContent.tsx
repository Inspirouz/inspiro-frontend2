import { useNavigate } from 'react-router-dom';
import Card from "@/components/Card";
import { useProjects } from "@/hooks/useProjects";
import type { ContentItem } from '@/types';
import '@/styles/header-search.css';

interface MainContentProps {
  category?: string;
}

const MainContent = ({ category }: MainContentProps) => {
  const navigate = useNavigate();
  const { projects, loading, error } = useProjects(category);

  const handleCardClick = (item: ContentItem) => {
    navigate(`/detail/${item.id}`);
  };

  if (loading) {
    return (
      <main className="main-content-view" role="main" aria-label="Main content">
        <div className="main-content-view__loading">Загрузка...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content-view" role="main" aria-label="Main content">
        <div className="main-content-view__error">{error}</div>
      </main>
    );
  }

  return (
    <main className="main-content-view" role="main" aria-label="Main content">
      {projects.map((item) => (
        <Card
          key={item.id}
          item={item}
          variant="default"
          onClick={handleCardClick}
        />
      ))}
    </main>
  );
};

export default MainContent;

