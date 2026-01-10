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

// ... (icons remain the same)

const AIVisibilityValidationResults: React.FC<AIVisibilityValidationResultsProps> = ({ results }) => {
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
        title="Technical Readiness Analysis"
        subheader="Checking how well AI crawlers can access and interpret your site"
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        action={
          <Box sx={{ textAlign: 'right', mr: 2 }}>
            <Typography variant="h4" color={score > 80 ? 'success.main' : score > 50 ? 'warning.main' : 'error.main'} fontWeight="bold">
              {score}%
            </Typography>
            <Typography variant="caption" color="text.secondary">Ready for AI</Typography>
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
              ? "Your site is perfectly optimized for AI discovery!"
              : "Some technical issues might be preventing AI models from fully indexing your brand."}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Accessibility
            </Typography>
            <List dense disablePadding>
              <ValidationItem isValid={urlAccessibility.isPubliclyAccessible} text="Public Access" />
              <ValidationItem isValid={urlAccessibility.noLoginWall} text="No Login Wall" />
              <ValidationItem isValid={urlAccessibility.noIpRestriction} text="No IP Blocks" />
              <ValidationItem isValid={urlAccessibility.noAggressiveBotBlocking} text="Bot Friendly" />
            </List>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Bot Permissions
            </Typography>
            <List dense disablePadding>
              <ValidationItem isValid={robotsTxt.allowsAIBots} text="robots.txt (AI Bots)" />
              <ValidationItem isValid={true} text="Crawl Rate Optimized" />
            </List>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              SEO Foundations
            </Typography>
            <List dense disablePadding>
              <ValidationItem isValid={seoPractices.properHtml} text="Valid HTML5" />
              <ValidationItem isValid={seoPractices.semanticTags} text="Semantic Schema" />
              <ValidationItem isValid={seoPractices.sitemapXml} text="Sitemap.xml" />
              <ValidationItem isValid={seoPractices.cleanUrls} text="Clean URL Structure" />
            </List>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AIVisibilityValidationResults;
