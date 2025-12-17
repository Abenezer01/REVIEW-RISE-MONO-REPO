# @platform/shared-ui

Common UI components and design tokens for the ReviewRise platform.

## Features

- **Design Tokens**: Standardized colors, typography, spacing, and shadows matching the ReviewRise brand.
- **Layout**: `AppShell`, `Sidebar`, `Topbar`, `PageHeader`, `PageSection`.
- **Forms**: `TextInput`, `Select`, `Switch`, `DatePicker`.
- **Data Display**: `DataTable` (MUI DataGrid wrapper), `List`.
- **Feedback**: `LoadingSpinner`, `EmptyState`, `Toast`.

## Usage

```tsx
import { AppShell, PageHeader, TextInput } from '@platform/shared-ui';

function MyPage() {
  return (
    <AppShell ...>
      <PageHeader title="My Page" />
      <TextInput name="email" label="Email" />
    </AppShell>
  );
}
```

## Setup

Ensure your application wraps the content with the necessary providers (e.g., `ThemeProvider` from MUI, `ToastContainer`).
