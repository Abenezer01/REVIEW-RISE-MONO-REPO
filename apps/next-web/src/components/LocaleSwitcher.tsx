'use client'

import { useTransition } from 'react'

import { useLocale } from 'next-intl'

// MUI Imports
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'

// Platform Imports
import { localeMetadata, type Locale } from '@platform/i18n'

import { useRouter, usePathname } from '@/i18n/routing'

const LocaleSwitcher = () => {
    const router = useRouter()
    const pathname = usePathname()
    const locale = useLocale() as Locale
    const [isPending, startTransition] = useTransition()

    const handleLocaleChange = (event: SelectChangeEvent) => {
        const newLocale = event.target.value as Locale

        startTransition(() => {
            router.replace(pathname as any, { locale: newLocale })
        })
    }

    return (
        <Select
            value={locale}
            onChange={handleLocaleChange}
            disabled={isPending}
            size='small'
            sx={{
                minWidth: 120,
                '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }
            }}
        >
            {Object.values(localeMetadata).map(({ code, flag, nativeName }) => (
                <MenuItem key={code} value={code}>
                    <span style={{ marginRight: '8px' }}>{flag}</span>
                    {nativeName}
                </MenuItem>
            ))}
        </Select>
    )
}

export default LocaleSwitcher
