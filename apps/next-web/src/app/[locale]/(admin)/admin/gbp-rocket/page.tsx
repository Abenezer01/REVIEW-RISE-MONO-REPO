import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'

const AdminGBPRocketPage = () => {
  const t = useTranslations('dashboard')
  const tc = useTranslations('common')

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h3' className='mbe-2'>
          {t('navigation.gbp-rocket')}™
        </Typography>
        <Typography variant='body1'>
          {tc('common.comingSoon')}
        </Typography>
      </Grid>
    </Grid>
  )
}

export default AdminGBPRocketPage
