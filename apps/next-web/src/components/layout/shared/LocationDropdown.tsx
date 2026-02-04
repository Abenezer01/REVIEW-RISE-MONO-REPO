/* eslint-disable import/no-unresolved */
'use client'

// React Imports
import { useRef, useState, useEffect, useCallback } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

// MUI Imports
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'

// Hook Imports
import { useTranslations } from 'next-intl'

import { useSettings } from '@core/hooks/useSettings'
import { useAuth } from '@/contexts/AuthContext'
import { useLocationFilter } from '@/hooks/useLocationFilter'

import apiClient from '@/lib/apiClient'
import { SERVICES } from '@/configs/services'

interface Location {
  id: number | string
  name: string
  address?: string
}

const LocationDropdown = () => {
  const t = useTranslations('dashboard')
  const tc = useTranslations('common.common')

  // States
  const [open, setOpen] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { settings } = useSettings()
  const { locationId, setLocationId } = useLocationFilter()

  // Derived state for display
  const selectedLocation = locationId ? locations.find(l => String(l.id) === locationId) || null : null

  // Set default location from user profile if not set in URL
  const { user } = useAuth()

  useEffect(() => {
    if (!locationId) {
      if (user?.locationId) {
        setLocationId(user.locationId)
      } else if (locations.length > 0) {
        setLocationId(locations[0].id)
      }
    }
  }, [locationId, user?.locationId, setLocationId, locations])

  const fetchLocations = useCallback(async (search = '') => {
    try {
      setLoading(true)

      // Use apiClient (auto-unwraps data field)
      const response = await apiClient.get<{ data: Location[] }>(`${SERVICES.admin.url}/locations`, {
        params: {
          limit: 10,
          status: 'active',
          search
        }
      })

      if (response.data) {
        setLocations(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch locations', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch initial locations
  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  // Debounced search when dropdown is open
  useEffect(() => {
    if (!open) return

    const timer = setTimeout(() => {
      fetchLocations(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, open, fetchLocations])

  const handleDropdownOpen = () => {
    setOpen(prev => !prev)
  }

  const handleDropdownClose = (event?: ReactMouseEvent | MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleLocationSelect = (location: Location) => {
    setLocationId(location.id)
    setOpen(false)
  }

  return (
    <>
      <Box
        ref={anchorRef}
        onClick={handleDropdownOpen}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          padding: '6px 12px',
          borderRadius: 1,
          border: theme => `1px solid ${theme.palette.divider}`,
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
      >
        <i className='tabler-map-pin text-primary' />
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography variant='body2' fontWeight={600} noWrap sx={{ maxWidth: 150 }}>
            {selectedLocation?.name || t('locations.detail.tabs.overview')}
          </Typography>
        </Box>
        <i className='tabler-chevron-down text-textSecondary' style={{ fontSize: '1rem' }} />
      </Box>

      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-start'
        anchorEl={anchorRef.current}
        className='min-is-[350px] !mbs-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-start' ? 'left top' : 'right top'
            }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={handleDropdownClose}>
                <MenuList sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}>
                    <TextField
                      fullWidth
                      size='small'
                      placeholder={t('locations.detail.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <i className='tabler-search text-textSecondary' />
                          </InputAdornment>
                        ),
                        endAdornment: loading ? (
                          <InputAdornment position='end'>
                            <CircularProgress size={20} />
                          </InputAdornment>
                        ) : null
                      }}
                    />
                  </Box>

                  {locations.length === 0 && !loading ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">{tc('no-items')}</Typography>
                    </Box>
                  ) : (
                    locations.map((location) => (
                      <MenuItem
                        key={location.id}
                        onClick={() => handleLocationSelect(location)}
                        selected={String(selectedLocation?.id) === String(location.id)}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography>{location.name}</Typography>
                          {location.address && (
                            <Typography variant='caption' color='text.secondary'>{location.address}</Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default LocationDropdown
