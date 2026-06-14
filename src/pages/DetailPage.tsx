import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useProject, useProjectScreens, useScreenDetails } from '@/hooks/useProjects';
import { useScreensCategories } from '@/hooks/useScreensCategories';
import { useScenariosCategories } from '@/hooks/useScenariosCategories';
import { useScenariosCategoriesWithScreens } from '@/hooks/useScenariosCategoriesWithScreens';
import { useAuth } from '@/contexts/AuthContext';
import { useSEO } from '@/hooks/useSEO';
import ImagePreviewModal from '@/components/ImagePreviewModal';
import PaywallGate from '@/components/PaywallGate';
import { NavIcons } from '@/components/icons';
import { DetailPageSkeleton, ScenariosContentSkeleton } from '@/components/Skeleton';
import '@/styles/detail-page.css';
import { isVideoUrl } from '@/lib/media';

function AutoPlayVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry) entry.isIntersecting ? el.play().catch(() => {}) : el.pause(); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <video ref={ref} src={src} className={className} muted loop playsInline preload="none" />;
}

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

const PAYWALL_LIMIT = 10;
const PAYWALL_BLUR_COUNT = 3;

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthorized } = useAuth();
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
    { id: 'scenarios' as TabType, label: 'Сценарии', count: flatTreeStructure.length },
    { id: 'screens' as TabType, label: 'Экраны', count: screens.length },
    // { id: 'videos' as TabType, label: 'Видео', count: null, comingSoon: true, disabled: true },
  ];

  /** For modal and click index: scenarios tab uses allScenarios, screens tab uses screens */
  const screensForModal = useMemo(() => {
    const all = activeTab === 'scenarios' ? allScenarios : screens;
    return isAuthorized ? all : all.slice(0, PAYWALL_LIMIT);
  }, [activeTab, allScenarios, screens, isAuthorized]);

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

  // Paywall: for unauthorized users blur screens after PAYWALL_LIMIT
  const { visibleScreens, blurredScreens, screensPaywallNeeded } = useMemo(() => {
    if (isAuthorized) return { visibleScreens: filteredScreens, blurredScreens: [], screensPaywallNeeded: false };
    const visible = filteredScreens.slice(0, PAYWALL_LIMIT);
    const blurred = filteredScreens.slice(PAYWALL_LIMIT, PAYWALL_LIMIT + PAYWALL_BLUR_COUNT);
    return { visibleScreens: visible, blurredScreens: blurred, screensPaywallNeeded: filteredScreens.length > PAYWALL_LIMIT };
  }, [filteredScreens, isAuthorized]);

  // Paywall for scenarios tab: count total screens across all sections
  const { clampedSectionData, scenariosPaywallNeeded } = useMemo(() => {
    const total = flatTreeStructure.reduce(
      (s, item) => s + (scenariosByCategoryId[item.id] ?? scenariosByCategoryId[item.sectionId] ?? []).length,
      0
    );
    if (isAuthorized || total <= PAYWALL_LIMIT) return { clampedSectionData: null, scenariosPaywallNeeded: false };

    let remaining = PAYWALL_LIMIT;
    let blurPlaced = false;
    const data = new Map<string, { visible: typeof allScenarios; blurred: typeof allScenarios }>();
    for (const item of flatTreeStructure) {
      const all = scenariosByCategoryId[item.id] ?? scenariosByCategoryId[item.sectionId] ?? [];
      if (all.length === 0) continue;

      if (remaining <= 0) {
        if (!blurPlaced) {
          // First section entirely beyond limit: show blurred preview
          data.set(item.id, { visible: [], blurred: all.slice(0, PAYWALL_BLUR_COUNT) });
          blurPlaced = true;
        } else {
          // All subsequent sections: hide completely
          data.set(item.id, { visible: [], blurred: [] });
        }
        continue;
      }

      // Section partially or fully within limit
      const visible = all.slice(0, remaining);
      let blurred: typeof allScenarios = [];
      if (!blurPlaced && visible.length < all.length) {
        // This section crosses the limit: show blurred screens after visible
        blurred = all.slice(remaining, remaining + PAYWALL_BLUR_COUNT);
        blurPlaced = true;
      }
      remaining = Math.max(0, remaining - all.length);
      data.set(item.id, { visible, blurred });
    }
    return { clampedSectionData: data, scenariosPaywallNeeded: true };
  }, [flatTreeStructure, scenariosByCategoryId, isAuthorized, allScenarios]);

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
      { root: null, rootMargin: '-215px 0px -60% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
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

  // Handle navigation back from ScenarioTreePage — scroll to selected section
  const sectionFromUrl = searchParams.get('section');
  useEffect(() => {
    if (!sectionFromUrl || scenariosLoading) return;
    setActiveTab('scenarios');
    const timeout = setTimeout(() => {
      const el = sectionRefs.current[sectionFromUrl];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const node = flatTreeStructure.find((i) => i.sectionId === sectionFromUrl);
        if (node) setActiveTreeItem(node.id);
      }
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('section');
        return next;
      }, { replace: true });
    }, 600);
    return () => clearTimeout(timeout);
  }, [sectionFromUrl, scenariosLoading]);

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
    return <DetailPageSkeleton />;
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
    <div className="detail-page-wrapper">
      <div className="detail-page">

      {/* Top Header */}
      <div className="detail-page__header">
        <div className="detail-page__header-main">
          <div className="detail-page__header-icon">
            {item.logo ? (
              <img src={item.logo} alt={item.app_name} />
            ) : (
              <span className="detail-page__header-icon-fallback">
                {(item.app_name?.trim()?.[0] ?? '?').toUpperCase()}
              </span>
            )}
          </div>
          <div className="detail-page__header-info">
            <h1 className="detail-page__header-title">{item.app_name}</h1>
            <p className="detail-page__header-description">{item.description || item.text_info || ''}</p>
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
            {tab.count !== null && tab.count > 0 && (
              <span className="detail-page__nav-chip"><span>{tab.count.toLocaleString('ru')}</span></span>
            )}
          </button>
        ))}
      </nav>



      <div className="detail-page__content">

        {/* Screens sidebar — category filter */}
        {activeTab === 'screens' && visibleSubCategories.length > 0 && (
          <aside className="detail-page__sidebar">
            <button
              className={`detail-page__subcategory ${activeSubCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveSubCategory('all')}
            >
              <span>Все</span>
              <span className="detail-page__subcategory-count">{screens.length}</span>
            </button>
            {visibleSubCategories.map((cat) => (
              <button
                key={cat.id}
                className={`detail-page__subcategory ${activeSubCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveSubCategory(cat.id)}
              >
                <span>{cat.label}</span>
                <span className="detail-page__subcategory-count">{cat.count}</span>
              </button>
            ))}
          </aside>
        )}

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
          {activeTab === 'scenarios' && treeStructure.length > 0 && (
            <button
              className="detail-page__select-scenario-btn"
              onClick={() => navigate(`/detail/${id}/scenarios`)}
            >
              <span>Выбрать сценарий</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {activeTab === 'screens' && (
            <>
            <div className="paywall-grid-wrap">
              <div className="detail-page__grid">
                {visibleScreens.map((screen, index) => {
                  const globalIndex = screensForModal.findIndex((s) => s.id === screen.id);
                  return (
                  <div
                    key={screen.id}
                    className="detail-page__screen-card"
                    onClick={() => handleImageClick(globalIndex >= 0 ? globalIndex : index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="detail-page__phone-screen">
                      {isVideoUrl(screen.image)
                        ? <AutoPlayVideo src={screen.image} className="detail-page__phone-image" />
                        : <img src={screen.image} alt={screen.title} className="detail-page__phone-image" />}
                    </div>
                    <div className="detail-page__screen-card-app-info">
                      {item.logo && <img src={item.logo} alt="" className="detail-page__screen-card-app-logo" />}
                      <span className="detail-page__screen-card-app-name">{item.app_name}</span>
                    </div>
                  </div>
                );})}
              </div>
            </div>
            {screensPaywallNeeded && <PaywallGate />}
            </>
          )}

          {activeTab === 'scenarios' && (
            <div className="detail-page__scenarios-content">
              {scenariosLoading ? (
                <ScenariosContentSkeleton />
              ) : (
                <>
                {flatTreeStructure.map((item) => {
                  const allSectionScreens = scenariosByCategoryId[item.id] ?? scenariosByCategoryId[item.sectionId] ?? [];
                  const clamped = clampedSectionData?.get(item.id);
                  const sectionScreens = clamped ? clamped.visible : allSectionScreens;
                  const sectionBlurred = clamped ? clamped.blurred : [];
                  if (sectionScreens.length === 0 && sectionBlurred.length === 0) return null;
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
                        <span className="detail-page__scenario-section-count">{allSectionScreens.length} экранов</span>
                      </div>
                      <div className="detail-page__scenario-section-grid">
                        {sectionScreens.map((screen) => {
                          const globalIndex = screensForModal.findIndex(
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
                                {isVideoUrl(screen.image)
                                  ? <AutoPlayVideo src={screen.image} className="detail-page__phone-image" />
                                  : <img src={screen.image} alt={screen.title} className="detail-page__phone-image" />}
                              </div>
                              <div className="detail-page__screen-card-app-info">
                                {projectFromApi?.logo && <img src={projectFromApi.logo} alt="" className="detail-page__screen-card-app-logo" />}
                                <span className="detail-page__screen-card-app-name">{projectFromApi?.app_name}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {scenariosPaywallNeeded && <PaywallGate />}
                </>
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
        paywallLimit={isAuthorized ? undefined : PAYWALL_LIMIT}
      />
    </div>
  );
};

export default DetailPage;

