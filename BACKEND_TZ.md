# Inspiro Backend — Texnik Spetsifikatsiya (TZ)

> **Maqsad:** Bu TZ Cursor AI ga tashlanganida, Inspiro frontend loyihasi uchun kerakli barcha API endpointlarni to'liq implementatsiya qilishi kerak. Har bir API aniq request/response formatlari, status kodlar va misollar bilan tavsiflangan.

---

## 1. Loyiha haqida umumiy ma'lumot

**Inspiro** — UI/UX dizayn patternlar, ssenariylar va elementlar to'plamini ko'rsatadigan platforma. Frontend React + TypeScript bilan yozilgan va hozirda mock data ishlatadi. Backend quyidagi funksionallikni ta'minlashi kerak:

- **Autentifikatsiya** — ro'yxatdan o'tish, login, email tasdiqlash, parol yaratish
- **Kontent boshqaruvi** — ilovalar, ekranlar, ssenariylar, patternlar
- **Qidiruv** — ilovalar, UI elementlar, ssenariylar, patternlar bo'yicha qidiruv
- **Obuna (Subscription)** — planlar, narxlar, to'lov
- **Foydalanuvchi** — profil, favoritlar (Pro plan uchun)

---

## 2. Texnik talablar

- **Base URL:** `https://api.inspiro.com` yoki `http://localhost:3001/api`
- **Format:** JSON
- **Autentifikatsiya:** Bearer token (JWT) — `Authorization: Bearer <token>`
- **CORS:** Frontend domeniga ruxsat berilishi kerak

---

## 3. API Endpointlar — To'liq ro'yxat

### 3.1. Autentifikatsiya (Auth)

#### 3.1.1. Ro'yxatdan o'tish — boshlash
```
POST /api/auth/register
Content-Type: application/json
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Tasdiqlash kodi emailga yuborildi",
  "data": {
    "email": "user@example.com",
    "requiresEmailConfirmation": true
  }
}
```

**Errors:**
- 400: `{ "success": false, "error": "Email va parol kiritilishi shart" }`
- 400: `{ "success": false, "error": "Parol kamida 6 belgidan iborat bo'lishi kerak" }`
- 409: `{ "success": false, "error": "Bu email allaqachon ro'yxatdan o'tgan" }`

---

#### 3.1.2. Email tasdiqlash
```
POST /api/auth/confirm-email
Content-Type: application/json
```

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Email tasdiqlandi"
}
```

**Errors:**
- 400: `{ "success": false, "error": "Неверный код" }`
- 400: `{ "success": false, "error": "Код должен состоять из 6 цифр" }`

---

#### 3.1.3. Parol yaratish (registratsiya davomida)
```
POST /api/auth/create-password
Content-Type: application/json
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "newpassword123"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Parol muvaffaqiyatli yaratildi"
}
```

**Errors:**
- 400: `{ "success": false, "error": "Parol kamida 6 belgidan iborat bo'lishi kerak" }`

---

#### 3.1.4. Login
```
POST /api/auth/login
Content-Type: application/json
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "user"
    }
  }
}
```

**Errors:**
- 400: `{ "success": false, "error": "Email va parol kiritilishi shart" }`
- 401: `{ "success": false, "error": "Email yoki parol noto'g'ri" }`

---

#### 3.1.5. Kodni qayta yuborish
```
POST /api/auth/resend-code
Content-Type: application/json
```

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Код был успешно отправлен"
}
```

**Errors:**
- 400: `{ "success": false, "error": "Email kiritilishi shart" }`

---

#### 3.1.6. Google OAuth (ixtiyoriy — kelajakda)
```
POST /api/auth/google
Content-Type: application/json
```

**Request:**
```json
{
  "idToken": "google_id_token_here"
}
```

**Response 200:** Login bilan bir xil format

---

### 3.2. Foydalanuvchi (User)

#### 3.2.1. Joriy foydalanuvchi ma'lumotlari
```
GET /api/user/me
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "user",
    "subscriptionPlan": "basic",
    "subscriptionExpiresAt": null
  }
}
```

**Errors:**
- 401: `{ "success": false, "error": "Unauthorized" }`

---

### 3.3. Kontent (Content) — Ilovalar va ekranlar

#### 3.3.1. Barcha ilovalar ro'yxati (Home page)
```
GET /api/applications
Query params: ?category=Банк&page=1&limit=20
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "app_name": "Unitrip",
        "text_info": "Путешествие",
        "img1": "https://cdn.inspiro.com/apps/1/screenshot1.png",
        "img2": "https://cdn.inspiro.com/apps/1/logo.png",
        "images": ["https://cdn.inspiro.com/apps/1/s1.png", "https://cdn.inspiro.com/apps/1/s2.png"],
        "category": "Путешествие",
        "platforms": ["iOS", "Android"],
        "updatedAt": "2025-10-14T00:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

**ContentItem modeli (frontend types bilan mos):**
- `id` (number)
- `app_name` (string)
- `text_info` (string, optional)
- `img1` (string) — asosiy screenshot URL
- `img2` (string) — logo URL
- `images` (string[], optional) — qo'shimcha screenshotlar
- `category` (string)
- `platforms` (string[], optional)

---

#### 3.3.2. Bitta ilova batafsil (Detail page)
```
GET /api/applications/:id
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "app_name": "Unitrip",
    "text_info": "Путешествие",
    "description": "Description of the company",
    "img1": "https://cdn.inspiro.com/apps/1/screenshot1.png",
    "img2": "https://cdn.inspiro.com/apps/1/logo.png",
    "images": ["url1", "url2"],
    "category": "Финтех",
    "platforms": ["iOS", "Android"],
    "updatedAt": "2025-10-14T00:00:00Z",
    "screensCount": 212,
    "scenariosCount": 30,
    "videosCount": 0,
    "subCategories": [
      { "id": "all", "label": "Все", "count": 12 },
      { "id": "onboarding", "label": "Онбординг", "count": 2 },
      { "id": "registration", "label": "Регистрация", "count": 3 },
      { "id": "main", "label": "Главный экран", "count": 5 },
      { "id": "cart", "label": "Корзина", "count": 2 }
    ],
    "treeStructure": [
      {
        "id": "item-1",
        "label": "Онбординг",
        "sectionId": "section-1",
        "count": 12,
        "children": [
          {
            "id": "item-2",
            "label": "Онбординг",
            "sectionId": "section-2",
            "count": 12,
            "children": []
          }
        ]
      }
    ],
    "screens": [
      {
        "id": 101,
        "title": "Welcome to Your Travel Companion",
        "image": "https://cdn.inspiro.com/screens/101.png",
        "subCategoryId": "onboarding",
        "scenarioSectionId": "section-1"
      }
    ]
  }
}
```

**TreeNode modeli:**
- `id` (string)
- `label` (string)
- `sectionId` (string)
- `count` (number)
- `children` (TreeNode[], optional)

---

#### 3.3.3. Kategoriyalar ro'yxati
```
GET /api/categories
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    "Все", "Банк", "Медицина", "Мобильный оператор", "Такси", "Доставка", "Обучение", "Государство", "Путешествие", "AI", "Карты"
  ]
}
```

---

#### 3.3.4. Pattern kategoriyalari
```
GET /api/pattern-categories
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "path": "", "label": "Все" },
    { "path": "/account", "label": "Мой аккаунт и профиль" },
    { "path": "/home", "label": "Главный экран" },
    { "path": "/description", "label": "Описание" },
    { "path": "/cart", "label": "Корзина" }
  ]
}
```

---

#### 3.3.5. Scenario kategoriyalari
```
GET /api/scenario-categories
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "path": "", "label": "Все" },
    { "path": "/search", "label": "Поиск" },
    { "path": "/login", "label": "Вход в аккаунт" },
    { "path": "/cancel", "label": "Отмена подписки" },
    { "path": "/order", "label": "Оформление заказа" }
  ]
}
```

---

### 3.4. Qidiruv (Search)

#### 3.4.1. Universal qidiruv
```
GET /api/search
Query params: ?q=korzinka&type=applications&limit=20
```

**type:** `applications` | `ui_elements` | `scenarios` | `patterns` | `fonts`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "1",
        "name": "Korzinka.uz",
        "category": "Приложения",
        "icon": "https://cdn.inspiro.com/logos/korzinka.png",
        "type": "applications"
      }
    ],
    "ui_elements": [],
    "scenarios": [],
    "patterns": []
  }
}
```

**Yoki bitta type bo'lsa:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Korzinka.uz",
      "category": "Приложения",
      "icon": "https://cdn.inspiro.com/logos/korzinka.png",
      "type": "applications"
    }
  ]
}
```

---

### 3.5. Obuna (Subscription)

#### 3.5.1. Obuna rejalari va narxlar
```
GET /api/subscription/plans
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "basic",
        "title": "Basic",
        "description": "Для тех, кто просто хочет вдохновения",
        "features": [
          { "text": "Доступ ко всем приложениям и паттернам" },
          { "text": "Базовый поиск по приложениям и паттернам" },
          { "text": "Просмотр экранов и UI-элементов" }
        ],
        "isPopular": false
      },
      {
        "id": "pro",
        "title": "Pro",
        "description": "Для тех, кто просто хочет вдохновения",
        "features": [
          { "text": "Умный поиск по тегам...", "icon": "search" },
          { "text": "Быстрое скачивание...", "icon": "download" },
          { "text": "Доступ к видео...", "icon": "video" },
          { "text": "Вкладка Избранное...", "icon": "favorite" },
          { "text": "Ранний доступ...", "icon": "early" }
        ],
        "isPopular": true
      },
      {
        "id": "team",
        "title": "Team",
        "description": "Для студий и продуктовых команд",
        "features": [
          { "text": "Включает всё из Pro" },
          { "text": "Общие коллекции и рабочие библиотеки" },
          { "text": "Единый платеж" }
        ]
      }
    ],
    "pricing": {
      "basic": {
        "month": { "price": 0, "oneTime": 0 },
        "3months": { "price": 0, "oneTime": 0 },
        "year": { "price": 0, "oneTime": 0 }
      },
      "pro": {
        "month": { "price": 20000, "oneTime": 20000 },
        "3months": { "price": 17000, "oneTime": 51000, "discount": 15 },
        "year": { "price": 16000, "oneTime": 192000, "discount": 20 }
      },
      "team": {
        "month": { "price": 80000, "oneTime": 80000 },
        "3months": { "price": 68000, "oneTime": 204000, "discount": 15 },
        "year": { "price": 64000, "oneTime": 768000, "discount": 20 }
      }
    }
  }
}
```

---

#### 3.5.2. Obuna rasmiylashtirish
```
POST /api/subscription/subscribe
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "planId": "pro",
  "period": "month"
}
```

**period:** `month` | `3months` | `year`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://pay.inspiro.com/checkout/xxx",
    "orderId": "order_123"
  }
}
```

**Errors:**
- 401: Unauthorized
- 400: `{ "success": false, "error": "Invalid plan or period" }`

---

#### 3.5.3. Foydalanuvchi obunasi
```
GET /api/subscription/current
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "planId": "basic",
    "expiresAt": null,
    "status": "active"
  }
}
```

---

### 3.6. Favoritlar (Pro plan — kelajakda)

#### 3.6.1. Favoritlar ro'yxati
```
GET /api/favorites
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "fav_1",
      "applicationId": 1,
      "screenId": 101,
      "createdAt": "2025-02-13T10:00:00Z"
    }
  ]
}
```

---

#### 3.6.2. Favoritga qo'shish
```
POST /api/favorites
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "applicationId": 1,
  "screenId": 101
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { "id": "fav_1" }
}
```

---

#### 3.6.3. Favoritdan o'chirish
```
DELETE /api/favorites/:id
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Removed from favorites"
}
```

---

### 3.7. Rasm yuklash (Download) — Pro plan

```
GET /api/screens/:id/download
Authorization: Bearer <token>
```

**Response:** Redirect yoki file stream (image/png)

---

## 4. Database modellari (suggested)

### User
- id, email, passwordHash, name, emailVerified, createdAt, updatedAt

### Application
- id, app_name, text_info, description, img1, img2, category, platforms, updatedAt

### Screen
- id, applicationId, title, image, subCategoryId, scenarioSectionId, order

### Category
- id, name, type (app|pattern|scenario)

### SubscriptionPlan
- id, name, features (JSON), isPopular

### SubscriptionPricing
- planId, period, price, oneTime, discount

### UserSubscription
- userId, planId, period, expiresAt, status

### Favorite (Pro)
- id, userId, applicationId, screenId, createdAt

---

## 5. Cursor AI uchun qo'shimcha ko'rsatmalar

1. **Barcha API larni implementatsiya qiling** — yuqoridagi endpointlar ro'yxati to'liq. Har biriga controller, route, service yozing.

2. **Response formatini saqlang** — barcha muvaffaqiyatli response larda `{ "success": true, "data": ... }` formatidan foydalaning. Xatolarda `{ "success": false, "error": "..." }`.

3. **JWT token** — login va register dan keyin token qaytaring. Token da `userId` va `email` bo'lsin. Access token muddati: 7 kun.

4. **CORS** — `Access-Control-Allow-Origin` frontend URL ga ruxsat bering.

5. **Validation** — request body va query paramlarni tekshiring (email format, parol uzunligi, required fieldlar).

6. **File storage** — rasmlar uchun CDN yoki S3-compatible storage. Development da `public/uploads` yoki mock URL lar ishlatish mumkin.

7. **Mock data** — agar DB bo'lmasa, avval mock data bilan ishlaydigan API yozing. Keyin DB ulang.

8. **Frontend integratsiya** — Frontend `src/utils/auth.ts` da `authService` — shu API ga so'rov yuboradi. `src/data/content.ts` o'rniga `GET /api/applications` ishlatiladi.

---

## 6. Frontend o'zgarishlar (API ulanganda)

- `src/utils/auth.ts` — `authService` da fetch/axios orqali backend API ga so'rov
- `src/data/content.ts` — o'rniga API service yaratish: `getApplications()`, `getApplicationById(id)`
- `src/constants/index.ts` — kategoriyalar API dan olinishi mumkin (yoki default qiymatlar qoladi)
- `SearchModal` — `GET /api/search?q=...&type=...` ishlatadi
- `SubscriptionPage` — `GET /api/subscription/plans`, `POST /api/subscription/subscribe`

---

## 7. Cursor AI uchun promptlar

Backend yozishda Cursor ga quyidagi promptlardan foydalaning:

### 7.1. Loyiha boshidan (Node.js/Express)

```
@BACKEND_TZ.md faylini o'qib chiq. Inspiro backend loyihasini yarat:
- Node.js + Express
- TypeScript
- JWT autentifikatsiya
- TZ dagi barcha API endpointlarni implementatsiya qil
- Avval mock data bilan ishlaydigan qil, keyin DB ulash oson bo'lsin
- Response format: { success: true, data: ... } va { success: false, error: "..." }
```

### 7.2. Mavjud backend ga qo'shish

```
@BACKEND_TZ.md faylidagi barcha API larni mavjud loyihaga qo'sh. Har bir endpoint uchun:
- Route
- Controller
- Service (yoki mavjud pattern bo'yicha)
- Request validation
- Response TZ dagi formatda bo'lsin
```

### 7.3. Bo'lakma (Auth, Content, va hokazo)

```
@BACKEND_TZ.md ga qarab faqat Auth API larni yoz: register, login, confirm-email, create-password, resend-code. JWT token qaytaring.
```

```
@BACKEND_TZ.md ga qarab Content API larni yoz: GET /api/applications, GET /api/applications/:id, categories, pattern-categories, scenario-categories. Mock data bilan boshlang.
```

```
@BACKEND_TZ.md ga qarab Search va Subscription API larni yoz.
```

### 7.4. Qisqa universal prompt

```
Bu @BACKEND_TZ.md fayli Inspiro frontend uchun backend API spetsifikatsiyasi. Barcha endpointlarni implementatsiya qil — Auth, User, Content, Search, Subscription, Favorites. Response formatlari TZ da aniq berilgan. Node.js + Express + TypeScript ishlat.
```

---

## 8. Xulosa

Bu TZ ni Cursor AI ga tashlaganingizda, u sizga:

1. Barcha Auth API lar (register, login, confirm-email, create-password, resend-code)
2. Content API lar (applications list, application detail, categories)
3. Search API
4. Subscription API lar (plans, subscribe, current)
5. Favorites API lar (kelajakda)
6. User/me API

ni to'liq implementatsiya qiladi. Response formatlari frontend `types` va komponentlar bilan moslashtirilgan.
