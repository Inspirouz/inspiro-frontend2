import type { NavItem, PatternCategory, Category } from '@/types';

export const CATEGORIES: Category[] = [
  'Все',
  'Банк',
  'Медицина',
  'Мобильный оператор',
  'Такси',
  'Доставка',
  'Обучение',
  'Государство',
  'Путешествие',
  'AI',
  'Карты',
  
];

export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Приложение', icon: 'app' },
  { path: '/patterns', label: 'Паттерны', icon: 'patterns' },
  { path: '/scenarios', label: 'Сценарии', icon: 'scenarios' },
  { path: '/ui_elements', label: 'UI Элементы', icon: 'ui' },
  // { path: '/fonts', label: 'Шрифты', icon: 'fonts' },
];

export const PATTERN_CATEGORIES: PatternCategory[] = [
  { path: '', label: 'Все' },
  { path: '/account', label: 'Мой аккаунт и профиль' },
  { path: '/home', label: 'Главный экран' },
  { path: '/description', label: 'Описание' },
  { path: '/cart', label: 'Корзина' },
];

export const SCENARIO_CATEGORIES: PatternCategory[] = [
  { path: '', label: 'Все' },
  { path: '/search', label: 'Поиск' },
  { path: '/login', label: 'Вход в аккаунт' },
  { path: '/cancel', label: 'Отмена подписки' },
  { path: '/order', label: 'Оформление заказа' },
];

export const COLORS = {
  primary: '#D9F743',
  background: '#111111',
  backgroundSecondary: '#161616',
  backgroundTertiary: '#242424',
  textPrimary: '#FFFFFF',
  textSecondary: '#7C7C7C',
  textTertiary: '#888888',
  hover: '#2B310D',
} as const;

