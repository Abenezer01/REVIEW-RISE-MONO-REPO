'use client'

import React, { useState } from 'react';
import { Card, Box, Typography, Avatar, Chip, Button, IconButton, useTheme, Rating, Divider, TextField } from '@mui/material';

// Placeholder icons
const GoogleIcon = () => <Typography variant="caption" sx={{ fontWeight: 'bold' }}>G</Typography>;
const EditIcon = () => <span>✏️</span>;
const SendIcon = () => <span>📤</span>;
const SparkleIcon = () => <span>✨</span>;

export interface ReviewProps {
    id: string;
    authorName: string;
    authorPhotoUrl?: string;
    rating: number;
    timeAgo: string;
    content: string;
    platform: 'google' | 'yelp' | 'facebook';
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    isReplied: boolean;
    aiSuggestedReply?: string;
}

export default function ReviewCard({
    review,
    onGenerateReply,
    onPostReply
}: {
    review: ReviewProps,
    onGenerateReply?: (tone: string) => Promise<string>,
    onPostReply?: (content: string) => Promise<any>
}) {
    const theme = useTheme();
    const [selectedTone, setSelectedTone] = useState<'Professional' | 'Friendly' | 'Apologetic'>('Professional');
    const [isEditing, setIsEditing] = useState(false);
    const [draftReply, setDraftReply] = useState(review.aiSuggestedReply || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    const sentimentColor = {
        Positive: 'success',
        Neutral: 'info',
        Negative: 'error'
    } as const;

    return (
        <Card sx={{ mb: 3, p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            {/* Header Row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar src={review.authorPhotoUrl} alt={review.authorName} sx={{ bgcolor: 'primary.main' }}>
                        {review.authorName.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{review.authorName}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating value={review.rating} readOnly size="small" />
                            <Typography variant="caption" color="text.secondary">{review.timeAgo}</Typography>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                        label={review.sentiment}
                        size="small"
                        color={sentimentColor[review.sentiment]}
                        sx={{ fontWeight: 600, height: 24 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <GoogleIcon />
                        <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{review.platform}</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Review Body */}
            <Typography variant="body2" sx={{ mb: 3, color: 'text.primary', lineHeight: 1.6 }}>
                {review.content}
            </Typography>

            {/* AI Suggested Reply Engine (Only if unreplied) */}
            {!review.isReplied && (
                <Box sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50',
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                }}>
                    {/* AI Header & Tones */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                            <SparkleIcon />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>AI-Suggested Reply</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, p: 0.5, bgcolor: 'background.paper', borderRadius: 8, border: `1px solid ${theme.palette.divider}` }}>
                            {['Professional', 'Friendly', 'Apologetic'].map((tone) => (
                                <Chip
                                    key={tone}
                                    label={tone}
                                    size="small"
                                    onClick={async () => {
                                        setSelectedTone(tone as any);

                                        if (onGenerateReply) {
                                            setIsGenerating(true);

                                            try {
                                                const newDraft = await onGenerateReply(tone);

                                                setDraftReply(newDraft);
                                                setIsEditing(false);
                                            } finally {
                                                setIsGenerating(false);
                                            }
                                        }
                                    }}
                                    sx={{
                                        cursor: 'pointer',
                                        bgcolor: selectedTone === tone ? 'primary.main' : 'transparent',
                                        color: selectedTone === tone ? 'primary.contrastText' : 'text.secondary',
                                        fontWeight: selectedTone === tone ? 600 : 400,
                                        '&:hover': { bgcolor: selectedTone === tone ? 'primary.main' : 'action.hover' }
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Draft Content */}
                    {isEditing ? (
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={draftReply}
                            onChange={(e) => setDraftReply(e.target.value)}
                            sx={{ mb: 2, bgcolor: 'background.paper' }}
                            disabled={isGenerating || isPosting}
                        />
                    ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontStyle: 'italic' }}>
                            {isGenerating ? "Generating response..." : (draftReply || "Select a tone to generate a response.")}
                        </Typography>
                    )}

                    {/* Footer Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => setIsEditing(!isEditing)}
                            sx={{ color: 'text.secondary' }}
                            disabled={isGenerating || isPosting}
                        >
                            {isEditing ? 'Save Draft' : 'Edit'}
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<SendIcon />}
                            color="warning"
                            disabled={!draftReply || isGenerating || isPosting}
                            sx={{ fontWeight: 600 }}
                            onClick={async () => {
                                if (onPostReply) {
                                    setIsPosting(true);

                                    try {
                                        await onPostReply(draftReply);
                                    } finally {
                                        setIsPosting(false);
                                    }
                                }
                            }}
                        >
                            {isPosting ? 'Posting...' : 'Post Reply'}
                        </Button>
                    </Box>
                </Box>
            )}
        </Card>
    );
}
