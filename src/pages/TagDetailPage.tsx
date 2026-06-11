import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { usePatternsWithScreens } from '@/hooks/usePatternsWithScreens';
import { useUiElementsWithScreens } from '@/hooks/useUiElementsWithScreens';
import { useScenariosCategoriesWithScreens } from '@/hooks/useScenariosCategoriesWithScreens';
import type { ScenariosTreeNode } from '@/hooks/useScenariosCategoriesWithScreens';
import type { ScenarioItem } from '@/hooks/useProjects';
import '@/styles/detail-page.css';
import '@/styles/ui-elements-page.css';

type TagType = 'patterns' | 'ui-elements' | 'scenarios';

type Screen = {
  image: string;
  screenId?: string;
  projectId?: string;
  projectName?: string;
  projectLogo?: string;
};

function flattenTree(nodes: ScenariosTreeNode[]): ScenariosTreeNode[] {
  return nodes.flatMap((n) => [n, ...(n.children ? flattenTree(n.children) : [])]);
}

const TagDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const tagType: TagType = location.pathname.startsWith('/patterns')
    ? 'patterns'
    : location.pathname.startsWith('/ui-elements')
    ? 'ui-elements'
    : 'scenarios';

  const { groups: patternGroups, loading: patternLoading } = usePatternsWithScreens();
  const { groups: uiGroups, loading: uiLoading } = useUiElementsWithScreens();
  const { scenariosByCategoryId, treeStructure: scenarioTree, loading: scenarioLoading } =
    useScenariosCategoriesWithScreens(null);

  let title = '';
  let screens: Screen[] = [];
  let loading = false;

  if (tagType === 'patterns') {
    loading = patternLoading;
    const group = patternGroups.find((g) => g.id === id);
    title = group?.label ?? '';
    screens = (group?.screens ?? []).map((s) => ({
      image: s.path,
      screenId: s.screen_id,
      projectId: s.project_id,
      projectName: s.project_name,
      projectLogo: s.project_logo,
    }));
  } else if (tagType === 'ui-elements') {
    loading = uiLoading;
    const group = uiGroups.find((g) => g.id === id);
    title = group?.label ?? '';
    screens = (group?.screens ?? []).map((s) => ({
      image: s.path,
      screenId: s.screen_id,
      projectId: s.project_id,
      projectName: s.project_name,
      projectLogo: s.project_logo,
    }));
  } else {
    loading = scenarioLoading;
    const flat = flattenTree(scenarioTree);
    const node = flat.find((n) => n.id === id);
    title = node?.label ?? '';
    const items: ScenarioItem[] = scenariosByCategoryId[id ?? ''] ?? [];
    screens = items.map((s) => ({
      image: s.image,
      screenId: String(s.screenId ?? s.id ?? ''),
      projectId: s.projectId,
      projectName: s.projectName,
      projectLogo: s.projectLogo,
    }));
  }

  return (
    <div className="ui-elements-page" style={{ paddingTop: 24 }}>
      <main className="ui-elements-page__main" style={{ width: '100%' }}>

        {loading ? (
          <div className="ui-elements-page__loading">Загрузка...</div>
        ) : (
          <section className="ui-elements-page__group">
            <div className="ui-elements-page__group-header">
              {tagType === 'scenarios' ? (
                <h2 className="ui-elements-page__group-title" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {title || '—'}
                  {(() => {
                    const first = screens.find((s) => s.projectId);
                    if (!first) return null;
                    return (
                      <>
                        <span style={{ fontWeight: 400, color: '#ffffff' }}>в</span>
                        <span
                          className="scenario-company-link"
                          onClick={(e) => { e.stopPropagation(); navigate(`/detail/${first.projectId}`); }}
                        >
                          {first.projectLogo && (
                            <img src={first.projectLogo} alt={first.projectName ?? ''} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                          )}
                          {first.projectName}
                        </span>
                      </>
                    );
                  })()}
                </h2>
              ) : (
                <h2 className="ui-elements-page__group-title">{title || '—'}</h2>
              )}
              <p className="ui-elements-page__group-count">{screens.length} экранов</p>
            </div>
            {screens.length === 0 ? (
              <div className="ui-elements-page__empty">Экраны не найдены</div>
            ) : (
              <div className="ui-elements-page__grid">
                {screens.map((screen, idx) => (
                  <div
                    key={idx}
                    className="patterns-card"
                    style={{ cursor: screen.projectId ? 'pointer' : 'default' }}
                    onClick={() => screen.projectId && navigate(`/detail/${screen.projectId}${screen.screenId ? `?screen=${screen.screenId}` : ''}`, { state: { from: location.pathname } })}
                  >
                    <div className="patterns-card__image-wrapper">
                      <img
                        src={screen.image}
                        alt={screen.projectName ?? ''}
                        className="patterns-card__image"
                      />
                    </div>
                    {tagType !== 'scenarios' && (
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
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default TagDetailPage;
