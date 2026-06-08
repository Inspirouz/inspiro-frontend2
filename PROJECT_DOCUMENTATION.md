# Inspiro Frontend Project Documentation

## Project Overview

This is a React-based frontend application for Inspiro, a design inspiration platform. The project is built with modern technologies and follows best practices for performance, maintainability, and scalability.

## Technology Stack

- **Framework**: React 19.1.1 with TypeScript
- **Router**: React Router DOM v7
- **Build Tool**: Vite 7.1.2
- **Styling**: Tailwind CSS with custom CSS modules
- **State Management**: React Context API
- **Performance**: Code splitting, lazy loading, optimized builds

## Project Structure

### Root Directory
```
inspiro-frontend/
├── src/                    # Main source code
├── public/                 # Static assets (fonts, robots.txt, etc.)
├── src/assets/            # Project-specific images and assets
├── src/components/        # Reusable React components
├── src/pages/            # Page components and routing
├── src/styles/           # CSS modules and global styles
├── src/data/             # Static data and content
├── src/types/            # TypeScript type definitions
├── src/hooks/            # Custom React hooks
├── src/constants/        # Application constants
├── src/utils/            # Utility functions
├── src/contexts/         # React Context providers
└── src/assets/projects/  # Project-specific images
```

### Key Configuration Files

#### `package.json`
- **Purpose**: Project dependencies, scripts, and metadata
- **Key Scripts**:
  - `npm run dev`: Start development server on port 4002
  - `npm run build`: Build for production
  - `npm run preview`: Preview production build
  - `npm run lint`: Run ESLint

#### `vite.config.ts`
- **Purpose**: Vite build configuration with optimizations
- **Key Features**:
  - Path aliases (`@`, `@/components`, etc.)
  - Code splitting for vendor libraries
  - Performance optimizations
  - Development server on port 4002

#### `tailwind.config.js`
- **Purpose**: Tailwind CSS configuration
- **Customizations**:
  - Helvetica Neue font family
  - Custom color palette (primary: #D9F743)
  - Custom border radius values
  - Dark theme colors

#### `tsconfig.json`
- **Purpose**: TypeScript configuration
- **Features**: Strict type checking, modern ES features

## Source Code Organization

### 1. Components (`src/components/`)

**Core Components**:
- `Header.tsx` - Main navigation header
- `NavLinks.tsx` - Navigation menu
- `MainContent.tsx` - Content area wrapper
- `Card.tsx` - Project/pattern card component
- `Modal.tsx` - Modal dialog component
- `Toast.tsx` - Toast notification system

**Authentication Components**:
- `AuthContext.tsx` - Authentication state management
- `ProtectedRoute.tsx` - Route protection wrapper
- `Reg.tsx` - Registration form
- `CreatePassword.tsx` - Password creation
- `EmailConfirmation.tsx` - Email verification

**Utility Components**:
- `ErrorBoundary.tsx` - Error handling
- `PageLoader.tsx` - Loading states
- `OptimizedImage.tsx` - Image optimization
- `SearchModal.tsx` - Search functionality

### 2. Pages (`src/pages/`)

**Main Pages**:
- `HomePage.tsx` - Landing page with featured content
- `PatternsPage.tsx` - Design patterns gallery
- `ScenariosPage.tsx` - User scenarios
- `UiElementsPage.tsx` - UI components
- `DetailPage.tsx` - Individual item details
- `SubscriptionPage.tsx` - Premium features (protected)

**Layout**:
- `Layout.tsx` - Main layout wrapper with header and navigation

### 3. Data Management (`src/data/` and `src/hooks/`)

**Data Files**:
- `content.ts` - Static content definitions

**Custom Hooks**:
- `useCategories.ts` - Category data fetching
- `usePatternsByTag.ts` - Pattern filtering by tags
- `usePatternTags.ts` - Pattern tag management
- `useProjects.ts` - Project data handling
- `useScenariosCategories.ts` - Scenario categories
- `useScreensCategories.ts` - Screen categories
- `useSEO.ts` - SEO optimization
- `useToast.ts` - Toast notification management

### 4. Styling (`src/styles/`)

**CSS Modules**:
- `index.css` - Global styles and Tailwind imports
- `card.css` - Card component styles
- `header-search.css` - Header and search styles
- `modal.css` - Modal component styles
- `auth-prompt.css` - Authentication styles
- `profile.css` - User profile styles
- `toast.css` - Toast notification styles

**Global Styles**:
- Font imports and custom properties
- Responsive design utilities
- Animation classes

### 5. Types (`src/types/`)

**Type Definitions**:
- `ContentItem` - Main content structure
- `NavItem` - Navigation item structure
- `FormData` - Form data interfaces
- `ModalProps` - Component prop types
- `Category` - Category type definitions

## Development Workflow

### Starting Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   - Server runs on `http://localhost:4002`
   - Hot reload enabled

3. **Code Changes**:
   - Use TypeScript for type safety
   - Follow existing naming conventions
   - Use CSS modules for component styles
   - Implement responsive design

### Adding New Features

#### 1. New Page
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation in `src/components/NavLinks.tsx`
4. Add styles in `src/styles/`

#### 2. New Component
1. Create component in `src/components/`
2. Export from `src/components/index.ts`
3. Add TypeScript props interface
4. Create CSS module if needed
5. Write tests if applicable

#### 3. New Data Source
1. Create hook in `src/hooks/`
2. Define types in `src/types/`
3. Update data files in `src/data/`
4. Integrate with components

#### 4. New Style
1. Create CSS module in `src/styles/`
2. Import in component
3. Use Tailwind classes where possible
4. Follow existing naming conventions

### Performance Optimization

#### Code Splitting
- Pages are lazy-loaded using `React.lazy()`
- Vendor libraries are split into separate chunks
- Dynamic imports for heavy components

#### Image Optimization
- Use `OptimizedImage` component
- WebP format with fallbacks
- Lazy loading for below-the-fold images

#### Bundle Optimization
- Terser for minification
- Console/debugger removal in production
- Tree shaking enabled

### Environment Configuration

#### `.env` File
```env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=Inspiro
VITE_VERSION=1.0.0
```

#### Environment Variables Usage
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Deployment

### Build Process
```bash
npm run build
```
- Creates optimized production build in `dist/`
- Minified JavaScript and CSS
- Optimized images
- Source maps (optional)

### Preview Build
```bash
npm run preview
```
- Serves production build locally
- Tests production environment

### Deployment Targets
- **Vercel**: Automatic deployment from Git
- **Netlify**: Static site deployment
- **Custom**: Any static hosting service

## Best Practices

### Code Organization
- Use absolute imports with `@` alias
- Group related files in feature directories
- Maintain consistent naming conventions
- Use TypeScript for all new code

### Styling Guidelines
- Prefer Tailwind CSS classes
- Use CSS modules for component-specific styles
- Follow existing color palette
- Maintain responsive design

### Performance
- Implement lazy loading for images
- Use memoization for expensive calculations
- Avoid state updates in render cycles
- Optimize bundle size

### Accessibility
- Use semantic HTML elements
- Add proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

## Troubleshooting

### Common Issues

#### Development Server Won't Start
- Check port 4002 is available
- Verify Node.js version compatibility
- Clear npm cache if needed

#### Build Failures
- Check TypeScript compilation errors
- Verify all imports are correct
- Ensure required environment variables

#### Performance Issues
- Check for unnecessary re-renders
- Verify image optimization
- Review bundle size

### Debugging Tools
- React DevTools browser extension
- Vite dev server logs
- Browser developer tools
- ESLint for code quality

## Future Enhancements

### Potential Improvements
1. **State Management**: Consider Redux Toolkit for complex state
2. **Testing**: Add Jest and React Testing Library
3. **Internationalization**: i18n support
4. **PWA Features**: Service workers, offline support
5. **Analytics**: User behavior tracking
6. **Accessibility**: WCAG compliance improvements

### Architecture Evolution
- Component library extraction
- Micro-frontend architecture
- Server-side rendering (SSR)
- Static site generation (SSG)

## Contributing

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Maintain consistent TypeScript usage
- Write meaningful commit messages

### Pull Request Process
1. Create feature branch from `main`
2. Make changes with tests
3. Update documentation if needed
4. Submit PR with description
5. Address review feedback

## Support

For questions or support:
- Check existing issues in repository
- Review this documentation
- Contact development team
- Check browser console for errors

---

**Last Updated**: March 2026
**Version**: 1.0.0
**Maintainer**: Inspiro Development Team