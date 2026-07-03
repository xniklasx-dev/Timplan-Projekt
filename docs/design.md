# Design System

## Übersicht

Das Design-System basiert auf CSS Custom Properties (Design Tokens) in `globals.css`. Alle Komponenten verwenden ausschließlich diese Variablen — keine hardcodierten Farben außer bei wenigen Status-Farben. Das Theme ist durchgehend dunkel.

---

## Design Tokens — `ui/globals.css`

### Hintergründe & Surfaces

| Token                   | Wert    | Verwendung                 |
| ----------------------- | ------- | -------------------------- |
| `--color-background`    | #0A0A0A | Seiten-Hintergrund         |
| `--color-surface`       | #171717 | Karten, Modals, Dropdowns  |
| `--color-surface-hover` | #1F1F1F | Hover-Zustand von Surfaces |

### Akzentfarben

| Token                  | Wert    | Verwendung                  |
| ---------------------- | ------- | --------------------------- |
| `--color-accent`       | #420420 | Buttons, Avatar, Highlights |
| `--color-accent-hover` | #5A0F2E | Hover der Akzentfarbe       |
| `--color-focus`        | #7A1A45 | Focus-Ring, Links           |

### Text

| Token                   | Wert    | Verwendung            |
| ----------------------- | ------- | --------------------- |
| `--color-text`          | #E6E8EB | Primärtext            |
| `--color-text-muted`    | #A6ABB3 | Sekundärtext, Labels  |
| `--color-text-disabled` | #6E6E6E | Deaktivierte Elemente |

### Borders & Schatten

| Token                    | Wert                   | Verwendung                  |
| ------------------------ | ---------------------- | --------------------------- |
| `--color-border`         | #2A2A2A                | Input-Rahmen, Karten-Rahmen |
| `--color-surface-shadow` | rgba(0,0,0,0.78)       | Box-Shadow                  |
| `--color-subtle-overlay` | rgba(230,232,235,0.06) | Inset-Shadow                |
| `--color-divider`        | rgba(230,232,235,0.08) | Trennlinien                 |
| `--color-glow`           | rgba(230,232,235,0.14) | Focus-Glow auf Buttons      |

### Status-Farben

| Token              | Wert    | Verwendung           |
| ------------------ | ------- | -------------------- |
| `--color-success`  | #1DB954 | Erfolgsmeldungen     |
| `--color-error`    | #E5484D | Fehlermeldungen      |
| `--color-warning`  | #F5A524 | Warnungen            |
| `--color-info`     | #3B82F6 | Info-Meldungen       |
| `--color-disabled` | #3A3A3A | Deaktivierte Buttons |

### Lernkarten-Schwierigkeitsgrade

| Token                  | Wert    | Verwendung         |
| ---------------------- | ------- | ------------------ |
| `--color-again`        | #60A5FA | Bewertung: Nochmal |
| `--color-again-hover`  | #3B82F6 | Hover              |
| `--color-easy`         | #4ADE80 | Bewertung: Einfach |
| `--color-easy-hover`   | #22C55E | Hover              |
| `--color-medium`       | #FDBA74 | Bewertung: Mittel  |
| `--color-medium-hover` | #FB923C | Hover              |
| `--color-hard`         | #F87171 | Bewertung: Schwer  |
| `--color-hard-hover`   | #EF4444 | Hover              |

---

## Globale CSS-Regeln

```css
html,
body {
  max-width: 100svw;
  overflow-x: hidden;
  height: 100svh;
  overflow-y: hidden;
}
```

- `color-scheme: dark` — Browser-native Elemente im Dark Mode
- `box-sizing: border-box` — global auf alle Elemente
- `a { text-decoration: none; color: inherit; }` — Links ohne Standard-Styling
- `::selection` — Akzentfarbe als Markierungsfarbe

### Focus-Styles

```css
a:focus-visible,
button:focus-visible,
input:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

Alle interaktiven Elemente haben einen sichtbaren Focus-Ring für Keyboard-Navigation.

---

## UI-Komponenten Übersicht

```
ui/
  buttons/
    accentButton/          → Primärer Button für Hauptaktionen
    startLessonButton/     → Runder Icon-Button für Lernstart
  cards/
    deckCardsEditView/     → Liste aller Karten eines Decks zum Bearbeiten
    singleCardEditor/      → Editor für eine einzelne Karte
  chart/
    Chart.tsx              → Statistik-Diagramm
  learning_cards/
    dashboard_learning     → Lern-Dashboard-Übersicht
    learning_cards         → Lernkarten-Anzeige im Lernmodus
  navbar/
    Navbar.tsx             → Hauptnavigation
    accountMenu/           → Avatar-Dropdown
    search/                → Suchkomponente
  spinner/
    Spinner.tsx            → Lade-Indikator
```

---

## Komponenten

### AccentButton — `ui/buttons/accentButton/`

Primärer Button für alle Hauptaktionen (Login, Register, Speichern, etc.).

| Eigenschaft      | Wert                                                          |
| ---------------- | ------------------------------------------------------------- |
| Hintergrund      | `--color-accent`                                              |
| Hover            | `--color-accent-hover` + `box-shadow: 0 0 0 1px --color-glow` |
| Active           | `translateY(1px) scale(0.99)`                                 |
| Disabled         | `--color-disabled`, `--color-text-disabled`, kein Hover       |
| Padding          | `1rem`                                                        |
| Border-radius    | `12px`                                                        |
| Font-size        | `1rem`                                                        |
| Font-weight      | `600`                                                         |
| `fullWidth` prop | `width: 100%`                                                 |

**Props:**

```ts
type AccentButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  fullWidth?: boolean;
};
```

**Verwendung:**

```tsx
<AccentButton type="submit" fullWidth disabled={loading}>
  {loading ? (
    <>
      <Spinner small /> Logging in...
    </>
  ) : (
    "Login"
  )}
</AccentButton>
```

**Verwendet in:** LoginPage, RegisterPage, ForgotPasswordModal, AccountSettingsPage

---

### StartLessonButton — `ui/buttons/startLessonButton/`

Runder Icon-Button zum Starten einer Lerneinheit.

| Eigenschaft | Wert                                                          |
| ----------- | ------------------------------------------------------------- |
| Form        | Kreis, 48×48px, `border-radius: 50%`                          |
| Icon        | `/play_lesson_icon.svg`, 20×20px via `next/image`             |
| Hover       | `--color-accent-hover` + `box-shadow: 0 0 0 2px --color-glow` |
| Active      | `translateY(1px) scale(0.95)`                                 |

---

### Spinner — `ui/spinner/`

Lade-Indikator in zwei Größen.

| Eigenschaft | Normal                      | Small            |
| ----------- | --------------------------- | ---------------- |
| Größe       | 32×32px                     | 18×18px          |
| Border      | 3px                         | 2px              |
| Farbe oben  | `--color-accent`            | `--color-accent` |
| Margin      | `1rem auto` (zentriert)     | `0` (inline)     |
| Animation   | `spin 0.8s linear infinite` | gleich           |

```tsx
<Spinner />        // Normal — zentriert auf der Seite
<Spinner small />  // Klein — inline in Buttons
```

**Verwendet in:** LoginPage, RegisterPage, SettingsPage, AccountSettingsPage, App-Layout

---

### AccountMenu — `ui/navbar/accountMenu/`

Avatar-Button mit Dropdown-Menü für Account-Verwaltung.

#### Avatar-Button

| Eigenschaft | Wert                                              |
| ----------- | ------------------------------------------------- |
| Größe       | 50×50px, `border-radius: 999px`                   |
| Hintergrund | `--color-accent`                                  |
| Hover       | `--color-surface-hover` + Box-Shadow              |
| Inhalt      | Initiale (erster Buchstabe) oder `avatarUrl`-Bild |

#### Dropdown

| Eigenschaft   | Wert                                |
| ------------- | ----------------------------------- |
| Breite        | 260px                               |
| Position      | `absolute`, rechts unter dem Button |
| Hintergrund   | `--color-surface`                   |
| Border-radius | `14px`                              |

#### Menü-Items

| Klasse            | Beschreibung                                    |
| ----------------- | ----------------------------------------------- |
| `.menuItem`       | Link-Einträge (Settings, Login, Register)       |
| `.menuItemButton` | Button-Einträge (Switch Account)                |
| `.menuItemLogout` | Logout — rot `#e53935`, roter Hover-Hintergrund |

**Wichtig:** `.menuItemButton:not(.menuItemLogout):hover` verhindert Konflikte zwischen normalem Hover und Logout-Hover.

---

### Navbar — `ui/navbar/`

Hauptnavigation der App. Enthält Links zu Decks, Learning, Stats, Sharing sowie die Suchkomponente und das AccountMenu.

> Detaillierte Dokumentation liegt bei den jeweiligen Teammitgliedern.

---

## Responsivität

Das Projekt verwendet drei Breakpoints:

| Breakpoint | Breite | Änderungen                                       |
| ---------- | ------ | ------------------------------------------------ |
| Tablet     | 786px  | Auth-Layout: column → row, Schriftgrößen wachsen |
| Desktop    | 1200px | Inputs und Titel etwas größer                    |
| Ultra Wide | 1800px | Maximale Schrift- und Container-Größen           |

### Clamp-Werte (AuthLayout)

```css
padding: clamp(2rem, 4vw, 6rem);
gap: clamp(2rem, 4vw, 6rem);
font-size: clamp(2.2rem, 4vw, 3.8rem); /* brandTitle */
```

---

## CSS Modules Konvention

Jede Komponente hat eine eigene `.module.css`-Datei. Klassen werden als `styles.className` eingebunden:

```tsx
import styles from "./page.module.css";
<div className={styles.form}>
```

Mehrere Klassen kombinieren:

```tsx
className={`${styles.menuItemButton} ${styles.menuItemLogout}`}
```

Mit bedingter Klasse:

```tsx
className={`${styles.button} ${fullWidth ? styles.fullWidth : ""}`}
```

---

## Schriften

| Variable            | Schrift          | Verwendung       |
| ------------------- | ---------------- | ---------------- |
| `--font-geist-sans` | Geist Sans       | Standard-Schrift |
| `--font-geist-mono` | Geist Mono       | Code, Listen     |
| `--font-sans`       | Arial, Helvetica | Fallback         |

Eingebunden via `next/font/google` im Root-Layout.
