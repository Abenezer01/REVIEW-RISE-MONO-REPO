/* eslint-disable import/no-unresolved */
'use client'

// React Imports
import { useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const NotificationDropdown = () => {
  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)

  // Hooks
  const { settings } = useSettings()

  const handleDropdownOpen = () => {
    setOpen(prev => !prev)
  }

  const handleDropdownClose = (event?: ReactMouseEvent | MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleDropdownOpen}
        className='text-textPrimary'
        aria-label='notifications'
      >
        <Badge badgeContent={3} color='error'>
          <i className='tabler-bell' />
        </Badge>
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[300px] !mbs-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={handleDropdownClose}>
                <MenuList sx={{ p: 0 }}>
                  <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant='h6'>Notifications</Typography>
                    <Badge color='primary' badgeContent={3} sx={{ '& .MuiBadge-badge': { position: 'relative', transform: 'none' } }} />
                  </Box>
                  <Divider />
                  <MenuItem onClick={handleDropdownClose} sx={{ p: 3, gap: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant='subtitle2' fontWeight={600}>New Review Received</Typography>
                        <Typography variant='body2' color='text.secondary'>
                            You received a 5-star review from John Doe.
                        </Typography>
                        <Typography variant='caption' color='text.disabled'>Today, 10:30 AM</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem onClick={handleDropdownClose} sx={{ p: 3, gap: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant='subtitle2' fontWeight={600}>System Alert</Typography>
                        <Typography variant='body2' color='text.secondary'>
                            Your daily SEO report is ready to view.
                        </Typography>
                        <Typography variant='caption' color='text.disabled'>Yesterday, 2:15 PM</Typography>
                    </Box>
                  </MenuItem>
                  <Divider />
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button fullWidth variant='contained' size='small' onClick={() => setOpen(false)}>
                      View All Notifications
                    </Button>
                  </Box>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default NotificationDropdown
