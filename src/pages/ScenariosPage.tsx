import { useState } from 'react';
import { useScenariosCategories } from '@/hooks/useScenariosCategories';
import { useScenariosCategoriesWithScreens } from '@/hooks/useScenariosCategoriesWithScreens';
import { useSEO } from '@/hooks/useSEO';
import '@/styles/header-search.css';
import '@/styles/detail-page.css';
import '@/styles/ui-elements-page.css';

const ScenariosPage = () => {
  useSEO({
    title: 'Сценарии - UI/UX Design Scenarios',
    description: "UI/UX dizayn scenariylar to'plami. User flow va interaction patternlari.",
    keywords: 'UI scenarios, UX scenarios, user flows, interaction patterns, mobile app scenarios',
    ogUrl: 'https://inspiro.uz/scenarios',
  });

  const { treeStructure: categoriesTree, loading: tagsLoading } = useScenariosCategories(null);
  const {
    treeStructure: groupsTree,
    scenariosByCategoryId,
    loading: groupsLoading,
  } = useScenariosCategoriesWithScreens(null);
  const [activeTag, setActiveTag] = useState<string>('all');

  const countForCategory = (nodeId: string, nodeSectionId?: string): number => {
    const ownLoaded =
      (scenariosByCategoryId[nodeId] ?? scenariosByCategoryId[nodeSectionId ?? ''] ?? []).length;
    if (ownLoaded > 0) return ownLoaded;
    const fromTree = groupsTree.find((g) => g.id === nodeId);
    return fromTree?.count ?? 0;
  };

  const tags = categoriesTree.map((node) => ({
    id: node.id,
    label: node.label,
    count: countForCategory(node.id, node.sectionId) || node.count,
  }));

  const allCount = tags.reduce((sum, t) => sum + t.count, 0);

  const groups = groupsTree
    .map((node) => ({
      id: node.id,
      label: node.label,
      screens: scenariosByCategoryId[node.id] ?? [],
    }))
    .filter((g) => g.screens.length > 0);

  const visibleGroups =
    activeTag === 'all' ? groups : groups.filter((g) => g.id === activeTag);

  return (
    <div className="ui-elements-page">
      {/* Left Sidebar */}
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
            {tags.map((tag) => (
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

      {/* Main Content */}
      <main className="ui-elements-page__main">
        {groupsLoading ? (
          <div className="ui-elements-page__loading">Загрузка...</div>
        ) : visibleGroups.length === 0 ? (
          <div className="ui-elements-page__empty">Malumot mavjud emas</div>
        ) : (
          visibleGroups.map((group) => (
            <section key={group.id} className="ui-elements-page__group">
              <div className="ui-elements-page__group-header">
                <h2 className="ui-elements-page__group-title">{group.label}</h2>
                <p className="ui-elements-page__group-count">{group.screens.length} экранов</p>
              </div>
              <div className="ui-elements-page__grid">
                {group.screens.map((screen) => (
                  <div key={String(screen.id)} className="patterns-card">
                    <div className="patterns-card__image-wrapper">
                      <img
                        src={screen.image}
                        alt={screen.projectName ?? screen.title}
                        className="patterns-card__image"
                      />
                    </div>
                    <div className="patterns-card__app-info">
                      {screen.projectLogo && (
                        <img
                          src={screen.projectLogo}
                          alt={screen.projectName ?? ''}
                          className="patterns-card__app-logo"
                        />
                      )}
                      <span className="patterns-card__app-name">{screen.projectName ?? ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
};

export default ScenariosPage;
