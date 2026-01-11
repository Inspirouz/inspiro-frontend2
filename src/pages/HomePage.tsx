import { useEffect, useRef, useState, useCallback } from "react";
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
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const canScroll = container.scrollLeft < container.scrollWidth - container.clientWidth - 10;
    setCanScrollRight(canScroll);
  }, []);

  const scrollRight = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollBy({ left: 200, behavior: 'smooth' });
  }, []);

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
    container.addEventListener('scroll', checkScroll);
    checkScroll();
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('scroll', checkScroll);
    };
  }, [checkScroll]);

  return (
    <>
      <section className="category-filter-section" aria-label="Category filters">
        <div className="category-filter-wrapper">
          <ul className="category-list" ref={containerRef} role="list">
            {CATEGORIES.map((category) => (
              <li 
                key={category} 
                className={`category-item ${activeCategory === category ? 'active' : ''}`}
                role="listitem"
                aria-label={`Filter by ${category}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </li>
            ))}
          </ul>
          {canScrollRight && (
            <button 
              className="category-scroll-btn"
              onClick={scrollRight}
              aria-label="Scroll right"
            >
             <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.9375 7.9375L14.9375 7.9375" stroke="#D9F743" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.9375 0.9375L14.9375 7.9375L7.9375 14.9375" stroke="#D9F743" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

            </button>
          )}
        </div>
      </section>
      <MainContent />
    </>
  );
};

export default HomePage;

