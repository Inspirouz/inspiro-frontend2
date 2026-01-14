import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import contentData from '@/data/content';
import { useSEO } from '@/hooks/useSEO';
import ImagePreviewModal from '@/components/ImagePreviewModal';
import { NavIcons } from '@/components/icons';
import '@/styles/detail-page.css';

type TabType = 'screens' | 'scenarios' | 'videos';
type SubCategoryType = 'all' | 'onboarding' | 'registration' | 'main' | 'cart';

type TreeNode = {
  id: string;
  label: string;
  sectionId: string;
  count: number;
  children?: TreeNode[];
};

// Recursive component for rendering tree nodes
const TreeNodeComponent = ({
  node,
  activeTreeItem,
  onItemClick,
  className='',
  level = 0,
}: {
  node: TreeNode;
  activeTreeItem: string | null;
  onItemClick: (sectionId: string, itemId: string) => void;
  level?: number;
  className?: string;
}) => {
  return (
    <div className={`detail-page__tree-row ${className}`}>
      <button
        className={`detail-page__tree-button ${activeTreeItem === node.id ? 'active' : ''}`}
        onClick={() => node.sectionId && onItemClick(node.sectionId, node.id)}
      >
        <span className="detail-page__tree-label">{node.label}</span>
        <span className="detail-page__tree-count">{node.count}</span>
      </button>
      {node.children && node.children.length > 0 && (
        <div className="detail-page__tree-children">
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              activeTreeItem={activeTreeItem}
              onItemClick={onItemClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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

  // Tree structure data - nested structure with parent and children
  const treeStructure: TreeNode[] = [
    {
      id: 'item-1',
      label: 'Онбординг',
      sectionId: 'section-1',
      count: 12,
      children: [
        {
          id: 'item-2',
          label: 'Онбординг',
          sectionId: 'section-2',
          count: 12,
          children: [
            {
              id: 'item-3',
              label: 'Онбординг',
              sectionId: 'section-3',
              count: 12,
              children: [
                { id: 'item-4', label: 'Онбординг', sectionId: 'section-4', count: 12 },
              ],
            },
            { id: 'item-6', label: 'Онбординг', sectionId: 'section-6', count: 12 },
          ],
        },
        {
          id: 'item-8',
          label: 'Онбординг',
          sectionId: 'section-8',
          count: 12,
          children: []
        }
      ],
    },
    { id: 'item-7', label: 'Онбординг', sectionId: 'section-7', count: 12 },
  ];

  // Helper function to flatten tree structure for IntersectionObserver and scenarios content
  const flattenTree = (nodes: TreeNode[], level: number = 0): Array<TreeNode & { level: number }> => {
    const result: Array<TreeNode & { level: number }> = [];
    nodes.forEach((node) => {
      result.push({ ...node, level });
      if (node.children) {
        result.push(...flattenTree(node.children, level + 1));
      }
    });
    return result;
  };

  const flatTreeStructure = flattenTree(treeStructure);

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

    // Get all section IDs from flattened tree structure
    const allSectionIds = flatTreeStructure.map(item => item.sectionId).filter(Boolean);

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
          // Find the corresponding item ID from flattened tree structure
          const item = flatTreeStructure.find(item => item.sectionId === sectionId);
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
  }, [activeTab, flatTreeStructure]);

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
    <>

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
              {treeStructure.map((item) => (
                <TreeNodeComponent
                  key={item.id}
                  node={item}
                  activeTreeItem={activeTreeItem}
                  onItemClick={handleTreeItemClick}
                  level={0}
                  className='parent-tree-row'
                />
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
              {flatTreeStructure.map((item) => (
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
        appInfo={{
          logo: item.img2,
          name: item.app_name,
          description: item.text_info || 'Description of the company',
        }}
        treeStructure={treeStructure}
        activeTreeItem={activeTreeItem}
        onTreeItemClick={handleTreeItemClick}
        activeTab={activeTab}
        subCategories={subCategories}
        activeSubCategory={activeSubCategory}
        onSubCategoryClick={(categoryId) => setActiveSubCategory(categoryId as SubCategoryType)}
      />
    </div>
    </>
  );
};

export default DetailPage;

