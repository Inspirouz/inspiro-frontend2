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

  // Tree structure data - matching the image
  const treeStructure = [
    {
      id: 'entry',
      label: 'Вход',
      type: 'top-level' as const,
      count: 5,
      children: [],
    },
    {
      id: 'main',
      label: 'Главная',
      type: 'parent' as const,
      count: 24,
      children: [
        { id: 'main-1', label: 'Пополнить с другого банка', sectionId: 'section-main-1', count: 4 },
        { id: 'main-2', label: 'Оплата по QR', sectionId: 'section-main-2', count: 3 },
        { id: 'main-3', label: 'Перевод между счетами', sectionId: 'section-main-3', count: 5 },
        { id: 'main-4', label: 'Перевод по номеру телефо...', sectionId: 'section-main-4', count: 6 },
        { id: 'main-5', label: 'Кэшбэк', sectionId: 'section-main-5', count: 3 },
        { id: 'main-6', label: 'Уведомления', sectionId: 'section-main-6', count: 3 },
      ],
    },
    {
      id: 'products',
      label: 'Все продукты',
      type: 'parent' as const,
      count: 18,
      children: [
        {
          id: 'products-1',
          label: 'Счет',
          type: 'nested' as const,
          count: 8,
          children: [
            { id: 'products-1-1', label: 'Заказать справку', sectionId: 'section-products-1-1', count: 8 },
          ],
        },
        { id: 'products-2', label: 'Изменить порядок', sectionId: 'section-products-2', count: 5 },
        { id: 'products-3', label: 'Настроить баланс', sectionId: 'section-products-3', count: 5 },
      ],
    },
    {
      id: 'history',
      label: 'Просмотр историй',
      type: 'parent' as const,
      count: 12,
      children: [
        { id: 'history-1', label: 'Найти банкомат', sectionId: 'section-history-1', count: 6 },
        { id: 'history-2', label: 'Раздел «Игры»', sectionId: 'section-history-2', count: 6 },
      ],
    },
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

    // Get all section IDs from tree structure
    const allSectionIds: string[] = [];
    treeStructure.forEach((parent) => {
      if (parent.type === 'parent') {
        parent.children.forEach((child: any) => {
          if (child.sectionId) {
            allSectionIds.push(child.sectionId);
          }
          if (child.children) {
            child.children.forEach((nested: any) => {
              if (nested.sectionId) {
                allSectionIds.push(nested.sectionId);
              }
            });
          }
        });
      }
    });

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
          // Find the corresponding item ID from tree structure
          treeStructure.forEach((parent) => {
            if (parent.type === 'parent') {
              parent.children.forEach((child: any) => {
                if (child.sectionId === sectionId) {
                  setActiveTreeItem(child.id);
                }
                if (child.children) {
                  child.children.forEach((nested: any) => {
                    if (nested.sectionId === sectionId) {
                      setActiveTreeItem(nested.id);
                    }
                  });
                }
              });
            }
          });
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
              {treeStructure.map((parent) => (
                <div key={parent.id} className="detail-page__tree-section">
                  {/* Top-level or Parent item */}
                  {parent.type === 'top-level' ? (
                    <button className="detail-page__tree-top-level">
                      <span className="detail-page__tree-label">{parent.label}</span>
                      <span className="detail-page__tree-count">{parent.count}</span>
                    </button>
                  ) : (
                    <>
                      <div className="detail-page__tree-parent">
                        {parent.children.length > 0 && (
                          <div className="detail-page__tree-parent-line"></div>
                        )}
                        <button className="detail-page__tree-parent-button">
                          <span className="detail-page__tree-label">{parent.label}</span>
                          <span className="detail-page__tree-count">{parent.count}</span>
                        </button>
                      </div>
                      
                      {/* Child items */}
                      {parent.children.length > 0 && (
                        <div className="detail-page__tree-items">
                          {parent.children.map((child: any, childIndex: number) => {
                            // Check if child has nested children
                            const hasNested = child.children && child.children.length > 0;
                            const isLast = childIndex === parent.children.length - 1;
                            
                            return (
                              <div key={child.id} className="detail-page__tree-item">
                                <div className="detail-page__tree-connector">
                                  <div className={`detail-page__tree-vertical-line ${isLast ? 'last' : ''}`}></div>
                                  <div className="detail-page__tree-horizontal-line"></div>
                                </div>
                                
                                {hasNested ? (
                                  <div className="detail-page__tree-nested">
                                    <div className="detail-page__tree-nested-parent">
                                      {child.children.length > 0 && (
                                        <div className="detail-page__tree-nested-line"></div>
                                      )}
                                      <button className="detail-page__tree-nested-button">
                                        <span className="detail-page__tree-label">{child.label}</span>
                                        <span className="detail-page__tree-count">{child.count}</span>
                                      </button>
                                    </div>
                                    
                                    {child.children && child.children.length > 0 && (
                                      <div className="detail-page__tree-nested-items">
                                        {child.children.map((nested: any, nestedIndex: number) => {
                                          const isNestedLast = nestedIndex === child.children.length - 1;
                                          return (
                                            <div key={nested.id} className="detail-page__tree-nested-item">
                                              <div className="detail-page__tree-nested-connector">
                                                <div className={`detail-page__tree-nested-vertical-line ${isNestedLast ? 'last' : ''}`}></div>
                                                <div className="detail-page__tree-nested-horizontal-line"></div>
                                              </div>
                                              <button 
                                                className={`detail-page__tree-button ${activeTreeItem === nested.id ? 'active' : ''}`}
                                                onClick={() => nested.sectionId && handleTreeItemClick(nested.sectionId, nested.id)}
                                              >
                                                <span className="detail-page__tree-label">{nested.label}</span>
                                                <span className="detail-page__tree-count">{nested.count}</span>
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <button 
                                    className={`detail-page__tree-button ${activeTreeItem === child.id ? 'active' : ''}`}
                                    onClick={() => child.sectionId && handleTreeItemClick(child.sectionId, child.id)}
                                  >
                                    <span className="detail-page__tree-label">{child.label}</span>
                                    <span className="detail-page__tree-count">{child.count}</span>
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
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
              {treeStructure.map((parent) => {
                if (parent.type === 'top-level') return null;
                
                return (
                  <div key={parent.id} className="detail-page__scenarios-parent-section">
           
                    
                    {/* Child sections */}
                    {parent.children.map((child: any) => {
                      if (child.sectionId) {
                        return (
                          <div 
                            key={child.id}
                            id={child.sectionId}
                            ref={(el) => {
                              sectionRefs.current[child.sectionId] = el;
                            }}
                            className="detail-page__scenario-section"
                          >
                            <div className="detail-page__scenario-section-header">
                              <h3 className="detail-page__scenario-section-title">{child.label}</h3>
                              <span className="detail-page__scenario-section-count">{screens.length}  экранов</span>
                            </div>
                            <div className="detail-page__scenario-section-grid">
                              {screens.map((screen, index) => (
                                <div 
                                  key={`${child.sectionId}-${screen.id}`} 
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
                        );
                      }
                      
                      // Nested child (like "Счет")
                      if (child.children && child.children.length > 0) {
                        return (
                          <div key={child.id} className="detail-page__scenario-nested-parent">
                            <div className="detail-page__scenario-nested-header">
                              <h3 className="detail-page__scenario-nested-title">{child.label}</h3>
                            </div>
                            {child.children.map((nested: any) => {
                              if (nested.sectionId) {
                                return (
                                  <div 
                                    key={nested.id}
                                    id={nested.sectionId}
                                    ref={(el) => {
                                      sectionRefs.current[nested.sectionId] = el;
                                    }}
                                    className="detail-page__scenario-section"
                                  >
                                    <div className="detail-page__scenario-section-header">
                                      <h4 className="detail-page__scenario-section-title">{nested.label}</h4>
                                      
                                    </div>
                                    <div className="detail-page__scenario-section-grid">
                                      {screens.map((screen, index) => (
                                        <div 
                                          key={`${nested.sectionId}-${screen.id}`} 
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
                                );
                              }
                              return null;
                            })}
                          </div>
                        );
                      }
                      
                      return null;
                    })}
                  </div>
                );
              })}
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

