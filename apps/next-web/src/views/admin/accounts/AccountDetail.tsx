/* eslint-disable import/no-unresolved */
'use client'

import { useState, useEffect, useCallback } from 'react'

import { useParams } from 'next/navigation'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { toast } from 'react-toastify'

// Core Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'
import CustomTabList from '@core/components/mui/TabList'

import { useRouter } from '@/i18n/routing'
import { getAccount } from '@/app/actions/account'
import AccountDialog from './AccountDialog'

// Utils
const getInitials = (string: string) =>
  string.split(/\s/).reduce((response, word) => (response += word.slice(0, 1)), '')

const AccountDetail = () => {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [editOpen, setEditOpen] = useState(false)

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const res = await getAccount(id as string)

    if (res && !('error' in res)) {
      setData(res)
    } else {
      toast.error('Failed to load account')
    }

    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue)
  }

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Skeleton variant='circular' width={72} height={72} />
                <Box sx={{ width: '100%' }}>
                  <Skeleton width='30%' height={32} sx={{ mb: 1 }} />
                  <Skeleton width='20%' height={20} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Skeleton variant='rectangular' height={400} />
        </Grid>
      </Grid>
    )
  }

  if (!data) return <Typography>Account not found</Typography>

  const email = data.userBusinessRoles?.[0]?.user?.email || data.email
  const statusColor = data.status === 'active' ? 'success' : 'secondary'

  return (
    <Grid container spacing={6}>
      {/* Header Section */}
      <Grid size={{ xs: 12 }}>
        <Card sx={{ position: 'relative', overflow: 'visible', mt: { xs: 0, md: 4 } }}>
          <CardContent sx={{ pb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: 5
              }}
            >
              <CustomAvatar
                skin='light'
                variant='rounded'
                color='primary'
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: '2.5rem',
                  border: theme => `4px solid ${theme.palette.common.white}`,
                  boxShadow: 3
                }}
              >
                {getInitials(data.name || 'Account')}
              </CustomAvatar>
              
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                  <Typography variant='h4' sx={{ fontWeight: 600 }}>
                    {data.name}
                  </Typography>
                  <CustomChip
                    round='true'
                    size='small'
                    variant='tonal'
                    color={statusColor}
                    label={data.status}
                    sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <CustomAvatar skin='light' color='secondary' sx={{ width: 24, height: 24, mr: 2, fontSize: '0.875rem' }}>
                        <i className='tabler-mail' />
                      </CustomAvatar>
                      <Typography variant='body1'>{email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <CustomAvatar skin='light' color='secondary' sx={{ width: 24, height: 24, mr: 2, fontSize: '0.875rem' }}>
                        <i className='tabler-calendar' />
                      </CustomAvatar>
                      <Typography variant='body1'>
                        Created {new Date(data.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignSelf: { xs: 'stretch', md: 'center' } }}>
                <Button
                  variant='tonal'
                  color='secondary'
                  startIcon={<i className='tabler-arrow-left' />}
                  onClick={() => router.push('/admin/accounts')}
                >
                  Back
                </Button>
                <Button
                  variant='contained'
                  startIcon={<i className='tabler-edit' />}
                  onClick={() => setEditOpen(true)}
                >
                  Edit Account
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Tabs Section */}
      <Grid size={{ xs: 12 }}>
        <TabContext value={tab}>
          <CustomTabList pill='true' onChange={handleTabChange} aria-label='account tabs'>
            <Tab
              value='overview'
              label='Overview'
              icon={<i className='tabler-info-circle' />}
              iconPosition='start'
            />
            <Tab
              value='locations'
              label='Locations'
              icon={<i className='tabler-map-pin' />}
              iconPosition='start'
            />
            <Tab
              value='channels'
              label='Channels'
              icon={<i className='tabler-share' />}
              iconPosition='start'
            />
            <Tab
              value='logs'
              label='Audit Logs'
              icon={<i className='tabler-file-text' />}
              iconPosition='start'
            />
          </CustomTabList>

          <Box sx={{ mt: 4 }}>
            <TabPanel value='overview' sx={{ p: 0 }}>
              <Grid container spacing={6}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader
                      title='Subscription Details'
                      subheader='Current plan and status'
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
                          <Box key={sub.id} sx={{ mb: 2, p: 4, borderRadius: 1, border: theme => `1px solid ${theme.palette.divider}` }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 2,
                                alignItems: 'center'
                              }}
                            >
                              <Typography variant='h5' sx={{ fontWeight: 600, color: 'primary.main' }}>
                                {sub.plan} Plan
                              </Typography>
                              <CustomChip
                                size='small'
                                variant='tonal'
                                color={sub.status === 'active' ? 'success' : 'error'}
                                label={sub.status}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                              <i className='tabler-calendar-time' style={{ marginRight: 8 }} />
                              <Typography variant='body1'>
                                Renews on {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 4, bgcolor: 'action.hover', borderRadius: 1 }}>
                          <CustomAvatar skin='light' color='secondary' size={40}>
                            <i className='tabler-alert-circle' />
                          </CustomAvatar>
                          <Box>
                            <Typography variant='subtitle1'>No active subscription</Typography>
                            <Typography variant='body2' color='text.secondary'>This account is on the free tier.</Typography>
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader
                      title='Account Stats'
                      subheader='Overview of account usage'
                      avatar={
                        <CustomAvatar skin='light' variant='rounded' color='info' sx={{ width: 48, height: 48 }}>
                          <i className='tabler-chart-bar' style={{ fontSize: '1.5rem' }} />
                        </CustomAvatar>
                      }
                    />
                    <Divider />
                    <CardContent>
                      <Grid container spacing={4}>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ 
                            p: 4, 
                            borderRadius: 1, 
                            bgcolor: 'action.hover',
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: 2 
                          }}>
                            <CustomAvatar skin='light' color='primary' size={50}>
                              <i className='tabler-map-pin' style={{ fontSize: '1.75rem' }} />
                            </CustomAvatar>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant='h4' sx={{ fontWeight: 600 }}>{data.locations?.length || 0}</Typography>
                              <Typography variant='body2' color='text.secondary'>Locations</Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ 
                            p: 4, 
                            borderRadius: 1, 
                            bgcolor: 'action.hover',
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: 2 
                          }}>
                            <CustomAvatar skin='light' color='success' size={50}>
                              <i className='tabler-users' style={{ fontSize: '1.75rem' }} />
                            </CustomAvatar>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant='h4' sx={{ fontWeight: 600 }}>
                                {data.userBusinessRoles?.length || 1}
                              </Typography>
                              <Typography variant='body2' color='text.secondary'>Users</Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value='locations' sx={{ p: 0 }}>
              <Grid container spacing={6}>
                {data.locations?.length > 0 ? (
                  data.locations.map((loc: any) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={loc.id}>
                      <Card 
                        sx={{ 
                          height: '100%', 
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4,
                            cursor: 'pointer'
                          }
                        }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mb: 4
                            }}
                          >
                            <CustomAvatar skin='light' color='primary' variant='rounded' sx={{ width: 48, height: 48 }}>
                              <i className='tabler-building-store' style={{ fontSize: '1.5rem' }} />
                            </CustomAvatar>
                            <CustomChip
                              size='small'
                              variant='tonal'
                              color={loc.status === 'active' ? 'success' : 'default'}
                              label={loc.status}
                            />
                          </Box>
                          <Typography variant='h5' sx={{ mb: 2, fontWeight: 600 }}>
                            {loc.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, color: 'text.secondary' }}>
                            <i className='tabler-map-pin' style={{ fontSize: 20 }} />
                            <Typography variant='body1' noWrap>
                              {loc.address}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid size={{ xs: 12 }}>
                    <Card sx={{ border: theme => `2px dashed ${theme.palette.divider}`, boxShadow: 'none' }}>
                      <CardContent sx={{ textAlign: 'center', py: 12 }}>
                        <CustomAvatar
                          skin='light'
                          color='secondary'
                          sx={{ width: 72, height: 72, mb: 4, mx: 'auto' }}
                        >
                          <i className='tabler-building-off' style={{ fontSize: 36 }} />
                        </CustomAvatar>
                        <Typography variant='h5' sx={{ mb: 2 }}>No locations found</Typography>
                        <Typography variant='body1' color='text.secondary'>
                          This account has no locations yet. Add a location to get started.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            <TabPanel value='channels' sx={{ p: 0 }}>
              <Card>
                <CardHeader
                  title='Connected Platforms'
                  subheader='Manage integrations with third-party platforms'
                  avatar={
                    <CustomAvatar skin='light' variant='rounded' color='secondary' sx={{ width: 48, height: 48 }}>
                      <i className='tabler-share' style={{ fontSize: '1.5rem' }} />
                    </CustomAvatar>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box
                        sx={{
                          p: 6,
                          border: theme => `1px solid ${theme.palette.divider}`,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <CustomAvatar skin='light' color='error' variant='rounded' sx={{ width: 56, height: 56 }}>
                          <i className='tabler-brand-google' style={{ fontSize: '2rem' }} />
                        </CustomAvatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant='h6' sx={{ mb: 0.5 }}>Google</Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Business Profile
                          </Typography>
                        </Box>
                        <CustomChip size='small' label='Connected' color='success' variant='tonal' />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box
                        sx={{
                          p: 6,
                          border: theme => `1px solid ${theme.palette.divider}`,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          opacity: 0.8,
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'action.hover',
                            opacity: 1
                          }
                        }}
                      >
                        <CustomAvatar skin='light' color='primary' variant='rounded' sx={{ width: 56, height: 56 }}>
                          <i className='tabler-brand-facebook' style={{ fontSize: '2rem' }} />
                        </CustomAvatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant='h6' sx={{ mb: 0.5 }}>Facebook</Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Pages
                          </Typography>
                        </Box>
                        <CustomChip size='small' label='Not Connected' color='secondary' variant='tonal' />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </TabPanel>

            <TabPanel value='logs' sx={{ p: 0 }}>
              <Card>
                <CardHeader 
                  title='Recent Activity'
                  avatar={
                    <CustomAvatar skin='light' variant='rounded' color='info' sx={{ width: 48, height: 48 }}>
                      <i className='tabler-file-text' style={{ fontSize: '1.5rem' }} />
                    </CustomAvatar>
                  }
                />
                <Divider />
                <CardContent>
                  {data.auditLogs?.length > 0 ? (
                    <Box component='ul' sx={{ p: 0, m: 0, listStyle: 'none' }}>
                      {data.auditLogs.map((log: any, index: number) => (
                        <Box
                          component='li'
                          key={log.id}
                          sx={{
                            display: 'flex',
                            gap: 3,
                            pb: index === data.auditLogs.length - 1 ? 0 : 4,
                            mb: index === data.auditLogs.length - 1 ? 0 : 4,
                            borderBottom:
                              index === data.auditLogs.length - 1
                                ? 'none'
                                : theme => `1px dashed ${theme.palette.divider}`
                          }}
                        >
                          <CustomAvatar skin='light' color='info' size={38} sx={{ mt: 1 }}>
                            <i className='tabler-activity' style={{ fontSize: 20 }} />
                          </CustomAvatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap' }}>
                              <Typography variant='h6' sx={{ fontWeight: 600 }}>{log.action}</Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {new Date(log.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <i className='tabler-user' style={{ fontSize: 16, marginRight: 6, opacity: 0.7 }} />
                              <Typography variant='body2' color='text.secondary'>
                                {log.userId}
                              </Typography>
                            </Box>
                            <Box
                              component='pre'
                              sx={{
                                background: theme => theme.palette.action.hover,
                                p: 3,
                                borderRadius: 1,
                                overflow: 'auto',
                                fontSize: '0.8125rem',
                                m: 0,
                                maxHeight: 200,
                                fontFamily: 'monospace'
                              }}
                            >
                              {JSON.stringify(log.details, null, 2)}
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <CustomAvatar
                        skin='light'
                        color='secondary'
                        sx={{ width: 56, height: 56, mb: 2, mx: 'auto' }}
                      >
                        <i className='tabler-file-off' style={{ fontSize: 28 }} />
                      </CustomAvatar>
                      <Typography variant='h6' sx={{ mb: 1 }}>No audit logs found</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Activity will appear here once actions are performed.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </TabPanel>
          </Box>
        </TabContext>
      </Grid>

      <AccountDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={fetchData}
        account={data}
      />
    </Grid>
  )
}

export default AccountDetail
