import { Fade, Grid } from '@mui/material';

import CustomTextBox from '@/components/shared/form/custom-text-box';

type Props = {
  values: any;
  t: any;
  businessBrandTone: string | null;
};

const ToneStep = ({ values, t, businessBrandTone }: Props) => {
  return (
    <Fade in timeout={500}>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12 }}>
          {values.mode === 'PRO' ? (
            <CustomTextBox
              name="brandTone"
              label={t('fields.brandTone')}
              tooltip={t('fields.brandToneTooltip')}
              placeholder={t('tone.placeholder')}
              multiline
              rows={4}
              fullWidth
            />
          ) : (
            <CustomTextBox
              name="brandTone"
              label={t('fields.brandTone')}
              tooltip={t('fields.brandToneTooltip')}
              placeholder={businessBrandTone || t('tone.placeholder')}
              disabled={Boolean(businessBrandTone)}
              fullWidth
              helperText={businessBrandTone ? t('tone.fromProfile') : (t('tone.notSet') || 'Optional in Quick mode')}
            />
          )}
        </Grid>
      </Grid>
    </Fade>
  );
};

export default ToneStep;
