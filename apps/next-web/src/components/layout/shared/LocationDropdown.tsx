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

import apiClient from '@/lib/apiClient'

interface Location {
  id: number | string
  name: string
  address?: string
}

const LocationDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { settings } = useSettings()

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
        setLocations(response.data.data)

        // Set default selected location if none selected and we have results
        if (!selectedLocation && response.data.data.length > 0) {
          // Removed default selection to show "Select Location"
          // setSelectedLocation(response.data.data[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch locations', error)
    } finally {
      setLoading(false)
    }
  }, [selectedLocation])

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
    setSelectedLocation(location)
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
                        selected={selectedLocation?.id === location.id}
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
