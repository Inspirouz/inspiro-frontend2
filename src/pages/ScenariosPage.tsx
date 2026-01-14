import { useState, useRef, useEffect, useCallback } from "react";
import contentData from "@/data/content";
import { SCENARIO_CATEGORIES, CATEGORIES } from "@/constants";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import { useSEO } from "@/hooks/useSEO";
import '@/styles/header-search.css';
import '@/styles/detail-page.css';

// Category counts based on the design
const SCENARIO_COUNTS: Record<string, number> = {
  '': 12,
  '/search': 2,
  '/login': 3,
  '/cancel': 5,
  '/order': 2,
};

const ScenariosPage = () => {
  // SEO optimization
  useSEO({
    title: 'Сценарии - UI/UX Design Scenarios',
    description: 'UI/UX dizayn scenariylar to\'plami. User flow va interaction patternlari.',
    keywords: 'UI scenarios, UX scenarios, user flows, interaction patterns, mobile app scenarios',
    ogUrl: 'https://inspiro.com/scenarios',
  });
  
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('Все');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const filtersRef = useRef<HTMLUListElement>(null);

  // Create screens array for the modal
  const screens = contentData.map((item) => ({
    id: item.id,
    image: item.img1,
    title: item.app_name,
  }));

  const handleImageClick = (index: number) => {
    setPreviewIndex(index);
    setIsPreviewOpen(true);
  };

  // Check scroll position
  const checkScroll = useCallback(() => {
    const container = filtersRef.current;
    if (!container) return;
    const canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth - 10;
    const canScrollLeft = container.scrollLeft > 10;
    setCanScrollRight(canScrollRight);
    setCanScrollLeft(canScrollLeft);
  }, []);

  // Scroll filters
  const scrollFilters = (direction: 'left' | 'right') => {
    if (filtersRef.current) {
      const scrollAmount = 200;
      filtersRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Set up scroll listeners
  useEffect(() => {
    const container = filtersRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScroll);
    checkScroll();
    
    return () => {
      container.removeEventListener('scroll', checkScroll);
    };
  }, [checkScroll]);

  return (
    <>
      <div className="detail-page__content">
        {/* Left Sidebar */}
        <aside className="detail-page__sidebar">
          <div className="detail-page__subcategories">
            {SCENARIO_CATEGORIES.map((category) => (
              <button
                key={category.path}
                className={`detail-page__subcategory ${activeCategory === category.path ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.path)}
              >
                {category.label}
                <span className="detail-page__subcategory-count">
                  {SCENARIO_COUNTS[category.path] || 0}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="scenarios-page__main detail-page__main with-sidebar">
          {/* Horizontal Category Filters - Same as HomePage */}
          <section className="category-filter-section" aria-label="Category filters">
            <div className="category-filter-wrapper">
              {canScrollLeft && (
                <button 
                  className="category-scroll-btn category-scroll-btn--left"
                  onClick={() => scrollFilters('left')}
                  aria-label="Scroll left"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.0625 7.9375L1.0625 7.9375" stroke="#D9F743" strokeWidth="1.875" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8.0625 0.9375L1.0625 7.9375L8.0625 14.9375" stroke="#D9F743" strokeWidth="1.875" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
              <ul className="category-list" ref={filtersRef} role="list">
                {CATEGORIES.map((category) => (
                  <li 
                    key={category} 
                    className={`category-item ${activeFilter === category ? 'active' : ''}`}
                    role="listitem"
                    aria-label={`Filter by ${category}`}
                    onClick={() => setActiveFilter(category)}
                  >
                    {category}
                  </li>
                ))}
              </ul>
              {canScrollRight && (
                <button 
                  className="category-scroll-btn category-scroll-btn--right"
                  onClick={() => scrollFilters('right')}
                  aria-label="Scroll right"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.9375 7.9375L14.9375 7.9375" stroke="#D9F743" strokeWidth="1.875" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.9375 0.9375L14.9375 7.9375L7.9375 14.9375" stroke="#D9F743" strokeWidth="1.875" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          </section>

          {/* Cards Grid - Same as Patterns Page */}
          <div className="detail-page__grid">
            {contentData.map((item, index) => (
              <div 
                key={item.id} 
                className="patterns-card"
                onClick={() => handleImageClick(index)}
              >
                {/* Screen Image */}
                <div className="patterns-card__image-wrapper">
                  <img 
                    src={item.img1} 
                    alt={item.app_name}
                    className="patterns-card__image"
                  />
                </div>
                
                {/* App Info */}
                <div className="patterns-card__app-info">
                  <img 
                    src={item.img2} 
                    alt={item.app_name}
                    className="patterns-card__app-logo"
                  />
                  <span className="patterns-card__app-name">{item.app_name}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        images={screens}
        initialIndex={previewIndex}
      />
    </>
  );
};

export default ScenariosPage;

