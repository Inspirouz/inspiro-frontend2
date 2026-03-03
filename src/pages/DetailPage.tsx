import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useProject, useProjectScreens, useScreenDetails } from '@/hooks/useProjects';
import { useScreensCategories } from '@/hooks/useScreensCategories';
import { useSEO } from '@/hooks/useSEO';
import ImagePreviewModal from '@/components/ImagePreviewModal';
import { NavIcons } from '@/components/icons';
import '@/styles/detail-page.css';

type TabType = 'screens' | 'scenarios' | 'videos';

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
  const [activeSubCategory, setActiveSubCategory] = useState<string>('all');

  const { project: projectFromApi, loading: projectLoading, error: projectError } = useProject(id ?? undefined);
  const { subCategories } = useScreensCategories(id ?? null);
  const { screens: screensFromApi } = useProjectScreens(id ?? undefined);
  const item = projectFromApi ??  null;

  const [activeTreeItem, setActiveTreeItem] = useState<string | null>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useSEO({
    title: item ? `${item.app_name} - Detail` : 'Detail Page',
    description: item?.text_info || 'Application detail page',
    keywords: 'UI design, UX design, application detail',
    ogUrl: `https://inspiro.com/detail/${id}`,
  });

  useEffect(() => {
    const validIds = ['all', ...subCategories.map((c) => c.id)];
    if (!validIds.includes(activeSubCategory)) {
      setActiveSubCategory('all');
    }
  }, [subCategories, activeSubCategory]);

  const tabs = [
    { id: 'screens' as TabType, label: 'Экраны', count: 212 },
    { id: 'scenarios' as TabType, label: 'Сценарии', count: 30 },
    { id: 'videos' as TabType, label: 'Видео', count: null, comingSoon: true, disabled: true },
  ];

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
          children: [],
        },
      ],
    },
    { id: 'item-7', label: 'Онбординг', sectionId: 'section-7', count: 12 },
  ];

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

  const screenIdFromUrl = searchParams.get('screen');
  const isImagePreviewOpen = screenIdFromUrl !== null;

  const screensFallback =
    item && screensFromApi.length === 0
      ? (item.images && item.images.length > 0
        ? item.images.map((img, index) => ({
            id: `${item.id}-${index}`,
            screenId: `${item.id}-${index}`,
            title: item.app_name,
            image: img || '',
          }))
        : [
            {
              id: item.id,
              screenId: item.id,
              title: item.app_name,
              image: item.logo ?? item.img1 ?? '',
            },
          ])
      : [];
  const screens = screensFromApi.length > 0 ? screensFromApi : screensFallback;

  const filteredScreens =
    activeSubCategory === 'all'
      ? screens
      : screens.filter((screen) => {
          const selectedCat = subCategories.find((c) => c.id === activeSubCategory);
          return selectedCat ? screen.title === selectedCat.label : true;
        });

  useEffect(() => {
    if (activeTab !== 'scenarios') return;
    const allSectionIds = flatTreeStructure.map(i => i.sectionId).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const intersectingEntries = entries.filter(entry => entry.isIntersecting);
        if (intersectingEntries.length === 0) return;
        let closestEntry: IntersectionObserverEntry | null = null;
        let closestDistance = Infinity;
        for (const entry of intersectingEntries) {
          const distance = Math.abs(entry.boundingClientRect.top);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestEntry = entry;
          }
        }
        if (closestEntry) {
          const target = closestEntry.target as HTMLElement;
          if (target?.id) {
            const node = flatTreeStructure.find(i => i.sectionId === target.id);
            if (node) setActiveTreeItem(node.id);
          }
        }
      },
      { root: null, rootMargin: '-130px 0px -60% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );
    allSectionIds.forEach((sectionId) => {
      const el = sectionRefs.current[sectionId];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [activeTab, flatTreeStructure]);

  const { details: screenDetails, loading: screenDetailsLoading } = useScreenDetails(
    id ?? undefined,
    screenIdFromUrl
  );

  useEffect(() => {
    if (!screenIdFromUrl) return;
    const screenIndex = screens.findIndex(
      (screen) => String(screen.screenId ?? screen.id) === screenIdFromUrl
    );
    if (screenIndex !== -1) {
      setSelectedImageIndex(screenIndex);
    } else {
      setSearchParams({});
    }
  }, [screenIdFromUrl, screens]);

  const handleTreeItemClick = (sectionId: string, itemId: string) => {
    setActiveTreeItem(itemId);
    const section = sectionRefs.current[sectionId];
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    const screen = screens[index];
    const screenId = screen?.screenId ?? screen?.id;
    if (screenId) setSearchParams({ screen: String(screenId) });
  };

  const handleModalClose = () => setSearchParams({});

  if (projectLoading && !item) {
    return (
      <div className="detail-page">
        <div className="detail-page__not-found">Загрузка...</div>
      </div>
    );
  }

  if (!item || projectError) {
    return (
      <div className="detail-page">
        <div className="detail-page__not-found">
          <h2>Item not found</h2>
          <button onClick={() => navigate('/')}>Go back to home</button>
        </div>
      </div>
    );
  }


  return (
    <>

    <div className="detail-page-wrapper">
      <div className="detail-page">
      {/* Top Header */}
      <div className="detail-page__header">
        <div className="detail-page__header-main">
          <div className="detail-page__header-icon">
            <img src={item.logo ?? item.logo ?? item.logo} alt={item.app_name} />
          </div>
          <div className="detail-page__header-info">
            <h1 className="detail-page__header-title">{item.app_name}</h1>
            <p className="detail-page__header-description">{item.description || item.text_info || '—'}</p>
          </div>
        </div>
        <div className="detail-page__header-meta">
          <div className="detail-page__meta-item">
            <span className="detail-page__meta-label">Категория</span>
            <span className="detail-page__meta-value">
              {item.categories?.map((c) => c.name).filter(Boolean).join(', ') || '—'}
            </span>
          </div>
          <div className="detail-page__meta-item">
            <span className="detail-page__meta-label">Платформы</span>
            <span className="detail-page__meta-value">{item.platforms?.join(', ') || '—'}</span>
          </div>
          <div className="detail-page__meta-item">
            <span className="detail-page__meta-label">Последнее обновление</span>
            <span className="detail-page__meta-value">
              {item.updated_at
                ? new Date(item.updated_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </span>
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
              {(() => {
                const totalCount = subCategories.reduce((sum, c) => sum + c.count, 0);
                const hasAll = subCategories.some((c) => c.id === 'all');
                const items = hasAll
                  ? subCategories
                  : [{ id: 'all', label: 'Все', count: totalCount }, ...subCategories];
                return items;
              })().map((subCat, idx) => (
                <button
                  key={`${subCat.id}-${idx}`}
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
              {filteredScreens.map((screen, index) => {
                const globalIndex = screens.findIndex((s) => s.id === screen.id);
                return (
                <div 
                  key={screen.id} 
                  className="detail-page__screen-card"
                  onClick={() => handleImageClick(globalIndex >= 0 ? globalIndex : index)}
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
              );})}
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
          logo: item.logo ?? item.img2 ?? item.img1 ?? '',
          name: item.app_name,
          description: item.description || item.text_info || '—',
        }}
        treeStructure={treeStructure}
        activeTreeItem={activeTreeItem}
        onTreeItemClick={handleTreeItemClick}
        activeTab={activeTab}
        subCategories={subCategories}
        activeSubCategory={activeSubCategory}
        onSubCategoryClick={(categoryId) => setActiveSubCategory(categoryId)}
        screenMeta={screenDetails}
        screenMetaLoading={screenDetailsLoading}
      />
    </div>
    </>
  );
};

export default DetailPage;

