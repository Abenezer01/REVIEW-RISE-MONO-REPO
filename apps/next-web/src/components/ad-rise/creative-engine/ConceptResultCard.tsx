import React, { useState } from 'react';
import { Box, Typography, Paper, Chip, Stack, Alert, Button, Collapse, IconButton } from '@mui/material';
import type { CreativeConcept } from '@platform/contracts';

interface ConceptResultCardProps {
    concept: CreativeConcept;
    onGenerateImage: (prompt: string) => void;
    isGeneratingImage: boolean;
}

export default function ConceptResultCard({ concept, onGenerateImage, isGeneratingImage }: ConceptResultCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

    const handleCopy = (text: string, format: string) => {
        navigator.clipboard.writeText(text);
        setCopiedFormat(format);
        setTimeout(() => setCopiedFormat(null), 2000);
    };

    return (
        <Paper 
            elevation={0}
            sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2, 
                border: '1px solid', 
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {concept.headline}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {concept.primaryText}
                    </Typography>
                </Box>
                <Chip label="Concept" size="small" color="primary" variant="outlined" />
            </Box>

            <Alert severity="info" icon={false} sx={{ mb: 2, bgcolor: 'action.hover', border: 'none' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Visual Idea:</Typography>
                <Typography variant="body2">{concept.visualIdea}</Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip label={`CTA: ${concept.cta}`} size="small" sx={{ fontWeight: 'bold' }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button 
                    onClick={() => setExpanded(!expanded)}
                    size="small"
                >
                    {expanded ? 'Hide Prompts' : 'View Prompts & Image'}
                </Button>

                {concept.imageUrl && (
                    <Button 
                        href={concept.imageUrl} 
                        target="_blank" 
                        color="success" 
                        size="small"
                        variant="outlined"
                    >
                        View Generated Image
                    </Button>
                )}
            </Box>

            <Collapse in={expanded} sx={{ mt: 2 }}>
                <Box sx={{ bgcolor: 'background.neutral', p: 2, borderRadius: 2 }}>
                    
                    {/* Platform Prompts */}
                    <Box sx={{ mb: 3 }}>
                         <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            {Object.entries(concept.formatPrompts).map(([format, prompt]) => (
                                <Box key={format} sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                        {format}
                                    </Typography>
                                    <Paper sx={{ p: 1.5, bgcolor: 'background.paper', fontSize: '0.85rem', position: 'relative' }}>
                                        {prompt.substring(0, 100)}...
                                        <Button 
                                            size="small" 
                                            sx={{ position: 'absolute', right: 2, top: 2, minWidth: 'auto', p: 0.5 }}
                                            onClick={() => handleCopy(prompt, format)}
                                        >
                                            {copiedFormat === format ? 'Copied' : 'Copy'}
                                        </Button>
                                    </Paper>
                                </Box>
                            ))}
                        </Stack>
                    </Box>

                    {/* Image Generation */}
                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>AI Image Generation</Typography>
                        <Typography variant="caption" display="block" sx={{ mb: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                            Prompt: {concept.imagePrompt}
                        </Typography>
                        
                        {!concept.imageUrl && (
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                onClick={() => onGenerateImage(concept.imagePrompt || '')}
                                disabled={isGeneratingImage || !concept.imagePrompt}
                            >
                                {isGeneratingImage ? 'Generating...' : 'Generate Art (DALL-E)'}
                            </Button>
                        )}
                        
                        {concept.imageUrl && (
                             <Box 
                                component="img" 
                                src={concept.imageUrl} 
                                alt="Generated Creative" 
                                sx={{ width: '100%', maxWidth: 300, borderRadius: 2, mt: 1 }} 
                            />
                        )}
                    </Box>
                </Box>
            </Collapse>
        </Paper>
    );
}
