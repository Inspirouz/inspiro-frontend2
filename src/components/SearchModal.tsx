import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/search-modal.css';

export type SearchType = 'applications' | 'ui_elements' | 'scenarios' | 'patterns' | 'fonts';

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

const VISIBLE_TAB_TYPES: SearchType[] = ['applications', 'ui_elements', 'patterns', 'scenarios'];

const TYPE_LABELS: Record<SearchType, string> = {
  applications: 'Приложения',
  ui_elements: 'UI Элементы',
  scenarios: 'Сценарии',
  patterns: 'Паттерны',
  fonts: 'Шрифты',
};

type RawItem = { id?: string; name?: string; category?: string; icon?: string; type?: string };

function toSearchItem(x: RawItem, fallbackType: SearchType): SearchItem {
  return {
    id: String(x.id ?? ''),
    name: x.name ?? '',
    category: x.category,
    icon: x.icon ?? '',
    type: (x.type as SearchType) ?? fallbackType,
  };
}

const SearchModal = ({ onClose }: { onClose?: () => void }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchType>('applications');
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTabSearch = useCallback(async (q: string, type: SearchType) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ type });
      if (q.trim()) params.set('q', q.trim());
      const res = await fetch(`${apiUrl}/search?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || data?.error || `Ошибка ${res.status}`);
      const list: RawItem[] = Array.isArray(data?.data) ? data.data : [];
      setItems(list.map((x) => toSearchItem(x, type)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGlobalSearch = useCallback(async (q: string) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || data?.error || `Ошибка ${res.status}`);
      const grouped = data?.data ?? {};
      const merged: SearchItem[] = (
        ['applications', 'ui_elements', 'patterns', 'scenarios'] as SearchType[]
      ).flatMap((type) =>
        (Array.isArray(grouped[type]) ? grouped[type] : []).map((x: RawItem) =>
          toSearchItem(x, type)
        )
      );
      setItems(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchGlobalSearch(searchQuery);
      } else {
        fetchTabSearch('', activeFilter);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, activeFilter, fetchTabSearch, fetchGlobalSearch]);

  const filterIcons: Record<SearchType, React.ReactNode> = {
    applications: (
      <svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.4" d="M24.36 3H11.64C7.5 3 6 4.5 6 8.715V27.285C6 31.5 7.5 33 11.64 33H24.345C28.5 33 30 31.5 30 27.285V8.715C30 4.5 28.5 3 24.36 3Z" fill="var(--fill-0, #737373)"/>
        <path d="M21 9.375H15C14.385 9.375 13.875 8.865 13.875 8.25C13.875 7.635 14.385 7.125 15 7.125H21C21.615 7.125 22.125 7.635 22.125 8.25C22.125 8.865 21.615 9.375 21 9.375Z" fill="var(--fill-0, #737373)"/>
        <path d="M18 28.95C19.4497 28.95 20.625 27.7747 20.625 26.325C20.625 24.8753 19.4497 23.7 18 23.7C16.5503 23.7 15.375 24.8753 15.375 26.325C15.375 27.7747 16.5503 28.95 18 28.95Z" fill="var(--fill-0, #737373)"/>
      </svg>
    ),
    ui_elements: (
      <svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.145 22.5H6.6C3.87 22.5 2.13 19.575 3.45 17.175L6.945 10.815L10.215 4.86C11.58 2.385 15.15 2.385 16.515 4.86L19.8 10.815L21.375 13.68L23.295 17.175C24.615 19.575 22.875 22.5 20.145 22.5Z" fill="var(--fill-0, #737373)"/>
        <path opacity="0.4" d="M33 23.25C33 28.635 28.635 33 23.25 33C17.865 33 13.5 28.635 13.5 23.25C13.5 22.995 13.515 22.755 13.53 22.5H20.145C22.875 22.5 24.615 19.575 23.295 17.175L21.375 13.68C21.975 13.56 22.605 13.5 23.25 13.5C28.635 13.5 33 17.865 33 23.25Z" fill="var(--fill-0, #737373)"/>
      </svg>
    ),
    scenarios: (
      <svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.4" d="M30.54 19.095C29.985 19.095 29.52 18.675 29.46 18.12C29.1 14.82 27.33 11.85 24.6 9.96C24.105 9.615 23.985 8.94 24.33 8.445C24.675 7.95 25.35 7.83 25.845 8.175C29.1 10.44 31.2 13.98 31.635 17.895C31.695 18.495 31.26 19.035 30.66 19.095C30.615 19.095 30.585 19.095 30.54 19.095Z" fill="var(--fill-0, #737373)"/>
        <path opacity="0.4" d="M5.61 19.17C5.58 19.17 5.535 19.17 5.505 19.17C4.905 19.11 4.47 18.57 4.53 17.97C4.935 14.055 7.005 10.515 10.23 8.235C10.71 7.89 11.4 8.01 11.745 8.49C12.09 8.985 11.97 9.66 11.49 10.005C8.79 11.925 7.035 14.895 6.705 18.18C6.645 18.75 6.165 19.17 5.61 19.17Z" fill="var(--fill-0, #737373)"/>
        <path opacity="0.4" d="M23.985 31.65C22.14 32.535 20.16 32.985 18.09 32.985C15.93 32.985 13.875 32.505 11.955 31.53C11.415 31.275 11.205 30.615 11.475 30.075C11.73 29.535 12.39 29.325 12.93 29.58C13.875 30.06 14.88 30.39 15.9 30.585C17.28 30.855 18.69 30.87 20.07 30.63C21.09 30.45 22.095 30.135 23.025 29.685C23.58 29.43 24.24 29.64 24.48 30.195C24.75 30.735 24.54 31.395 23.985 31.65Z" fill="var(--fill-0, #737373)"/>
        <path d="M18.075 3.015C15.75 3.015 13.845 4.905 13.845 7.245C13.845 9.585 15.735 11.475 18.075 11.475C20.415 11.475 22.305 9.585 22.305 7.245C22.305 4.905 20.415 3.015 18.075 3.015Z" fill="var(--fill-0, #737373)"/>
        <path d="M7.575 20.805C5.25 20.805 3.345 22.695 3.345 25.035C3.345 27.375 5.235 29.265 7.575 29.265C9.915 29.265 11.805 27.375 11.805 25.035C11.805 22.692 9.9 20.805 7.575 20.805Z" fill="var(--fill-0, #737373)"/>
        <path d="M28.425 20.805C26.1 20.805 24.195 22.695 24.195 25.035C24.195 27.375 26.085 29.265 28.425 29.265C30.765 29.265 32.655 27.375 32.655 25.035C32.655 22.692 30.765 20.805 28.425 20.805Z" fill="var(--fill-0, #737373)"/>
      </svg>
    ),
    patterns: (
      <svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.4" d="M31.5609 10.785L18.0009 18.63L4.44094 10.785C5.04094 9.675 5.91094 8.7 6.88594 8.16L14.8959 3.72C16.6059 2.76 19.3959 2.76 21.1059 3.72L29.1159 8.16C30.0909 8.7 30.9609 9.675 31.5609 10.785Z" fill="var(--fill-0, #737373)"/>
        <path opacity="0.6" d="M18.0009 18.63V33C16.8759 33 15.7509 32.76 14.8959 32.28L6.88594 27.84C5.07094 26.835 3.58594 24.315 3.58594 22.245V13.755C3.58594 12.795 3.91594 11.745 4.44094 10.785L18.0009 18.63Z" fill="var(--fill-0, #737373)"/>
        <path d="M32.4159 13.755V22.245C32.4159 24.315 30.9309 26.835 29.1159 27.84L21.1059 32.28C20.2509 32.76 19.1259 33 18.0009 33V18.63L31.5609 10.785C32.0859 11.745 32.4159 12.795 32.4159 13.755Z" fill="var(--fill-0, #737373)"/>
      </svg>
    ),
    fonts: (
      <svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.4" d="M33 11.715V24.285C33 29.745 29.745 33 24.285 33H11.715C11.43 33 11.145 32.985 10.875 32.97C9.09 32.865 7.575 32.325 6.24 31.425C5.685 31.05 5.19 30.585 4.8 30.06C3.78 28.695 3.33 26.955 3.33 24.285V11.715C3.33 6.555 5.91 3.36 10.875 3.045C11.145 3.015 11.43 3 11.715 3H24.285C26.7 3 28.665 3.555 30.135 4.575C30.69 4.95 31.185 5.415 31.575 5.94C32.595 7.305 33 9.045 33 11.715Z" fill="var(--fill-0, #737373)"/>
        <path d="M17.085 21.57H16.53V11.865H20.385C20.55 11.865 20.685 12 20.685 12.165V13.335C20.685 13.95 21.195 14.46 21.81 14.46C22.425 14.46 22.935 13.95 22.935 13.335V12.15C22.935 10.74 21.795 9.6 20.385 9.6H10.425C9.015 9.6 7.875 10.74 7.875 12.15V13.32C7.875 13.95 8.385 14.445 9 14.445C9.615 14.445 10.125 13.95 10.125 13.32V12.15C10.125 11.985 10.26 11.85 10.425 11.85H14.28V21.57H12.78C12.165 21.57 11.655 22.08 11.655 22.695C11.655 23.31 12.165 23.82 12.78 23.82H17.07C17.685 23.82 18.195 23.31 18.195 22.695C18.195 22.08 17.7 21.57 17.085 21.57Z" fill="var(--fill-0, #737373)"/>
        <path d="M25.98 15.6H20.58C19.965 15.6 19.455 16.11 19.455 16.725C19.455 17.34 19.965 17.85 20.58 17.85H21.3V24.15H20.82C20.205 24.15 19.695 24.66 19.695 25.275C19.695 25.89 20.205 26.4 20.82 26.4H24.075C24.69 26.4 25.2 25.89 25.2 25.275C25.2 24.66 24.69 24.15 24.075 24.15H23.565V17.85H25.875V18.36C25.875 18.975 26.385 19.485 27 19.485C27.615 19.485 28.125 18.975 28.125 18.36V17.775C28.125 16.575 27.165 15.6 25.98 15.6Z" fill="var(--fill-0, #737373)"/>
      </svg>
    ),
  };

  return (
    <div className="search-modal">
      <div className="search-modal__input-container">
        <svg
          className="search-modal__search-icon"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17.5 17.5L13.875 13.875"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          type="text"
          className="search-modal__input"
          placeholder="Поиск приложений, UI Элементов, Паттернов, Сценариев..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      {!searchQuery && (
        <div className="search-modal__filters">
          {VISIBLE_TAB_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`search-modal__filter ${activeFilter === type ? 'active' : ''}`}
              onClick={() => setActiveFilter(type)}
            >
              <span className="search-modal__filter-icon">
                <span className="search-modal__filter-icon-wrapper nav-svg-icon">
                  {filterIcons[type]}
                </span>
              </span>
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}

      <div className="search-modal__results">
        {loading ? (
          <div className="search-modal__empty">
            <p>Загрузка...</p>
          </div>
        ) : error ? (
          <div className="search-modal__empty">
            <p>{error}</p>
          </div>
        ) : items.length > 0 ? (
          <ul className="search-modal__list">
            {items?.map((item) => {
              const handleClick = () => {
                if (item.type === 'applications') {
                  navigate(`/detail/${item.id}`);
                } else if (item.type === 'ui_elements') {
                  navigate(`/ui-elements/${item.id}`);
                } else if (item.type === 'patterns') {
                  navigate(`/patterns/${item.id}`);
                } else if (item.type === 'scenarios') {
                  navigate(`/scenarios/${item.id}`);
                }
                onClose?.();
              };
              const categoryLabel = TYPE_LABELS[item.type] ?? item.category ?? '';
              return (
                <li key={`${item.type}-${item.id}`} className="search-modal__item" style={{ cursor: 'pointer' }} onClick={handleClick}>
                  <div className="search-modal__item-icon">
                    {item.icon ? (
                      <img src={toImageUrl(item.icon)} alt={item.name} width={48} height={48} style={{ borderRadius: 8 }} />
                    ) : (
                      <div className="search-modal__item-icon-placeholder">
                        <span className="search-modal__filter-icon-wrapper nav-svg-icon">
                          {filterIcons[item.type]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="search-modal__item-content">
                    <p className="search-modal__item-name">{item.name}</p>
                    <p className="search-modal__item-category">{categoryLabel}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="search-modal__empty">
            <p>Ничего не найдено</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;











