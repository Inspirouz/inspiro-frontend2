import { useEffect, useRef, useState } from "react";
import MainContent from "@/components/MainContent";
import { CATEGORIES } from "@/constants";
import { useSEO } from "@/hooks/useSEO";
import '@/styles/header-search.css';

const HomePage = () => {
  // SEO optimization
  useSEO({
    title: 'Inspiro - UI/UX Patterns va Design Elements',
    description: 'Zamonaviy UI/UX dizayn patternlar, scenario va elementlar to\'plami. Dizayn ilhomlari va best practices.',
    keywords: 'UI design, UX design, design patterns, UI elements, UX scenarios, design inspiration',
    ogUrl: 'https://inspiro.com/',
  });
  const containerRef = useRef<HTMLUListElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0] || '');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <>
      <section className="main-content-links" aria-label="Category filters">
        <ul className="link-list" ref={containerRef} role="list">
          {CATEGORIES.map((category) => (
            <li 
              key={category} 
              className={`link-item ${activeCategory === category ? 'active' : ''}`}
              role="listitem"
              aria-label={`Filter by ${category}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </li>
          ))}
        </ul>
      </section>
      <MainContent />
    </>
  );
};

export default HomePage;

