import { Fade, Grid, Typography } from '@mui/material';

import CustomTagsInput from '@/components/shared/form/custom-tags-input';
import CustomTextBox from '@/components/shared/form/custom-text-box';
import { countries } from '@/shared/utils/countries';

type Props = {
  values: any;
  t: any;
  tc: any;
};

const GeoStep = ({ values, t, tc }: Props) => {
  const specificAreaLabel = 'Primary target area (city, district, or address)';
  const specificAreaPlaceholder = 'e.g. Bole, Addis Ababa';
  const specificAreaHint = 'Required for radius targeting in Pro mode.';

  return (
    <Fade in timeout={500}>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12 }}>
          <CustomTagsInput
            name="locations"
            label={t('fields.locations')}
            tooltip={t('fields.locationsTooltip')}
            placeholder={t('geo.countryPlaceholder') || 'Select target countries...'}
            options={countries}
            fullWidth
          />
        </Grid>
        {values.mode === 'PRO' && (
          <>
            <Grid size={{ xs: 12 }}>
              <CustomTextBox
                name="geoCenter"
                label={specificAreaLabel}
                placeholder={specificAreaPlaceholder}
                fullWidth
                helperText={specificAreaHint}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextBox
                name="geoRadius"
                label={t('fields.geoRadius')}
                tooltip={t('fields.geoRadiusTooltip')}
                type="number"
                placeholder="10"
                fullWidth
                InputProps={{
                  endAdornment: <Typography sx={{ ml: 1 }}>{tc('common.distanceUnit') || 'km'}</Typography>
                }}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Fade>
  );
};

export default GeoStep;
