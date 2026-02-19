import React from 'react';

import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  LinearProgress,
  Alert,
  Grid,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import { useTranslation } from '@/hooks/useTranslation';
import {
  type AiVisibilityValidationResults,
} from './AIVisibilityValidationTypes';

interface AIVisibilityValidationResultsProps {
  results: AiVisibilityValidationResults;
}

const ValidationItem: React.FC<{ isValid: boolean; text: string; message?: string }> = ({ isValid, text, message }) => (
  <ListItem dense sx={{ py: 0.5 }}>
    <ListItemIcon sx={{ minWidth: 40 }}>
      {isValid ? <CheckCircleOutlineIcon color="success" /> : <ErrorOutlineIcon color="error" />}
    </ListItemIcon>
    <ListItemText
      primary={text}
      secondary={message && <Typography variant="caption" color="textSecondary">{message}</Typography>}
    />
  </ListItem>
);

const AIVisibilityValidationResults: React.FC<AIVisibilityValidationResultsProps> = ({ results }) => {
  const t = useTranslation('dashboard');
  const { urlAccessibility, robotsTxt, seoPractices } = results;

  const checks = [
    urlAccessibility.isPubliclyAccessible,
    urlAccessibility.noLoginWall,
    urlAccessibility.noIpRestriction,
    urlAccessibility.noAggressiveBotBlocking,
    robotsTxt.allowsAIBots,
    seoPractices.properHtml,
    seoPractices.semanticTags,
    seoPractices.sitemapXml,
    seoPractices.cleanUrls
  ]

  const passed = checks.filter(Boolean).length
  const score = Math.round((passed / checks.length) * 100)

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <CardHeader
        title={t('aiVisibility.validation.title')}
        subheader={t('aiVisibility.validation.subtitle')}
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        action={
          <Box sx={{ textAlign: 'right', mr: 2 }}>
            <Typography variant="h4" color={score > 80 ? 'success.main' : score > 50 ? 'warning.main' : 'error.main'} fontWeight="bold">
              {score}%
            </Typography>
            <Typography variant="caption" color="text.secondary">{t('aiVisibility.validation.readyForAI')}</Typography>
          </Box>
        }
      />
      <LinearProgress
        variant="determinate"
        value={score}
        color={score > 80 ? 'success' : score > 50 ? 'warning' : 'error'}
        sx={{ height: 4 }}
      />
      <CardContent>
        {score < 100 && (
          <Alert severity={score > 70 ? 'info' : 'warning'} sx={{ mb: 3 }}>
            {score === 100
              ? t('aiVisibility.validation.perfectOptimized')
              : t('aiVisibility.validation.technicalIssues')}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('aiVisibility.validation.accessibility')}
            </Typography>
            <List dense disablePadding>
              <ValidationItem isValid={urlAccessibility.isPubliclyAccessible} text={t('aiVisibility.validation.checks.publicAccess')} />
              <ValidationItem isValid={urlAccessibility.noLoginWall} text={t('aiVisibility.validation.checks.noLoginWall')} />
              <ValidationItem isValid={urlAccessibility.noIpRestriction} text={t('aiVisibility.validation.checks.noIpBlocks')} />
              <ValidationItem isValid={urlAccessibility.noAggressiveBotBlocking} text={t('aiVisibility.validation.checks.botFriendly')} />
            </List>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('aiVisibility.validation.botPermissions')}
            </Typography>
            <List dense disablePadding>
              <ValidationItem isValid={robotsTxt.allowsAIBots} text={t('aiVisibility.validation.checks.robotsTxt')} />
              <ValidationItem isValid={true} text={t('aiVisibility.validation.checks.crawlRate')} />
            </List>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('aiVisibility.validation.seoFoundations')}
            </Typography>
            <List dense disablePadding>
              <ValidationItem isValid={seoPractices.properHtml} text={t('aiVisibility.validation.checks.validHtml')} />
              <ValidationItem isValid={seoPractices.semanticTags} text={t('aiVisibility.validation.checks.semanticSchema')} />
              <ValidationItem isValid={seoPractices.sitemapXml} text={t('aiVisibility.validation.checks.sitemap')} />
              <ValidationItem isValid={seoPractices.cleanUrls} text={t('aiVisibility.validation.checks.cleanUrls')} />
            </List>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AIVisibilityValidationResults;
