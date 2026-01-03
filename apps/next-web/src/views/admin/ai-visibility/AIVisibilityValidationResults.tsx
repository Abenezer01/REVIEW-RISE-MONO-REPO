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

const AIVisibilityValidationResults: React.FC<AIVisibilityValidationResultsProps> = ({ results }) => {
  const { urlAccessibility, robotsTxt, seoPractices } = results;

  return (
    <Card
      elevation={5} // Increased elevation for a more premium feel
      sx={{
        borderRadius: 2, // Slightly rounded corners
        border: '1px solid', // Subtle border
        borderColor: 'grey.300', // Light grey border color
        bgcolor: 'background.paper', // Ensure consistent background
        overflow: 'hidden', // Hide overflow for rounded corners
      }}
    >
      <CardHeader
        title="URL Validation Results"
        titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
        sx={{ pb: 1.5 }} // Adjust padding bottom
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="h6" sx={{ mb: 1.5, mt: 2 }}>Accessibility Checks</Typography>
        <List dense>
          <ValidationItem
            isValid={urlAccessibility.isPubliclyAccessible}
            text="Publicly Accessible"
            message={urlAccessibility.message}
          />
          <ValidationItem
            isValid={urlAccessibility.noLoginWall}
            text="No Login Wall Detected"
            message={urlAccessibility.message}
          />
          <ValidationItem
            isValid={urlAccessibility.noIpRestriction}
            text="No IP Restriction Detected"
            message={urlAccessibility.message}
          />
          <ValidationItem
            isValid={urlAccessibility.noAggressiveBotBlocking}
            text="No Aggressive Bot Blocking Detected"
            message={urlAccessibility.message}
          />
        </List>

        <Typography variant="h6" sx={{ mb: 1.5, mt: 2 }}>robots.txt Check</Typography>
        <List dense>
          <ValidationItem
            isValid={robotsTxt.allowsAIBots}
            text="robots.txt Allows AI Bots"
            message={robotsTxt.message}
          />
        </List>

        <Typography variant="h6" sx={{ mb: 1.5, mt: 2 }}>Basic SEO Practices</Typography>
        <List dense>
          <ValidationItem
            isValid={seoPractices.properHtml}
            text="Proper HTML Structure"
            message={seoPractices.message}
          />
          <ValidationItem
            isValid={seoPractices.semanticTags}
            text="Semantic Tags Used"
            message={seoPractices.message}
          />
          <ValidationItem
            isValid={seoPractices.sitemapXml}
            text="Sitemap.xml Found"
            message={seoPractices.message}
          />
          <ValidationItem
            isValid={seoPractices.cleanUrls}
            text="Clean URLs Used"
            message={seoPractices.message}
          />
        </List>
      </CardContent>
    </Card>
  );
};

export default AIVisibilityValidationResults;
