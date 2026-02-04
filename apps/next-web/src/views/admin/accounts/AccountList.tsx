'use client'

import { useState, useEffect, useCallback } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'

import { SystemMessageCode } from '@platform/contracts'

import type { GridColDef } from '@mui/x-data-grid'

import { useTranslation } from '@/hooks/useTranslation'
import { useSystemMessages } from '@/shared/components/SystemMessageProvider'

// Core Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'
import CustomTextField from '@core/components/mui/TextField'
import ConfirmationDialog from '@components/shared/dialog/confirmation-dialog'
import ItemsListing from '@components/shared/listing'

import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig'

import { Link } from '@/i18n/routing'

import { getAccounts, deleteAccount } from '@/app/actions/account'
import AccountDialog from './AccountDialog'

// Utils
const getInitials = (string: string) =>
  string.split(/\s/).reduce((response, word) => (response += word.slice(0, 1)), '')

const AccountList = () => {
  const { notify } = useSystemMessages()
  const t = useTranslation('dashboard')
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

  const fetchData = useCallback(async () => {
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
  }, [page, rowsPerPage, filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
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
      notify(SystemMessageCode.ITEM_DELETED)
      fetchData()
    } else {
      notify(SystemMessageCode.GENERIC_ERROR)
    }

    setDeleteDialogOpen(false)
    setAccountToDelete(null)
  }

  const statusColor: any = {
    active: 'success',
    inactive: 'secondary',
    pending: 'warning'
  }

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('accounts.list.columns.account'),
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CustomAvatar
            skin='light'
            color='primary'
            sx={{ mr: 3, width: 34, height: 34, fontSize: '1rem' }}
          >
            {getInitials(params.row.name || 'A')}
          </CustomAvatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              component={Link}
              href={{ pathname: '/admin/accounts/[id]', params: { id: params.row.id } }}
              color='text.primary'
              sx={{
                fontWeight: 500,
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {params.row.name}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='tabler-building-skyscraper' style={{ fontSize: 16 }} />
              {params.row.description || t('accounts.list.noDescription')}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'ownerName',
      headerName: t('accounts.list.columns.nameEmail'),
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CustomAvatar
            skin='light'
            color='info'
            src={params.row.ownerImage}
            sx={{ mr: 3, width: 34, height: 34, fontSize: '1rem' }}
          >
            {getInitials(params.row.ownerName || 'U')}
          </CustomAvatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.primary' }}>
              {params.row.ownerName}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {params.row.owner}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'status',
      headerName: t('accounts.list.columns.status'),
      minWidth: 120,
      renderCell: (params) => (
        <CustomChip
          round='true'
          size='small'
          variant='tonal'
          color={statusColor[params.value] || 'default'}
          label={t(`common.status.${params.value}`)}
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'plan',
      headerName: t('accounts.list.columns.plan'),
      minWidth: 120,
      renderCell: (params) => (
        <CustomChip
          size='small'
          variant='tonal'
          color='info'
          label={params.value}
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'createdAt',
      headerName: t('accounts.list.columns.createdDate'),
      minWidth: 150,
      valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
      renderCell: (params) => (
        <Typography variant='body2' color='text.secondary'>
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: t('accounts.list.columns.actions'),
      sortable: false,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={t('accounts.list.tooltips.viewDetails')}>
            <IconButton
              size='small'
              component={Link}
              href={{ pathname: '/admin/accounts/[id]', params: { id: params.row.id } }}
              sx={{ color: 'text.secondary' }}
            >
              <i className='tabler-eye' />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('accounts.list.tooltips.edit')}>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedAccount(params.row)
                setOpenDialog(true)
              }}
              sx={{ color: 'text.secondary' }}
            >
              <i className='tabler-edit' />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('accounts.list.tooltips.delete')}>
            <IconButton
              size='small'
              onClick={() => handleDeleteClick(params.row)}
              sx={{ color: 'error.main' }}
            >
              <i className='tabler-trash' />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  return (
    <>
      <Card sx={{ mb: 6 }}>
        <CardHeader
          title={t('accounts.list.title')}
          action={
            <Button
              variant='contained'
              onClick={() => setOpenDialog(true)}
              startIcon={<i className='tabler-plus' />}
            >
              {t('accounts.list.createAccount')}
            </Button>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomTextField
                fullWidth
                placeholder={t('accounts.list.searchPlaceholder')}
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-search' />
                    </InputAdornment>
                  )
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-activity' />
                    </InputAdornment>
                  )
                }}
              >
                <MenuItem value=''>{t('accounts.list.allStatus')}</MenuItem>
                <MenuItem value='active'>{t('common.status.active')}</MenuItem>
                <MenuItem value='inactive'>{t('common.status.inactive')}</MenuItem>
                <MenuItem value='pending'>{t('common.status.pending')}</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomTextField
                select
                fullWidth
                defaultValue=''
                value={filters.plan}
                onChange={e => handleFilterChange('plan', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-credit-card' />
                    </InputAdornment>
                  )
                }}
              >
                <MenuItem value=''>{t('accounts.list.allPlans')}</MenuItem>
                <MenuItem value='free'>{t('accounts.accountDialog.fields.free')}</MenuItem>
                <MenuItem value='pro'>{t('accounts.accountDialog.fields.pro')}</MenuItem>
                <MenuItem value='enterprise'>{t('accounts.accountDialog.fields.enterprise')}</MenuItem>
              </CustomTextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <ItemsListing
        type={ITEMS_LISTING_TYPE.table.value}
        items={data}
        isLoading={loading}
        pagination={{
          page: page + 1,
          pageSize: rowsPerPage,
          total: total,
          lastPage: Math.ceil(total / rowsPerPage)
        }}
        onPaginationChange={(pageSize, newPage) => {
          setRowsPerPage(pageSize)
          setPage(newPage - 1)
        }}
        tableProps={{
          headers: columns
        }}
        hasListHeader={false}
        createActionConfig={{
          show: false,
          onClick: () => { },
          onlyIcon: false,
          permission: { action: 'create', subject: 'account' }
        }}
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
        title={t('accounts.list.deleteDialog.title')}
        content={t('accounts.list.deleteDialog.confirm', { name: accountToDelete?.name })}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        type='delete'
      />
    </>
  )
}

export default AccountList
