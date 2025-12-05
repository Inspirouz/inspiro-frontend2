import { useState } from 'react';
import '@/styles/search-modal.css';

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
    { id: '1', name: 'Korzinka.uz', category: 'Приложения', icon: '🛒', type: 'applications' },
    { id: '2', name: 'Uzum Bank', category: 'Приложения', icon: '🏦', type: 'applications' },
    { id: '3', name: 'Kapital Bank', category: 'Приложения', icon: '💰', type: 'applications' },
    { id: '4', name: 'Safia Bakery', category: 'Приложения', icon: '🍰', type: 'applications' },
    { id: '5', name: 'Safe Road YHXX', category: 'Приложения', icon: '🛣️', type: 'applications' },
    { id: '6', name: 'Bir Bir', category: 'Приложения', icon: '📱', type: 'applications' },
    { id: '7', name: 'Uzum Market', category: 'Кнопка', icon: '🛍️', type: 'ui_elements' },
    { id: '8', name: 'Click', category: 'UI Элементы', icon: '👆', type: 'ui_elements' },
  ];

  const filters = [
    { id: 'applications' as FilterType, label: 'Приложения', icon: '📱' },
    { id: 'ui_elements' as FilterType, label: 'UI Элементы', icon: '📄' },
    { id: 'scenarios' as FilterType, label: 'Сценарии', icon: '🎲' },
    { id: 'patterns' as FilterType, label: 'Паттерны', icon: '🔗' },
    { id: 'fonts' as FilterType, label: 'Шрифты', icon: 'Tt' },
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
                <div className="search-modal__item-icon">{item.icon}</div>
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




