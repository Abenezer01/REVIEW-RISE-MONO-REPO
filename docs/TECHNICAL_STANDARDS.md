# Technical Standards: Messaging, Localization, and API

This document outlines the core standards for communication between services and user feedback in the ReviewRise monorepo.

---

## 1. System Messaging Framework
Standardizes user feedback across all applications.

### Core Concepts
- **Machine-Readable Codes**: All feedback uses `SystemMessageCode` (enum) or unique string keys (e.g., `'studio.draftLoaded'`).
- **Standardized UI**: Handled by `SystemMessageProvider` using `notify()`.
- **Automatic Interception**: `apiClient` automatically triggers toasts if a `messageCode` is present in an API response.

### Usage
```tsx
const { notify } = useSystemMessages();

// Simple enum-based notification
notify(SystemMessageCode.SAVE_SUCCESS);

// Object-based with overrides
notify({
  messageCode: 'studio.customMessage',
  severity: 'WARNING',
  variant: 'MODAL',
  onConfirm: () => handleCleanup()
});
```

### Response Codes
Codes are defined in `packages/@platform/contracts/src/system-messages.ts`. Every code should have a corresponding translation in `systemMessages.json`.

---

## 2. Localization (i18n)
ReviewRise uses `next-intl` for all user-facing text.

### Standards
1. **Mandatory**: Hardcoded strings in JSX are forbidden and blocked by ESLint.
2. **Hook Usage**: Always use `useTranslations('namespace')`.
3. **Namespacing**: Organize keys into logical files (e.g., `common.json`, `studio.json`).
4. **Formatters**: Use `useFormatter()` for dates, numbers, and currencies.

### Example
```tsx
const t = useTranslations('studio.carousels');
const format = useFormatter();

<Typography>{t('title')}</Typography>
<Typography>{format.dateTime(new Date(), { month: 'long' })}</Typography>
```

---

## 3. API Request & Response Format
Defined in `@platform/contracts` to ensure consistency between Backend and Frontend.

### Response Wrapper (`ApiResponse<T>`)
Every API response must follow this structure:
```json
{
  "success": true,
  "statusCode": 200,
  "messageCode": "ITEM_CREATED",
  "data": { ... },
  "meta": {
    "requestId": "uuid",
    "timestamp": "iso-date"
  }
}
```

### Paginated Response (`PaginatedResponse<T>`)
Extended wrapper for lists:
```json
{
  "success": true,
  "data": [],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### Request Structure
Handlers should typed using `ApiRequest<Body, Query, Params>`.
- **GET**: Use `BaseQuery` (page, limit, search, sortBy, sortOrder).
- **POST/PUT**: Use `PostRequestParams<T>` or `PutRequestParams<T>`.

### Error Handling
Errors must return a `statusCode` and a `messageCode`.
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token expired"
  }
}
```
