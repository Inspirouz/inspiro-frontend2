// Content types
export interface ContentItem {
  /**
   * Primary screenshot for legacy/static content.
   * For API projects this is usually the first image in `images`.
   */
  img1?: string;
  /**
   * Secondary screenshot / logo for legacy content.
   * For API projects this is often the logo or same as `img1`.
   */
  img2?: string;
  /** App/project logo URL (e.g. for headers, cards) */
  logo?: string;
  /** Multiple screenshots for swiper or detail screens */
  images?: string[];
  app_name: string;
  text_info?: string;
  id: number | string;
  /** Screen id for modal/preview (e.g. from API screens list) */
  screenId?: number | string;
  /** From API project: description, platforms, categories, updated_at */
  description?: string;
  platforms?: string[];
  categories?: Array<{ name?: string }>;
  updated_at?: string;
}

// Navigation types
export interface NavItem {
  path: string;
  label: string;
  icon?: string;
}

export interface PatternCategory extends NavItem {}

// Form types
export interface FormData {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface FormErrors {
  full_name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  submit?: string;
}

// Component Props types
export interface ModalProps {
  active: boolean;
  setActive: (active: boolean) => void;
  children: React.ReactNode;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export interface CardProps {
  item: ContentItem;
  onClick?: (item: ContentItem) => void;
  variant?: 'default' | 'pattern';
}

export interface PasswordInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}

// Constants types
export type Category = string;

/** GET /categories API dan keladigan element */
export interface CategoryItem {
  id: string;
  name: string;
}
