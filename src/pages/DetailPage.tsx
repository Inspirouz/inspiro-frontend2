import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import contentData from '@/data/content';
import { useSEO } from '@/hooks/useSEO';
import ImagePreviewModal from '@/components/ImagePreviewModal';
import { NavIcons } from '@/components/icons';
import '@/styles/detail-page.css';

type TabType = 'screens' | 'scenarios' | 'videos';
type SubCategoryType = 'all' | 'onboarding' | 'registration' | 'main' | 'cart';

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('screens');
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategoryType>('all');

  const item = contentData.find((item) => item.id === Number(id));

  useSEO({
    title: item ? `${item.app_name} - Detail` : 'Detail Page',
    description: item?.text_info || 'Application detail page',
    keywords: 'UI design, UX design, application detail',
    ogUrl: `https://inspiro.com/detail/${id}`,
  });

  if (!item) {
    return (
      <div className="detail-page">
        <div className="detail-page__not-found">
          <h2>Item not found</h2>
          <button onClick={() => navigate('/')}>Go back to home</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'screens' as TabType, label: 'Экраны', count: 212 },
    { id: 'scenarios' as TabType, label: 'Сценарии', count: 30 },
    { id: 'videos' as TabType, label: 'Видео', count: null, comingSoon: true, disabled: true },
  ];

  const subCategories = [
    { id: 'all' as SubCategoryType, label: 'Все', count: 12 },
    { id: 'onboarding' as SubCategoryType, label: 'Онбординг', count: 2 },
    { id: 'registration' as SubCategoryType, label: 'Регистрация', count: 3 },
    { id: 'main' as SubCategoryType, label: 'Главный экран', count: 5 },
    { id: 'cart' as SubCategoryType, label: 'Корзина', count: 2 },
  ];

  // Tree structure data - flat list with nesting levels
  const treeStructure = [
    { id: 'item-1', label: 'Онбординг', sectionId: 'section-1', count: 12, level: 0 },
    { id: 'item-2', label: 'Онбординг', sectionId: 'section-2', count: 12, level: 1 },
    { id: 'item-3', label: 'Онбординг', sectionId: 'section-3', count: 12, level: 2 },
    { id: 'item-4', label: 'Онбординг', sectionId: 'section-4', count: 12, level: 3 },
    { id: 'item-5', label: 'Онбординг', sectionId: 'section-5', count: 12, level: 3 },
    { id: 'item-6', label: 'Онбординг', sectionId: 'section-6', count: 12, level: 2 },
    { id: 'item-7', label: 'Онбординг', sectionId: 'section-7', count: 12, level: 0 },
  ];

  const [activeTreeItem, setActiveTreeItem] = useState<string | null>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get screen ID from URL search params
  const screenIdFromUrl = searchParams.get('screen');
  
  // Check if modal should be open based on URL
  const isImagePreviewOpen = screenIdFromUrl !== null;

  // Scroll to section when tree item is clicked
  const handleTreeItemClick = (sectionId: string, itemId: string) => {
    setActiveTreeItem(itemId);
    const section = sectionRefs.current[sectionId];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Set up Intersection Observer to track which section is visible
  useEffect(() => {
    if (activeTab !== 'scenarios') return;

    // Get all section IDs from flat tree structure
    const allSectionIds = treeStructure.map(item => item.sectionId).filter(Boolean);

    // Create Intersection Observer
    const mainContent = document.querySelector('.detail-page__main');
    if (!mainContent) return;

    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        // Find the section that is most visible
        let mostVisibleEntry: IntersectionObserverEntry | null = null;
        let maxRatio = 0;

        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisibleEntry = entry;
          }
        }

        if (mostVisibleEntry) {
          const target = mostVisibleEntry.target as HTMLElement;
          if (!target || !target.id) return;
          const sectionId = target.id;
          // Find the corresponding item ID from flat tree structure
          const item = treeStructure.find(item => item.sectionId === sectionId);
          if (item) {
            setActiveTreeItem(item.id);
          }
        }
      },
      {
        root: mainContent,
        rootMargin: '-20% 0px -50% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    // Observe all sections
    allSectionIds.forEach((sectionId) => {
      const section = sectionRefs.current[sectionId];
      if (section) {
        observer.observe(section);
      }
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [activeTab, treeStructure]);

  // Use actual content data for screens
  const screens = contentData.map((contentItem) => ({
    id: contentItem.id,
    title: 'Welcome to Your Travel Companion',
    image: contentItem.img1,
  }));

  // Handle image click to open preview
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    const screenId = screens[index]?.id;
    if (screenId) {
      setSearchParams({ screen: screenId.toString() });
    }
  };

  // Handle modal close - remove search param
  const handleModalClose = () => {
    setSearchParams({});
  };

  // Sync URL with modal state on mount and when screenId changes
  useEffect(() => {
    if (screenIdFromUrl) {
      const screenIndex = screens.findIndex(screen => screen.id.toString() === screenIdFromUrl);
      if (screenIndex !== -1) {
        setSelectedImageIndex(screenIndex);
      } else {
        // Invalid screen ID, remove from URL
        setSearchParams({});
      }
    }
  }, [screenIdFromUrl]);


  return (
    <div className='container'>

    <div className="detail-page-wrapper">
      <div className="detail-page">
      {/* Top Header */}
      <div className="detail-page__header">
        <div className="detail-page__header-main">
          <div className="detail-page__header-icon">
            <img src={item.img2} alt={item.app_name} />
          </div>
          <div className="detail-page__header-info">
            <h1 className="detail-page__header-title">{item.app_name}</h1>
            <p className="detail-page__header-description">Description of the company</p>
          </div>
        </div>
        <div className="detail-page__header-meta">
          <div className="detail-page__meta-item">
            <span className="detail-page__meta-label">Категория</span>
            <span className="detail-page__meta-value">Финтех</span>
          </div>
          <div className="detail-page__meta-item">
            <span className="detail-page__meta-label">Платформы</span>
            <span className="detail-page__meta-value">IOS, Android</span>
          </div>
          <div className="detail-page__meta-item">
            <span className="detail-page__meta-label">Последнее обновление</span>
            <span className="detail-page__meta-value">14 октября, 2025</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="detail-page__nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`detail-page__nav-tab ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
          >
            <span className="detail-page__nav-icon">
              {NavIcons[tab.id]}
            </span>
            {tab.label}
            {tab.count !== null && (
              <span className="detail-page__nav-count">({tab.count})</span>
            )}
            {tab.comingSoon && (
              <span className="detail-page__nav-coming-soon">Скоро</span>
            )}
          </button>
        ))}
      </nav>



      <div className="detail-page__content">
        {/* Left Sidebar */}
        {activeTab === 'screens' && (
          <aside className="detail-page__sidebar">
            <div className="detail-page__subcategories">
              {subCategories.map((subCat) => (
                <button
                  key={subCat.id}
                  className={`detail-page__subcategory ${
                    activeSubCategory === subCat.id ? 'active' : ''
                  }`}
                  onClick={() => setActiveSubCategory(subCat.id)}
                >
                  {subCat.label}
                  <span className="detail-page__subcategory-count">{subCat.count}</span>
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Tree Sidebar for Scenarios */}
        {activeTab === 'scenarios' && (
          <aside className="detail-page__sidebar detail-page__sidebar--tree">
            <div className="detail-page__tree">
              {treeStructure.map((item, index) => {
                const nextItem = treeStructure[index + 1];
                const hasChildBelow = nextItem && nextItem.level > item.level;
                const isLastAtLevel = !nextItem || nextItem.level <= item.level;
                
                return (
                  <div 
                    key={item.id} 
                    className="detail-page__tree-row"
                    style={{ paddingLeft: `${item.level * 24}px` }}
                  >
                    {/* Tree connector lines */}
                    {item.level > 0 && (
                      <div className="detail-page__tree-connector">
                        <div className={`detail-page__tree-vertical-line ${isLastAtLevel ? 'last' : ''}`}></div>
                        <div className="detail-page__tree-horizontal-line"></div>
                      </div>
                    )}
                    
                    {/* Vertical line for items that have children */}
                    {hasChildBelow && (
                      <div className="detail-page__tree-parent-line"></div>
                    )}
                    
                    <button 
                      className={`detail-page__tree-button ${activeTreeItem === item.id ? 'active' : ''}`}
                      onClick={() => item.sectionId && handleTreeItemClick(item.sectionId, item.id)}
                    >
                      <span className="detail-page__tree-label">{item.label}</span>
                      <span className="detail-page__tree-count">{item.count}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>
        )}


        {/* Main Content */}
        <main className={`detail-page__main ${(activeTab === 'screens' || activeTab === 'scenarios') ? 'with-sidebar' : ''}`}>
          {activeTab === 'screens' && (
            <div className="detail-page__grid">
              {screens.map((screen, index) => (
                <div 
                  key={screen.id} 
                  className="detail-page__screen-card"
                  onClick={() => handleImageClick(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="detail-page__phone-screen">
                    <img 
                      src={screen.image} 
                      alt={screen.title}
                      className="detail-page__phone-image"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'scenarios' && (
            <div className="detail-page__scenarios-content">
              {treeStructure.map((item) => (
                <div 
                  key={item.id}
                  id={item.sectionId}
                  ref={(el) => {
                    sectionRefs.current[item.sectionId] = el;
                  }}
                  className="detail-page__scenario-section"
                >
                  <div className="detail-page__scenario-section-header">
                    <h3 className="detail-page__scenario-section-title">{item.label}</h3>
                    <span className="detail-page__scenario-section-count">{item.count} экранов</span>
                  </div>
                  <div className="detail-page__scenario-section-grid">
                    {screens.map((screen, index) => (
                      <div 
                        key={`${item.sectionId}-${screen.id}`} 
                        className="detail-page__screen-card"
                        onClick={() => handleImageClick(index)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="detail-page__phone-screen">
                          <img 
                            src={screen.image} 
                            alt={screen.title}
                            className="detail-page__phone-image"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="detail-page__videos-placeholder">
              <p>Видео раздел скоро будет доступен</p>
            </div>
          )}
        </main>
      </div>
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={isImagePreviewOpen}
        onClose={handleModalClose}
        images={screens}
        initialIndex={selectedImageIndex}
      />
    </div>
    </div>
  );
};

export default DetailPage;

