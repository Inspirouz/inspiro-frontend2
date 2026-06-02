import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useProject, useProjectScreens, useScreenDetails } from '@/hooks/useProjects';
import { useScreensCategories } from '@/hooks/useScreensCategories';
import { useScenariosCategories } from '@/hooks/useScenariosCategories';
import { useScenariosCategoriesWithScreens } from '@/hooks/useScenariosCategoriesWithScreens';
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
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('scenarios');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('all');

  const { project: projectFromApi, loading: projectLoading, error: projectError } = useProject(id ?? undefined);
  const { subCategories } = useScreensCategories(id ?? null);
  const { treeStructure: scenariosTree } = useScenariosCategories(id ?? null);
  const {
    scenariosByCategoryId,
    allScenarios,
    loading: scenariosLoading,
  } = useScenariosCategoriesWithScreens(id ?? null);
  const { screens: screensFromApi, loading: screensLoading } = useProjectScreens(id ?? undefined);
  const item = projectFromApi ??  null;

  const [activeTreeItem, setActiveTreeItem] = useState<string | null>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useSEO({
    title: item ? `${item.app_name} - Detail` : 'Detail Page',
    description: item?.text_info || 'Application detail page',
    keywords: 'UI design, UX design, application detail',
    ogUrl: `https://inspiro.uz/detail/${id}`,
  });

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

  useEffect(() => {
    const validIds = ['all', ...subCategories.map((c) => c.id)];
    if (!validIds.includes(activeSubCategory)) {
      setActiveSubCategory('all');
    }
  }, [subCategories, activeSubCategory]);

  useEffect(() => {
    if (activeSubCategory === 'all') return;
    const stillVisible = screens.some((s) => {
      const cat = subCategories.find((c) => c.id === activeSubCategory);
      return cat && s.title === cat.label;
    });
    if (!stillVisible) setActiveSubCategory('all');
  }, [screens, subCategories, activeSubCategory]);

  const filterNodesWithScreens = (nodes: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = [];
    for (const node of nodes) {
      const filteredChildren = node.children ? filterNodesWithScreens(node.children) : undefined;
      const ownCount = scenariosByCategoryId[node.id]?.length ?? 0;
      const hasChildren = !!filteredChildren && filteredChildren.length > 0;
      if (ownCount === 0 && !hasChildren) continue;
      result.push({
        ...node,
        count: ownCount || node.count,
        ...(hasChildren ? { children: filteredChildren } : { children: undefined }),
      });
    }
    return result;
  };

  const treeStructure: TreeNode[] = filterNodesWithScreens(scenariosTree);

  const flattenTree = (
    nodes: TreeNode[],
    level: number = 0,
    ancestors: string[] = []
  ): Array<TreeNode & { level: number; ancestors: string[] }> => {
    const result: Array<TreeNode & { level: number; ancestors: string[] }> = [];
    nodes.forEach((node) => {
      result.push({ ...node, level, ancestors });
      if (node.children) {
        result.push(...flattenTree(node.children, level + 1, [...ancestors, node.label]));
      }
    });
    return result;
  };

  const flatTreeStructure = flattenTree(treeStructure);

  const tabs = [
    { id: 'scenarios' as TabType, label: 'Сценарии', count: allScenarios.length },
    { id: 'screens' as TabType, label: 'Экраны', count: screens.length },
    // { id: 'videos' as TabType, label: 'Видео', count: null, comingSoon: true, disabled: true },
  ];

  /** For modal and click index: scenarios tab uses allScenarios, screens tab uses screens */
  const screensForModal = activeTab === 'scenarios' ? allScenarios : screens;

  const visibleSubCategories = subCategories
    .filter((c) => c.id !== 'all')
    .map((c) => ({
      ...c,
      count: screens.filter((s) => s.title === c.label).length,
    }))
    .filter((c) => c.count > 0);

  const filteredScreens =
    activeSubCategory === 'all'
      ? screens
      : screens.filter((screen) => {
          const selectedCat = visibleSubCategories.find((c) => c.id === activeSubCategory);
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

  const { details: modalScreenMeta, loading: modalScreenMetaLoading } = useScreenDetails(
    id ?? undefined,
    screenIdFromUrl
  );

  useEffect(() => {
    if (!screenIdFromUrl) return;
    if (screensLoading) return;
    const screenIndex = screensForModal.findIndex(
      (screen) => String(screen.screenId ?? screen.id) === screenIdFromUrl
    );
    if (screenIndex !== -1) {
      setSelectedImageIndex(screenIndex);
    } else {
      setSearchParams({});
    }
  }, [screenIdFromUrl, screensForModal, screensLoading]);

  const handleTreeItemClick = (sectionId: string, itemId: string) => {
    setActiveTreeItem(itemId);
    const section = sectionRefs.current[sectionId];
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    const screen = screensForModal[index];
    const screenId = screen?.screenId ?? screen?.id;
    if (screenId) setSearchParams({ screen: String(screenId) });
  };

  const fromPath = (location.state as { from?: string } | null)?.from;
  const handleModalClose = () => {
    if (fromPath) {
      navigate(fromPath);
    } else {
      setSearchParams({});
    }
  };

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
            {item.logo ? (
              <img src={item.logo} alt={item.app_name} />
            ) : (
              <div
                aria-label={item.app_name}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: '#242424',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 22,
                  textTransform: 'uppercase',
                  userSelect: 'none',
                }}
              >
                {(item.app_name?.trim()?.[0] ?? '?').toUpperCase()}
              </div>
            )}
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
            className={`detail-page__nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="detail-page__nav-icon">
              {NavIcons[tab.id]}
            </span>
            {tab.label}
            {tab.count !== null && (
              <span className="detail-page__nav-count">({tab.count})</span>
            )}
          </button>
        ))}
      </nav>



      <div className="detail-page__content">

        {/* Scenarios sidebar — tree navigation */}
        {activeTab === 'scenarios' && treeStructure.length > 0 && (
          <aside className="detail-page__sidebar detail-page__sidebar--tree">
            {treeStructure.map((node) => (
              <TreeNodeComponent
                key={node.id}
                node={node}
                activeTreeItem={activeTreeItem}
                onItemClick={handleTreeItemClick}
              />
            ))}
          </aside>
        )}

        {/* Main Content */}
        <main className="detail-page__main">
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
              {scenariosLoading ? (
                <div className="detail-page__scenarios-loading">Загрузка...</div>
              ) : (
                flatTreeStructure.map((item) => {
                  const sectionScreens = scenariosByCategoryId[item.id] ?? scenariosByCategoryId[item.sectionId] ?? [];
                  if (sectionScreens.length === 0) return null;
                  return (
                    <div
                      key={item.id}
                      id={item.sectionId}
                      ref={(el) => {
                        sectionRefs.current[item.sectionId] = el;
                      }}
                      className="detail-page__scenario-section"
                    >
                      <div className="detail-page__scenario-section-header">
                        <h3 className="detail-page__scenario-section-title">
                          {[...item.ancestors, item.label].join(' → ')}
                        </h3>
                        <span className="detail-page__scenario-section-count">{sectionScreens.length} экранов</span>
                      </div>
                      <div className="detail-page__scenario-section-grid">
                        {sectionScreens.map((screen) => {
                          const globalIndex = allScenarios.findIndex(
                            (s) => String(s.screenId ?? s.id) === String(screen.screenId ?? screen.id)
                          );
                          return (
                            <div
                              key={`${item.sectionId}-${screen.id}`}
                              className="detail-page__screen-card"
                              onClick={() => handleImageClick(globalIndex >= 0 ? globalIndex : 0)}
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
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
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
        images={screensForModal}
        initialIndex={Math.min(selectedImageIndex, Math.max(0, screensForModal.length - 1))}
        appInfo={{
          logo: item.logo ?? item.img2 ?? item.img1 ?? '',
          name: item.app_name,
          description: item.description || item.text_info || '—',
          projectId: id,
        }}
        treeStructure={treeStructure}
        activeTreeItem={activeTreeItem}
        onTreeItemClick={handleTreeItemClick}
        activeTab={activeTab}
        subCategories={subCategories}
        activeSubCategory={activeSubCategory}
        onSubCategoryClick={(categoryId) => setActiveSubCategory(categoryId)}
        screenMeta={modalScreenMeta}
        screenMetaLoading={modalScreenMetaLoading}
      />
    </div>
    </>
  );
};

export default DetailPage;

