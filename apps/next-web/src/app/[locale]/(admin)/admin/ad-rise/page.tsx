import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'

const AdminAdRisePage = () => {
  const t = useTranslations('dashboard')
  const tc = useTranslations('common')

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h3' className='mbe-2'>
          {t('navigation.ad-rise')}™
        </Typography>
        <Typography variant='body1'>
          {tc('common.comingSoon')}
        </Typography>
      </Grid>
    </Grid>
  )
}

export default AdminAdRisePage
