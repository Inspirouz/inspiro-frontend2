import { useState } from "react";
import contentData from "@/data/content";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import { usePatternTags } from "@/hooks/usePatternTags";
import { usePatternsByTag } from "@/hooks/usePatternsByTag";
import { useSEO } from "@/hooks/useSEO";
import '@/styles/header-search.css';
import '@/styles/detail-page.css';

const PatternsPage = () => {
  useSEO({
    title: 'Patterns - UI/UX Design Patterns',
    description: 'UI/UX dizayn patternlar to\'plami. Zamonaviy dizayn yechimlari va best practices.',
    keywords: 'UI patterns, UX patterns, design patterns, interface patterns, user experience patterns',
    ogUrl: 'https://inspiro.com/patterns',
  });

  const { tags: patternTags, loading: tagsLoading } = usePatternTags();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const { patterns: patternsByTag, loading: patternsLoading } = usePatternsByTag(
    activeCategory === 'all' ? null : activeCategory
  );
  const displayItems = activeCategory === 'all' ? contentData : patternsByTag;
  const firstItem = displayItems[0] || null;

  const nonEmptyPatternTags = patternTags.filter((t) => t.count > 0);
  const allPatternsCount = nonEmptyPatternTags.reduce((sum, t) => sum + t.count, 0);
  const hasAnyPatterns = allPatternsCount > 0;

  const subCategories = hasAnyPatterns
    ? [
        { id: 'all', label: 'Все', count: allPatternsCount },
        ...nonEmptyPatternTags.map((t) => ({ id: t.id, label: t.label, count: t.count })),
      ]
    : [];

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
            {tagsLoading ? (
              <div className="detail-page__subcategories-loading">Загрузка...</div>
            ) : (
              <>
                {hasAnyPatterns && (
                  <>
                    <button
                      key="all"
                      className={`detail-page__subcategory ${activeCategory === 'all' ? 'active' : ''}`}
                      onClick={() => setActiveCategory('all')}
                    >
                      Все
                      <span className="detail-page__subcategory-count">{allPatternsCount}</span>
                    </button>
                    {nonEmptyPatternTags.map((tag) => (
                      <button
                        key={tag.id}
                        className={`detail-page__subcategory ${activeCategory === tag.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(tag.id)}
                      >
                        {tag.label}
                        <span className="detail-page__subcategory-count">{tag.count}</span>
                      </button>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="detail-page__main with-sidebar">
          {patternsLoading ? (
            <div className="detail-page__grid-loading">Загрузка...</div>
          ) : displayItems.length === 0 ? (
            <div
              className="detail-page__grid-empty"
              style={{
                width: '100%',
                height: '100%',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: '#888',
                textAlign: 'center',
                paddingRight: '200px',
              }}
            >
              Malumot mavjude emas
            </div>
          ) : (
            <div className="detail-page__grid">
              {displayItems.map((item, index) => (
                <div
                  key={item.id}
                  className="patterns-card"
                  onClick={() => handleImageClick(index)}
                >
                  <div className="patterns-card__image-wrapper">
                    <img
                      src={item.logo ?? item.images?.[0]}
                      alt={item.app_name}
                      className="patterns-card__image"
                    />
                  </div>
                  <div className="patterns-card__app-info">
                    <img
                      src={item.logo ?? item.images?.[0]}
                      alt={item.app_name}
                      className="patterns-card__app-logo"
                    />
                    <span className="patterns-card__app-name">{item.app_name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Image Preview Modal */}
      {firstItem && (
        <ImagePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          images={displayItems.map((item) => ({
            id: item.id,
            screenId: item.screenId ?? item.id,
            image: item.logo ?? item.images?.[0] ?? '',
            title: item.app_name,
          }))}
          initialIndex={previewIndex}
          appInfo={{
            logo: firstItem.logo ?? firstItem.images?.[0] ?? '',
            name: firstItem.app_name,
            description: firstItem.text_info ?? firstItem.description ?? 'Description of the company',
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