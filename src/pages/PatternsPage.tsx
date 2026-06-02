import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePatternsWithScreens } from "@/hooks/usePatternsWithScreens";
import { useSEO } from "@/hooks/useSEO";
import '@/styles/header-search.css';
import '@/styles/detail-page.css';
import '@/styles/ui-elements-page.css';

const PatternsPage = () => {
  useSEO({
    title: 'Patterns - UI/UX Design Patterns',
    description: 'UI/UX dizayn patternlar to\'plami. Zamonaviy dizayn yechimlari va best practices.',
    keywords: 'UI patterns, UX patterns, design patterns, interface patterns, user experience patterns',
    ogUrl: 'https://inspiro.uz/patterns',
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { groups, loading: groupsLoading } = usePatternsWithScreens();
  const [activeTag, setActiveTag] = useState<string>('all');
  const mainRef = useRef<HTMLElement>(null);

  // Reset scroll when filter changes so user sees the filtered result
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollTop = window.scrollY + rect.top - 140; // 140 = header + nav height
    if (window.scrollY > scrollTop) {
      window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
    }
  }, [activeTag]);

  const tags = groups.map((g) => ({ id: g.id, label: g.label, count: g.screens.length }));
  const allCount = tags.reduce((sum, t) => sum + t.count, 0);

  const visibleGroups =
    activeTag === 'all' ? groups : groups.filter((g) => g.id === activeTag);

  return (
    <div className="ui-elements-page">
      {/* Left Sidebar */}
      <aside className="ui-elements-page__sidebar">
        {groupsLoading ? (
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
      <main ref={mainRef} className="ui-elements-page__main">
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
                {group.screens.map((screen, idx) => (
                  <div
                    key={idx}
                    className="patterns-card"
                    style={{ cursor: screen.project_id ? 'pointer' : 'default' }}
                    onClick={() => screen.project_id && navigate(`/detail/${screen.project_id}${screen.screen_id ? `?screen=${screen.screen_id}` : ''}`, { state: { from: location.pathname } })}
                  >
                    <div className="patterns-card__image-wrapper">
                      <img
                        src={screen.path}
                        alt={screen.project_name}
                        className="patterns-card__image"
                      />
                    </div>
                    <div className="patterns-card__app-info">
                      <img
                        src={screen.project_logo}
                        alt={screen.project_name}
                        className="patterns-card__app-logo"
                      />
                      <span className="patterns-card__app-name">{screen.project_name}</span>
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

export default PatternsPage;
