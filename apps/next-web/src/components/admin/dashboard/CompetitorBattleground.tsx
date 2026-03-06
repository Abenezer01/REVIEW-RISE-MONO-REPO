/* eslint-disable react/jsx-no-literals */
'use client'

import React from 'react'
import { Card, CardContent, Typography, Box, useTheme, alpha, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Avatar } from '@mui/material'

export default function CompetitorBattleground() {
    const theme = useTheme()

    const competitors = [
        { id: 1, name: 'Your Business', rating: 4.8, reviews: 1240, visibility: 85, isUser: true },
        { id: 2, name: 'Starbucks Downtown', rating: 4.6, reviews: 3420, visibility: 92, isUser: false },
        { id: 3, name: 'Local Roasters', rating: 4.9, reviews: 450, visibility: 60, isUser: false },
        { id: 4, name: 'Cafe Noir', rating: 4.2, reviews: 890, visibility: 55, isUser: false },
    ].sort((a, b) => b.visibility - a.visibility)

    return (
        <Card
            sx={{
                height: '100%',
                background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.6)})`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
        >
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: 2, backgroundColor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, display: 'flex' }}>
                        <i className="tabler-swords" style={{ fontSize: '1.2rem' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{'Competitor Battleground'}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>{'Local Search Visibility'}</Typography>
            </Box>

            <CardContent sx={{ p: 0 }}>
                <TableContainer>
                    <Table sx={{ minWidth: 400 }} aria-label="competitor matrix">
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.background.default, 0.5) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>{'Business'}</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>{'Rating'}</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>{'Reviews'}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>{'Visibility Score'}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {competitors.map((row) => (
                                <TableRow
                                    key={row.id}
                                    sx={{
                                        // '&:last-child td, &:last-child th': { border: 0 },
                                        backgroundColor: row.isUser ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                        borderLeft: row.isUser ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                                        transition: 'background-color 0.2s',
                                        '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.5) }
                                    }}
                                >
                                    <TableCell component="th" scope="row">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    backgroundColor: row.isUser ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.2),
                                                    fontSize: '0.9rem',
                                                    fontWeight: 700
                                                }}
                                            >
                                                {row.name.charAt(0)}
                                            </Avatar>
                                            <Typography variant="subtitle2" sx={{ fontWeight: row.isUser ? 700 : 500, color: row.isUser ? theme.palette.primary.main : theme.palette.text.primary }}>
                                                {row.name} {row.isUser && '(You)'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.rating}</Typography>
                                            <i className="tabler-star-filled" style={{ fontSize: '0.9rem', color: theme.palette.warning.main }} />
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2">{row.reviews.toLocaleString()}</Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ width: '30%' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                                            <Box sx={{ width: '100%', mr: 1, display: { xs: 'none', sm: 'block' } }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={row.visibility}
                                                    color={row.isUser ? 'primary' : 'inherit'}
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: row.isUser ? theme.palette.primary.main : theme.palette.text.secondary
                                                        }
                                                    }}
                                                />
                                            </Box>
                                            <Box sx={{ minWidth: 35 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: row.isUser ? theme.palette.primary.main : theme.palette.text.primary }}>
                                                    {row.visibility}%
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    )
}
