'use client';

import React from 'react';
import { Box, Typography, Grid, Paper, Button, Stack } from '@mui/material';
import type { CreativeConcept } from '@platform/contracts';
import { AutoAwesome } from '@mui/icons-material';

interface CreativeLibraryProps {
    onReuse: (concept: CreativeConcept) => void;
}

export default function CreativeLibrary({ onReuse }: CreativeLibraryProps) {
    // Mock data for now, would fetch from API
    const savedConcepts: CreativeConcept[] = [];

    return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
            <Paper sx={{ p: 5, maxWidth: 600, mx: 'auto', borderRadius: 4, borderStyle: 'dashed', borderColor: 'divider' }}>
                <Box sx={{ mb: 2, color: 'text.secondary' }}>
                     <AutoAwesome sx={{ fontSize: 48, opacity: 0.5 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Creative Library Coming Soon
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Save your best concepts and reuse them later. This feature is currently under development.
                </Typography>
                <Button variant="contained" disabled>
                    Browse Library
                </Button>
            </Paper>
        </Box>
    );
}
