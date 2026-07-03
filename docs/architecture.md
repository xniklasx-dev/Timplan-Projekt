# Architektur

## Überblick

Timplan ist eine Lernkarten-Webanwendung mit getrenntem Frontend (Next.js 15) und Backend (Express.js). Die Kommunikation läuft über eine REST-API. Für die Entwicklung ohne Backend gibt es einen Mock-Modus.

---

## Tech Stack

| Bereich    | Technologie                                    |
| ---------- | ---------------------------------------------- |
| Frontend   | Next.js 15, React, TypeScript                  |
| Styling    | CSS Modules, CSS Custom Properties             |
| Backend    | Node.js, Express.js, TypeScript                |
| API-Docs   | OpenAPI 3.0, zod-to-openapi, Swagger UI        |
| Auth       | Token-basiert (Mock), localStorage für Session |
| Deployment | Azure App Service (Backend)                    |

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

## Ordnerstruktur Frontend

```
frontend/src/app/
  (app)/                        → Eingeloggte Seiten (mit Navbar)
    layout.tsx                  → App-Shell (Navbar + Main)
    layout.module.css
    page.tsx                    → Startseite
    page.module.css
    cards/
      edit/[deckid]/            → Karten eines Decks bearbeiten
    decks/
      page.tsx                  → Deck-Übersicht
      [id]/                     → Einzelnes Deck
        page.tsx
        edit/                   → Deck bearbeiten
    learning/
      page.tsx                  → Lern-Übersicht
      [deckId]/                 → Lernmodus für ein Deck
    settings/
      page.tsx                  → Settings-Übersicht
      account/                  → Account-Einstellungen
    sharing/                    → Teilen-Seite
    statistic/                  → Statistiken

  (auth)/                       → Auth-Seiten (ohne Navbar)
    layout.tsx                  → Zweispaltiges Auth-Layout
    auth.css
    login/
      page.tsx                  → LoginPage
      ForgotPasswordModal.tsx
    register/
      page.tsx                  → RegisterPage

  lib/
    definitions.ts              → Globale Typ-Definitionen
    learning-service.ts         → Lernlogik
    search-function.ts          → Suchfunktion
    placeholder-cards.json      → Platzhalter-Karteidaten
    placeholder-decks.json      → Platzhalter-Deckdaten
    placeholder-users.json      → Platzhalter-Nutzerdaten
    placeholder-dateData.json   → Platzhalter-Datumsdaten
    auth/
      AuthContext.tsx           → Globaler Auth-State
      auth.service.ts           → API-Abstraktionsschicht
      auth.types.ts             → TypeScript-Interfaces

  mocks/
    users.mock.ts               → Mock-Nutzer für Entwicklung

  ui/
    globals.css                 → Design Tokens
    buttons/
      accentButton/             → AccentButton
      startLessonButton/        → StartLessonButton
    cards/
      deckCardsEditView/        → DeckCardsEditView + DeckCardsEditItem
      singleCardEditor/         → SingleCardEditor
    chart/
      Chart.tsx                 → Statistik-Diagramm
    learning_cards/
      dashboard_learning.tsx    → Lern-Dashboard
      learning_cards.tsx        → Lernkarten-Komponente
    navbar/
      Navbar.tsx
      navbar.module.css
      accountMenu/              → AccountMenu mit Dropdown
      search/                   → Suchkomponente
    spinner/
      Spinner.tsx

  layout.tsx                    → Root Layout (AuthProvider, Fonts)
  global.d.ts                   → Globale TypeScript-Deklarationen
```

---

## Ordnerstruktur Backend

```
backend/src/
  app.ts                        → Express-App erstellen
  server.ts                     → Server starten
  config/
    env.ts                      → Umgebungsvariablen
  middleware/
    cors.ts                     → CORS-Konfiguration
  routes/
    index.ts                    → Router-Sammlung
    auth.ts                     → /auth/*
    decks.ts                    → /decks/*
    health.ts                   → /health
    docs.ts                     → /docs (Swagger UI)
  docs/
    openapi.ts                  → OpenAPI-Dokument generieren
    paths.ts                    → Endpunkt-Definitionen
    registry.ts                 → Schema-Registry
    schemas.ts                  → Zod-Schemas (Card, Deck, Media)
    swagger.ts                  → Swagger UI mounten

backend/mockData/
  mockUsers.json
  mockCards.json
```

---

## Next.js Route-Gruppen

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
