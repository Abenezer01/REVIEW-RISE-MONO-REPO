import { Box, Button, Card, CardContent, CircularProgress, Grid, Stack, Tooltip, Typography, alpha } from '@mui/material';
import { InfoOutlined as InfoIcon, LocalOffer as OfferIcon, TrendingUp as GoalIcon } from '@mui/icons-material';

import { getPacingCurve, type AllocationResult } from '../planning';

type Props = {
  values: any;
  theme: any;
  t: any;
  allocationData?: AllocationResult | null;
  isAllocationLoading?: boolean;
  onRetryAllocation?: () => void;
};

const AllocationCard = ({ values, theme, t, allocationData = null, isAllocationLoading = false, onRetryAllocation }: Props) => {
  const allocation = allocationData;

  const stageTooltips: Record<'awareness' | 'consideration' | 'conversion', string> = {
    awareness: 'Awareness: reach/new audience',
    consideration: 'Consideration: traffic/engagement/interest',
    conversion: 'Conversion: leads/sales actions'
  };

  const pacingCurve = getPacingCurve(values);

  const channelSplitSummary = allocation
    ? `Channel split: Google ${allocation.channelSplit.google}% / Meta ${allocation.channelSplit.meta}%`
    : '';

  const pacingCurveSummary = `Pacing curve: ${pacingCurve.map((point) => `${point.label} ${point.weight}%`).join(' | ')}`;

  const tradeoffsTitle = 'Budget tradeoffs';
  const loadingText = 'Generating AI allocation...';
  const unavailableText = 'AI allocation is unavailable. Try regenerating from the review step.';
  const retryLabel = 'Retry AI allocation';

  const simplifyTradeoff = (text: string) => {
    const normalized = (text || '').trim();

    if (!normalized) return normalized;

    return normalized
      .replace(/CPC/gi, 'cost per click')
      .replace(/CTR/gi, 'click rate')
      .replace(/CPA/gi, 'cost per lead/sale')
      .replace(/ROAS/gi, 'return from ad spend')
      .replace(/fragmented/gi, 'spread too thin')
      .replace(/upper-funnel/gi, 'awareness stage')
      .replace(/lower-funnel|bottom-funnel/gi, 'conversion stage')
      .replace(/prospecting/gi, 'finding new customers')
      .replace(/intent/gi, 'buyer interest');
  };

  return (
    <Card sx={{ p: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 6, fontWeight: 800 }}>
          {t('review.channelAllocation')}
        </Typography>

        {isAllocationLoading ? (
          <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              {loadingText}
            </Typography>
          </Box>
        ) : !allocation ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {unavailableText}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={onRetryAllocation}
              disabled={!onRetryAllocation}
            >
              {retryLabel}
            </Button>
          </Box>
        ) : (
        <Stack spacing={6}>
          <Grid container spacing={8}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                {channelSplitSummary}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {pacingCurveSummary}
              </Typography>
            </Grid>
            {[
              { platform: 'Google Ads', icon: <GoalIcon />, color: theme.palette.primary.main, data: allocation.google },
              { platform: 'Meta (FB/IG)', icon: <OfferIcon />, color: theme.palette.secondary.main, data: allocation.meta }
            ].map((item) => {
              return (
              <Grid size={{ xs: 12, md: 6 }} key={item.platform}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 4, color: item.color, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {item.icon} {item.platform}
                </Typography>
                <Stack spacing={4}>
                  {(['awareness', 'consideration', 'conversion'] as const).map((stage) => (
                    <Box key={stage}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
                            {t(`budget.${stage}`)}
                          </Typography>
                          <Tooltip title={stageTooltips[stage]} placement="top" arrow>
                            <InfoIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          </Tooltip>
                        </Stack>
                        <Typography variant="caption" sx={{ fontWeight: 900 }}>{item.data[stage as keyof typeof item.data]}%</Typography>
                      </Box>
                      <Box sx={{ height: 8, width: '100%', bgcolor: 'action.hover', borderRadius: 10, overflow: 'hidden' }}>
                        <Box sx={{
                          height: '100%',
                          width: `${item.data[stage as keyof typeof item.data]}%`,
                          bgcolor: item.color,
                          borderRadius: 10,
                          boxShadow: `0 0 10px ${alpha(item.color, 0.4)}`
                        }} />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            );
            })}
          </Grid>

          {allocation.tradeoffs.length > 0 && (
            <Box sx={{ p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.06), border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                {tradeoffsTitle}
              </Typography>
              <Stack spacing={1}>
                {allocation.tradeoffs.map((tradeoff, idx) => (
                  <Typography key={idx} variant="body2" color="text.secondary">
                    • {simplifyTradeoff(tradeoff)}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default AllocationCard;
