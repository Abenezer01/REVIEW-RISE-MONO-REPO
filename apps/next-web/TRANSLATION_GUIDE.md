# Translation System - Quick Start Guide

## Using Translations in Components

### Client Components

```tsx
'use client'

import { useTranslation } from '@/hooks/useTranslation'

export default function MyComponent() {
  const t = useTranslation()
  
  return (
    <div>
      <h1>{t('app.name')}</h1>
      <p>{t('navigation.home')}</p>
      <button>{t('common.save')}</button>
    </div>
  )
}
```

### Server Components

```tsx
import { useTranslations } from 'next-intl'

export default function MyServerComponent() {
  const t = useTranslations()
  
  return (
    <div>
      <h1>{t('app.name')}</h1>
      <p>{t('dashboard.overview.title')}</p>
    </div>
  )
}
```

## Adding the Locale Switcher

```tsx
import LocaleSwitcher from '@/components/LocaleSwitcher'

export default function Header() {
  return (
    <header>
      <nav>...</nav>
      <LocaleSwitcher />
    </header>
  )
}
```

## Using Locale-Aware Navigation

```tsx
import { Link } from '@/i18n/routing'

export default function Navigation() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/reviews">Reviews</Link>
    </nav>
  )
}
```

## Adding New Translations

1. Add keys to `messages/en/*.json`
2. Add corresponding Arabic translations to `messages/ar/*.json`
3. Use the keys in your components with `t('your.key')`

## Translation Namespaces

- `common.json` - Common UI elements, buttons, labels
- `auth.json` - Authentication-related text
- `dashboard.json` - Dashboard-specific content

## RTL Support

Arabic locale automatically applies RTL direction via the `dir` attribute on the `<html>` element. The layout will mirror for Arabic users.
