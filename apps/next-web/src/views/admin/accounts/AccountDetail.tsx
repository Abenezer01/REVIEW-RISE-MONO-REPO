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
import { toast } from 'react-toastify'

// Core Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'
import CustomTabList from '@core/components/mui/TabList'

import ConfirmationDialog from '@components/shared/dialog/confirmation-dialog'

import { getCurrentAccount, deleteAccount, getAccounts } from '@/app/actions/account'

import { useAuth } from '@/contexts/AuthContext'

import AccountDialog from './AccountDialog'
import UserDialog from './UserDialog'
import AccountOverview from './account-details/AccountOverview'
import AccountLocations from './account-details/AccountLocations'
import AccountUsers from './account-details/AccountUsers'
import AccountChannels from './account-details/AccountChannels'
import AccountLogs from './account-details/AccountLogs'

// Utils
const getInitials = (string: string) =>
  string.split(/\s/).reduce((response, word) => (response += word.slice(0, 1)), '')

const AccountDetail = () => {
  const { user } = useAuth()
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
        toast.success('User deleted')
        fetchUsers()
      } else {
        toast.error(res.message || 'Failed to delete user')
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
      toast.error('Failed to load account')
    }

    setLoading(false)
  }, [])

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

  const email = user?.email || data.userBusinessRoles?.[0]?.user?.email || data.email
  const statusColor = data.status === 'active' ? 'success' : 'secondary'
  const userName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.email?.split('@')[0] || data.name)

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
                src={user?.avatar}
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: '2.5rem',
                  border: theme => `4px solid ${theme.palette.common.white}`,
                  boxShadow: 3
                }}
              >
                {getInitials(userName || 'User')}
              </CustomAvatar>

              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                  <Typography variant='h4' sx={{ fontWeight: 600 }}>
                    {userName}
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
              value='users'
              label='Users'
              icon={<i className='tabler-users' />}
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
        title='Delete User'
        content={`Are you sure you want to remove ${userToDelete?.name} from this account?`}
        onConfirm={handleDeleteUserConfirm}
        onCancel={() => setDeleteUserDialogOpen(false)}
        type='delete'
      />
    </Grid>
  )
}

export default AccountDetail
