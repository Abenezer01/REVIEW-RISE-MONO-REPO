/* eslint-disable import/no-unresolved */
'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'

// Core Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'

// Hook Imports
import useTranslation from '@/hooks/useTranslation'
import { useDashboardMetrics } from '@/hooks/reviews/useReviewAnalytics'

interface PlatformStatus {
  key: string
  label: string
  icon: string
  color: 'success' | 'error' | 'secondary'
  connected: boolean
}

const StatBlock = ({
  icon, label, value, subLabel, color, loading
}: {
  icon: string
  label: string
  value: string | number
  subLabel: string
  color: 'warning' | 'primary' | 'success' | 'error'
  loading?: boolean
}) => (
  <Box sx={{ p: 3, borderRadius: 1, bgcolor: 'action.hover', textAlign: 'center' }}>
    <CustomAvatar skin='light' color={color} size={44} sx={{ mx: 'auto', mb: 2 }}>
      <i className={icon} style={{ fontSize: '1.25rem' }} />
    </CustomAvatar>

    {loading ? (
      <>
        <Skeleton width={40} height={28} sx={{ mx: 'auto' }} />

        <Skeleton width={70} height={18} sx={{ mx: 'auto', mt: 0.5 }} />
      </>
    ) : (
      <>
        <Typography variant='h5' fontWeight={700}>{value}</Typography>

        <Typography variant='body2' fontWeight={600} sx={{ mt: 0.5 }}>{label}</Typography>

        <Typography variant='caption' color='text.secondary'>{subLabel}</Typography>
      </>
    )}
  </Box>
)

const AccountOverview = ({ data }: { data: any }) => {
  const t = useTranslation('dashboard')

  const primaryBusiness = data?.userBusinessRoles?.[0]?.business
  const businessId = primaryBusiness?.id || data?.id

  // Fix bug: prefer _count from API, then array length

  const locationCount = primaryBusiness?._count?.locations ?? data?._count?.locations ?? data?.locations?.length ?? 0

  const userCount = data?.userBusinessRoles?.length ?? 1

  const plan = data?.subscriptions?.[0]?.plan || 'free'

  const planLimits: Record<string, { locations: number; users: number }> = {
    free: { locations: 1, users: 3 },
    pro: { locations: 10, users: 20 },
    enterprise: { locations: 999, users: 999 }
  }

  const limits = planLimits[plan] || planLimits.free

  // Real API metrics
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics({
    businessId: businessId || '',
    limit: 30
  })

  const avgRating = metrics ? Number((metrics as any).averageRating ?? 0).toFixed(1) : '—'
  const totalReviews = metrics ? ((metrics as any).totalReviews ?? 0) : '—'

  const responseRate = metrics
    ? `${Math.round(((metrics as any).responseCount / Math.max((metrics as any).totalReviews, 1)) * 100)}%`
    : '—'

  const unanswered = metrics
    ? Math.max(0, ((metrics as any).totalReviews ?? 0) - ((metrics as any).responseCount ?? 0))
    : '—'

  // Platform connections — aggregate across all locations
  const allLocations: any[] = data?.locations || []
  const hasGoogle = allLocations.some((l: any) => l.googlePlaceId || l.platforms?.google)
  const hasFacebook = allLocations.some((l: any) => l.facebookPageId || l.platforms?.facebook)
  const locationConnections = allLocations.length > 0

  const platforms: PlatformStatus[] = [
    {
      key: 'google',
      label: t('accounts.overview.platformConnections.google'),
      icon: 'tabler-brand-google',
      color: hasGoogle ? 'success' : 'error',
      connected: hasGoogle
    },
    {
      key: 'facebook',
      label: t('accounts.overview.platformConnections.facebook'),
      icon: 'tabler-brand-facebook',
      color: hasFacebook ? 'success' : 'error',
      connected: hasFacebook
    },
    {
      key: 'sync',
      label: t('accounts.overview.platformConnections.reviewSync'),
      icon: 'tabler-refresh',
      color: locationConnections ? 'success' : 'secondary',
      connected: locationConnections
    }
  ]

  return (
    <Grid container spacing={6}>

      {/* ── Card 1: Subscription ── */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={t('accounts.overview.subscription.title')}
            subheader={t('accounts.overview.subscription.subtitle')}
            avatar={
              <CustomAvatar skin='light' variant='rounded' color='warning' sx={{ width: 48, height: 48 }}>
                <i className='tabler-credit-card' style={{ fontSize: '1.5rem' }} />
              </CustomAvatar>
            }
          />
          <Divider />
          <CardContent>
            {data.subscriptions?.length > 0 ? (
              data.subscriptions.map((sub: any) => (
                <Box key={sub.id} sx={{ mb: 2, p: 3, borderRadius: 1, border: theme => `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                    <Typography variant='h5' fontWeight={600} color='primary.main'>
                      {t('accounts.overview.subscription.planName', { plan: sub.plan })}
                    </Typography>
                    <CustomChip
                      size='small'
                      variant='tonal'
                      color={sub.status === 'active' ? 'success' : 'error'}
                      label={t(`common.status.${sub.status}`)}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <i className='tabler-calendar-time' style={{ marginRight: 8 }} />
                    <Typography variant='body2'>
                      {t('accounts.overview.subscription.renewsOn', { date: new Date(sub.currentPeriodEnd).toLocaleDateString() })}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3, bgcolor: 'action.hover', borderRadius: 1 }}>
                <CustomAvatar skin='light' color='secondary' size={40}>
                  <i className='tabler-alert-circle' />
                </CustomAvatar>
                <Box>
                  <Typography variant='subtitle1'>{t('accounts.overview.subscription.noActive')}</Typography>
                  <Typography variant='body2' color='text.secondary'>{t('accounts.overview.subscription.freeTier')}</Typography>
                </Box>
              </Box>
            )}

            {/* Usage meters */}

            <Box sx={{ mt: 4 }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant='caption' color='text.secondary'>{t('accounts.overview.stats.locationsUsed')}</Typography>
                  <Typography variant='caption' fontWeight={600}>
                    {locationCount} / {limits.locations === 999 ? '∞' : limits.locations}
                  </Typography>
                </Box>
                <LinearProgress
                  variant='determinate'
                  value={limits.locations === 999 ? 10 : Math.min((locationCount / limits.locations) * 100, 100)}
                  color={locationCount >= limits.locations ? 'error' : 'primary'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant='caption' color='text.secondary'>{t('accounts.overview.stats.teamMembers')}</Typography>
                  <Typography variant='caption' fontWeight={600}>
                    {userCount} / {limits.users === 999 ? '∞' : limits.users}
                  </Typography>
                </Box>
                <LinearProgress
                  variant='determinate'
                  value={limits.users === 999 ? 5 : Math.min((userCount / limits.users) * 100, 100)}
                  color={userCount >= limits.users ? 'error' : 'success'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* ── Card 2: Review Performance (Live) ── */}

      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={t('accounts.overview.reviewPerformance.title')}
            subheader={t('accounts.overview.reviewPerformance.subtitle')}
            avatar={
              <CustomAvatar skin='light' variant='rounded' color='warning' sx={{ width: 48, height: 48 }}>
                <i className='tabler-star' style={{ fontSize: '1.5rem' }} />
              </CustomAvatar>
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={4}>
              <Grid size={{ xs: 6 }}>
                <StatBlock
                  icon='tabler-star-filled'
                  label={t('accounts.overview.reviewPerformance.avgRating')}
                  value={avgRating}
                  subLabel={t('accounts.overview.reviewPerformance.avgRatingSub')}
                  color='warning'
                  loading={metricsLoading}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <StatBlock
                  icon='tabler-messages'
                  label={t('accounts.overview.reviewPerformance.totalReviews')}
                  value={totalReviews}
                  subLabel={t('accounts.overview.reviewPerformance.totalReviewsSub')}
                  color='primary'
                  loading={metricsLoading}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <StatBlock
                  icon='tabler-message-check'
                  label={t('accounts.overview.reviewPerformance.responseRate')}
                  value={responseRate}
                  subLabel={t('accounts.overview.reviewPerformance.responseRateSub')}
                  color='success'
                  loading={metricsLoading}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <StatBlock
                  icon='tabler-message-x'
                  label={t('accounts.overview.reviewPerformance.unanswered')}
                  value={unanswered}
                  subLabel={t('accounts.overview.reviewPerformance.unansweredSub')}
                  color='error'
                  loading={metricsLoading}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* ── Card 3: Platform Connections ── */}

      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={t('accounts.overview.platformConnections.title')}
            subheader={t('accounts.overview.platformConnections.subtitle')}
            avatar={
              <CustomAvatar skin='light' variant='rounded' color='info' sx={{ width: 48, height: 48 }}>
                <i className='tabler-plug-connected' style={{ fontSize: '1.5rem' }} />
              </CustomAvatar>
            }
          />
          <Divider />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {platforms.map(platform => (
                <Box
                  key={platform.key}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 3,
                    borderRadius: 1,
                    border: theme => `1px solid ${theme.palette.divider}`,
                    bgcolor: platform.connected ? 'success.light' : 'action.hover'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CustomAvatar skin='light' color={platform.color} size={36}>
                      <i className={platform.icon} />
                    </CustomAvatar>
                    <Typography variant='body2' fontWeight={500}>{platform.label}</Typography>
                  </Box>
                  <CustomChip
                    size='small'
                    variant='tonal'
                    color={platform.color}
                    label={platform.connected ? t('accounts.overview.platformConnections.connected') : t('accounts.overview.platformConnections.notConnected')}
                  />
                </Box>
              ))}
            </Box>

            <Box sx={{ mt: 4, p: 3, borderRadius: 1, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 2 }}>
              <i className='tabler-info-circle' style={{ fontSize: '1.1rem' }} />
              <Typography variant='caption' color='text.secondary'>
                {t('accounts.overview.stats.connectPlatformsDesc')}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AccountOverview
