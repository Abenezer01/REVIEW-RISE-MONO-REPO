import { Box, Card, CardContent, Stack, Typography, alpha } from '@mui/material';
import { AttachMoney as BudgetIcon } from '@mui/icons-material';

type Props = {
  values: any;
  theme: any;
  t: any;
  tc: any;
  businessBrandTone: string | null;
  budgetSummary: string;
};

const BudgetSummaryCard = ({ values, theme, t, tc, businessBrandTone, budgetSummary }: Props) => {
  return (
    <Card sx={{ height: '100%', p: 2, bgcolor: alpha(theme.palette.success.main, 0.02) }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 6, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.success.main, 0.1), display: 'flex' }}>
            <BudgetIcon color="success" />
          </Box>
          {t('review.budgetLogistics')}
        </Typography>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{ color: 'success.main', fontWeight: 900 }}>
            {tc('common.currencySymbol') || '$'}{values.budgetMonthly}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {budgetSummary}
          </Typography>
        </Box>

        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{t('fields.industry')}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, textTransform: 'capitalize' }}>{values.industry}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{t('fields.brandTone')}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, textTransform: 'capitalize' }}>{values.brandTone || businessBrandTone}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BudgetSummaryCard;
