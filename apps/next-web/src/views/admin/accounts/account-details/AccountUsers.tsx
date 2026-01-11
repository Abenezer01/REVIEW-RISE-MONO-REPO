/* eslint-disable import/no-unresolved */
import { useMemo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

// Third-party Imports
import { type GridColDef } from '@mui/x-data-grid'

// Core Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'
import ItemsListing from '@components/shared/listing'

// Hook Imports
import useTranslation from '@/hooks/useTranslation'

// Configs & Types
import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig'
import { defaultCreateActionConfig } from '@/types/general/listing'

// Utils
const getInitials = (string: string) =>
  string.split(/\s/).reduce((response, word) => (response += word.slice(0, 1)), '')

interface AccountUsersProps {
  usersData: { data: any[], meta: any }
  usersLoading: boolean
  setUserPage: (page: number) => void
  setUserPageSize: (size: number) => void
  setUserSearch: (search: string) => void
  handleCreateUser: () => void
  handleEditUser: (user: any) => void
  handleDeleteUser: (user: any) => void
}

const AccountUsers = ({
  usersData,
  usersLoading,
  setUserPage,
  setUserPageSize,
  setUserSearch,
  handleCreateUser,
  handleEditUser,
  handleDeleteUser
}: AccountUsersProps) => {
  const t = useTranslation('dashboard')

  const userColumns = useMemo<GridColDef<any>[]>(() => [
    {
      flex: 0.25,
      minWidth: 200,
      field: 'name',
      headerName: t('accounts.users.columns.user'),
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CustomAvatar
              skin='light'
              color='primary'
              src={row.image}
              sx={{ mr: 3, width: 34, height: 34, fontSize: '1rem' }}
            >
              {getInitials(row.name || 'User')}
            </CustomAvatar>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                {row.name}
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                {row.email}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.25,
      minWidth: 200,
      field: 'email',
      headerName: t('accounts.users.columns.email'),
      valueGetter: (value, row) => row.email
    },
    {
      flex: 0.15,
      minWidth: 120,
      field: 'role',
      headerName: t('accounts.users.columns.role'),
      renderCell: ({ row }) => (
        <CustomChip
          size='small'
          label={row.role}
          color='primary'
          variant='tonal'
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'actions',
      headerName: t('accounts.users.columns.actions', { defaultValue: 'Actions' }),
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={t('accounts.users.actions.edit', { defaultValue: 'Edit' })}>
            <IconButton size='small' onClick={() => handleEditUser(row)}>
              <i className='tabler-edit' />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('accounts.users.actions.delete', { defaultValue: 'Delete' })}>
            <IconButton size='small' onClick={() => handleDeleteUser(row)} sx={{ color: 'error.main' }}>
              <i className='tabler-trash' />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [handleEditUser, handleDeleteUser, t])

  return (
    <ItemsListing
      title={t('accounts.users.title')}
      subtitle={t('accounts.users.subtitle')}
      type={ITEMS_LISTING_TYPE.table.value}
      items={usersData.data}
      isLoading={usersLoading}
      tableProps={{
        headers: userColumns
      }}
      pagination={{
        page: usersData.meta.page,
        pageSize: usersData.meta.limit,
        total: usersData.meta.total,
        lastPage: usersData.meta.pages
      }}
      onPaginationChange={(pageSize, page) => {
        setUserPage(page)
        setUserPageSize(pageSize)
      }}
      hasListHeader={true}
      features={{
        search: {
          enabled: true,
          onSearch: (term) => setUserSearch(term),
          searchKeys: ['name', 'email'],
          placeholder: t('accounts.users.searchPlaceholder'),
          permission: { action: 'read', subject: 'user' }
        }
      }}
      createActionConfig={{
        ...defaultCreateActionConfig,
        onClick: handleCreateUser
      }}
    />
  )
}

export default AccountUsers
