import { useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useScenariosCategories } from '@/hooks/useScenariosCategories';
import { useScenariosCategoriesWithScreens } from '@/hooks/useScenariosCategoriesWithScreens';
import type { ScenariosTreeNode } from '@/hooks/useScenariosCategoriesWithScreens';
import { useScreenDetails } from '@/hooks/useProjects';
import { useSEO } from '@/hooks/useSEO';
import ImagePreviewModal from '@/components/ImagePreviewModal';
import iconDownload from '@/assets/icon-download.svg';
import iconLink from '@/assets/icon-link.svg';
import { SidebarSkeleton, ScenariosContentSkeleton } from '@/components/Skeleton';
import '@/styles/header-search.css';
import '@/styles/detail-page.css';
import '@/styles/ui-elements-page.css';
import '@/styles/scenarios-page.css';

type AppRow = {
  categoryId: string;
  projectId: string;
  projectName: string;
  projectLogo?: string;
  screens: Array<{ id: string | number; screenId?: string | number; image: string }>;
};

type CategorySection = {
  label: string;
  apps: AppRow[];
};

type FlatNode = ScenariosTreeNode & { depth: number };

function flattenTreeWithDepth(nodes: ScenariosTreeNode[], depth = 0): FlatNode[] {
  return nodes.flatMap((n) => [
    { ...n, depth },
    ...(n.children ? flattenTreeWithDepth(n.children, depth + 1) : []),
  ]);
}

function flattenTree(nodes: ScenariosTreeNode[]): ScenariosTreeNode[] {
  return nodes.flatMap((n) => [n, ...(n.children ? flattenTree(n.children) : [])]);
}

// Build label → ancestor path map from the tree
function buildLabelPathMap(nodes: ScenariosTreeNode[], ancestors: string[] = []): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const node of nodes) {
    const path = [...ancestors, node.label];
    if (node.label && !map.has(node.label)) map.set(node.label, path);
    if (node.children) {
      for (const [k, v] of buildLabelPathMap(node.children, path)) {
        if (!map.has(k)) map.set(k, v);
      }
    }
  }
  return map;
}

function findNodeById(nodes: ScenariosTreeNode[], id: string): ScenariosTreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNodeById(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

const ScenariosPage = () => {
  useSEO({
    title: 'Сценарии - UI/UX Design Scenarios',
    description: "UI/UX dizayn scenariylar to'plami. User flow va interaction patternlari.",
    keywords: 'UI scenarios, UX scenarios, user flows, interaction patterns, mobile app scenarios',
    ogUrl: 'https://inspiro.uz/scenarios',
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { treeStructure: categoriesTree, loading: tagsLoading } = useScenariosCategories(null);
  const {
    treeStructure: groupsTree,
    scenariosByCategoryId,
    loading: groupsLoading,
  } = useScenariosCategoriesWithScreens(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTag, setActiveTag] = useState<string>('all');
  const [openApp, setOpenApp] = useState<AppRow | null>(null);
  const [openInitialIdx, setOpenInitialIdx] = useState(0);

  const screenIdFromUrl = searchParams.get('screen');
  const { details: screenMeta, loading: screenMetaLoading } = useScreenDetails(
    openApp?.projectId,
    screenIdFromUrl
  );
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  // Sections grouped by node's OWN label (so every tree level gets its own section)
  const categorySections = useMemo<CategorySection[]>(() => {
    const allNodes = flattenTree(groupsTree);
    const byLabel = new Map<string, CategorySection>();

    for (const node of allNodes) {
      const screens = scenariosByCategoryId[node.id] ?? [];
      if (!screens.length) continue;

      const label = node.label;
      if (!label) continue;

      if (!byLabel.has(label)) byLabel.set(label, { label, apps: [] });

      const byProject = new Map<string, AppRow>();
      for (const s of screens) {
        const pid = s.projectId ?? '';
        const key = pid || '__unknown__';
        if (!byProject.has(key)) {
          byProject.set(key, {
            categoryId: node.id,
            projectId: pid,
            projectName: s.projectName ?? '',
            projectLogo: s.projectLogo,
            screens: [],
          });
        }
        byProject.get(key)!.screens.push({ id: s.id, screenId: s.screenId, image: s.image });
      }
      byLabel.get(label)!.apps.push(...byProject.values());
    }

    return [...byLabel.values()];
  }, [groupsTree, scenariosByCategoryId]);

  // Count per label for fast lookup
  const sectionCountByLabel = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of categorySections) {
      const n = s.apps.reduce((sum, app) => sum + app.screens.length, 0);
      map.set(s.label, (map.get(s.label) ?? 0) + n);
    }
    return map;
  }, [categorySections]);

  // All tree nodes flattened, deduplicated by label, sorted alphabetically
  const flatCategoriesWithDepth = useMemo(() => {
    const seen = new Set<string>();
    return flattenTreeWithDepth(categoriesTree)
      .filter((n) => {
        if (!n.label || seen.has(n.label)) return false;
        seen.add(n.label);
        return true;
      })
      .sort((a, b) => a.label.localeCompare(b.label, 'ru'));
  }, [categoriesTree]);

  // Sidebar tags — all levels, count is only this node's own screens
  const sidebarTags = useMemo(() => {
    return flatCategoriesWithDepth.map((node) => ({
      id: node.id,
      label: node.label,
      depth: node.depth,
      count: sectionCountByLabel.get(node.label) ?? 0,
    }));
  }, [flatCategoriesWithDepth, sectionCountByLabel]);

  const labelPathMap = useMemo(() => buildLabelPathMap(categoriesTree), [categoriesTree]);

  const allCount = useMemo(
    () => categorySections.reduce((sum, s) => sum + s.apps.reduce((a, r) => a + r.screens.length, 0), 0),
    [categorySections]
  );

  // Filter sections by active tag — exact label match only
  const visibleSections = useMemo(() => {
    if (activeTag === 'all') return categorySections;
    const activeNode = findNodeById(categoriesTree, activeTag);
    if (!activeNode) return [];
    return categorySections.filter((s) => s.label === activeNode.label);
  }, [categorySections, categoriesTree, activeTag]);

  const showToast = () => {
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2000);
  };

  const handleCopyLink = (categoryId: string) => {
    const url = `${window.location.origin}/scenarios/${categoryId}`;
    navigator.clipboard.writeText(url).catch(() => {});
    showToast();
  };

  const handleDownload = async (app: AppRow, categoryLabel: string) => {
    const key = app.categoryId + app.projectId;
    if (downloadingKey) return;
    setDownloadingKey(key);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      await Promise.all(
        app.screens.map(async (screen, i) => {
          const res = await fetch(screen.image);
          const blob = await res.blob();
          const ext = screen.image.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
          zip.file(`${i + 1}.${ext}`, blob);
        })
      );
      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `${categoryLabel}_${app.projectName}.zip`
        .replace(/\s+/g, '_')
        .replace(/[^\w._-]/g, '');
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error('Download failed', e);
    } finally {
      setDownloadingKey(null);
    }
  };

  return (
    <div className="ui-elements-page">
      {/* Sidebar */}
      <aside className="ui-elements-page__sidebar">
        {tagsLoading ? (
          <SidebarSkeleton />
        ) : (
          <>
            <button
              className={`detail-page__subcategory ${activeTag === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTag('all')}
            >
              Все
              <span className="detail-page__subcategory-count">{allCount}</span>
            </button>
            {sidebarTags.map((tag) => (
              <button
                key={tag.id}
                className={`detail-page__subcategory ${activeTag === tag.id ? 'active' : ''}`}
                onClick={() => setActiveTag(tag.id)}
              >
                {tag.label}
                <span className="detail-page__subcategory-count">{tag.count}</span>
              </button>
            ))}
          </>
        )}
      </aside>

      {/* Main */}
      <main className="ui-elements-page__main">
        {groupsLoading ? (
          <ScenariosContentSkeleton />
        ) : visibleSections.length === 0 ? (
          <div className="ui-elements-page__empty">Нет данных</div>
        ) : (
          visibleSections.map((section) => (
            <section key={section.label} className="scenario-section">
              {section.apps.map((app) => {
                const isDownloading = downloadingKey === app.categoryId + app.projectId;
                return (
                  <div key={`${app.categoryId}-${app.projectId}`} className="scenario-app-row">
                    <div className="scenario-app-row__header">
                      <div className="scenario-group__title-block">
                        <div className="scenario-group__title-row">
                          {(labelPathMap.get(section.label) ?? [section.label]).map((part, i) => (
                            <span key={i} className="scenario-group__path-part">
                              {i > 0 && <span className="scenario-group__arrow">→</span>}
                              <span className="scenario-group__category">{part}</span>
                            </span>
                          ))}
                          {app.projectName && (
                            <>
                              <span className="scenario-group__in">в</span>
                              <span
                                className="scenario-group__app"
                                onClick={() =>
                                  app.projectId &&
                                  navigate(`/detail/${app.projectId}`, {
                                    state: { from: location.pathname },
                                  })
                                }
                              >
                                {app.projectLogo && (
                                  <img
                                    src={app.projectLogo}
                                    alt={app.projectName}
                                    className="scenario-group__app-logo"
                                  />
                                )}
                                <span className="scenario-group__app-name">{app.projectName}</span>
                              </span>
                            </>
                          )}
                        </div>
                        <span className="scenario-group__count">{app.screens.length} экранов</span>
                      </div>

                      <div className="scenario-group__actions">
                        <button
                          className="scenario-group__btn"
                          title="Скачать экраны"
                          disabled={!!downloadingKey}
                          onClick={() => handleDownload(app, section.label)}
                          style={{ opacity: isDownloading ? 0.5 : 1 }}
                        >
                          <img src={iconDownload} alt="Скачать" />
                        </button>
                        <button
                          className="scenario-group__btn"
                          title="Скопировать ссылку на сценарий"
                          onClick={() => handleCopyLink(app.categoryId)}
                        >
                          <img src={iconLink} alt="Скопировать ссылку" />
                        </button>
                      </div>
                    </div>

                    <div className="scenario-group__screens">
                      {app.screens.map((screen, sIdx) => (
                        <div
                          key={screen.id}
                          className="scenario-screen-card"
                          onClick={() => {
                            setOpenApp(app);
                            setOpenInitialIdx(sIdx);
                            const sid = screen.screenId;
                            if (sid != null) setSearchParams({ screen: String(sid) });
                          }}
                        >
                          <img
                            src={screen.image}
                            alt=""
                            className="scenario-screen-card__image"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          ))
        )}
      </main>

      <div className={`scenario-toast${toastVisible ? ' visible' : ''}`}>
        Ссылка скопирована
      </div>

      <ImagePreviewModal
        isOpen={openApp !== null}
        onClose={() => { setOpenApp(null); setSearchParams({}); }}
        images={(openApp?.screens ?? []).map((s, i) => ({
          id: s.screenId ?? s.id ?? i,
          screenId: s.screenId,
          image: s.image,
          title: openApp?.projectName ?? '',
        }))}
        initialIndex={openInitialIdx}
        appInfo={openApp ? {
          logo: openApp.projectLogo ?? '',
          name: openApp.projectName,
          description: '',
          projectId: openApp.projectId,
        } : undefined}
        screenMeta={screenMeta}
        screenMetaLoading={screenMetaLoading}
      />
    </div>
  );
};

export default ScenariosPage;
