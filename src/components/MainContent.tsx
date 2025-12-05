import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import contentData from "@/data/content";
import Card from "@/components/Card";
import type { ContentItem } from '@/types';
import '@/styles/header-search.css';

const MainContent = () => {
  const navigate = useNavigate();
  // Memoize content to prevent unnecessary re-renders
  const memoizedContent = useMemo(() => contentData, []);

  const handleCardClick = (item: ContentItem) => {
    navigate(`/detail/${item.id}`);
  };

  return (
    <main className="main-content-view" role="main" aria-label="Main content">
      {memoizedContent.map((item) => (
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

