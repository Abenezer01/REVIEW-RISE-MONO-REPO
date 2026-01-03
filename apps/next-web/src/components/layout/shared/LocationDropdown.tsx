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
import { useSettings } from '@core/hooks/useSettings'
import { useAuth } from '@/contexts/AuthContext'
import { useLocationFilter } from '@/hooks/useLocationFilter'

import apiClient from '@/lib/apiClient'

interface Location {
  id: number | string
  name: string
  address?: string
}

const LocationDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  // Removed local selectedLocation state in favor of URL param lookup
  // const [selectedLocation, setSelectedLocation] = useState<Location | null>(null) 
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { settings } = useSettings()
  const { locationId, setLocationId } = useLocationFilter()

  // Derived state for display
  const selectedLocation = locations.find(l => String(l.id) === locationId) || null

  // Set default location from user profile if not set in URL
  const { user } = useAuth()
  useEffect(() => {
    // console.log('LocationDropdown Debug:', { locationId, userLocationId: user?.locationId, user })
    if (!locationId) {
        if (user?.locationId) {
             // Case 1: Use cached location from session
            // console.log('Setting default location from User Session:', user.locationId)
            setLocationId(user.locationId)
        } else if (locations.length > 0) {
            // Case 2: User has no locationId in session, but we have fetched locations. Select the first one.
            // console.log('Setting default location from First Available:', locations[0].id)
            setLocationId(locations[0].id)
        }
    }
  }, [locationId, user?.locationId, setLocationId, locations])

  const fetchLocations = useCallback(async (search = '') => {
    try {
      setLoading(true)

      const response = await apiClient.get('/admin/locations', {
        params: {
          limit: 10,
          status: 'active',
          search
        }
      })

      if (response.data && response.data.data) {
        const fetchedLocations = response.data.data
        setLocations(fetchedLocations)

        // If no location is selected in URL, and we have locations, select the first one by default?
        // OR just leave it empty. The original code had commented out default selection.
        // Let's respect the "global" nature: if URL has ID, we use it. 
        // If not, we could arguably default to the first one, but let's stick to explicit selection for now unless requested.
        
        // However, we need to ensure the selected location from URL is actually in the list 
        // if we want to display its name correctly. 
        // If the list is paginated/searched, we might not have the selected location in the initial list.
        // For now, assuming the initial list contains the selected one or we just show "Select Location".
      }
    } catch (error) {
      console.error('Failed to fetch locations', error)
    } finally {
      setLoading(false)
    }
  }, []) // Removed dependency on selectedLocation to avoid loops

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
            {selectedLocation?.name || 'Select Location'}
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
                      placeholder='Search locations...'
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

                  {/* Fixed "Use Current Location" Option - functionality to be implemented */}
                  {/* <MenuItem onClick={() => handleLocationSelect({ id: 'current', name: 'Use Current Location', address: '' })} sx={{ gap: 2, color: 'primary.main' }}>
                        <i className='tabler-current-location' />
                        <Typography color='inherit'>Use Current Location</Typography>
                    </MenuItem> */}

                  {locations.length === 0 && !loading ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">No locations found</Typography>
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
