// Content types
export interface ContentItem {
  img1: string;
  img2: string;
  images?: string[]; // Multiple screenshots for swiper
  app_name: string;
  text_info?: string;
  id: number;
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
  email: string;
  password: string;
  confirmPassword: string;
}

export interface FormErrors {
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

