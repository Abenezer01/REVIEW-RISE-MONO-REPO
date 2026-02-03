# Localization Guidelines & Enforcement

This document outlines the rules and conventions for localization across all frontend applications in the ReviewRise monorepo.

## 1. Localization is Mandatory
All user-facing text, including labels, button text, headings, placeholders, helper text, empty states, and tooltips, **must** be localized using the `next-intl` framework.

## 2. Hardcoded Strings are Prohibited
Hardcoded string literals in JSX are blocked by ESLint. The `react/jsx-no-literals` rule is enabled in both `apps/next-web` and `apps/next-seo-landing`.

### Allowed Literals
Common symbols and technical strings are permitted in JSX expression containers:
- Symbols: `{'%'}`, `{'✓'}`, `{'•'}`, `{'™'}`, `{'—'}`, `{'→'}`, `{'#'}`, `{'&apos;'}`
- Technical: `{'N/A'}`
- Formatting: `{' '}`, `{':'}`, `{','}`

## 3. Localization Pattern
Always use the `useTranslations` hook (or `useTranslation` shared hook) and resolve keys through the appropriate namespace.

```tsx
// Correct
const t = useTranslations('dashboard');
<Typography>{t('navigation.dashboard')}</Typography>

// Incorrect (Linter will catch this)
<Typography>Dashboard</Typography>
```

## 4. Organization of Locale Files
Locale files are located in `messages/{locale}/*.json` and grouped by feature or domain:
- `common.json`: Shared UI elements (buttons like Save/Cancel, brand names).
- `dashboard.json`: Main application views and navigation.
- `studio.json`: AI Content Studio specific strings.
- `auth.json`: Authentication and user management.

## 5. Dynamic Content
Use interpolation for dynamic values:
```json
// messages/en/dashboard.json
{
  "welcome": "Welcome back, {name}!"
}
```
```tsx
t('welcome', { name: user.name })
```

## 6. Multi-language Support
Currently, English (`en`) and Arabic (`ar`) are supported. When adding new keys to English locale files, ensure they are also added to the Arabic counterparts (or at least copied as a fallback).
