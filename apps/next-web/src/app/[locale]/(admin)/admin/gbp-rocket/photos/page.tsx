'use client'

import { Box } from '@mui/material'
import { useTranslations } from 'next-intl'
import { useLocationFilter } from '@/hooks/useLocationFilter'
import { LocationPhotosSection } from '@/components/admin/locations/social/gbp-photos/LocationPhotosSection'

const AdminGBPRocketPhotosPage = () => {
    const t = useTranslations('gbpRocket.photos')
    const { locationId } = useLocationFilter()

    return (
        <Box>
            {locationId ? (
                <LocationPhotosSection locationId={locationId} />
            ) : (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    {t('selectLocation')}
                </Box>
            )}
        </Box>
    )
}

export default AdminGBPRocketPhotosPage
