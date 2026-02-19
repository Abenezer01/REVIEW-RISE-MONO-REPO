import { Box, Fade, Grid, Typography } from '@mui/material';

import CustomTextBox from '@/components/shared/form/custom-text-box';

type Props = {
  values: any;
  t: any;
};

const OfferStep = ({ values, t }: Props) => {
  return (
    <Fade in timeout={500}>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {t('offer.title')}
            </Typography>
          </Box>
          <CustomTextBox
            name="offer"
            label={t('fields.offer')}
            tooltip={t('fields.offerTooltip')}
            placeholder={t('offer.placeholder')}
            multiline
            rows={4}
            fullWidth
          />
        </Grid>
        {values.mode === 'PRO' && (
          <Grid size={{ xs: 12 }}>
            <CustomTextBox
              name="audienceNotes"
              label={t('fields.audienceNotes')}
              tooltip={t('fields.audienceNotesTooltip')}
              placeholder={t('offer.audiencePlaceholder')}
              multiline
              rows={4}
              fullWidth
            />
          </Grid>
        )}
      </Grid>
    </Fade>
  );
};

export default OfferStep;
