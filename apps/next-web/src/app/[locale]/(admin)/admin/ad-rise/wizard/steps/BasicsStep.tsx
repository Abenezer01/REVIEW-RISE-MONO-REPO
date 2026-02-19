import { Fade, Grid, Typography } from '@mui/material';
import { FlashOn as QuickModeIcon, SettingsSuggest as ProModeIcon } from '@mui/icons-material';

import CustomInputVertical from '@core/components/custom-inputs/Vertical';

import CustomSelect from '@/components/shared/form/custom-select';
import CustomTagsInput from '@/components/shared/form/custom-tags-input';
import CustomTextBox from '@/components/shared/form/custom-text-box';

type Props = {
  values: any;
  setFieldValue: any;
  t: any;
};

const BasicsStep = ({ values, setFieldValue, t }: Props) => {
  const today = new Date().toISOString().split('T')[0];

  const industryOptions = [
    { label: 'E-commerce', value: 'ecommerce' },
    { label: 'SaaS', value: 'saas' },
    { label: 'Real Estate', value: 'real_estate' },
    { label: 'Healthcare', value: 'healthcare' },
    { label: 'Fashion & Apparel', value: 'fashion' },
    { label: 'Food & Beverage', value: 'food_beverage' },
    { label: 'Travel & Hospitality', value: 'travel' },
    { label: 'Automotive', value: 'automotive' },
    { label: 'Financial Services', value: 'finance' },
    { label: 'Legal Services', value: 'legal' },
    { label: 'Education', value: 'education' },
    { label: 'Local Business', value: 'local' }
  ];

  const isKnownIndustry = industryOptions.some((item) => item.value === values.industry);

  return (
    <Fade in timeout={500}>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12 }}>
          <CustomTextBox
            name="sessionName"
            label={t('fields.sessionName')}
            tooltip={t('fields.sessionNameTooltip')}
            placeholder="My Summer Campaign"
            fullWidth
            autoFocus
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CustomSelect
            name="industry"
            label={t('fields.industry')}
            tooltip={t('fields.industryTooltip')}
            placeholder="e.g. Health & Wellness"
            options={industryOptions}
            onValueChange={() => {
              if (values.industryCustom) {
                setFieldValue('industryCustom', '');
              }
            }}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CustomTextBox
            name="industryCustom"
            label="Industry not listed? Add your own"
            placeholder="e.g. Home Services"
            fullWidth
            helperText={isKnownIndustry ? 'Optional: add only if your industry is not in the list above.' : 'Custom industry is active and will be used for this plan.'}
            onValueChange={(val: string | number) => {
              const custom = String(val || '').trim();

              setFieldValue('industry', custom || values.industry);
            }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CustomTextBox
            name="landingPage"
            label={t('fields.landingPage')}
            tooltip={t('fields.landingPageTooltip')}
            placeholder="https://yourbrand.com/special-offer"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomTextBox
            name="campaignStart"
            label={t('fields.campaignStart')}
            tooltip={t('fields.campaignTimelineTooltip')}
            type="date"
            placeholder="YYYY-MM-DD"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: today }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomTextBox
            name="campaignEnd"
            label={t('fields.campaignEnd')}
            tooltip={t('fields.campaignTimelineTooltip')}
            type="date"
            placeholder="YYYY-MM-DD"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: values.campaignStart && values.campaignStart > today ? values.campaignStart : today }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 600 }}>
            {t('basics.mode')}
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                value: 'QUICK',
                title: t('basics.modeQuick'),
                content: t('basics.modeQuickDesc'),
                icon: <QuickModeIcon fontSize="large" color={values.mode === 'QUICK' ? 'primary' : 'action'} />
              },
              {
                value: 'PRO',
                title: t('basics.modePro'),
                content: t('basics.modeProDesc'),
                icon: <ProModeIcon fontSize="large" color={values.mode === 'PRO' ? 'primary' : 'action'} />
              }
            ].map((item) => (
              <Grid size={{ xs: 12, sm: 6 }} key={item.value}>
                <CustomInputVertical
                  type="radio"
                  name="mode"
                  selected={values.mode}
                  handleChange={(val) => setFieldValue('mode', val)}
                  data={{
                    value: item.value,
                    title: item.title,
                    content: item.content,
                    asset: item.icon
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
        {values.mode === 'PRO' && (
          <Grid size={{ xs: 12 }}>
            <CustomTagsInput
              name="competitors"
              label={t('fields.competitors')}
              tooltip={t('fields.competitorsTooltip')}
              placeholder={t('competitors.placeholder')}
              fullWidth
            />
          </Grid>
        )}
      </Grid>
    </Fade>
  );
};

export default BasicsStep;
