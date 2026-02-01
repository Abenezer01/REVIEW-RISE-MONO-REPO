# System Messaging Framework

A uniform, localized system messaging framework for the ReviewRise monorepo.

## Overview

The system messaging framework ensures consistent feedback across all apps and services. It uses machine-readable codes from the backend and resolves them to localized messages on the frontend.

## Components

### 1. SystemMessageCode (Contracts)
Defined in `packages/@platform/contracts/src/system-messages.ts`.
This enum contains all possible message codes. One code = one meaning.

### 2. Response Structure
All API responses include a `messageCode` field.
```typescript
{
  success: true,
  messageCode: 'AUTH_LOGIN_SUCCESS',
  data: { ... }
}
```

### 3. SystemMessageProvider
A React provider that handles displaying messages via:
- **TOAST**: Small notifications (using `react-hot-toast`).
- **MODAL**: Blocking dialogs for important information.
- **INLINE**: Non-blocking messages within a specific UI area.

## Usage

### Backend (Express)
Use the standard response builders:

```typescript
import { createSuccessResponse, SystemMessageCode } from '@platform/contracts';

res.json(createSuccessResponse(data, SystemMessageCode.ITEM_CREATED));
```

### Frontend (React)
Use the `useSystemMessages` hook:

```typescript
import { useSystemMessages } from '@/shared/components/SystemMessageProvider';
import { SystemMessageCode } from '@platform/contracts';

const { notify } = useSystemMessages();

const handleSave = () => {
  notify(SystemMessageCode.SAVE_SUCCESS);
};

// With options
notify(SystemMessageCode.DELETE_SUCCESS, {
  variant: 'MODAL',
  onConfirm: () => console.log('Confirmed')
});
```

### Global Interceptor
The `apiClient` in `apps/next-web` automatically intercepts responses. If a `messageCode` is present, it will automatically trigger a toast notification. No manual `notify` call is needed for standard API operations.

## Localization
Messages are stored in `systemMessages.json` within each app's locale directory:
- `apps/next-web/messages/en/systemMessages.json`
- `apps/next-web/messages/ar/systemMessages.json`

## Message Priority and Deduplication
- **Deduplication**: Identical toast messages within a short window are suppressed.
- **Severity**: Success, Info, Warning, Error.
- **Default Severity**: Each `SystemMessageCode` has a default severity defined in the contracts.

## Enforcement Rules

To maintain consistency and support localization, the following rules are enforced:

1. **No Direct Toast Imports**: Importing `react-hot-toast` or `react-toastify` directly in UI components is forbidden. This is enforced by ESLint.
2. **Mandatory use of `notify`**: All user-facing feedback messages must be triggered via the `notify(code, options)` API from `useSystemMessages()`.
3. **No Hardcoded Strings**: System-level messages must use `SystemMessageCode` and be translated in `systemMessages.json`. Component-specific labels should use standard i18n keys.
4. **Backend Contract**: The backend must never return user-facing strings. It must return a `messageCode` from the shared `SystemMessageCode` enum.

### Before (Prohibited)
```typescript
import { toast } from 'react-hot-toast';

toast.success('Settings saved!');
```

### After (Required)
```typescript
import { useSystemMessages } from '@/shared/components/SystemMessageProvider';
import { SystemMessageCode } from '@platform/contracts';

const { notify } = useSystemMessages();
notify(SystemMessageCode.SAVE_SUCCESS);
```
