import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import type { SearchType } from '@/components/SearchModal';
import { SearchSkeleton } from '@/components/Skeleton';
import '@/styles/search-page.css';

function getImageBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const root = apiUrl.replace(/\/api\/?$/, '');
  return `${root}/images/`;
}

function toImageUrl(image: string): string {
  if (!image) return '';
  let cleaned = image;
  const matches = [...image.matchAll(/https?:\/+/gi)];
  const last = matches.length > 0 ? matches[matches.length - 1] : undefined;
  if (last && last.index !== undefined && last.index > 0) cleaned = image.slice(last.index);
  cleaned = cleaned.replace(/^(https?:)\/+/i, '$1//');
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  const path = cleaned.startsWith('/') ? cleaned.slice(1) : cleaned;
  return `${getImageBaseUrl()}${path}`;
}

interface SearchItem {
  id: string;
  name: string;
  category?: string;
  icon: string;
  type: SearchType;
}

type RawItem = { id?: string; name?: string; category?: string; icon?: string; type?: string };

const TYPE_LABELS: Record<SearchType, string> = {
  applications: 'Приложения',
  ui_elements: 'UI Элементы',
  scenarios: 'Сценарии',
  patterns: 'Паттерны',
  fonts: 'Шрифты',
};

const VISIBLE_TAB_TYPES: SearchType[] = ['applications', 'ui_elements', 'patterns', 'scenarios'];

function toSearchItem(x: RawItem, fallbackType: SearchType): SearchItem {
  return {
    id: String(x.id ?? ''),
    name: x.name ?? '',
    category: x.category,
    icon: x.icon ?? '',
    type: (x.type as SearchType) ?? fallbackType,
  };
}

const SearchPage = () => {
  useSEO({ title: 'Поиск - Inspiro', description: 'Поиск приложений, UI элементов и паттернов' });

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchType>('applications');
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fetchTabSearch = useCallback(async (q: string, type: SearchType) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    try {
      const params = new URLSearchParams({ type });
      if (q.trim()) params.set('q', q.trim());
      const res = await fetch(`${apiUrl}/search?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      const list: RawItem[] = Array.isArray(data?.data) ? data.data : [];
      setItems(list.map((x) => toSearchItem(x, type)));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGlobalSearch = useCallback(async (q: string) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json().catch(() => ({}));
      const grouped = data?.data ?? {};
      const merged: SearchItem[] = (
        ['applications', 'ui_elements', 'patterns', 'scenarios'] as SearchType[]
      ).flatMap((type) =>
        (Array.isArray(grouped[type]) ? grouped[type] : []).map((x: RawItem) =>
          toSearchItem(x, type)
        )
      );
      setItems(merged);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim()) fetchGlobalSearch(searchQuery);
      else fetchTabSearch('', activeFilter);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, activeFilter, fetchTabSearch, fetchGlobalSearch]);

  const handleItemClick = (item: SearchItem) => {
    if (item.type === 'applications') navigate(`/detail/${item.id}`);
    else if (item.type === 'ui_elements') navigate('/ui_elements');
    else if (item.type === 'patterns') navigate('/patterns');
    else if (item.type === 'scenarios') navigate('/scenarios');
  };

  return (
    <div className="search-page">
      {/* Top bar */}
      <div className="search-page__topbar">
        <button className="search-page__back" onClick={() => navigate(-1)} aria-label="Назад">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="search-page__input-wrap">
          <svg className="search-page__input-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M9.167 15.833a6.667 6.667 0 1 0 0-13.333 6.667 6.667 0 0 0 0 13.333ZM17.5 17.5l-3.625-3.625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-page__input"
            placeholder="Поиск приложений, UI Элементов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-page__clear" onClick={() => setSearchQuery('')} aria-label="Очистить">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs — shown only when not typing */}
      {!searchQuery && (
        <div className="search-page__filters">
          {VISIBLE_TAB_TYPES.map((type) => (
            <button
              key={type}
              className={`search-page__filter ${activeFilter === type ? 'active' : ''}`}
              onClick={() => setActiveFilter(type)}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="search-page__results">
        {loading ? (
          <SearchSkeleton />
        ) : items.length === 0 ? (
          <div className="search-page__empty">Ничего не найдено</div>
        ) : (
          <ul className="search-page__list">
            {items.map((item) => (
              <li key={`${item.type}-${item.id}`} className="search-page__item" onClick={() => handleItemClick(item)}>
                <div className="search-page__item-icon">
                  {item.icon ? (
                    <img src={toImageUrl(item.icon)} alt={item.name} />
                  ) : (
                    <div className="search-page__item-icon-placeholder">
                      {item.type === 'applications' ? '📱' : item.type === 'ui_elements' ? '🧩' : '🎨'}
                    </div>
                  )}
                </div>
                <div className="search-page__item-content">
                  <p className="search-page__item-name">{item.name}</p>
                  <p className="search-page__item-category">{TYPE_LABELS[item.type]}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
