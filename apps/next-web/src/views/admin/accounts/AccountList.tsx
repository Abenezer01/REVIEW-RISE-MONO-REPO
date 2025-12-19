/* eslint-disable import/no-unresolved */
'use client'

import { useState, useEffect } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'
import { toast } from 'react-toastify'

// Core Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'
import CustomTextField from '@core/components/mui/TextField'
import ConfirmationDialog from '@components/shared/dialog/confirmation-dialog'

import { Link } from '@/i18n/routing'

import { getAccounts, deleteAccount } from '@/app/actions/account'
import AccountDialog from './AccountDialog'

// Utils
const getInitials = (string: string) =>
  string.split(/\s/).reduce((response, word) => (response += word.slice(0, 1)), '')

const AccountList = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [filters, setFilters] = useState({
    status: '',
    plan: '',
    search: ''
  })

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<any>(null)

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<any>(null)

  const fetchData = async () => {
    setLoading(true)

    const res = await getAccounts({
      page: page + 1,
      limit: rowsPerPage,
      ...filters
    })

    if (res?.data) {
      setData(res.data)
      setTotal(res.meta?.total || 0)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [page, rowsPerPage, filters])

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(0)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleDeleteClick = (account: any) => {
    setAccountToDelete(account)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return

    const res = await deleteAccount(accountToDelete.id)

    if (res.success) {
      toast.success('Account deleted successfully')
      fetchData()
    } else {
      toast.error(res.message || 'Failed to delete account')
    }

    setDeleteDialogOpen(false)
    setAccountToDelete(null)
  }

  const statusColor: any = {
    active: 'success',
    inactive: 'secondary',
    pending: 'warning'
  }

  return (
    <Card>
      <CardHeader
        title='Accounts'
        action={
          <Button
            variant='contained'
            onClick={() => setOpenDialog(true)}
            startIcon={<i className='tabler-plus' />}
          >
            Create Account
          </Button>
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomTextField
              fullWidth
              placeholder='Search Account...'
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-search' />
                    </InputAdornment>
                  )
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomTextField
              select
              fullWidth
              defaultValue=''
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-activity' />
                    </InputAdornment>
                  )
                }
              }}
            >
              <MenuItem value=''>All Status</MenuItem>
              <MenuItem value='active'>Active</MenuItem>
              <MenuItem value='inactive'>Inactive</MenuItem>
              <MenuItem value='pending'>Pending</MenuItem>
            </CustomTextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomTextField
              select
              fullWidth
              defaultValue=''
              value={filters.plan}
              onChange={e => handleFilterChange('plan', e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-credit-card' />
                    </InputAdornment>
                  )
                }
              }}
            >
              <MenuItem value=''>All Plans</MenuItem>
              <MenuItem value='free'>Free</MenuItem>
              <MenuItem value='pro'>Pro</MenuItem>
              <MenuItem value='enterprise'>Enterprise</MenuItem>
            </CustomTextField>
          </Grid>
        </Grid>
      </CardContent>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Account</TableCell>
              <TableCell>Name / Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (

              // Skeleton Loading State
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Skeleton variant='circular' width={34} height={34} sx={{ mr: 3 }} />
                      <Box sx={{ width: '100%' }}>
                        <Skeleton width={120} height={24} sx={{ mb: 0.5 }} />
                        <Skeleton width={80} height={16} />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Skeleton width={150} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={80} height={32} sx={{ borderRadius: 16 }} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={60} height={32} sx={{ borderRadius: 16 }} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={100} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Skeleton variant='circular' width={32} height={32} />
                      <Skeleton variant='circular' width={32} height={32} />
                      <Skeleton variant='circular' width={32} height={32} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align='center' sx={{ py: 10 }}>
                  <CustomAvatar
                    skin='light'
                    color='secondary'
                    sx={{ width: 64, height: 64, mb: 4, mx: 'auto' }}
                  >
                    <i className='tabler-database-off' style={{ fontSize: 32 }} />
                  </CustomAvatar>
                  <Typography variant='h5' sx={{ mb: 2 }}>No accounts found</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Try adjusting your filters or create a new account.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row: any) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CustomAvatar
                        skin='light'
                        color='primary'
                        sx={{ mr: 3, width: 34, height: 34, fontSize: '1rem' }}
                      >
                        {getInitials(row.name || 'A')}
                      </CustomAvatar>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography
                          component={Link}
                          href={{ pathname: '/admin/accounts/[id]', params: { id: row.id } }}
                          color='text.primary'
                          sx={{
                            fontWeight: 500,
                            textDecoration: 'none',
                            '&:hover': { color: 'primary.main' }
                          }}
                        >
                          {row.name}
                        </Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <i className='tabler-building-skyscraper' style={{ fontSize: 16 }} />
                          {row.description || 'No description'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CustomAvatar
                        skin='light'
                        color='info'
                        src={row.ownerImage}
                        sx={{ mr: 3, width: 34, height: 34, fontSize: '1rem' }}
                      >
                        {getInitials(row.ownerName || 'U')}
                      </CustomAvatar>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {row.ownerName}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {row.owner}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <CustomChip
                      round='true'
                      size='small'
                      variant='tonal'
                      color={statusColor[row.status] || 'default'}
                      label={row.status}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <CustomChip
                      size='small'
                      variant='tonal'
                      color='info'
                      label={row.plan}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' color='text.secondary'>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title='View Details'>
                        <IconButton
                          size='small'
                          component={Link}
                          href={{ pathname: '/admin/accounts/[id]', params: { id: row.id } }}
                          sx={{ color: 'text.secondary' }}
                        >
                          <i className='tabler-eye' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Edit'>
                        <IconButton
                          size='small'
                          onClick={() => {
                            setSelectedAccount(row)
                            setOpenDialog(true)
                          }}
                          sx={{ color: 'text.secondary' }}
                        >
                          <i className='tabler-edit' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton
                          size='small'
                          onClick={() => handleDeleteClick(row)}
                          sx={{ color: 'error.main' }}
                        >
                          <i className='tabler-trash' />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component='div'
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <AccountDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false)
          setSelectedAccount(null)
        }}
        onSuccess={fetchData}
        account={selectedAccount}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        handleClose={() => setDeleteDialogOpen(false)}
        title='Delete Account'
        content={`Are you sure you want to delete ${accountToDelete?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        type='delete'
      />
    </Card>
  )
}

export default AccountList
