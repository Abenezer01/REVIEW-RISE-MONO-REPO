/* eslint-disable import/no-unresolved */
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

// Core Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const AccountLogs = ({ data }: { data: any }) => {
  return (
    <Card>
      <CardHeader
        title='Recent Activity'
        avatar={
          <CustomAvatar skin='light' variant='rounded' color='info' sx={{ width: 48, height: 48 }}>
            <i className='tabler-file-text' style={{ fontSize: '1.5rem' }} />
          </CustomAvatar>
        }
      />
      <Divider />
      <CardContent>
        {data.auditLogs?.length > 0 ? (
          <Box component='ul' sx={{ p: 0, m: 0, listStyle: 'none' }}>
            {data.auditLogs.map((log: any, index: number) => (
              <Box
                component='li'
                key={log.id}
                sx={{
                  display: 'flex',
                  gap: 3,
                  pb: index === data.auditLogs.length - 1 ? 0 : 4,
                  mb: index === data.auditLogs.length - 1 ? 0 : 4,
                  borderBottom:
                    index === data.auditLogs.length - 1
                      ? 'none'
                      : theme => `1px dashed ${theme.palette.divider}`
                }}
              >
                <CustomAvatar skin='light' color='info' size={38} sx={{ mt: 1 }}>
                  <i className='tabler-activity' style={{ fontSize: 20 }} />
                </CustomAvatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap' }}>
                    <Typography variant='h6' sx={{ fontWeight: 600 }}>{log.action}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {new Date(log.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <i className='tabler-user' style={{ fontSize: 16, marginRight: 6, opacity: 0.7 }} />
                    <Typography variant='body2' color='text.secondary'>
                      {log.userId}
                    </Typography>
                  </Box>
                  <Box
                    component='pre'
                    sx={{
                      background: theme => theme.palette.action.hover,
                      p: 3,
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.8125rem',
                      m: 0,
                      maxHeight: 200,
                      fontFamily: 'monospace'
                    }}
                  >
                    {JSON.stringify(log.details, null, 2)}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CustomAvatar
              skin='light'
              color='secondary'
              sx={{ width: 56, height: 56, mb: 2, mx: 'auto' }}
            >
              <i className='tabler-file-off' style={{ fontSize: 28 }} />
            </CustomAvatar>
            <Typography variant='h6' sx={{ mb: 1 }}>No audit logs found</Typography>
            <Typography variant='body2' color='text.secondary'>
              Activity will appear here once actions are performed.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default AccountLogs
