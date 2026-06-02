import { useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useScenariosCategories } from '@/hooks/useScenariosCategories';
import { useScenariosCategoriesWithScreens } from '@/hooks/useScenariosCategoriesWithScreens';
import type { ScenariosTreeNode } from '@/hooks/useScenariosCategoriesWithScreens';
import { useSEO } from '@/hooks/useSEO';
import iconDownload from '@/assets/icon-download.svg';
import iconLink from '@/assets/icon-link.svg';
import '@/styles/header-search.css';
import '@/styles/detail-page.css';
import '@/styles/ui-elements-page.css';
import '@/styles/scenarios-page.css';

type AppRow = {
  categoryId: string; // leaf node ID → used for /scenarios/:id link
  projectId: string;
  projectName: string;
  projectLogo?: string;
  screens: Array<{ id: string | number; screenId?: string | number; image: string }>;
};

type CategorySection = {
  label: string;   // e.g. "Авторизация"
  apps: AppRow[];  // one per app that has this scenario
};

function flattenTree(nodes: ScenariosTreeNode[]): ScenariosTreeNode[] {
  return nodes.flatMap((n) => [n, ...(n.children ? flattenTree(n.children) : [])]);
}

// nodeId → root ancestor id
function buildRootMap(nodes: ScenariosTreeNode[], rootId?: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const node of nodes) {
    const thisRoot = rootId ?? node.id;
    map.set(node.id, thisRoot);
    if (node.children?.length) {
      for (const [k, v] of buildRootMap(node.children, thisRoot)) map.set(k, v);
    }
  }
  return map;
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

  const [activeTag, setActiveTag] = useState<string>('all');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const rootMap = useMemo(() => buildRootMap(groupsTree), [groupsTree]);

  // Build sections: group all leaf nodes by their root-ancestor label
  const categorySections = useMemo<CategorySection[]>(() => {
    const allNodes = flattenTree(groupsTree);
    // Group by label so all apps with the same scenario name end up in one section
    const byLabel = new Map<string, CategorySection>();

    for (const node of allNodes) {
      const screens = scenariosByCategoryId[node.id] ?? [];
      if (!screens.length) continue;

      const rootId = rootMap.get(node.id) ?? node.id;
      const rootNode = allNodes.find((n) => n.id === rootId);
      const label = rootNode?.label ?? node.label;
      if (!label) continue;

      if (!byLabel.has(label)) byLabel.set(label, { label, apps: [] });

      // Group by project within this leaf node
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
  }, [groupsTree, scenariosByCategoryId, rootMap]);

  // Sidebar tags with counts calculated from real screen data (label-matched)
  const sidebarTags = useMemo(() => {
    return categoriesTree.map((node) => {
      // Match by label since IDs may differ between the two API endpoints
      const section = categorySections.find((s) => s.label === node.label);
      const count = section
        ? section.apps.reduce((sum, app) => sum + app.screens.length, 0)
        : 0;
      return { id: node.id, label: node.label, count };
    });
  }, [categoriesTree, categorySections]);

  const allCount = useMemo(
    () => categorySections.reduce((sum, s) => sum + s.apps.reduce((a, r) => a + r.screens.length, 0), 0),
    [categorySections]
  );

  // Filter sections by activeTag (matched by label)
  const visibleSections = useMemo(() => {
    if (activeTag === 'all') return categorySections;
    const activeLabel = sidebarTags.find((t) => t.id === activeTag)?.label;
    if (!activeLabel) return [];
    return categorySections.filter((s) => s.label === activeLabel);
  }, [categorySections, sidebarTags, activeTag]);

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
          <div className="ui-elements-page__sidebar-loading">Загрузка...</div>
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
          <div className="ui-elements-page__loading">Загрузка...</div>
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
                          <span className="scenario-group__category">{section.label}</span>
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
                      {app.screens.map((screen) => (
                        <div
                          key={screen.id}
                          className="scenario-screen-card"
                          onClick={() =>
                            app.projectId &&
                            navigate(
                              `/detail/${app.projectId}${
                                screen.screenId ? `?screen=${screen.screenId}` : ''
                              }`,
                              { state: { from: location.pathname } }
                            )
                          }
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
    </div>
  );
};

export default ScenariosPage;
