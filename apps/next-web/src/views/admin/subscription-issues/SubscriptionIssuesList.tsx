/* eslint-disable import/no-unresolved */
'use client'

import { useState, useEffect } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import toast from 'react-hot-toast'
import type { GridColDef } from '@mui/x-data-grid'

// Core Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'
import ItemsListing from '@components/shared/listing'

import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig'
import { Link } from '@/i18n/routing'

import {
  getSubscriptionIssues,
  markSubscriptionAsContacted,
  toggleSubscriptionStatus,
  type SubscriptionIssue
} from '@/app/actions/subscription-issues'

// Utils
const getInitials = (string: string) =>
  string.split(/\s/).reduce((response, word) => (response += word.slice(0, 1)), '')

const SubscriptionIssuesList = () => {
  const [data, setData] = useState<SubscriptionIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<SubscriptionIssue | null>(null)

  // Client-side pagination for now since the list of issues shouldn't be huge
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const fetchData = async () => {
    setLoading(true)
    const issues = await getSubscriptionIssues()

    setData(issues)

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleMarkContacted = async (id: string) => {
    const res = await markSubscriptionAsContacted(id)

    if (res.success) {
      toast.success('Marked as contacted')
      fetchData()
    } else {
      toast.error(res.message || 'Failed to update')
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    const res = await toggleSubscriptionStatus(id, newStatus)

    if (res.success) {
      toast.success(`Subscription ${newStatus === 'active' ? 'resumed' : 'paused'}`)
      fetchData()
    } else {
      toast.error(res.message || 'Failed to update status')
    }
  }

  const handleViewDetails = (issue: SubscriptionIssue) => {
    setSelectedIssue(issue)
    setDetailOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailOpen(false)
    setSelectedIssue(null)
  }

  const statusColor: any = {
    active: 'success',
    canceled: 'error',
    past_due: 'error',
    unpaid: 'error',
    paused: 'warning',
    trialing: 'info'
  }

  const issueReasonColor: any = {
    'Insufficient funds or exceeded credit limit': 'error',
    'Fraud suspicion or security flags': 'warning',
    'Technical or processing issues': 'info',
    'Generic or bank-specific declines': 'secondary',
    'Other restrictions': 'secondary'
  }

  const columns: GridColDef[] = [
    {
      field: 'businessName',
      headerName: 'Business',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CustomAvatar
            skin='light'
            color='primary'
            sx={{ mr: 3, width: 34, height: 34, fontSize: '1rem' }}
          >
            {getInitials(params.row.businessName || 'B')}
          </CustomAvatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              component={Link}
              href={{ pathname: '/admin/accounts/[id]', params: { id: params.row.businessId } }}
              color='text.primary'
              sx={{
                fontWeight: 500,
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {params.row.businessName}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {params.row.plan} Plan
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <CustomChip
            round='true'
            size='small'
            variant='tonal'
            color={statusColor[params.value] || 'secondary'}
            label={params.value}
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>
      )
    },
    {
      field: 'latestIssueDetails.reason',
      headerName: 'Issue Reason',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        params.row.latestIssueDetails && (params.row.latestIssueDetails as any).reason ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <CustomChip
              round='true'
              size='small'
              variant='tonal'
              color={issueReasonColor[(params.row.latestIssueDetails as any).reason] || 'secondary'}
              label={(params.row.latestIssueDetails as any).reason}
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
        ) : (
          <Typography variant='body2' color='text.disabled'>
            N/A
          </Typography>
        )
      )
    },
    {
      field: 'currentPeriodEnd',
      headerName: 'Period End',
      minWidth: 150,
      valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
      renderCell: (params) => {
        const isExpired = new Date(params.value) < new Date()

        return (
          <Typography variant='body2' color={isExpired ? 'error.main' : 'text.primary'}>
            {new Date(params.value).toLocaleDateString()}
            {isExpired && ' (Expired)'}
          </Typography>
        )
      }
    },
    {
      field: 'contactedAt',
      headerName: 'Last Contacted',
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          {params.value ? (
            <>
              <Typography variant='body2'>
                {new Date(params.value).toLocaleDateString()}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                by {params.row.contactedBy || 'Admin'}
              </Typography>
              {params.row.latestIssueDetails && ((params.row.latestIssueDetails as any).note || (params.row.latestIssueDetails as any).notes) && (
                <Typography variant='caption' color='text.secondary'>
                  ({(params.row.latestIssueDetails as any).note || (params.row.latestIssueDetails as any).notes})
                </Typography>
              )}
            </>
          ) : (
            <Typography variant='body2' color='text.disabled'>
              Never
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={params.row.status === 'active' ? 'Pause Subscription' : 'Resume Subscription'}>
            <IconButton
              size='small'
              onClick={() => handleToggleStatus(params.row.id, params.row.status)}
              sx={{ color: params.row.status === 'active' ? 'warning.main' : 'success.main' }}
            >
              <i className={params.row.status === 'active' ? 'tabler-player-pause' : 'tabler-player-play'} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Mark as Contacted'>
            <IconButton
              size='small'
              onClick={() => handleMarkContacted(params.row.id)}
              sx={{ color: 'info.main' }}
            >
              <i className='tabler-mail-forward' />
            </IconButton>
          </Tooltip>
          <Tooltip title='View Account Details'>
            <IconButton
              size='small'
              onClick={() => handleViewDetails(params.row)}
              sx={{ color: 'text.secondary' }}
            >
              <i className='tabler-eye' />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  // Pagination logic
  const paginatedData = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage)

  return (
    <>
      <Dialog open={detailOpen} onClose={handleCloseDetails} maxWidth='sm' fullWidth>
        <DialogTitle>Billing Issue Detail</DialogTitle>
        <DialogContent dividers>
          {selectedIssue && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CustomAvatar skin='light' color='primary' sx={{ width: 34, height: 34, fontSize: '1rem' }}>
                  {getInitials(selectedIssue.businessName || 'B')}
                </CustomAvatar>
                <Box>
                  <Typography variant='h6' sx={{ lineHeight: 1 }}>{selectedIssue.businessName}</Typography>
                  <Typography variant='body2' color='text.secondary'>{selectedIssue.plan} Plan</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap' }}>
                <CustomChip
                  round='true'
                  size='small'
                  variant='tonal'
                  color={statusColor[selectedIssue.status] || 'secondary'}
                  label={selectedIssue.status}
                  sx={{ textTransform: 'capitalize' }}
                />
                {selectedIssue.latestIssueDetails && (selectedIssue.latestIssueDetails as any).reason && (
                  <CustomChip
                    round='true'
                    size='small'
                    variant='tonal'
                    color={issueReasonColor[(selectedIssue.latestIssueDetails as any).reason] || 'secondary'}
                    label={(selectedIssue.latestIssueDetails as any).reason}
                    sx={{ textTransform: 'capitalize' }}
                  />
                )}
              </Box>
              {selectedIssue.latestIssueDetails && (selectedIssue.latestIssueDetails as any).notes && (
                <Box>
                  <Typography variant='subtitle2'>Notes</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {(selectedIssue.latestIssueDetails as any).notes}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant='subtitle2'>Details</Typography>
                <Box
                  component='pre'
                  sx={{
                    backgroundColor: theme => theme.palette.action.hover,
                    p: 2,
                    borderRadius: 1,
                    border: theme => `1px solid ${theme.palette.divider}`,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.8125rem',
                    m: 0,
                    maxHeight: 200
                  }}
                >
                  {JSON.stringify(selectedIssue.latestIssueDetails || {}, null, 2)}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} variant='outlined' color='secondary'>Close</Button>
        </DialogActions>
      </Dialog>
      <Card sx={{ mb: 6 }}>
        <CardHeader
          title='Subscription Issues'
          subheader='Monitor and manage billing problems'
        />
        <Divider />
        <CardContent>
          <Typography variant='body2' color='text.secondary'>
            Showing accounts with expired subscriptions, payment failures, or other billing issues.
          </Typography>
        </CardContent>
      </Card>

      <ItemsListing
        type={ITEMS_LISTING_TYPE.table.value}
        items={paginatedData}
        isLoading={loading}
        pagination={{
          page: page + 1,
          pageSize: rowsPerPage,
          total: data.length,
          lastPage: Math.ceil(data.length / rowsPerPage)
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
          permission: { action: 'read', subject: 'subscription' }
        }}
      />
    </>
  )
}

export default SubscriptionIssuesList
