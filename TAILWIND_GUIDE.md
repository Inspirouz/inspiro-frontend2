# 🎨 Tailwind CSS Qo'llanmasi

Tailwind CSS muvaffaqiyatli qo'shildi! Endi siz utility-first CSS framework ishlatishingiz mumkin.

## ✅ Qo'shilgan Paketlar

- `tailwindcss` - Tailwind CSS framework
- `postcss` - CSS processor
- `autoprefixer` - Vendor prefixlar

## 📁 Konfiguratsiya

### `tailwind.config.js`
- Content paths sozlangan
- Custom colors qo'shilgan (primary, background, text, hover)
- Custom border radius qo'shilgan

### `postcss.config.js`
- Tailwind va Autoprefixer pluginlari

### `src/styles/index.css`
- Tailwind direktivalari (@tailwind base, components, utilities)
- Custom scrollbar styles
- Base styles

## 🎯 Custom Colors

Sizning loyihangiz uchun custom colors sozlangan:

```tsx
// Primary color
className="text-primary"        // #D9F743
className="bg-primary"          // #D9F743

// Background colors
className="bg-background"              // #111111
className="bg-background-secondary"    // #161616
className="bg-background-tertiary"     // #242424

// Text colors
className="text-text-primary"         // #FFFFFF
className="text-text-secondary"       // #7C7C7C
className="text-text-tertiary"        // #888888

// Hover color
className="hover:bg-hover"             // #2B310D
```

## 📝 Misollar

### NavLinks komponenti (Tailwind bilan)

```tsx
<nav className="w-full min-h-fit pt-8">
  <ul className="list-none flex gap-10">
    <NavLink className="text-3xl font-bold text-text-secondary hover:text-primary">
      Link
    </NavLink>
  </ul>
</nav>
```

### Button

```tsx
<button className="bg-primary text-black rounded-xl px-4 py-3 font-semibold hover:bg-hover hover:text-primary transition-colors">
  Button
</button>
```

### Card

```tsx
<div className="bg-background-secondary rounded-xl p-8 hover:bg-background-tertiary transition-colors">
  <h3 className="text-text-primary text-xl font-semibold">Title</h3>
  <p className="text-text-secondary">Description</p>
</div>
```

## 🔄 CSS fayllarni o'zgartirish

Siz ikkala usulni ham ishlatishingiz mumkin:

1. **Eski CSS fayllar** - Hozirgi CSS fayllar ishlashda davom etadi
2. **Tailwind utility classes** - Yangi komponentlar uchun Tailwind ishlatish

### Bosqichma-bosqich o'zgartirish:

1. Komponentni oching
2. CSS classlarni Tailwind utility classlariga o'zgartiring
3. Eski CSS importini olib tashlang (agar kerak bo'lsa)

### Misol: Header komponenti

**Eski (CSS):**
```tsx
<header className="header-search">
  <button className="header-input">Поиск...</button>
</header>
```

**Yangi (Tailwind):**
```tsx
<header className="w-full flex justify-between items-center min-h-fit">
  <button className="bg-background-tertiary border-none flex items-center rounded-full w-[680px] h-16 pl-[60px] text-lg text-text-secondary cursor-pointer hover:bg-[#2a2a2a]">
    Поиск...
  </button>
</header>
```

## 🎨 Utility Classlar

### Spacing
- `p-4` - padding
- `m-4` - margin
- `gap-4` - gap
- `space-x-4` - horizontal spacing

### Colors
- `bg-primary` - background
- `text-primary` - text color
- `border-primary` - border color

### Typography
- `text-3xl` - font size
- `font-bold` - font weight
- `text-center` - text align

### Layout
- `flex` - display flex
- `grid` - display grid
- `w-full` - width 100%
- `h-screen` - height 100vh

### Effects
- `hover:bg-primary` - hover effect
- `transition-colors` - transition
- `rounded-xl` - border radius

## 📚 Qo'shimcha Ma'lumot

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)

## 💡 Maslahatlar

1. **Incremental Migration** - Bosqichma-bosqich o'zgartiring
2. **Custom Classes** - Ko'p ishlatiladigan patternlar uchun `@layer components` ishlating
3. **Responsive** - `md:`, `lg:`, `xl:` prefixlar bilan responsive dizayn
4. **Dark Mode** - `dark:` prefix bilan dark mode qo'llash

## 🚀 Keyingi Qadamlar

1. Komponentlarni bosqichma-bosqich Tailwind ga o'zgartiring
2. Custom utility classlar yarating (agar kerak bo'lsa)
3. Eski CSS fayllarni olib tashlang (oxirida)






