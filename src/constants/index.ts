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
  { path: '/', label: 'Приложение' },
  { path: '/patterns', label: 'Паттерны' },
  { path: '/scenarios', label: 'Сценарии' },
  { path: '/ui_elements', label: 'UI Элементы' },
];

export const PATTERN_CATEGORIES: PatternCategory[] = [
  { path: '', label: 'Все' },
  { path: '/account', label: 'Мой аккаунт и профиль' },
  { path: '/home', label: 'Главный экран' },
  { path: '/description', label: 'Описание' },
  { path: '/cart', label: 'Корзина' },
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

