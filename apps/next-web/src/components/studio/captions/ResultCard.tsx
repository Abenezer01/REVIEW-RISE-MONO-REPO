'use client'

import React from 'react'

import { Box, Typography, Card, CardContent, IconButton } from '@mui/material'
import { toast } from 'react-toastify'

interface ResultCardProps {
    index: number
    text: string
    onSave?: (text: string) => void
}

export default function ResultCard({ index, text, onSave }: ResultCardProps) {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard')
    }

    const charCount = text.length

    // Crude emoji count
    const emojiCount = (text.match(/[\p{Emoji}]/gu) || []).length

    return (
        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ 
                        mt: 0.5,
                        width: 24, 
                        height: 24, 
                        borderRadius: 1, 
                        bgcolor: '#9C27B0', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        flexShrink: 0
                    }}>
                        {index}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                         <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, gap: 1 }}>
                             <IconButton size="small" onClick={copyToClipboard}><i className="tabler-copy" style={{ fontSize: 18 }} /></IconButton>
                             <IconButton size="small" onClick={() => onSave?.(text)}><i className="tabler-file-plus" style={{ fontSize: 18 }} /></IconButton>
                             <IconButton size="small"><i className="tabler-share" style={{ fontSize: 18 }} /></IconButton>
                         </Box>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'text.primary' }}>
                            {text}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Aa</Typography>
                                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{charCount} characters</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                <i className="tabler-mood-smile" style={{ fontSize: 12 }} />
                                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{emojiCount} emojis</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}
