import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'

const AdminSeoIntelligencePage = () => {
  const t = useTranslations('dashboard')

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h3' className='mbe-2'>
          {t('navigation.seo-intelligence')}
        </Typography>
        <Typography variant='body1'>
          {t('seo.visibility.subtitle')}
        </Typography>
      </Grid>
    </Grid>
  )
}

export default AdminSeoIntelligencePage
