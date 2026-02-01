/* eslint-disable import/no-unresolved */
'use client'

import { useEffect, useState } from 'react'

import { 
  Box, 
  Typography, 
  CircularProgress, 
  Grid, 
  MenuItem, 
  Select, 
  FormControl, 
  Card, 
  CardContent, 
  Avatar, 
  alpha, 
  Stack,
  Paper
} from '@mui/material'
import { Store as StoreIcon, InfoOutlined as InfoIcon, SmartToy as RobotIcon } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

import { useSystemMessages } from '@platform/shared-ui'
import { SystemMessageCode } from '@platform/contracts'

import AutoReplySettings from '@/views/admin/reviews/components/AutoReplySettings'
import { getCurrentAccount } from '@/app/actions/account'
import { getBrandProfileByBusinessId, updateAutoReplySettings } from '@/app/actions/brand-profile'

const AutoReplySettingsPage = () => {
  const { notify } = useSystemMessages()
  const tDashboard = useTranslations('dashboard')
  const [businesses, setBusinesses] = useState<any[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('')
  const [brandProfile, setBrandProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const accountData = await getCurrentAccount()

        if (accountData && !('error' in accountData)) {
          const userBusinessRoles = accountData.userBusinessRoles || []
          const userBusinesses = userBusinessRoles.map((ubr: any) => ubr.business) || []

          // Unique businesses by ID to prevent duplicate key errors in the UI
          const uniqueBusinesses = Array.from(
            new Map(userBusinesses.map((b: any) => [b.id, b])).values()
          )

          setBusinesses(uniqueBusinesses)
          
          if (uniqueBusinesses.length > 0) {
            setSelectedBusinessId(uniqueBusinesses[0].id)
          }
        } else if (accountData && 'error' in accountData) {
          throw new Error(accountData.error)
        }
      } catch (error: any) {
        console.error('Failed to fetch initial data:', error)
        notify(SystemMessageCode.GENERIC_ERROR)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!selectedBusinessId) return

      setLoadingProfile(true)

      try {
        const result = await getBrandProfileByBusinessId(selectedBusinessId)
        
        if (result.success) {
          setBrandProfile(result.data)
        } else {
          setBrandProfile(null)

          notify(SystemMessageCode.BRAND_PROFILE_NOT_FOUND)
        }
      } catch (error) {
        console.error('Failed to fetch brand profile:', error)
        setBrandProfile(null)
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [selectedBusinessId])

  const handleUpdateSettings = async (data: any) => {
    if (!selectedBusinessId || isUpdating) return

    setIsUpdating(true)

    try {
      const result = await updateAutoReplySettings(selectedBusinessId, data.autoReplySettings)

      if (result.success) {
        setBrandProfile(result.data)
        notify(SystemMessageCode.SAVE_SUCCESS)
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error('Update failed:', error)
      notify(SystemMessageCode.SAVE_FAILED)
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Stack direction="row" spacing={3} alignItems="center" className="mbe-6">
          <Avatar 
            variant="rounded" 
            sx={{ 
              width: 48, 
              height: 48, 
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main'
            }}
          >
            <RobotIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant='h3'>
              {tDashboard('auto-reply')}
            </Typography>
            <Typography variant='body1' color="text.secondary">
              Configure AI-powered automated responses for your business reviews.
            </Typography>
          </Box>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Paper 
          elevation={0} 
          variant="outlined" 
          sx={{ 
            p: 4, 
            borderRadius: 3, 
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 4
          }}
        >
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar 
              sx={{ 
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1), 
                color: 'primary.main', 
                width: 44, 
                height: 44,
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              <StoreIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="800">Active Business Context</Typography>
              <Typography variant="body2" color="text.secondary">Select the business you want to configure</Typography>
            </Box>
          </Stack>
          
          <FormControl sx={{ minWidth: { xs: '100%', sm: 300 } }}>
            <Select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              disabled={isUpdating}
              size="small"
              displayEmpty
              sx={{ 
                borderRadius: 2,
                bgcolor: 'background.paper',
                fontWeight: 600,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.2)
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main'
                }
              }}
            >
              {businesses.map((business) => (
                <MenuItem key={business.id} value={business.id} sx={{ fontWeight: 600 }}>
                  {business.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12 }}>
        {loadingProfile ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 12 }}>
            <CircularProgress size={40} />
          </Box>
        ) : brandProfile ? (
          <AutoReplySettings
            profile={brandProfile}
            onUpdate={handleUpdateSettings}
            isUpdating={isUpdating}
          />
        ) : (
          <Card variant="outlined" sx={{ borderStyle: 'dashed', bgcolor: (theme) => alpha(theme.palette.background.paper, 0.5) }}>
            <CardContent sx={{ py: 10 }}>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Avatar sx={{ width: 56, height: 56, bgcolor: (theme) => alpha(theme.palette.info.main, 0.1), color: 'info.main' }}>
                  <InfoIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600">No Brand Profile Found</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                    The selected business does not have an active brand profile. Please set up a brand profile first to enable auto-reply features.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Grid>
    </Grid>
  )
}

export default AutoReplySettingsPage
