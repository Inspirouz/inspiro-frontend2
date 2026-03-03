import { useState } from "react";
import contentData from "@/data/content";
import { PATTERN_CATEGORIES } from "@/constants";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import { useSEO } from "@/hooks/useSEO";
import '@/styles/header-search.css';
import '@/styles/detail-page.css';

// Category counts based on the design
const CATEGORY_COUNTS: Record<string, number> = {
  '': 12,
  '/account': 2,
  '/home': 3,
  '/description': 5,
  '/cart': 2,
};

const PatternsPage = () => {
  // SEO optimization
  useSEO({
    title: 'Patterns - UI/UX Design Patterns',
    description: 'UI/UX dizayn patternlar to\'plami. Zamonaviy dizayn yechimlari va best practices.',
    keywords: 'UI patterns, UX patterns, design patterns, interface patterns, user experience patterns',
    ogUrl: 'https://inspiro.com/patterns',
  });
  
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Get first item for app info (or use selected item)
  const firstItem = contentData[0] || null;

  // Convert PATTERN_CATEGORIES to subCategories format
  const subCategories = PATTERN_CATEGORIES.map((category) => ({
    id: category.path,
    label: category.label,
    count: CATEGORY_COUNTS[category.path] || 0,
  }));

  const handleImageClick = (index: number) => {
    setPreviewIndex(index);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <div className="detail-page__content">
        {/* Left Sidebar */}
        <aside className="detail-page__sidebar">
          <div className="detail-page__subcategories">
          {PATTERN_CATEGORIES.map((category) => (
              <button
              key={category.path}
                className={`detail-page__subcategory ${activeCategory === category.path ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.path)}
            >
              {category.label}
                <span className="detail-page__subcategory-count">
                  {CATEGORY_COUNTS[category.path] || 0}
                </span>
              </button>
          ))}
        </div>
        </aside>

        {/* Main Content */}
        <main className="detail-page__main with-sidebar">
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
                    src={item.logo} 
                    alt={item.app_name}
                    className="patterns-card__image"
                  />
                </div>
                
                {/* App Info */}
                <div className="patterns-card__app-info">
                  <img 
                    src={item.logo} 
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
      {firstItem && (
        <ImagePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
            images={contentData.map((item) => ({
              id: item.id,
              screenId: item.screenId,
              image: item.logo ?? item.images?.[0] ?? '',
              title: item.app_name,
            }))}
          initialIndex={previewIndex}
          appInfo={{
            logo: firstItem.logo ?? firstItem.logo ?? firstItem.logo ?? '',
            name: firstItem.app_name,
            description: firstItem.text_info || 'Description of the company',
          }}
          activeTab="screens"
          subCategories={subCategories}
          activeSubCategory={activeCategory}
          onSubCategoryClick={(categoryId) => setActiveCategory(categoryId)}
        />
      )}
    </>
  );
};

export default PatternsPage;