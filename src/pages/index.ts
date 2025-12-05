// Layout is not lazy loaded as it's always needed
export { default as Layout } from './Layout';

// Pages are lazy loaded in App.tsx for code splitting
// These exports are kept for type safety
export type { default as HomePage } from './HomePage';
export type { default as PatternsPage } from './PatternsPage';
export type { default as UiElementsPage } from './UiElementsPage';
export type { default as SubscriptionPage } from './SubscriptionPage';

