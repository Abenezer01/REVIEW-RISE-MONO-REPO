import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from '@mui/material';

import {
  AutoFixHigh as NarrativeIcon,
  FactCheck as AssumptionsIcon,
  FlashOn as QuickModeIcon,
  TrackChanges as GoalIcon,
  SettingsSuggest as ProModeIcon,
} from '@mui/icons-material';

import { getDailyBudget, type AllocationResult } from '../planning';
import AllocationCard from './AllocationCard';
import BudgetSummaryCard from './BudgetSummaryCard';
import ReviewHeader from './ReviewHeader';

type Props = {
  values: any;
  t: any;
  tc: any;
  theme: any;
  readOnly: boolean;
  currentSessionId?: string;
  businessBrandTone: string | null;
  narrativeData: { narrative: string; assumptions: string[] } | null;
  isNarrativeLoading: boolean;
  allocationData: AllocationResult | null;
  isAllocationLoading: boolean;
  onRetryAllocation: () => void;
  fetchNarrative: (values: any) => Promise<void>;
  onShare: () => void;
  onExport: () => void;
  onPrint: () => void;
  shareLabel: string;
};

const ReviewStep = ({
  values,
  t,
  tc,
  theme,
  readOnly,
  currentSessionId,
  businessBrandTone,
  narrativeData,
  isNarrativeLoading,
  allocationData,
  isAllocationLoading,
  onRetryAllocation,
  fetchNarrative,
  onShare,
  onExport,
  onPrint,
  shareLabel
}: Props) => {
  const budgetMath = getDailyBudget(values);
  const budgetSummary = `${t('review.totalMonthly')} / ${tc('common.currencySymbol') || '$'}${budgetMath.dailyBudget} ${t('budget.dailyUnit')} (${budgetMath.campaignDays} ${t('budget.days')})`;
  const regenerateLabel = 'Regenerate';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <ReviewHeader
        title={t('review.title')}
        readOnly={readOnly}
        canShare={Boolean(currentSessionId)}
        onShare={onShare}
        onExport={onExport}
        onPrint={onPrint}
        shareLabel={shareLabel}
        exportLabel={t('review.exportJson')}
        printLabel={t('review.print')}
      />

      <Paper
        elevation={0}
        sx={{
          p: 8,
          borderRadius: 5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{
          position: 'absolute',
          bottom: -40,
          right: -40,
          opacity: 0.03,
          transform: 'rotate(-15deg)'
        }}>
          <GoalIcon sx={{ fontSize: 240 }} />
        </Box>

        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: 2 }}>
              {t('review.sessionName')}
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, fontWeight: 800, letterSpacing: -1 }}>{values.sessionName}</Typography>

            <Stack direction="row" spacing={3} sx={{ mt: 4 }}>
              <Chip
                label={values.mode}
                color="primary"
                variant="tonal"
                sx={{ fontWeight: 700, px: 2 }}
                icon={values.mode === 'PRO' ? <ProModeIcon /> : <QuickModeIcon />}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
              {t('fields.landingPage')}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: 'primary.main', fontWeight: 700, textDecoration: 'underline', wordBreak: 'break-all' }}>
              {values.landingPage || '—'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%', p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 6, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'flex' }}>
                  <GoalIcon color="primary" />
                </Box>
                {t('review.campaignStrategy')}
              </Typography>
              <Grid container spacing={6}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {t('review.objective')}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 700, color: 'primary.main' }}>
                    {t(`goal.objectives.${values.goal}`)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {t('fields.campaignStart')} / {t('fields.campaignEnd')}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>
                    {values.campaignStart || '—'} — {values.campaignEnd || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
                    {t('review.locations')}
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    {values.locations.map((loc: string) => (
                      <Chip key={loc} label={loc} size="small" variant="outlined" sx={{ borderRadius: 1, fontWeight: 600 }} />
                    ))}
                    {values.mode === 'PRO' && (
                      <Chip
                        label={`${values.geoCenter || 'Selected area'} +${values.geoRadius}km radius`}
                        size="small"
                        color="primary"
                        variant="tonal"
                        sx={{ borderRadius: 1, fontWeight: 600 }}
                      />
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <BudgetSummaryCard
            values={values}
            theme={theme}
            t={t}
            tc={tc}
            businessBrandTone={businessBrandTone}
            budgetSummary={budgetSummary}
          />
        </Grid>
      </Grid>

      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%', p: 2, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              opacity: 0.05,
              transform: 'rotate(-10deg)'
            }}>
              <NarrativeIcon sx={{ fontSize: 120 }} />
            </Box>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'flex' }}>
                  <NarrativeIcon color="primary" />
                </Box>
                {t('review.strategyNarrative') || 'Strategy Narrative'}
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Button variant="outlined" size="small" onClick={() => fetchNarrative(values)} disabled={isNarrativeLoading}>
                  {regenerateLabel}
                </Button>
              </Box>

              {isNarrativeLoading ? (
                <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary">{t('review.generatingNarrative') || 'Generating strategy explanation...'}</Typography>
                </Box>
              ) : narrativeData ? (
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {narrativeData.narrative}
                </Typography>
              ) : (
                <Button variant="tonal" onClick={() => fetchNarrative(values)}>
                  {t('review.generateNarrative') || 'Generate Explanation'}
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', p: 2, bgcolor: alpha(theme.palette.info.main, 0.02) }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.1), display: 'flex' }}>
                  <AssumptionsIcon color="info" />
                </Box>
                {t('review.assumptions') || 'Planning Assumptions'}
              </Typography>

              {isNarrativeLoading ? (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} variant="text" height={20} />
                  ))}
                </Stack>
              ) : narrativeData?.assumptions ? (
                <Stack spacing={2}>
                  {narrativeData.assumptions.map((assumption, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ mt: 0.5, width: 6, height: 6, borderRadius: '50%', bgcolor: 'info.main', flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{assumption}</Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('review.noAssumptions') || 'Complete the narrative to see planning assumptions.'}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <AllocationCard
        values={values}
        t={t}
        theme={theme}
        allocationData={allocationData}
        isAllocationLoading={isAllocationLoading}
        onRetryAllocation={onRetryAllocation}
      />
    </Box>
  );
};

export default ReviewStep;
