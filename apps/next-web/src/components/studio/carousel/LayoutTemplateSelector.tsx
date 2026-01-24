'use client'

import React from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'

const LAYOUT_TEMPLATES = [
    { value: 'modern', label: 'Modern', icon: 'tabler-layout-grid' },
    { value: 'minimal', label: 'Minimal', icon: 'tabler-layout-list' },
    { value: 'bold', label: 'Bold', icon: 'tabler-layout-kanban' }
]

interface LayoutTemplateSelectorProps {
    selected: string
    onChange: (template: string) => void
}

export default function LayoutTemplateSelector({ selected, onChange }: LayoutTemplateSelectorProps) {
    return (
        <Box>
            <Typography variant="body2" fontWeight="bold" mb={1.5}>
                Layout Template
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
                {LAYOUT_TEMPLATES.map((template) => (
                    <Card
                        key={template.value}
                        onClick={() => onChange(template.value)}
                        sx={{
                            cursor: 'pointer',
                            flex: 1,
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            border: '2px solid',
                            borderColor: selected === template.value ? 'primary.main' : 'divider',
                            bgcolor: selected === template.value ? 'primary.lightOpacity' : 'transparent',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                borderColor: 'primary.main',
                                transform: 'translateY(-2px)',
                                boxShadow: 2
                            }
                        }}
                    >
                        <i 
                            className={template.icon} 
                            style={{ 
                                fontSize: 24, 
                                color: selected === template.value ? 'var(--mui-palette-primary-main)' : 'inherit'
                            }} 
                        />
                        <Typography 
                            variant="caption" 
                            fontWeight={selected === template.value ? 'bold' : 'medium'}
                            color={selected === template.value ? 'primary.main' : 'text.primary'}
                        >
                            {template.label}
                        </Typography>
                    </Card>
                ))}
            </Box>
        </Box>
    )
}
