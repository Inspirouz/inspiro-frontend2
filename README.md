# Inspiro Frontend

Modern React application for showcasing UI/UX patterns, scenarios, and design elements.

## 🚀 Tech Stack

- **React 19.1.1** - UI library
- **TypeScript** - Type safety
- **React Router DOM 7.9.4** - Routing
- **Vite 7.1.2** - Build tool
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **PostCSS** - CSS processing

## 📁 Project Structure

```
src/
├── pages/              # Page components (routes)
│   ├── Layout.tsx      # Main layout wrapper
│   ├── HomePage.tsx    # Home page
│   ├── PatternsPage.tsx # Patterns page
│   ├── UiElementsPage.tsx # UI Elements page
│   └── index.ts        # Barrel exports
├── components/          # Reusable UI components
│   ├── Header.tsx      # Header component
│   ├── NavLinks.tsx    # Navigation links
│   ├── MainContent.tsx # Content cards
│   ├── Modal.tsx       # Reusable modal
│   ├── Reg.tsx         # Registration/Login form
│   ├── Card.tsx         # Card component
│   ├── PasswordInput.tsx # Password input
│   ├── ErrorBoundary.tsx # Error boundary
│   └── index.ts        # Barrel exports
├── styles/             # CSS files
│   ├── index.css       # Main CSS (Tailwind + imports)
│   ├── header-search.css
│   ├── modal.css
│   └── reg.css
├── assets/             # Static assets
├── data/               # Data files
│   └── content.ts
├── constants/          # Constants and config
│   └── index.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## 🎯 Features

- ✅ Modern React architecture with functional components
- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Utility-first styling
- ✅ React Router for navigation
- ✅ Reusable Modal component
- ✅ Responsive design with dark theme
- ✅ Horizontal scroll for category filters
- ✅ Password visibility toggle
- ✅ Clean code structure following best practices

## 🛠️ Development

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## 📝 Code Quality

- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Utility-first CSS framework
- ✅ **Path Aliases** - Clean imports with `@/` prefix
- ✅ PascalCase for component files
- ✅ Consistent folder structure
- ✅ Separated concerns (pages, components, styles, data, constants, types)
- ✅ Reusable components
- ✅ Clean CSS with organized structure
- ✅ No linter errors
- ✅ Strict TypeScript configuration

## 🔗 Path Aliases

Loyiha path aliases bilan sozlangan. Barcha importlar `@/` prefix bilan:

```tsx
// ✅ Yaxshi - Alias ishlatish
import Header from '@/components/Header';
import { CATEGORIES } from '@/constants';
import type { ContentItem } from '@/types';
import '@/styles/header-search.css';

// ❌ Yomon - Relative path
import Header from '../components/Header';
import { CATEGORIES } from '../constants';
```

**Mavjud aliases:**
- `@/` - `src/`
- `@/components` - `src/components/`
- `@/pages` - `src/pages/`
- `@/styles` - `src/styles/`
- `@/assets` - `src/assets/`
- `@/constants` - `src/constants/`
- `@/data` - `src/data/`
- `@/types` - `src/types/`

## 🎨 Tailwind CSS

Loyiha Tailwind CSS bilan sozlangan. Custom colors va utility classlar mavjud.

**Custom Colors:**
- `primary` - #D9F743
- `background`, `background-secondary`, `background-tertiary`
- `text-primary`, `text-secondary`, `text-tertiary`
- `hover` - #2B310D

**Misol:**
```tsx
<button className="bg-primary text-black rounded-xl px-4 py-3 hover:bg-hover">
  Button
</button>
```

Batafsil ma'lumot: [TAILWIND_GUIDE.md](./TAILWIND_GUIDE.md)

## 🎨 Design

- Dark theme (#111111 background)
- Primary color: #D9F743 (yellow-green)
- Custom scrollbar styling
- Smooth transitions and hover effects
- Modern UI with rounded corners

## 📄 License

Private project
