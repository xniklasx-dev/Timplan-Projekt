# Auth

## Übersicht

Der Auth-Bereich umfasst Login, Registrierung, Passwort-Reset-Modal, den globalen AuthContext sowie den auth.service der zwischen Mock- und API-Modus wechseln kann.

---

## Ordnerstruktur

```
src/app/
  (auth)/
    layout.tsx               → Zweispaltiges Auth-Layout
    auth.css                 → Styles für Auth-Layout
    login/
      page.tsx               → LoginPage
      page.module.css
      ForgotPasswordModal.tsx
    register/
      page.tsx               → RegisterPage
      page.module.css
  lib/auth/
    AuthContext.tsx           → Globaler Auth-State (React Context)
    auth.service.ts           → Login/Register/Logout Logik
    auth.types.ts             → TypeScript-Interfaces
  mocks/
    users.mock.ts             → Mock-Nutzer für Entwicklung
  hooks/
    useClickOutside.ts        → Schließt Modals/Dropdowns bei Außenklick
```

---

## AuthLayout — `(auth)/layout.tsx`

Wrapper für alle Auth-Seiten. Zeigt links den Markennamen und rechts den Form-Inhalt via `{children}`.

**Layout-Verhalten:**

- Mobile: einspaltig (column)
- Ab 786px: zweispaltig (row) — Branding links, Form rechts
- Ab 1800px: max-width 1800px, Form max-width 600px

**Klassen (auth.css):**

| Klasse             | Beschreibung                              |
| ------------------ | ----------------------------------------- |
| `.authPage`        | Vollbild-Flex, zentriert, `clamp`-Padding |
| `.authContainer`   | max-width 1600px, column → row ab 786px   |
| `.authLeft`        | Flex-1, zentriert, Branding               |
| `.brandTitle`      | `clamp(2.2rem, 4vw, 3.8rem)`              |
| `.authRight`       | Flex-1, Form-Slot                         |
| `.authCardWrapper` | max-width 520px                           |

---

## LoginPage — `(auth)/login/page.tsx`

### State

| Variable             | Typ     | Beschreibung                 |
| -------------------- | ------- | ---------------------------- |
| `emailOrUsername`    | string  | Eingabe E-Mail oder Username |
| `password`           | string  | Eingabe Passwort             |
| `loading`            | boolean | Während API-Call             |
| `error`              | string  | Fehlermeldung                |
| `showForgotPassword` | boolean | Öffnet ForgotPasswordModal   |

### Ablauf

```
handleSubmit()
  → login({ emailOrUsername, password })   // auth.service
  → loginContext(user)                      // AuthContext
  → router.push("/")
```

Bei Fehler: `setError(err.message)` → Anzeige unter dem Formular.

### Besonderheit

Wenn `showForgotPassword=true`, wird `onSubmit` des Formulars auf `e.preventDefault()` gesetzt um versehentliches Absenden zu verhindern.

---

## ForgotPasswordModal — `(auth)/login/ForgotPasswordModal.tsx`

Modal für Passwort-Zurücksetzen. Rendert innerhalb der LoginPage über dem Overlay.

### Props

```ts
interface Props {
  onClose: () => void;
}
```

### State

| Variable | Beschreibung                                |
| -------- | ------------------------------------------- |
| `email`  | Eingabe E-Mail-Adresse                      |
| `sent`   | true nach Absenden → zeigt Bestätigungstext |

### Schließ-Verhalten

Verwendet `useClickOutside` — kein `onClick` auf dem Overlay nötig:

```ts
const modalRef = useRef<HTMLDivElement | null>(null);
useClickOutside([modalRef], onClose, true);
```

### Zustände

**Zustand 1 — Formular:**

- E-Mail-Input
- AccentButton "Send reset link"
- linkButton "Cancel" → `onClose()`

**Zustand 2 — Bestätigung (sent=true):**

- Text: "If this email exists, a reset link has been sent."
- AccentButton "Back to Login" → `onClose()`

> **TODO:** API-Call zum Versenden der Reset-Mail ist noch nicht implementiert.

---

## RegisterPage — `(auth)/register/page.tsx`

### State

| Variable   | Beschreibung             |
| ---------- | ------------------------ |
| `username` | Eingabe Username         |
| `email`    | Eingabe E-Mail           |
| `password` | Eingabe Passwort         |
| `loading`  | Während API-Call         |
| `error`    | Fehlermeldung            |
| `success`  | Erfolgsmeldung           |
| `message`  | Allgemeine Statusmeldung |

### Guard

Wenn `user` bereits im AuthContext vorhanden → sofort redirect zu `/`.

### Ablauf

```
handleSubmit()
  → register({ username, email, password })  // auth.service
  → login(user)                               // AuthContext
  → setSuccess(...)
  → setTimeout(() => router.push("/login"), 2000)
```

---

## AuthContext — `lib/auth/AuthContext.tsx`

Globaler React Context für Auth-State. Persistiert den User in `localStorage` unter dem Key `timplan_user`.

### Context-Werte

| Wert               | Typ                             | Beschreibung                   |
| ------------------ | ------------------------------- | ------------------------------ |
| `user`             | `User \| null`                  | Eingeloggter User              |
| `isLoading`        | `boolean`                       | true während localStorage-Init |
| `login(user)`      | `(user: User) => void`          | Setzt user + localStorage      |
| `logout()`         | `() => void`                    | Löscht user + localStorage     |
| `updateUser(data)` | `(data: Partial<User>) => void` | Merged Änderungen in user      |

### Verwendung

```tsx
// In _layout.tsx_ wrappen:
<AuthProvider>{children}</AuthProvider>;

// In Komponenten:
const { user, login, logout, isLoading } = useAuth();
```

`useAuth()` wirft einen Error wenn außerhalb von `AuthProvider` verwendet.

---

## auth.service.ts

Abstraktionsschicht zwischen UI und API. Wechselt automatisch zwischen Mock- und API-Modus.

### Mock-Modus

```
NEXT_PUBLIC_USE_MOCK=true  →  Daten aus mocks/users.mock.ts
NEXT_PUBLIC_USE_MOCK=false →  API-Calls an NEXT_PUBLIC_API_BASE
```

### Funktionen

**`login(data: LoginDTO): Promise<User>`**

- Mock: Sucht in `mockUsers` nach `emailOrUsername` + `password`
- API: `POST /auth/login`
- Wirft `Error("Invalid email or password")` bei Fehler

**`register(data: RegisterDTO): Promise<User>`**

- Mock: Erstellt neuen User mit `crypto.randomUUID()`, pusht in `mockUsers`
- API: `POST /auth/register`

**`logout(): Promise<void>`**

- Mock: no-op
- API: `POST /auth/logout`

---

## auth.types.ts

```ts
interface LoginDTO {
  emailOrUsername: string;
  password: string;
}

interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

interface User {
  id: string;
  username: string;
  displayname?: string;
  avatarUrl?: string;
  email: string;
  token: string;
  createdAt?: string;
  updatedAt?: string;
}
```

---

## useClickOutside — `hooks/useClickOutside.ts`

Custom Hook der Dropdowns und Modals schließt wenn außerhalb geklickt wird.

### Signatur

```ts
useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  onClose: () => void,
  active: boolean
)
```

### Verhalten

- Lauscht auf `pointerdown` (funktioniert für Maus, Touch und Stylus)
- Lauscht auf `keydown` mit `Escape`
- Ist nur aktiv wenn `active=true` → keine unnötigen Event Listener

### Verwendung

```ts
// AccountMenu
useClickOutside([btnRef, menuRef], () => setOpen(false), open);

// ForgotPasswordModal
useClickOutside([modalRef], onClose, true);
```

---

## Mock-Zugangsdaten

| Username   | E-Mail             | Passwort |
| ---------- | ------------------ | -------- |
| testuser   | test@example.com   | password |
| niktest    | nik@example.com    | password |
| leonietest | leonie@example.com | password |
| pascaltest | pascal@example.com | password |
| maxtest    | max@example.com    | password |
| tonytest   | tony@example.com   | password |

---

## Offene TODOs

- ForgotPasswordModal: API-Call implementieren
- Backend: JWT-Token-Validierung statt Mock-Token
- Backend: Auth-Middleware für geschützte Routen
- RegisterPage: E-Mail-Bestätigung implementieren
