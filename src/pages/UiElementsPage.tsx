import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUiElementsTags } from '@/hooks/useUiElementsTags';
import { useUiElementsWithScreens } from '@/hooks/useUiElementsWithScreens';
import type { UiElementGroup, UiScreen } from '@/hooks/useUiElementsWithScreens';
import { useScreenDetails } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import { useSEO } from '@/hooks/useSEO';
import { SidebarSkeleton, PatternsGridSkeleton } from '@/components/Skeleton';
import ImagePreviewModal from '@/components/ImagePreviewModal';
import PaywallGate from '@/components/PaywallGate';
import '@/styles/header-search.css';
import '@/styles/detail-page.css';
import '@/styles/ui-elements-page.css';

const PAYWALL_LIMIT = 10;

const UiElementsPage = () => {
  useSEO({
    title: 'UI Elements - Design Components',
    description: "UI elementlar va komponentlar to'plami. Zamonaviy dizayn komponentlari va best practices.",
    keywords: 'UI elements, design components, interface elements, UI components, design system',
    ogUrl: 'https://inspiro.uz/ui_elements',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const { tags, loading: tagsLoading } = useUiElementsTags();
  const { groups, loading: groupsLoading } = useUiElementsWithScreens();
  const { isAuthorized } = useAuth();
  const [activeTag, setActiveTag] = useState<string>('all');
  const [openGroupScreens, setOpenGroupScreens] = useState<UiScreen[] | null>(null);
  const [openInitialIdx, setOpenInitialIdx] = useState(0);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollTop = window.scrollY + rect.top - 140;
    if (window.scrollY > scrollTop) {
      window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
    }
  }, [activeTag]);

  const screenIdFromUrl = searchParams.get('screen');

  const currentScreen = openGroupScreens
    ? (openGroupScreens.find(s => s.screen_id === screenIdFromUrl) ?? openGroupScreens[openInitialIdx])
    : null;

  const { details: screenMeta, loading: screenMetaLoading } = useScreenDetails(
    currentScreen?.project_id,
    screenIdFromUrl
  );

  const handleClose = () => {
    setOpenGroupScreens(null);
    setSearchParams({});
  };

  const allCount = tags.reduce((sum, t) => sum + t.count, 0);
  const visibleGroups = activeTag === 'all' ? groups : groups.filter((g) => g.id === activeTag);

  // Clamp to PAYWALL_LIMIT screens total for unauthorized users
  const { clampedGroups, showPaywall } = useMemo(() => {
    if (isAuthorized) return { clampedGroups: visibleGroups, showPaywall: false };
    const totalScreens = visibleGroups.reduce((s, g) => s + g.screens.length, 0);
    if (totalScreens <= PAYWALL_LIMIT) return { clampedGroups: visibleGroups, showPaywall: false };

    let remaining = PAYWALL_LIMIT;
    const clamped: UiElementGroup[] = [];
    for (const group of visibleGroups) {
      if (remaining <= 0) break;
      const screens = group.screens.slice(0, remaining);
      remaining -= screens.length;
      if (screens.length > 0) clamped.push({ ...group, screens });
    }
    return { clampedGroups: clamped, showPaywall: true };
  }, [visibleGroups, isAuthorized]);

  return (
    <div className="ui-elements-page">
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

      <main ref={mainRef} className="ui-elements-page__main">
        {groupsLoading ? (
          <PatternsGridSkeleton />
        ) : clampedGroups.length === 0 && !showPaywall ? (
          <div className="ui-elements-page__empty">Malumot mavjud emas</div>
        ) : (
          <>
            {clampedGroups.map((group) => (
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
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setOpenGroupScreens(group.screens);
                        setOpenInitialIdx(idx);
                        if (screen.screen_id) setSearchParams({ screen: screen.screen_id });
                      }}
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
            ))}
            {showPaywall && <PaywallGate />}
          </>
        )}
      </main>

      <ImagePreviewModal
        isOpen={openGroupScreens !== null}
        onClose={handleClose}
        images={(openGroupScreens ?? []).map((s, i) => ({
          id: s.screen_id ?? String(i),
          screenId: s.screen_id,
          image: s.path,
          title: s.project_name,
        }))}
        initialIndex={openInitialIdx}
        appInfo={currentScreen ? {
          logo: currentScreen.project_logo,
          name: currentScreen.project_name,
          description: '',
          projectId: currentScreen.project_id,
        } : undefined}
        screenMeta={screenMeta}
        screenMetaLoading={screenMetaLoading}
        paywallLimit={isAuthorized ? undefined : PAYWALL_LIMIT}
      />
    </div>
  );
};

export default UiElementsPage;
