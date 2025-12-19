
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

const Loading = () => {
    return (
        <Box className='is-full bs-full flex items-center justify-center p-12'>
            <CircularProgress size={40} />
        </Box>
    )
}

export default Loading
