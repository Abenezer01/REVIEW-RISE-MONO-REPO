'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';

import type { CompetitorDto, KeywordDTO } from '@platform/contracts';

import { useAuth } from '@/contexts/AuthContext';
import { useApiGet } from '@/hooks/useApi';
import { useSeoApiGet } from '@/hooks/useSeoApi';
import CompetitorListing from '@/components/admin/seo/CompetitorListing';

interface BusinessResponse {
    data: Array<{ id: string; name: string }>;
}

interface CompetitorsResponse {
    data: CompetitorDto[];
}

interface KeywordsResponse {
    data: KeywordDTO[];
}

const CompetitorsDashboard = () => {
    const { user } = useAuth();
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [selectedKeywordId, setSelectedKeywordId] = useState<string>('');

    // Fetch user businesses
    const { data: businessesData, isLoading: businessesLoading, error: businessesError } = useApiGet<BusinessResponse>(
        ['user-businesses', user?.id || ''],
        `/admin/users/${user?.id}/businesses`,
        undefined,
        { enabled: !!user?.id }
    );

    const businesses = businessesData?.data || [];

    // Auto-select first business when data loads
    React.useEffect(() => {
        if (businesses.length > 0 && !businessId) {
            setBusinessId(businesses[0].id);
        }
    }, [businesses, businessId]);

    // Fetch keywords for the selected business
    const {
        data: keywordsData,
        isLoading: keywordsLoading
    } = useSeoApiGet<KeywordsResponse>(
        ['keywords', businessId || ''],
        '/keywords',
        { businessId, limit: 100 },
        { enabled: !!businessId }
    );

    const keywords = keywordsData?.data || [];

    // Fetch competitors for selected business (optionally filtered by keyword)
    const {
        data: competitorsData,
        isLoading: competitorsLoading,
        error: competitorsError,
        refetch: refetchCompetitors
    } = useSeoApiGet<CompetitorsResponse>(
        ['competitors', businessId || '', selectedKeywordId],
        '/competitors',
        {
            businessId,
            keywordId: selectedKeywordId || undefined
        },
        { enabled: !!businessId }
    );

    const competitors = competitorsData?.data || [];

    const handleRefresh = () => {
        refetchCompetitors();
    };

    const handleBusinessChange = (event: SelectChangeEvent) => {
        setBusinessId(event.target.value);
        setSelectedKeywordId(''); // Reset keyword filter when business changes
    };

    const handleKeywordChange = (event: SelectChangeEvent) => {
        setSelectedKeywordId(event.target.value);
    };

    const handleClearKeyword = () => {
        setSelectedKeywordId('');
    };

    const isLoading = businessesLoading || competitorsLoading;
    const error = businessesError || competitorsError;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Competitor Analysis
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        View auto-detected competitors and their rankings
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                    {businesses.length > 1 && (
                        <FormControl sx={{ minWidth: 200 }} size="small">
                            <InputLabel>Business</InputLabel>
                            <Select
                                value={businessId || ''}
                                onChange={handleBusinessChange}
                                label="Business"
                            >
                                {businesses.map((b) => (
                                    <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    {businessId && (
                        <Button variant="outlined" onClick={handleRefresh}>
                            Refresh Data
                        </Button>
                    )}
                </Stack>
            </Stack>

            {/* Keyword Filter Section */}
            {businessId && keywords.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControl sx={{ minWidth: 300 }} size="small">
                            <InputLabel>Filter by Keyword</InputLabel>
                            <Select
                                value={selectedKeywordId}
                                onChange={handleKeywordChange}
                                label="Filter by Keyword"
                                disabled={keywordsLoading}
                            >
                                <MenuItem value="">
                                    <em>All Keywords</em>
                                </MenuItem>
                                {keywords.map((kw) => (
                                    <MenuItem key={kw.id} value={kw.id}>
                                        {kw.keyword}
                                        {kw.searchVolume && (
                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                ({kw.searchVolume.toLocaleString()} searches/mo)
                                            </Typography>
                                        )}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {selectedKeywordId && (
                            <Chip
                                label={keywords.find(k => k.id === selectedKeywordId)?.keyword || 'Selected'}
                                onDelete={handleClearKeyword}
                                color="primary"
                                variant="outlined"
                            />
                        )}
                    </Stack>
                </Box>
            )}

            {!businessId && isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <Typography>Loading your business profile...</Typography>
                </Box>
            ) : !businessId ? (
                <Box sx={{ mt: 4, p: 4, border: '1px dashed grey', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>No Business Found</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {error ? String(error) : 'Your account does not appear to be linked to any businesses.'}
                    </Typography>
                </Box>
            ) : (
                <>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            Failed to load data. Please check connection to SEO service.
                        </Alert>
                    )}

                    <Box>
                        <CompetitorListing competitors={competitors} isLoading={competitorsLoading} />
                    </Box>
                </>
            )}
        </Container>
    );
};

export default CompetitorsDashboard;
