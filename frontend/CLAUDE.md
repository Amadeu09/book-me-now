# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web

# Lint
npm run lint
```

No test runner is configured in this project.

## Architecture

### Routing (Expo Router - file-based)

`app/` maps directly to routes:
- `app/login.tsx`, `app/register.tsx`, `app/register-user.tsx` — unauthenticated screens
- `app/(tabs)/` — simpler layout (home, bookings, services, profile)
- `app/(main)/` — full layout including `horarios` (shifts management)
- `app/_layout.tsx` — root layout; wraps the entire app with `QueryClientProvider` (staleTime: 5min, retry: 1)

Each layout in `(tabs)` and `(main)` renders a `Navbar` component that switches between a bottom tab bar (mobile) and a sidebar (desktop, width ≥ 768).

### Feature Modules (`src/features/`)

Code is organized by business domain. Each feature follows this internal structure:

```
feature/
  screens/       # Full-page components rendered by app/ routes
  components/    # UI pieces scoped to this feature
  hooks/         # React Query wrappers (e.g., useEmpresa, useServices)
  services/      # Axios API calls — no UI logic here
  types/         # TypeScript types for this domain
  constants/     # Feature-specific constants (colors, styles)
```

Features: `auth`, `home`, `calendar` (bookings), `horarios` (shifts/employees), `services` (business services), `empresas` (company profile), `profile`.

Screens in `app/` import from `src/features/<feature>/screens/` — the route file is a thin wrapper.

### Data Fetching

All server state goes through **React Query**. The pattern:

1. `services/*.service.ts` — pure async functions calling the Axios instance from `src/core/api/api.ts`
2. `hooks/use*.ts` — `useQuery`/`useMutation` wrappers around service functions
3. Screens consume hooks, never call services directly

The Axios instance at `src/core/api/api.ts` auto-attaches the Bearer token (read from `AsyncStorage`) via a request interceptor.

### Theme & Styling

- `src/constants/theme.ts` — global palette, spacing, radius, typography, shadows
- `src/features/home/constants/inicio.constants.ts` — `HC` object with the primary brand palette used across most screens:
  - Brand orange: `#FF6A00`
  - Screen background: `#F8F9FB`
  - Cards: white with `elevation: 2` / iOS shadow (`opacity: 0.06, radius: 12`)
  - Status colors: green `#22C55E`, yellow `#F59E0B`, red `#EF4444`
- Use `StyleSheet.create` — no inline style objects in lists or render functions
- Responsive breakpoint: `width >= 768` (via `useWindowDimensions()`)

#### Company Color System (`src/core/theme/ThemeProvider.tsx`)

The app adapts its UI to each company's `colorPrimari`. Access via `const theme = useTheme()`.

| Token | Value | Usage |
|---|---|---|
| `theme.primary` | Company color (full) | NavBar bg, buttons, selected badges, progress bars |
| `theme.primaryMid` | Company color lightened 60% | VACANCES calendar badges (background) |
| `theme.primaryLight` | Company color lightened 85% | Card backgrounds, range-selection highlight |
| `theme.background` | Company color lightened 93% | Screen background |
| `theme.textOnPrimary` | `#fff` or `#000` (contrast) | Text/icons on `theme.primary` backgrounds |

#### Card visual hierarchy

There are three card variants used consistently across screens. Always apply them this way:

**1. Strong card** — full company color background (high-contrast, used for featured info)
```tsx
<View style={[styles.card, { backgroundColor: theme.primary }]}>
  <Text style={{ color: theme.textOnPrimary }}>...</Text>
</View>
```

**2. Soft card with border** — light company color background with a subtle 0.5pt border (default for most content cards)
```tsx
<View style={[styles.card, { backgroundColor: theme.primaryLight, borderWidth: 0.5, borderColor: theme.primary }]}>
  <Text style={{ color: HC.textPrimary }}>...</Text>
</View>
```

**3. Neutral card** — plain white (`HC.card`) background, no company color (used for non-themed content)
```tsx
<View style={[styles.card, { backgroundColor: HC.card }]}>
  <Text style={{ color: HC.textPrimary }}>...</Text>
</View>
```

#### Screen header

Headers use `theme.headerBg` as background and `theme.headerText` / `theme.headerSubtitle` for text, so they automatically match the company color:
```tsx
<View style={{ backgroundColor: theme.headerBg }}>
  <Text style={{ color: theme.headerText }}>Títol</Text>
  <Text style={{ color: theme.headerSubtitle }}>Subtítol</Text>
</View>
```

`theme.headerBg` equals `theme.primary` (company color) unless the company color is white, in which case it falls back to white with dark text.

### Path Aliases

`@/` resolves to `./src/` and `./` (configured in both `tsconfig.json` and `babel.config.js`).

### Environment

API base URL is set via `EXPO_PUBLIC_API_URL` (see `.env.example`). Defaults to `http://localhost:3000`. Configured in `app.config.ts` and consumed in `src/core/api/api.ts`.

## Key Conventions (from `.claude\skills`)

- **Screen size limit**: 200–300 lines. Split large screens into subcomponents.
- **Lists**: Always use `FlatList` with `keyExtractor`. Extract list items into named components.
- **Modals**: Complex modals live in `components/modal/` subdirectory and are broken into subcomponents.
- **FAB buttons**: 56×56, `borderRadius: 28`, absolute bottom-right positioning.
- **No hardcoded colors** — always use the `HC` palette or `theme.ts`.
- Functional components only; no anonymous components exported.

## Pending tasks

- (ninguna)