'use client'

import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Slider from '@mui/material/Slider'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'

import { toast } from 'react-toastify'

import { SERVICES } from '@/configs/services'
import apiClient from '@/lib/apiClient'
import LayoutTemplateSelector from './carousel/LayoutTemplateSelector'
import ColorSchemePicker from './carousel/ColorSchemePicker'

export default function CarouselBuilder() {
    const [loading, setLoading] = useState(false)
    const [topic, setTopic] = useState('')
    const [additionalContext, setAdditionalContext] = useState('')
    const [slideCount, setSlideCount] = useState(7)
    const [layoutTemplate, setLayoutTemplate] = useState('modern')
    const [colorScheme, setColorScheme] = useState('orange')
    const [autoGenerateImages, setAutoGenerateImages] = useState(true)
    const [includeStatistics, setIncludeStatistics] = useState(true)
    const [addCallToAction, setAddCallToAction] = useState(false)
    const [slides, setSlides] = useState<any[]>([])
    const [currentSlide, setCurrentSlide] = useState(0)

    const handleGenerate = async () => {
        if (!topic) {
            toast.error('Please enter a topic or theme')
            
return
        }

        setLoading(true)

        try {
            const response = await apiClient.post(`${SERVICES.ai.url}/studio/carousels`, { 
                topic,
                additionalContext,
                count: slideCount,
                layoutTemplate,
                colorScheme,
                autoGenerateImages,
                includeStatistics,
                addCallToAction
            })

            const data = response.data

            setSlides(data.slides || [])
            setCurrentSlide(0)
            toast.success(`${data.slides?.length || 0} slides generated!`)
        } catch (error) {
            console.error(error)
            toast.error('Failed to generate carousel')
        } finally {
            setLoading(false)
        }
    }

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    return (
        <Box>
            {/* Page Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        AI Carousel Generator
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Create engaging multi-slide carousels
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" startIcon={<i className="tabler-device-floppy" />}>
                        Save Draft
                    </Button>
                    <Button variant="contained" startIcon={<i className="tabler-download" />}>
                        Export
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={4}>
                {/* Left Panel - Input & Settings */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Carousel Content */}
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Carousel Content
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        label="Topic or Theme"
                                        placeholder="10 social media tips for 2025..."
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        fullWidth
                                        size="small"
                                        helperText="What should your carousel be about?"
                                    />

                                    <TextField
                                        label="Additional Details (Optional)"
                                        placeholder="Specific requirements, target audience, key points..."
                                        multiline
                                        rows={2}
                                        value={additionalContext}
                                        onChange={(e) => setAdditionalContext(e.target.value)}
                                        fullWidth
                                        size="small"
                                    />

                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" fontWeight="bold">
                                                Number of Slides
                                            </Typography>
                                            <Typography variant="body2" color="primary.main" fontWeight="bold">
                                                {slideCount}
                                            </Typography>
                                        </Box>
                                        <Slider
                                            value={slideCount}
                                            onChange={(_, val) => setSlideCount(val as number)}
                                            min={3}
                                            max={10}
                                            marks
                                            sx={{ color: 'primary.main' }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            Recommended: 5-10 slides
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Design Style */}
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Design Style
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <LayoutTemplateSelector 
                                        selected={layoutTemplate} 
                                        onChange={setLayoutTemplate} 
                                    />
                                    <ColorSchemePicker 
                                        selected={colorScheme} 
                                        onChange={setColorScheme} 
                                    />
                                </Box>
                            </CardContent>
                        </Card>

                        {/* AI Settings */}
                        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'action.hover' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <i className="tabler-sparkles" style={{ fontSize: 20, color: '#9C27B0' }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        AI Settings
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch 
                                                checked={autoGenerateImages} 
                                                onChange={(e) => setAutoGenerateImages(e.target.checked)}
                                                color="secondary"
                                            />
                                        }
                                        label="Auto-generate images"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch 
                                                checked={includeStatistics} 
                                                onChange={(e) => setIncludeStatistics(e.target.checked)}
                                                color="secondary"
                                            />
                                        }
                                        label="Include statistics"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch 
                                                checked={addCallToAction} 
                                                onChange={(e) => setAddCallToAction(e.target.checked)}
                                                color="secondary"
                                            />
                                        }
                                        label="Add call-to-action"
                                    />
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Generation Cost & Button */}
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Generation Cost
                                </Typography>
                                <Typography variant="h6" color="primary.main" fontWeight="bold">
                                    15 Credits
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                onClick={handleGenerate}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <i className='tabler-sparkles' />}
                                sx={{ 
                                    borderRadius: 2, 
                                    py: 1.5,
                                    bgcolor: 'primary.main',
                                    '&:hover': { bgcolor: 'primary.dark' },
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                {loading ? 'Generating...' : '✨ Generate Carousel'}
                            </Button>
                        </Box>
                    </Box>
                </Grid>

                {/* Right Panel - Preview & Customization */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Live Preview */}
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Live Preview
                                </Typography>
                                {slides.length === 0 ? (
                                    <Box sx={{ 
                                        aspectRatio: '1', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        bgcolor: colorScheme === 'orange' ? '#FF8C42' : 
                                                 colorScheme === 'blue' ? '#4A90E2' :
                                                 colorScheme === 'purple' ? '#9C27B0' :
                                                 colorScheme === 'green' ? '#4CAF50' : '#E91E63',
                                        borderRadius: 2,
                                        flexDirection: 'column',
                                        gap: 2,
                                        color: 'white'
                                    }}>
                                        <Box
                                            sx={{
                                                animation: 'float 3s ease-in-out infinite',
                                                '@keyframes float': {
                                                    '0%, 100%': { transform: 'translateY(0px)' },
                                                    '50%': { transform: 'translateY(-10px)' }
                                                }
                                            }}
                                        >
                                            <i 
                                                className="tabler-photo" 
                                                style={{ 
                                                    fontSize: 64, 
                                                    opacity: 0.8
                                                }} 
                                            />
                                        </Box>
                                        <Typography variant="body1" fontWeight="medium">
                                            Your generated image will appear here
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Box sx={{ 
                                            aspectRatio: '1', 
                                            bgcolor: colorScheme === 'orange' ? '#FF8C42' : 
                                                     colorScheme === 'blue' ? '#4A90E2' :
                                                     colorScheme === 'purple' ? '#9C27B0' :
                                                     colorScheme === 'green' ? '#4CAF50' : '#E91E63',
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            p: 4,
                                            position: 'relative'
                                        }}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h5" fontWeight="bold" mb={2}>
                                                    {slides[currentSlide]?.title || `Slide ${currentSlide + 1}`}
                                                </Typography>
                                                <Typography variant="body1">
                                                    {slides[currentSlide]?.content || slides[currentSlide]?.text}
                                                </Typography>
                                            </Box>
                                            <IconButton
                                                onClick={prevSlide}
                                                sx={{ 
                                                    position: 'absolute', 
                                                    left: 8, 
                                                    bgcolor: 'rgba(0,0,0,0.3)',
                                                    color: 'white',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': { 
                                                        bgcolor: 'rgba(0,0,0,0.6)',
                                                        transform: 'translateX(-4px) scale(1.1)',
                                                        boxShadow: 3
                                                    },
                                                    '&:active': {
                                                        transform: 'translateX(-2px) scale(1.05)'
                                                    }
                                                }}
                                            >
                                                <i className="tabler-chevron-left" />
                                            </IconButton>
                                            <IconButton
                                                onClick={nextSlide}
                                                sx={{ 
                                                    position: 'absolute', 
                                                    right: 8,
                                                    bgcolor: 'rgba(0,0,0,0.3)',
                                                    color: 'white',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': { 
                                                        bgcolor: 'rgba(0,0,0,0.6)',
                                                        transform: 'translateX(4px) scale(1.1)',
                                                        boxShadow: 3
                                                    },
                                                    '&:active': {
                                                        transform: 'translateX(2px) scale(1.05)'
                                                    }
                                                }}
                                            >
                                                <i className="tabler-chevron-right" />
                                            </IconButton>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                                            {slides.map((_, idx) => (
                                                <Box
                                                    key={idx}
                                                    onClick={() => setCurrentSlide(idx)}
                                                    sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        bgcolor: idx === currentSlide ? 'primary.main' : 'action.disabled',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        '&:hover': {
                                                            transform: 'scale(1.3)',
                                                            bgcolor: idx === currentSlide ? 'primary.dark' : 'action.active'
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Customization */}
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Quick Customization
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2">Edit Text Content</Typography>
                                        <Button size="small" variant="contained" sx={{ borderRadius: 1.5, bgcolor: '#FF8C42' }}>
                                            Edit
                                        </Button>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2">Change Images</Typography>
                                        <Button size="small" variant="contained" sx={{ borderRadius: 1.5, bgcolor: '#FF8C42' }}>
                                            Replace
                                        </Button>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2">Adjust Colors</Typography>
                                        <Button size="small" variant="contained" sx={{ borderRadius: 1.5, bgcolor: '#FF8C42' }}>
                                            Customize
                                        </Button>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2">Reorder Slides</Typography>
                                        <Button size="small" variant="contained" sx={{ borderRadius: 1.5, bgcolor: '#FF8C42' }}>
                                            Arrange
                                        </Button>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}
