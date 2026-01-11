import { useState } from 'react';
import '@/styles/search-modal.css';

// Import logo images
import korzinkaLogo from '@/assets/logos/karzinka.png';
import uzumLogo from '@/assets/logos/uzum.png';
import kapitalbankLogo from '@/assets/logos/kapitalbank.png';
import safiaLogo from '@/assets/logos/safia.png';

type FilterType = 'applications' | 'ui_elements' | 'scenarios' | 'patterns' | 'fonts';

interface SearchItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  type: FilterType;
}

const SearchModal = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('applications');

  // Mock data - replace with actual data from API
  const mockItems: SearchItem[] = [
    { id: '1', name: 'Korzinka.uz', category: 'Приложения', icon: korzinkaLogo, type: 'applications' },
    { id: '2', name: 'Uzum Bank', category: 'Приложения', icon: uzumLogo, type: 'applications' },
    { id: '3', name: 'Kapital Bank', category: 'Приложения', icon: kapitalbankLogo, type: 'applications' },
    { id: '4', name: 'Safia Bakery', category: 'Приложения', icon: safiaLogo, type: 'applications' },
  ];

  const filters = [
    { id: 'applications' as FilterType, label: 'Приложения', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.4" d="M16.24 2H7.76C5 2 4 3 4 5.81V18.19C4 21 5 22 7.76 22H16.23C19 22 20 21 20 18.19V5.81C20 3 19 2 16.24 2Z" fill="url(#paint0_linear_997_1671)"/>
      <path d="M14 6.25H10C9.59 6.25 9.25 5.91 9.25 5.5C9.25 5.09 9.59 4.75 10 4.75H14C14.41 4.75 14.75 5.09 14.75 5.5C14.75 5.91 14.41 6.25 14 6.25Z" fill="url(#paint1_linear_997_1671)"/>
      <path d="M12 19.3C12.9665 19.3 13.75 18.5165 13.75 17.55C13.75 16.5835 12.9665 15.8 12 15.8C11.0335 15.8 10.25 16.5835 10.25 17.55C10.25 18.5165 11.0335 19.3 12 19.3Z" fill="url(#paint2_linear_997_1671)"/>
      <defs>
      <linearGradient id="paint0_linear_997_1671" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
      <stop/>
      <stop offset="1" stop-color="#666666"/>
      </linearGradient>
      <linearGradient id="paint1_linear_997_1671" x1="12" y1="4.5" x2="12" y2="6.5" gradientUnits="userSpaceOnUse">
      <stop/>
      <stop offset="1" stop-color="#666666"/>
      </linearGradient>
      <linearGradient id="paint2_linear_997_1671" x1="12" y1="15.8" x2="12" y2="19.3" gradientUnits="userSpaceOnUse">
      <stop/>
      <stop offset="1" stop-color="#494949"/>
      </linearGradient>
      </defs>
      </svg>
       },
    { id: 'ui_elements' as FilterType, label: 'UI Элементы', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.4" d="M12 17V19.38C12 21.25 11.25 22 9.37 22H4.62C2.75 22 2 21.25 2 19.38V14.63C2 12.75 2.75 12 4.62 12H7V14.37C7 16.25 7.75 17 9.62 17H12Z" fill="url(#paint0_linear_997_1683)"/>
      <path opacity="0.6" d="M17 12V14.37C17 16.25 16.25 17 14.37 17H9.62C7.75 17 7 16.25 7 14.37V9.62C7 7.75 7.75 7 9.62 7H12V9.37C12 11.25 12.75 12 14.62 12H17Z" fill="url(#paint1_linear_997_1683)"/>
      <path d="M22 4.62V9.37C22 11.25 21.25 12 19.37 12H14.62C12.75 12 12 11.25 12 9.37V4.62C12 2.75 12.75 2 14.62 2H19.37C21.25 2 22 2.75 22 4.62Z" fill="url(#paint2_linear_997_1683)"/>
      <defs>
      <linearGradient id="paint0_linear_997_1683" x1="7" y1="12" x2="7" y2="22" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C7C7C"/>
      <stop offset="1" stop-color="#E2E2E2"/>
      </linearGradient>
      <linearGradient id="paint1_linear_997_1683" x1="12" y1="7" x2="12" y2="17" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C7C7C"/>
      <stop offset="1" stop-color="#E2E2E2"/>
      </linearGradient>
      <linearGradient id="paint2_linear_997_1683" x1="17" y1="2" x2="17" y2="12" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C7C7C"/>
      <stop offset="1" stop-color="#E2E2E2"/>
      </linearGradient>
      </defs>
      </svg>
       },
    { id: 'scenarios' as FilterType, label: 'Сценарии', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.4" d="M21.0409 7.19L12.0009 12.42L2.96094 7.19C3.36094 6.45 3.94094 5.8 4.59094 5.44L9.93094 2.48C11.0709 1.84 12.9309 1.84 14.0709 2.48L19.4109 5.44C20.0609 5.8 20.6409 6.45 21.0409 7.19Z" fill="#7C7C7C"/>
      <path opacity="0.6" d="M12.0006 12.4199V21.9999C11.2506 21.9999 10.5006 21.8399 9.93062 21.5199L4.59063 18.5599C3.38063 17.8899 2.39062 16.2099 2.39062 14.8299V9.16994C2.39062 8.52994 2.61062 7.82994 2.96062 7.18994L12.0006 12.4199Z" fill="url(#paint0_linear_997_1699)"/>
      <path d="M21.61 9.16994V14.8299C21.61 16.2099 20.62 17.8899 19.41 18.5599L14.07 21.5199C13.5 21.8399 12.75 21.9999 12 21.9999V12.4199L21.04 7.18994C21.39 7.82994 21.61 8.52994 21.61 9.16994Z" fill="url(#paint1_linear_997_1699)"/>
      <defs>
      <linearGradient id="paint0_linear_997_1699" x1="7.19562" y1="7.18994" x2="7.19562" y2="21.9999" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C7C7C"/>
      <stop offset="1" stop-color="#E2E2E2"/>
      </linearGradient>
      <linearGradient id="paint1_linear_997_1699" x1="16.805" y1="7.18994" x2="16.805" y2="21.9999" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C7C7C"/>
      <stop offset="1" stop-color="#E2E2E2"/>
      </linearGradient>
      </defs>
      </svg>
      },
    { id: 'patterns' as FilterType, label: 'Паттерны', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.4" d="M20.3591 12.7301C19.9891 12.7301 19.6791 12.4501 19.6391 12.0801C19.3991 9.88007 18.2191 7.90007 16.3991 6.64007C16.0691 6.41007 15.9891 5.96007 16.2191 5.63007C16.4491 5.30007 16.8991 5.22007 17.2291 5.45007C19.3991 6.96007 20.7991 9.32007 21.0891 11.9301C21.1291 12.3301 20.8391 12.6901 20.4391 12.7301C20.4091 12.7301 20.3891 12.7301 20.3591 12.7301Z" fill="#7C7C7C"/>
      <path opacity="0.4" d="M3.73931 12.78C3.71931 12.78 3.68931 12.78 3.66931 12.78C3.26931 12.74 2.97931 12.38 3.01931 11.98C3.28931 9.36996 4.66931 7.00996 6.81931 5.48996C7.13931 5.25996 7.59931 5.33996 7.82931 5.65996C8.05931 5.98996 7.97931 6.43996 7.65931 6.66996C5.85931 7.94996 4.68931 9.92996 4.46931 12.12C4.42931 12.5 4.10931 12.78 3.73931 12.78Z" fill="#7C7C7C"/>
      <path opacity="0.4" d="M15.9906 21.1001C14.7606 21.6901 13.4406 21.9901 12.0606 21.9901C10.6206 21.9901 9.25059 21.6701 7.97059 21.0201C7.61059 20.8501 7.47059 20.4101 7.65059 20.0501C7.82059 19.6901 8.26059 19.5501 8.62059 19.7201C9.25059 20.0401 9.92059 20.2601 10.6006 20.3901C11.5206 20.5701 12.4606 20.5801 13.3806 20.4201C14.0606 20.3001 14.7306 20.0901 15.3506 19.7901C15.7206 19.6201 16.1606 19.7601 16.3206 20.1301C16.5006 20.4901 16.3606 20.9301 15.9906 21.1001Z" fill="#7C7C7C"/>
      <path d="M12.0505 2.01001C10.5005 2.01001 9.23047 3.27001 9.23047 4.83001C9.23047 6.39001 10.4905 7.65001 12.0505 7.65001C13.6105 7.65001 14.8705 6.39001 14.8705 4.83001C14.8705 3.27001 13.6105 2.01001 12.0505 2.01001Z" fill="url(#paint0_linear_997_1991)"/>
      <path d="M5.05047 13.8701C3.50047 13.8701 2.23047 15.1301 2.23047 16.6901C2.23047 18.2501 3.49047 19.5101 5.05047 19.5101C6.61047 19.5101 7.87047 18.2501 7.87047 16.6901C7.87047 15.1301 6.60047 13.8701 5.05047 13.8701Z" fill="url(#paint1_linear_997_1991)"/>
      <path d="M18.9509 13.8701C17.4009 13.8701 16.1309 15.1301 16.1309 16.6901C16.1309 18.2501 17.3909 19.5101 18.9509 19.5101C20.5109 19.5101 21.7709 18.2501 21.7709 16.6901C21.7709 15.1301 20.5109 13.8701 18.9509 13.8701Z" fill="url(#paint2_linear_997_1991)"/>
      <defs>
      <linearGradient id="paint0_linear_997_1991" x1="12.0505" y1="2.01001" x2="12.0505" y2="7.65001" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C7C7C"/>
      <stop offset="1" stop-color="#E2E2E2"/>
      </linearGradient>
      <linearGradient id="paint1_linear_997_1991" x1="5.05047" y1="13.8701" x2="5.05047" y2="19.5101" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C7C7C"/>
      <stop offset="1" stop-color="#E2E2E2"/>
      </linearGradient>
      <linearGradient id="paint2_linear_997_1991" x1="18.9509" y1="13.8701" x2="18.9509" y2="19.5101" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C7C7C"/>
      <stop offset="1" stop-color="#E2E2E2"/>
      </linearGradient>
      </defs>
      </svg>
      },
    { id: 'fonts' as FilterType, label: 'Шрифты', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.4" d="M22 7.81V16.19C22 19.83 19.83 22 16.19 22H7.81C7.61 22 7.41 21.99 7.22 21.98C5.99 21.9 4.95 21.55 4.13 20.95C3.71 20.66 3.34 20.29 3.05 19.87C2.36 18.92 2 17.68 2 16.19V7.81C2 4.37 3.94 2.24 7.22 2.03C7.41 2.01 7.61 2 7.81 2H16.19C17.68 2 18.92 2.36 19.87 3.05C20.29 3.34 20.66 3.71 20.95 4.13C21.64 5.08 22 6.32 22 7.81Z" fill="url(#paint0_linear_997_4002)"/>
      <path d="M11.39 14.3799H11.02V7.9099H13.59C13.7 7.9099 13.79 7.9999 13.79 8.1099V8.8899C13.79 9.2999 14.13 9.6399 14.54 9.6399C14.95 9.6399 15.29 9.2999 15.29 8.8899V8.0999C15.29 7.1599 14.53 6.3999 13.59 6.3999H6.95C6.01 6.3999 5.25 7.1599 5.25 8.0999V8.8799C5.25 9.2999 5.59 9.6299 6 9.6299C6.41 9.6299 6.75 9.2999 6.75 8.8799V8.0999C6.75 7.9899 6.84 7.8999 6.95 7.8999H9.52V14.3799H8.52C8.11 14.3799 7.77 14.7199 7.77 15.1299C7.77 15.5399 8.11 15.8799 8.52 15.8799H11.38C11.79 15.8799 12.13 15.5399 12.13 15.1299C12.13 14.7199 11.8 14.3799 11.39 14.3799Z" fill="url(#paint1_linear_997_4002)"/>
      <path d="M17.3207 10.3999H13.7207C13.3107 10.3999 12.9707 10.7399 12.9707 11.1499C12.9707 11.5599 13.3107 11.8999 13.7207 11.8999H14.2007V16.0999H13.8507C13.4407 16.0999 13.1007 16.4399 13.1007 16.8499C13.1007 17.2599 13.4407 17.5999 13.8507 17.5999H16.0507C16.4607 17.5999 16.8007 17.2599 16.8007 16.8499C16.8007 16.4399 16.4607 16.0999 16.0507 16.0999H15.7007V11.8999H17.2507V12.2399C17.2507 12.6499 17.5907 12.9899 18.0007 12.9899C18.4107 12.9899 18.7507 12.6499 18.7507 12.2399V11.8299C18.7507 11.0399 18.1107 10.3999 17.3207 10.3999Z" fill="url(#paint2_linear_997_4002)"/>
      <defs>
      <linearGradient id="paint0_linear_997_4002" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C7C7C"/>
      <stop offset="1" stop-color="#E2E2E2"/>
      </linearGradient>
      <linearGradient id="paint1_linear_997_4002" x1="10.27" y1="6.3999" x2="10.27" y2="15.8799" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C7C7C"/>
      <stop offset="1" stop-color="#E2E2E2"/>
      </linearGradient>
      <linearGradient id="paint2_linear_997_4002" x1="15.8607" y1="10.3999" x2="15.8607" y2="17.5999" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C7C7C"/>
      <stop offset="1" stop-color="#E2E2E2"/>
      </linearGradient>
      </defs>
      </svg>
       },
  ];

  const filteredItems = mockItems.filter((item) => {
    const matchesFilter = activeFilter === 'applications' || item.type === activeFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

      <div className="search-modal__filters">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`search-modal__filter ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            <span className="search-modal__filter-icon">{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>

      <div className="search-modal__results">
        {filteredItems.length > 0 ? (
          <ul className="search-modal__list">
            {filteredItems.map((item) => (
              <li key={item.id} className="search-modal__item">
                <div className="search-modal__item-icon">
                  <img src={item.icon} alt={item.name} width={48} height={48} />
                </div>
                <div className="search-modal__item-content">
                  <p className="search-modal__item-name">{item.name}</p>
                  <p className="search-modal__item-category">{item.category}</p>
                </div>
              </li>
            ))}
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











