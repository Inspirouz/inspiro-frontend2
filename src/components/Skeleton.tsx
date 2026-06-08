import '@/styles/skeleton.css';

// ── HomePage — 8 app cards matching .card layout ─────────────────────────
export const HomePageSkeleton = () => (
  <main className="main-content-view" aria-busy="true">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="sk-card">
        <div className="sk-card__header">
          <div className="sk sk-card__logo" />
          <div className="sk-card__info">
            <div className="sk sk-card__title" />
            <div className="sk sk-card__sub" />
          </div>
        </div>
        <div className="sk sk-card__image" />
      </div>
    ))}
  </main>
);

// ── Sidebar — .detail-page__subcategory buttons ───────────────────────────
export const SidebarSkeleton = () => (
  <div className="sk-sidebar" aria-hidden="true">
    {[80, 60, 75, 55, 70, 65, 50].map((w, i) => (
      <div key={i} className="sk sk-sidebar__item" style={{ width: `${w}%` }} />
    ))}
  </div>
);

// ── Patterns / UI Elements — groups with card grids ───────────────────────
export const PatternsGridSkeleton = () => (
  <div aria-hidden="true">
    {Array.from({ length: 2 }).map((_, gi) => (
      <div key={gi} className="sk-group">
        <div className="sk-group__header">
          <div className="sk sk-group__title" />
          <div className="sk sk-group__count" />
        </div>
        <div className="sk-patterns-grid">
          {Array.from({ length: 10 }).map((_, ci) => (
            <div key={ci} className="sk-pattern-card">
              {/* image-wrapper: border+radius matching .patterns-card__image-wrapper */}
              <div className="sk sk-pattern-card__image-wrapper" />
              <div className="sk-pattern-card__app-info">
                <div className="sk sk-pattern-card__logo" />
                <div className="sk sk-pattern-card__name" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ── DetailPage — full skeleton matching actual header + screen grid ────────
export const DetailPageSkeleton = () => (
  <div className="detail-page-wrapper" aria-busy="true">
    <div className="detail-page">
      <div className="detail-page__header">

        {/* Icon 120×120 + title/desc — .detail-page__header-main */}
        <div className="sk-detail-main">
          <div className="sk sk-detail-icon" />
          <div className="sk-detail-info">
            <div className="sk sk-detail-title" />
            <div className="sk sk-detail-desc" />
            <div className="sk sk-detail-desc" style={{ width: '50%' }} />
          </div>
        </div>

        {/* Meta — .detail-page__header-meta (flex gap40, each item: label+value) */}
        <div className="sk-detail-meta">
          {[1, 2, 3].map((i) => (
            <div key={i} className="sk-detail-meta-item">
              <div className="sk sk-detail-meta-label" />
              <div className="sk sk-detail-meta-value" />
            </div>
          ))}
        </div>

        {/* Nav tabs — 36px font / lh48 + padding = ~64px tall */}
        <div className="sk-tabs">
          {[120, 140, 160].map((w, i) => (
            <div key={i} className="sk sk-tab" style={{ width: w }} />
          ))}
        </div>
      </div>

      {/* Screen grid — repeat(6,1fr), aspect 9/19.5, border #404040, br 24 */}
      <div className="sk-screen-grid">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="sk sk-screen-card" />
        ))}
      </div>
    </div>
  </div>
);

// ── ScenariosPage — app rows with horizontal screen scroll ─────────────────
export const ScenariosContentSkeleton = () => (
  <div aria-hidden="true">
    {Array.from({ length: 2 }).map((_, si) => (
      <div key={si} className="sk-scenario-section">
        {Array.from({ length: 2 }).map((_, ri) => (
          <div key={ri} className="sk-scenario-app-row">
            {/* Header: logo + title + count | action buttons */}
            <div className="sk-scenario-row__header">
              <div className="sk-scenario-row__left">
                <div className="sk-scenario-title-row">
                  <div className="sk sk-scenario-logo" />
                  <div className="sk sk-scenario-title" />
                </div>
                <div className="sk sk-scenario-count" />
              </div>
              <div className="sk-scenario-actions">
                <div className="sk sk-scenario-btn" />
                <div className="sk sk-scenario-btn" />
              </div>
            </div>
            {/* Horizontal scroll: 240×520 cards, border #404040, br 20 */}
            <div className="sk-scenario-screens">
              {Array.from({ length: 4 }).map((_, k) => (
                <div key={k} className="sk sk-scenario-screen" />
              ))}
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

// ── SearchPage — .search-page__item list ──────────────────────────────────
export const SearchSkeleton = () => (
  <ul className="search-page__list" style={{ listStyle: 'none', padding: 0, margin: 0 }} aria-hidden="true">
    {[55, 45, 68, 40, 72, 50, 62].map((w, i) => (
      <li key={i} className="sk-search-item">
        <div className="sk sk-search-icon" />
        <div className="sk-search-info">
          <div className="sk sk-search-name" style={{ width: `${w}%` }} />
          <div className="sk sk-search-cat"  style={{ width: `${Math.max(18, w - 28)}%` }} />
        </div>
      </li>
    ))}
  </ul>
);
