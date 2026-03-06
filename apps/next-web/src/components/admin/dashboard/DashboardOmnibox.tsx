/* eslint-disable react/jsx-no-literals */
'use client'

import React, { useState } from 'react'
import { Paper, InputBase, IconButton, Box, Typography, alpha, useTheme, Chip, List, ListItem, ListItemText, ListItemIcon } from '@mui/material'

export default function DashboardOmnibox() {
    const theme = useTheme()
    const [query, setQuery] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    const quickActions = [
        { label: 'Generate Ad', icon: 'tabler-wand', color: theme.palette.primary.main },
        { label: 'Sync Google', icon: 'tabler-refresh', color: theme.palette.success.main },
        { label: 'Run Audit', icon: 'tabler-report-search', color: theme.palette.warning.main },
        { label: 'Draft Reply', icon: 'tabler-message-circle-2', color: theme.palette.info.main }
    ]

    const searchResults = [
        { title: 'Compare sentiment with Starbucks Downtown', type: 'Action' },
        { title: 'New 1-star review on Google (2 mins ago)', type: 'Alert' },
        { title: 'Draft a social post for Summer Promotion', type: 'Workflow' }
    ]

    return (
        <Box sx={{ position: 'relative', width: '100%', mb: 4, zIndex: 1200 }}>
            {/* Label/Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <i className="tabler-bolt" style={{ color: theme.palette.warning.main, fontSize: '1.2rem' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {'The Omnibox Command Center'}
                </Typography>
            </Box>

            {/* Main Input Area */}
            <Paper
                elevation={isFocused ? 8 : 2}
                sx={{
                    p: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${isFocused ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <IconButton sx={{ p: '12px', color: isFocused ? theme.palette.primary.main : theme.palette.text.secondary }} aria-label="search">
                    <i className="tabler-search" style={{ fontSize: '1.4rem' }} />
                </IconButton>

                <InputBase
                    sx={{ ml: 1, flex: 1, fontSize: '1.1rem', fontWeight: 500 }}
                    placeholder="Ask AI, run a command, or search data (e.g. 'Generate reply for recent bad review')..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.disabled, display: { xs: 'none', sm: 'block' }, fontWeight: 600 }}>
                        {'Ctrl + K'}
                    </Typography>
                    <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions">
                        <i className="tabler-arrow-right" />
                    </IconButton>
                </Box>
            </Paper>

            {/* Quick Action Chips (shown when empty or unfocused to guide user) */}
            {!query && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, alignSelf: 'center', mr: 1, fontWeight: 600 }}>
                        {'Suggested:'}
                    </Typography>
                    {quickActions.map((action, index) => (
                        <Chip
                            key={index}
                            icon={<i className={action.icon} style={{ fontSize: '1rem', color: action.color }} />}
                            label={action.label}
                            variant="outlined"
                            size="small"
                            clickable
                            sx={{
                                borderRadius: 2,
                                borderColor: alpha(action.color, 0.3),
                                backgroundColor: alpha(action.color, 0.05),
                                '&:hover': { backgroundColor: alpha(action.color, 0.1) },
                                fontWeight: 600
                            }}
                        />
                    ))}
                </Box>
            )}

            {/* Floating Search Results Dropdown */}
            {isFocused && query && (
                <Paper
                    elevation={12}
                    sx={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        right: 0,
                        borderRadius: 3,
                        overflow: 'hidden',
                        backgroundColor: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    <List sx={{ p: 0 }}>
                        {searchResults.map((result, index) => (
                            <ListItem
                                key={index}
                                component="button" // Use 'button' or implement Link behavior
                                sx={{
                                    width: '100%',
                                    textAlign: 'left',
                                    py: 1.5,
                                    px: 3,
                                    borderBottom: index < searchResults.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <i className={result.type === 'Alert' ? 'tabler-alert-triangle' : result.type === 'Workflow' ? 'tabler-wand' : 'tabler-arrow-up-right'}
                                        style={{ fontSize: '1.2rem', color: result.type === 'Alert' ? theme.palette.error.main : theme.palette.primary.main }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={result.title}
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                    secondary={result.type}
                                    secondaryTypographyProps={{ variant: 'caption', fontWeight: 600, color: theme.palette.primary.main }}
                                />
                                <i className="tabler-corner-down-left" style={{ color: theme.palette.text.disabled }} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    )
}
