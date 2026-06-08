# Inspiro — Project Guide for Claude

## Project Structure

| Project | Local path | GitHub | Live URL |
|---------|-----------|--------|----------|
| Frontend | `/Users/aleksandr/Desktop/inspiro-frontend2` | `Inspirouz/inspiro-frontend2` | `inspiro.uz` |
| Admin | `/root/inspiro/frontend/admin/prod` (server only) | `Inspirouz/insipro-admin` | `admin.inspiro.uz` |
| Backend prod | `/root/inspiro/backend/prod/inspiro-backend` (server) | `farzot/inspiro-backend` branch `master` | `api.inspiro.uz` (port 8000) |
| Backend dev | `/root/inspiro/backend/dev/inspiro-backend` (server) | `farzot/inspiro-backend` branch `dev` | `dev.api.inspiro.uz` (port 8001) |

**Server:** `164.92.231.138` — SSH: `ssh -i ~/.ssh/id_ed25519 root@164.92.231.138`

## Tech Stack

- **Frontend/Admin:** React + TypeScript + Vite, plain CSS (no Tailwind), React Router
- **Backend:** NestJS + TypeScript, PostgreSQL, Strapi CMS
- **Auth:** JWT + Google OAuth2 (access token flow via `initTokenClient`)
- **Google Client ID:** `890299226031-0mo9ki4btq3incjg0879og0akblq4tqs.apps.googleusercontent.com`

## Frontend Key Files

```
src/
  components/
    Header.tsx          — sticky header with centered search + nav tabs (CSS grid)
    NavLinks.tsx        — standalone nav (legacy, no longer used in Layout)
    Reg.tsx             — Google-only login modal
    ProfileDropdown.tsx — profile menu
    SearchModal.tsx     — desktop search overlay
    ImagePreviewModal.tsx
  pages/
    Layout.tsx          — wraps all pages: <Header /> + <Outlet /> (NavLinks removed)
    ScenariosPage.tsx   — scenarios with sidebar tree, breadcrumb titles
    HomePage.tsx
  styles/
    header-search.css   — header, nav tabs, search bar, mobile menu
    detail-page.css     — sidebar + main layout (.detail-page__)
    scenarios-page.css  — scenario cards and sections
  hooks/
    useNavCounts.ts     — counts for nav tab badges
  constants/            — NAV_ITEMS
```

## Header Architecture

The header uses **CSS grid** (`1fr auto 1fr`) so the center column is truly centered:

```
[Logo]  [header-center: search bar + nav tabs]  [Contact] [Profile]
```

- `.header-center` is the middle column — flex column, `align-items: stretch`
- `.header-input` fills the center column width (= nav tabs width)
- Nav tabs (`.header-nav`) are embedded directly in Header.tsx
- On mobile: switches to `display: flex`, tabs hidden, hamburger shown

## Deploy Flow

### Frontend (inspiro.uz)
```bash
cd /Users/aleksandr/Desktop/inspiro-frontend2
git add src/ && git commit -m "..." && git push origin main
npm run build
rsync -az -e "ssh -i ~/.ssh/id_ed25519" dist/ root@164.92.231.138:/root/inspiro/frontend/landing/prod/dist/
ssh -i ~/.ssh/id_ed25519 root@164.92.231.138 "pm2 restart inspiro-landing-prod"
```

### Admin (admin.inspiro.uz) — code lives on server
```bash
ssh -i ~/.ssh/id_ed25519 root@164.92.231.138
cd /root/inspiro/frontend/admin/prod
# make changes, then:
npm run build
git add src/ && git commit -m "..." && git push origin main
pm2 restart inspiro-admin-prod
```

### Backend prod
```bash
ssh -i ~/.ssh/id_ed25519 root@164.92.231.138 "
  cd /root/inspiro/backend/prod/inspiro-backend &&
  git pull origin master &&
  npm install --legacy-peer-deps &&
  rm -rf dist && npm run build &&
  pm2 restart inspiro-backend-prod --update-env
"
```

### Backend dev
```bash
ssh -i ~/.ssh/id_ed25519 root@164.92.231.138 "
  cd /root/inspiro/backend/dev/inspiro-backend &&
  git pull origin dev &&
  npm install --legacy-peer-deps &&
  rm -rf dist && npm run build &&
  pm2 restart inspiro-backend-dev --update-env
"
```

## Important Rules

- **Never commit `.env`** — contains Google client secret and API tokens
- **Frontend `.env`** has `VITE_API_URL=https://dev.api.inspiro.uz/api` — intentional, do NOT change
- **Admin `.env`** has `VITE_API_URL=https://api.inspiro.uz/api` (prod API)
- **`dist/` is never committed** — always rsync to server
- **Backend must use `npm run start:prod`** (not `nest start`) — avoids TS recompile errors
- **Admin code lives on the server** — there is no local copy at `/Users/aleksandr/Desktop/insipro-admin`

## GitHub Token

Token is embedded in git remote URLs on the server — run `git remote -v` in any repo to retrieve it.
Has access to `Inspirouz` org and `farzot` repos. Never commit the token to any file.

## PM2 Processes

| Name | Role | Port |
|------|------|------|
| `inspiro-landing-prod` | Frontend (inspiro.uz) | 4002 |
| `inspiro-admin-prod` | Admin (admin.inspiro.uz) | 4001 |
| `inspiro-backend-prod` | Backend prod API | 8000 |
| `inspiro-backend-dev` | Backend dev API | 8001 |
