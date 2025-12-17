import type { ReactNode } from 'react';

import { formatCreatedAt } from '@platform/utils';

import { Box, Card, CardActions, CardContent, Grid, Typography } from '@mui/material';

interface SharedItemViewCardProps {
  children: ReactNode;
  createdAt?: string | Date;
  actions?: ReactNode;
  t: any;
}

const SharedItemViewCard = ({ children, createdAt, actions, t }: SharedItemViewCardProps) => {
  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: 3,
        background: 'background.paper',
        minWidth: 320
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid size={12}>
            <Box>
              {children}

              <Typography
                variant="caption"
                color="text.disabled"
                sx={{
                  mt: 1,
                  display: 'block',
                  fontStyle: 'italic',
                  fontSize: '0.85rem'
                }}
              >
                {createdAt ? formatCreatedAt(createdAt) : t('common.not-available')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      {actions && (
        <CardActions
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            pt: 0
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>
        </CardActions>
      )}
    </Card>
  );
};

export default SharedItemViewCard;
