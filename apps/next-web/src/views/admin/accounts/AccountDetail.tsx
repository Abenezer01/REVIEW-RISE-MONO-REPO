/* eslint-disable import/no-unresolved */
'use client'

import { useState, useEffect, useCallback } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'

import { SystemMessageCode } from '@platform/contracts'

import { useSystemMessages } from '@/shared/components/SystemMessageProvider'

// Core Component Imports
import CustomChip from '@core/components/mui/Chip'
import CustomTabList from '@core/components/mui/TabList'

import ConfirmationDialog from '@components/shared/dialog/confirmation-dialog'

import { getCurrentAccount, deleteAccount, getAccounts } from '@/app/actions/account'

import AccountDialog from './AccountDialog'
import UserDialog from './UserDialog'
import AccountOverview from './account-details/AccountOverview'
import AccountLocations from './account-details/AccountLocations'
import AccountUsers from './account-details/AccountUsers'
import AccountChannels from './account-details/AccountChannels'
import AccountLogs from './account-details/AccountLogs'
import AccountPerformanceStrip from './account-details/AccountPerformanceStrip'
import { useTranslation } from '@/hooks/useTranslation'

const PLAN_COLOR_MAP: Record<string, 'primary' | 'warning' | 'success' | 'secondary'> = {
  free: 'secondary',
  pro: 'primary',
  enterprise: 'warning'
}

const AccountDetail = () => {
  const { notify } = useSystemMessages()
  const t = useTranslation('dashboard')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [editOpen, setEditOpen] = useState(false)

  // Users List State
  const [usersData, setUsersData] = useState<{ data: any[], meta: any }>({ data: [], meta: { total: 0, page: 1, limit: 10, pages: 0 } })
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [userPageSize, setUserPageSize] = useState(10)

  // User Dialog State
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<any>(null)

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)

    const res = await getAccounts({
      page: userPage,
      limit: userPageSize,
      search: userSearch
    })

    if (res && !('error' in res)) {
      setUsersData(res)
    }

    setUsersLoading(false)
  }, [userPage, userPageSize, userSearch])

  useEffect(() => {
    if (tab === 'users') {
      fetchUsers()
    }
  }, [tab, fetchUsers])

  const handleCreateUser = () => {
    setSelectedUser(null)
    setUserDialogOpen(true)
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setUserDialogOpen(true)
  }

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user)
    setDeleteUserDialogOpen(true)
  }

  const handleDeleteUserConfirm = async () => {
    if (userToDelete) {
      const res = await deleteAccount(userToDelete.id)

      if (res.success) {
        notify(SystemMessageCode.ITEM_DELETED)
        fetchUsers()
      } else {
        notify(SystemMessageCode.DELETE_FAILED)
      }

      setDeleteUserDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await getCurrentAccount()

    if (res && !('error' in res)) {
      setData(res)
    } else {
      notify(SystemMessageCode.NOT_FOUND)
    }

    setLoading(false)
  }, [notify])

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
                <Skeleton variant='rounded' width={64} height={64} />
                <Box sx={{ width: '100%' }}>
                  <Skeleton width='35%' height={36} sx={{ mb: 1 }} />
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

  if (!data) return <Typography>{t('accounts.notFound')}</Typography>

  const primaryBusiness = data.userBusinessRoles?.[0]?.business
  const businessName = primaryBusiness?.name || data.name || 'Business Account'
  const statusColor = data.status === 'active' ? 'success' : 'secondary'
  const plan = data.subscriptions?.[0]?.plan || primaryBusiness?.subscriptions?.[0]?.plan || 'free'
  const planColor = PLAN_COLOR_MAP[plan] || 'secondary'
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)
  const ownerEmail = data.email || data.userBusinessRoles?.[0]?.user?.email

  return (
    <Grid container spacing={6}>
      {/* ── Business Identity Header ── */}
      <Grid size={{ xs: 12 }}>
        <Card sx={{ overflow: 'visible' }}>
          <CardContent sx={{ pb: '20px !important' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: 4
              }}
            >
              {/* Business Icon */}
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  flexShrink: 0,
                  border: theme => `2px solid ${theme.palette.primary.main}22`
                }}
              >
                <i className='tabler-building-store' style={{ fontSize: '2rem' }} />
              </Box>

              {/* Business Info */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                  <Typography variant='h4' fontWeight={700} noWrap>
                    {businessName}
                  </Typography>
                  <CustomChip
                    round='true'
                    size='small'
                    variant='tonal'
                    color={statusColor}
                    label={data.status === 'active' ? 'Active' : 'Inactive'}
                  />
                  <CustomChip
                    round='true'
                    size='small'
                    variant='tonal'
                    color={planColor}
                    label={`${planLabel} Plan`}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  {data.createdAt && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <i className='tabler-calendar' style={{ fontSize: '0.9rem' }} />
                      <Typography variant='body2'>
                        {t('accounts.createdOn', { date: new Date(data.createdAt).toLocaleDateString() })}
                      </Typography>
                    </Box>
                  )}
                  {data.userBusinessRoles?.[0]?.user?.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <i className='tabler-mail' style={{ fontSize: '0.9rem' }} />
                      <Typography variant='body2'>{ownerEmail}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Quick Actions */}
              <Box sx={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                <Tooltip title='Edit account details'>
                  <Button
                    variant='outlined'
                    size='small'
                    startIcon={<i className='tabler-edit' />}
                    onClick={() => setEditOpen(true)}
                  >
                    Edit
                  </Button>
                </Tooltip>
              </Box>
            </Box>

            {/* ── Performance KPI Strip ── */}
            <AccountPerformanceStrip data={data} loading={loading} />
          </CardContent>
        </Card>
      </Grid>

      {/* ── Tabs ── */}
      <Grid size={{ xs: 12 }}>
        <TabContext value={tab}>
          <CustomTabList pill='true' onChange={handleTabChange} aria-label='account tabs'>
            <Tab
              value='overview'
              label={t('accounts.tabs.overview')}
              icon={<i className='tabler-chart-bar' />}
              iconPosition='start'
            />
            <Tab
              value='locations'
              label={t('accounts.tabs.locations')}
              icon={<i className='tabler-map-pin' />}
              iconPosition='start'
            />
            <Tab
              value='users'
              label={t('accounts.tabs.users')}
              icon={<i className='tabler-users' />}
              iconPosition='start'
            />
            <Tab
              value='channels'
              label={t('accounts.tabs.channels')}
              icon={<i className='tabler-share' />}
              iconPosition='start'
            />
            <Tab
              value='logs'
              label={t('accounts.tabs.auditLogs')}
              icon={<i className='tabler-file-text' />}
              iconPosition='start'
            />
          </CustomTabList>

          <Box sx={{ mt: 4 }}>
            <TabPanel value='overview' sx={{ p: 0 }}>
              <AccountOverview data={data} />
            </TabPanel>

            <TabPanel value='locations' sx={{ p: 0 }}>
              <AccountLocations />
            </TabPanel>

            <TabPanel value='users' sx={{ p: 0 }}>
              <AccountUsers
                usersData={usersData}
                usersLoading={usersLoading}
                setUserPage={setUserPage}
                setUserPageSize={setUserPageSize}
                setUserSearch={setUserSearch}
                handleCreateUser={handleCreateUser}
                handleEditUser={handleEditUser}
                handleDeleteUser={handleDeleteUser}
              />
            </TabPanel>

            <TabPanel value='channels' sx={{ p: 0 }}>
              <AccountChannels />
            </TabPanel>

            <TabPanel value='logs' sx={{ p: 0 }}>
              <AccountLogs data={data} />
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

      <UserDialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        onSuccess={() => {
          fetchUsers()
        }}
        user={selectedUser}
      />

      <ConfirmationDialog
        open={deleteUserDialogOpen}
        handleClose={() => setDeleteUserDialogOpen(false)}
        title={t('accounts.deleteUser.title')}
        content={t('accounts.deleteUser.confirm', { name: userToDelete?.name })}
        onConfirm={handleDeleteUserConfirm}
        onCancel={() => setDeleteUserDialogOpen(false)}
        type='delete'
      />
    </Grid>
  )
}

export default AccountDetail