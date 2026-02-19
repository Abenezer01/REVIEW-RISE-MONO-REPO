import { Box, Fade, Grid, Typography } from '@mui/material';
import { TrendingUp as GoalIcon } from '@mui/icons-material';

import CustomInputVertical from '@core/components/custom-inputs/Vertical';

type Props = {
  values: any;
  setFieldValue: any;
  t: any;
};

const GoalStep = ({ values, setFieldValue, t }: Props) => {
  const helperText = 'Choose one primary objective for this campaign.';

  const selectedHeading = 'Selected objective';

  const selectedGoalSummaries: Record<string, string> = {
    awareness: 'Focuses on maximizing reach and recall, with success measured by impressions, reach, and frequency trends.',
    traffic: 'Focuses on driving qualified visits to your landing page, with success measured by click volume and landing-page engagement.',
    leads: 'Focuses on generating inquiries or form submissions, with success measured by lead volume, CPL, and lead quality signals.',
    sales: 'Focuses on purchases and revenue outcomes, with success measured by conversion volume, CPA/ROAS, and order value.'
  };

  const objectiveCards = [
    {
      value: 'awareness',
      title: t('goal.objectives.awareness'),
      content: t('goal.objectives.awarenessSubtitle')
    },
    {
      value: 'traffic',
      title: t('goal.objectives.traffic'),
      content: t('goal.objectives.trafficSubtitle')
    },
    {
      value: 'leads',
      title: t('goal.objectives.leads'),
      content: t('goal.objectives.leadsSubtitle')
    },
    {
      value: 'sales',
      title: t('goal.objectives.sales'),
      content: t('goal.objectives.salesSubtitle')
    }
  ];

  const selectedGoal = objectiveCards.find((item) => item.value === values.goal);
  const selectedSummary = values.goal ? selectedGoalSummaries[values.goal] : '';
  const selectedLabel = selectedGoal ? `${selectedHeading}: ${selectedGoal.title}` : '';

  return (
    <Fade in timeout={500}>
      <Grid container spacing={4}>
        {objectiveCards.map((item) => (
          <Grid size={{ xs: 12, sm: 6 }} key={item.value}>
            <Box>
              <CustomInputVertical
                type="radio"
                name="goal"
                selected={values.goal}
                handleChange={(val) => setFieldValue('goal', val)}
                data={{
                  value: item.value,
                  title: item.title,
                  content: item.content,
                  asset: <GoalIcon fontSize="large" color={values.goal === item.value ? 'primary' : 'action'} />
                }}
              />
            </Box>
          </Grid>
        ))}
        {selectedGoal && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {selectedLabel}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedSummary}
              </Typography>
            </Box>
          </Grid>
        )}
        <Grid size={{ xs: 12 }}>
          <Typography variant="caption" color="text.secondary">
            {helperText}
          </Typography>
        </Grid>
      </Grid>
    </Fade>
  );
};

export default GoalStep;
