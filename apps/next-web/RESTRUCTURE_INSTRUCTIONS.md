# Manual Directory Restructuring Required

Due to command execution limitations, the following directories need to be manually moved:

## Required Moves

Please manually move these directories in your file explorer or IDE:

1. **Move blank-layout-pages:**
   - From: `src/app/(blank-layout-pages)`
   - To: `src/app/[locale]/(blank-layout-pages)`

2. **Move dashboard:**
   - From: `src/app/(dashboard)`
   - To: `src/app/[locale]/(dashboard)`

3. **Move not-found:**
   - From: `src/app/[...not-found]`
   - To: `src/app/[locale]/[...not-found]`

## After Moving

Once you've moved these directories, the app structure will be:

```
src/app/
├── layout.tsx (root layout)
├── page.tsx (redirects to /en)
├── favicon.ico
├── globals.css
└── [locale]/
    ├── layout.tsx (locale-aware layout)
    ├── page.tsx (redirects to /[locale]/home)
    ├── (blank-layout-pages)/
    │   └── login/
    ├── (dashboard)/
    │   ├── dashboard/
    │   └── reviews/
    └── [...not-found]/
```

This structure enables locale-based routing where all pages are accessible via `/en/...` and `/ar/...` URLs.
