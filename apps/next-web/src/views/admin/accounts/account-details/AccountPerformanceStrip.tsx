/* eslint-disable import/no-unresolved */
'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'

interface KPI {
    icon: string
    label: string
    value: string | number
    color: 'primary' | 'success' | 'warning' | 'info' | 'error' | 'secondary'
}

interface AccountPerformanceStripProps {
    data: any
    loading?: boolean
}

const AccountPerformanceStrip = ({ data, loading }: AccountPerformanceStripProps) => {
    const theme = useTheme()

    const primaryBusiness = data?.userBusinessRoles?.[0]?.business

    const locationCount =
        primaryBusiness?._count?.locations ??
        data?._count?.locations ??
        data?.locations?.length ??
        0

    const userCount = data?.userBusinessRoles?.length ?? data?._count?.users ?? 0

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const plan = data?.subscriptions?.[0]?.plan ?? 'free'

    const kpis: KPI[] = [
        {
            icon: 'tabler-map-pin',
            label: 'Locations',
            value: locationCount,
            color: 'primary'
        },
        {
            icon: 'tabler-users',
            label: 'Team Members',
            value: userCount,
            color: 'info'
        },
        {
            icon: 'tabler-star',
            label: 'Avg Rating',
            value: '—',
            color: 'warning'
        },
        {
            icon: 'tabler-message-check',
            label: 'Response Rate',
            value: '—',
            color: 'success'
        },
        {
            icon: 'tabler-robot',
            label: 'AI Replies',
            value: '—',
            color: 'secondary'
        }
    ]

    const colorMap: Record<string, string> = {
        primary: theme.palette.primary.main,
        success: theme.palette.success.main,
        warning: theme.palette.warning.main,
        info: theme.palette.info.main,
        error: theme.palette.error.main,
        secondary: theme.palette.secondary.main
    }

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                flexWrap: 'wrap',
                mt: 4,
                pt: 4,
                borderTop: theme => `1px solid ${theme.palette.divider}`
            }}
        >
            {kpis.map((kpi, index) => (
                <Box key={kpi.label} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            px: { xs: 3, md: 5 },
                            py: 1
                        }}
                    >
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: `${kpi.color}.light`,
                                color: colorMap[kpi.color],
                                flexShrink: 0
                            }}
                        >
                            <i className={kpi.icon} style={{ fontSize: '1rem' }} />
                        </Box>
                        <Box>
                            {loading ? (
                                <>
                                    <Skeleton width={40} height={24} />
                                    <Skeleton width={60} height={16} />
                                </>
                            ) : (
                                <>
                                    <Typography variant='subtitle1' fontWeight={700} lineHeight={1.2}>
                                        {kpi.value}
                                    </Typography>
                                    <Typography variant='caption' color='text.secondary' noWrap>
                                        {kpi.label}
                                    </Typography>
                                </>
                            )}
                        </Box>
                    </Box>
                    {index < kpis.length - 1 && (
                        <Divider orientation='vertical' flexItem sx={{ height: 36, alignSelf: 'center' }} />
                    )}
                </Box>
            ))}
        </Box>
    )
}

export default AccountPerformanceStrip
