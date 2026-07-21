# Architektur

## Überblick

Timplan is a learning anki web app with seperated frontend (by Next.js 15) and backend (by Express.js). 
The communication is about a REST-API. For the development without the backen we first used a Mock-Modus.

---

## Tech Stack

| Bereich    | Technologie                                     |
| ---------- |-------------------------------------------------|
| Frontend   | Next.js 15, React, TypeScript                   |
| Styling    | CSS Modules, CSS Custom Properties              |
| Backend    | Node.js, Express.js, TypeScript                 |
| API-Docs   | OpenAPI 3.0, zod-to-openapi, Swagger UI         |
| Auth       | Token-based (Mock), localStorage für Session |
| Deployment | Azure App Service (Backend)                     |

---

## Ordnerstruktur Gesamt

```
Timplan-Projekt/
├── backend/
├── docs/
│   ├── architecture.md
│   ├── design.md
│   └── contributions/
│       ├── auth.md
│       ├── cards.md
│       ├── decks.md
│       ├── learning.md
│       └── statistic.md
└── frontend/
```

---

## Folder-structure Frontend

```
frontend/src/app/
  (app)/                        → LoggedInPage (with Navbar)
    layout.tsx                  → App-Shell (Navbar + Main)
    layout.module.css
    page.tsx                    → StartPage
    page.module.css
    cards/
      edit/[deckid]/            → Cards of Decks editing
    decks/
      page.tsx                  → DeckPage
      [id]/                     → idDeck
        page.tsx
        edit/                   → Deck editing
    learning/
      page.tsx                  → LearningPage
      [deckId]/                 → Learnmode for Decks
    settings/
      page.tsx                  → SettingsPage
      account/                  → AccountSettingsPage
    sharing/                    → SharingPage
    statistic/                  → Statistics

  (auth)/                       → Auth-Pages (without Navbar)
    login/
      forgot-password/          → ForgotPasswordPage
      page.tsx                  → LoginPage
      page.module.css
    register/
      page.tsx                  → RegisterPage
      page.module.css
    reset-password/
      page.tsx                  → ResetPasswordPage
    layout.tsx                  → Auth-Layout
    auth.css

  lib/
    auth/
      AuthContext.tsx           → Global AuthContext
      auth.service.ts           → authService
      auth.types.ts             → authInterfaces
    card-service.ts             → cardService
    deck-service.ts             → deckService
    definitions.ts              → Global Type-Definitionen
    learning-service.ts         → learningService
    search-function.ts          → searchfunktion
    placeholder-cards.json     
    placeholder-dateData.json   
    placeholder-decks.json      
    placeholder-users.json      
    search-service.ts           → searchService
    weather-service.ts          → weatherService
    
  mocks/
    users.mock.ts               → Mock-User for first developing

  ui/
    buttons/
      accentButton/             → AccentButton
      dropdownButton/           → DropdownButton
      editButton/               → EditButton
      startLessonButton/        → StartLessonButton
      buttons.module.css        
    cards/
      deckCardsEditView/        → DeckCardsEditView + DeckCardsEditItem
      singleCardAdd/            → SingleCardAdd
      singleCardEditor/         → SingleCardEditor
    chart/
      Chart.tsx                 → StatisticDiagramm
    confirmDialog/             
    decks/
      deckCard/                 → DeckCard
      deckEditor/               → EditDeck
      deckGrid/                 → DeckGrid
      deckHeader/               → DeckHeader
      deckNavigator/            → NavigateDeck
      singleCard/               → singleCard
    learning_cards/
      dashboard_learning.tsx    → LearningDashboard 
      learning_cards.tsx        → LearningCard
      learning_end_page.tsx     → LearningEndPage
    navbar/
      Navbar.tsx
      accountMenu/              → AccountMenu with Dropdown
      search/                   → SearchComponent
      navbar.module.css
      Navbar.tsx
    spinner/
      Spinner.tsx
    toast/
      Toast.tsx
    globals.css                 → GlobalDesign
    
  layout.tsx                    → Root Layout (AuthProvider, Fonts)
  global.d.ts                   → Globale TypeScript-Deklarationen
```

---

## Folder-structure Backend

```
backend/src/
  config/
    env.ts                      → environment variables
  db/
    client.ts                   → 
    schema.ts                   → 
  docs/
    authPath.ts                 → authEndpoints
    cardPath.ts                 → cardEndpoints
    deckPath.ts                 → deckEndpoints
    healthPath.ts               → healthEndpoint
    openapi.ts                  → generate openApiDocument
    pathSchemas.ts              → Endpoint Definition
    registry.ts                 → registrySchema
    searchPaths.ts              → searchEndpoints
  middleware/
    asyncHandler.ts             → 
    cors.ts                     → CORS-Configuration
    requireJson.ts              → 
    tokenVerifier.ts            → 
  repositories/
    cards/                      → 
    decks/                      → 
    search/                     → 
    users/                      → 
    loadMockData.ts             → 
    repositories.ts             → 
  routes/
    auth.ts                     → /auth/*
    cards.ts                    → /cards/*
    decks.ts                    → /decks/*
    docs.ts                     → /docs (Swagger UI)
    health.ts                   → /health
    index.ts                    → Routers
    search.ts                   → /search/*
  services/
    deckHierachy.ts             → 
  utils/
    apiUtils.ts                 → 
    deckAuth.ts                 → 
    envUtils.ts                 → 
    mailUtils.ts                → 
  validation/
    cardSchemas.ts              → 
    commonSchemas.ts            → 
    dateDataSchemas.ts          → 
    deckSchemas.ts              → 
    schemas.ts                  → 
    searchSchemas.ts            → 
    userSchemas.ts              → 
  
  app.ts                        → Express-App creates
  server.ts                     → Server start

backend/mockData/
  mockUsers.json
  mockCards.json
```

---

## Next.js Routes

Das Projekt nutzt Next.js Route-Gruppen um zwei Layout-Bereiche zu trennen:

| Gruppe   | Pfad                            | Layout          | Beschreibung       |
| -------- | ------------------------------- | --------------- | ------------------ |
| `(app)`  | `/`, `/decks`, `/learning`, ... | Navbar + Main   | Eingeloggte Seiten |
| `(auth)` | `/login`, `/register`           | Branding + Form | Auth-Seiten        |

Route-Gruppen erzeugen **kein URL-Segment** — `/login` nicht `/(auth)/login`.

---

## Datenfluss

### Login

```
LoginPage
  → auth.service.login()
      → Mock: users.mock.ts
      → API:  POST /auth/login
  → AuthContext.login(user)
      → localStorage.setItem("timplan_user", ...)
      → setUser(user)
  → router.push("/")
```

### Seitenaufruf (eingeloggt)

```
(app)/layout.tsx
  → useAuth() → isLoading=true → Spinner
  → isLoading=false, user vorhanden → Navbar + {children}
  → user=null → Navbar zeigt Login/Register-Links
```

### Logout

```
AccountMenu.handleLogout()
  → AuthContext.logout()
      → localStorage.removeItem("timplan_user")
      → setUser(null)
  → router.push("/login")
```

---

## Root Layout — `layout.tsx`

Setzt Schriften, Metadata und wraps die App in `AuthProvider`.

```tsx
<html lang="en">
  <body className={`${geistSans.variable} ${geistMono.variable}`}>
    <AuthProvider>{children}</AuthProvider>
  </body>
</html>
```

| Eigenschaft | Wert                                                               |
| ----------- | ------------------------------------------------------------------ |
| Schriften   | Geist Sans (`--font-geist-sans`), Geist Mono (`--font-geist-mono`) |
| Titel       | TIMPLAN Karteikarten                                               |
| Favicon     | /favicon.ico                                                       |

---

## App-Layout — `(app)/layout.tsx`

Shell für alle eingeloggten Seiten.

```
┌─────────────────────────────┐  ← 10svh
│           Navbar            │
├─────────────────────────────┤
│                             │  ← 90svh, padding: 24px
│         {children}          │
│                             │
└─────────────────────────────┘
```

Bei `isLoading=true` → zeigt `<Spinner />` statt Layout.

---

## Backend — Einstieg

```
server.ts
  → createApp()           // app.ts
      → express.json()
      → corsMiddleware()
      → routes            // routes/index.ts
      → 404-Handler
  → app.listen(port, host)
```

### Umgebungsvariablen Backend

| Variable            | Default        | Beschreibung                  |
| ------------------- | -------------- | ----------------------------- |
| `PORT`              | 3001           | Server-Port                   |
| `HOST`              | 0.0.0.0        | Bind-Adresse                  |
| `NODE_ENV`          | development    | Umgebung                      |
| `ALLOWED_ORIGINS`   | localhost:3000 | CORS-Origins (kommasepariert) |
| `WEBSITE_HOSTNAME`  | —              | Azure: Public-URL             |
| `WEBSITE_SITE_NAME` | —              | Azure-Erkennung               |

### Azure-Deployment

Der Server erkennt Azure automatisch über `WEBSITE_*` Umgebungsvariablen:

- `.env` wird nicht geladen (dotenv wird übersprungen)
- `NODE_ENV` wird automatisch auf `production` gesetzt
- Public-URL wird aus `WEBSITE_HOSTNAME` gebildet

---

## API-Endpunkte

| Methode | Endpoint                          | Beschreibung       |
| ------- | --------------------------------- | ------------------ |
| GET     | /health                           | Health Check       |
| POST    | /auth/login                       | Login              |
| POST    | /auth/register                    | Registrierung      |
| POST    | /auth/logout                      | Logout             |
| GET     | /decks/getAllCardsforDeck/:deckId | Karten eines Decks |
| GET     | /openapi.json                     | OpenAPI-Dokument   |
| GET     | /docs                             | Swagger UI         |

---

## Mock-Modus Frontend

Wird aktiviert via:

```
NEXT_PUBLIC_USE_MOCK=true
```

Im Mock-Modus kommuniziert das Frontend nicht mit dem Backend. Auth-Operationen laufen gegen `mocks/users.mock.ts`. Weitere Placeholder-Daten liegen in `lib/placeholder-*.json`.

---

## Offene TODOs

- Echte Datenbank statt JSON-Dateien im Backend
- JWT-Token-Validierung + Auth-Middleware
- Weitere CRUD-Endpunkte für Cards und Decks
- Lernkarten-Flow vollständig implementieren
