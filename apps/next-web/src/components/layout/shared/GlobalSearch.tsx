'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

// Styled Component
const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  width: '100%',
  transition: 'all 0.2s ease-in-out',
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`
  }
}))

const GlobalSearch = () => {
  const [searchValue, setSearchValue] = useState('')

  return (
    <SearchContainer sx={{ display: { xs: 'none', md: 'flex' } }}>
      <TextField
        fullWidth
        size='small'
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
        placeholder='Search...'
        id='global-search-input'
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': { border: 'none' },
            '&:hover fieldset': { border: 'none' },
            '&.Mui-focused fieldset': { border: 'none' }
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <i className='tabler-search text-textSecondary' />
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position='end'>
              <IconButton size='small' onClick={() => setSearchValue('')}>
                <i className='tabler-x text-textSecondary' />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </SearchContainer>
  )
}

export default GlobalSearch
