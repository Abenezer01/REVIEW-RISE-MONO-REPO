'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'

// Tabler Icons
const IconWorld = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
)

const IconTarget = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
)

const IconSearch = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
    </svg>
)

const IconBulb = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
    </svg>
)

export default function SeoAnalyzerPage() {
    const t = useTranslations('common.seoAnalyzer')
    const [url, setUrl] = useState('')

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #1a1f3a 0%, #0f1729 100%)',
                color: 'white',
                overflow: 'hidden'
            }}
        >
            {/* Hero Section */}
            <Container maxWidth="lg">
                <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 10 }, textAlign: 'center' }}>
                    {/* Badge */}
                    <Chip
                        label={t('hero.badge')}
                        sx={{
                            mb: 3,
                            bgcolor: 'rgba(255, 152, 0, 0.1)',
                            color: 'warning.main',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            letterSpacing: '0.5px',
                            border: '1px solid rgba(255, 152, 0, 0.3)',
                            '& .MuiChip-label': { px: 2, py: 0.5 }
                        }}
                    />

                    {/* Main Title */}
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                            fontWeight: 700,
                            mb: 2,
                            lineHeight: 1.2,
                            background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}
                    >
                        {t('hero.title')}
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 4,
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: { xs: '1rem', md: '1.25rem' },
                            fontWeight: 400,
                            maxWidth: '600px',
                            mx: 'auto'
                        }}
                    >
                        {t('hero.subtitle')}
                    </Typography>

                    {/* URL Input */}
                    <Box
                        sx={{
                            maxWidth: '700px',
                            mx: 'auto',
                            mb: 3,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2
                        }}
                    >
                        <TextField
                            fullWidth
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder={t('hero.inputPlaceholder')}
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconWorld />
                                    </InputAdornment>
                                ),
                                sx: {
                                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 2,
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                    '&.Mui-focused fieldset': { borderColor: 'warning.main' },
                                    '& input': { color: 'white' }
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                px: 5,
                                py: 1.5,
                                bgcolor: 'warning.main',
                                color: 'grey.900',
                                fontWeight: 700,
                                fontSize: '1rem',
                                borderRadius: 2,
                                minWidth: { xs: '100%', sm: '160px' },
                                boxShadow: '0 8px 24px rgba(255, 152, 0, 0.4)',
                                '&:hover': {
                                    bgcolor: 'warning.dark',
                                    boxShadow: '0 12px 32px rgba(255, 152, 0, 0.5)',
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {t('hero.ctaButton')}
                        </Button>
                    </Box>

                    {/* Free Results Text */}
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.875rem'
                        }}
                    >
                        {t('hero.freeResults')}
                    </Typography>
                </Box>
            </Container>

            {/* Stats Section */}
            <Container maxWidth="lg">
                <Grid container spacing={3} sx={{ mb: { xs: 8, md: 12 } }}>
                    {[
                        { value: t('stats.sitesAnalyzed'), label: t('stats.sitesAnalyzedLabel') },
                        { value: t('stats.accuracy'), label: t('stats.accuracyLabel') },
                        { value: t('stats.rating'), label: t('stats.ratingLabel') },
                        { value: t('stats.availability'), label: t('stats.availabilityLabel') }
                    ].map((stat, index) => (
                        <Grid size={{ xs: 6, md: 3 }} key={index}>
                            <Card
                                sx={{
                                    textAlign: 'center',
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)'
                                    }
                                }}
                            >
                                <CardContent sx={{ py: 3 }}>
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            fontWeight: 800,
                                            mb: 1,
                                            color: 'warning.main',
                                            fontSize: { xs: '1.75rem', md: '2.5rem' }
                                        }}
                                    >
                                        {stat.value}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: '0.875rem',
                                            fontWeight: 500
                                        }}
                                    >
                                        {stat.label}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Features Section - What You'll Discover */}
            <Container maxWidth="lg">
                <Box sx={{ mb: { xs: 8, md: 12 } }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            fontWeight: 700,
                            textAlign: 'center',
                            mb: 2
                        }}
                    >
                        {t('features.title')}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            textAlign: 'center',
                            color: 'rgba(255, 255, 255, 0.7)',
                            mb: 6,
                            maxWidth: '600px',
                            mx: 'auto'
                        }}
                    >
                        {t('features.subtitle')}
                    </Typography>

                    <Grid container spacing={4}>
                        {[
                            {
                                icon: <IconTarget />,
                                title: t('features.seoHealth.title'),
                                description: t('features.seoHealth.description'),
                                features: [
                                    t('features.seoHealth.feature1'),
                                    t('features.seoHealth.feature2'),
                                    t('features.seoHealth.feature3')
                                ]
                            },
                            {
                                icon: <IconSearch />,
                                title: t('features.technicalAnalysis.title'),
                                description: t('features.technicalAnalysis.description'),
                                features: [
                                    t('features.technicalAnalysis.feature1'),
                                    t('features.technicalAnalysis.feature2'),
                                    t('features.technicalAnalysis.feature3')
                                ]
                            },
                            {
                                icon: <IconBulb />,
                                title: t('features.smartRecommendations.title'),
                                description: t('features.smartRecommendations.description'),
                                features: [
                                    t('features.smartRecommendations.feature1'),
                                    t('features.smartRecommendations.feature2'),
                                    t('features.smartRecommendations.feature3')
                                ]
                            }
                        ].map((feature, index) => (
                            <Grid size={{ xs: 12, md: 4 }} key={index}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: 3,
                                        p: 3,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.08)',
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 16px 32px rgba(255, 152, 0, 0.2)',
                                            borderColor: 'rgba(255, 152, 0, 0.3)'
                                        }
                                    }}
                                >
                                    <CardContent>
                                        {/* Icon */}
                                        <Box
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: 2,
                                                bgcolor: 'rgba(255, 152, 0, 0.1)',
                                                border: '1px solid rgba(255, 152, 0, 0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 3,
                                                color: 'warning.main'
                                            }}
                                        >
                                            {feature.icon}
                                        </Box>

                                        {/* Title */}
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 700,
                                                mb: 2,
                                                fontSize: '1.25rem'
                                            }}
                                        >
                                            {feature.title}
                                        </Typography>

                                        {/* Description */}
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                mb: 3,
                                                lineHeight: 1.6
                                            }}
                                        >
                                            {feature.description}
                                        </Typography>

                                        {/* Features List */}
                                        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0 }}>
                                            {feature.features.map((item, idx) => (
                                                <Box
                                                    component="li"
                                                    key={idx}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        mb: 1.5,
                                                        color: 'rgba(255, 255, 255, 0.8)',
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: '50%',
                                                            bgcolor: 'success.main',
                                                            mr: 2,
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                    {item}
                                                </Box>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>

            {/* How It Works Section */}
            <Container maxWidth="lg">
                <Box sx={{ mb: { xs: 8, md: 12 } }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            fontWeight: 700,
                            textAlign: 'center',
                            mb: 2
                        }}
                    >
                        {t('howItWorks.title')}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            textAlign: 'center',
                            color: 'rgba(255, 255, 255, 0.7)',
                            mb: 6,
                            maxWidth: '600px',
                            mx: 'auto'
                        }}
                    >
                        {t('howItWorks.subtitle')}
                    </Typography>

                    <Grid container spacing={4} alignItems="center">
                        {[
                            {
                                step: '1',
                                title: t('howItWorks.step1.title'),
                                description: t('howItWorks.step1.description')
                            },
                            {
                                step: '2',
                                title: t('howItWorks.step2.title'),
                                description: t('howItWorks.step2.description')
                            },
                            {
                                step: '3',
                                title: t('howItWorks.step3.title'),
                                description: t('howItWorks.step3.description')
                            }
                        ].map((step, index) => (
                            <Grid size={{ xs: 12, md: 4 }} key={index}>
                                <Box sx={{ textAlign: 'center', position: 'relative' }}>
                                    {/* Step Number */}
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(255, 152, 0, 0.1)',
                                            border: '2px solid',
                                            borderColor: 'warning.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 3,
                                            fontSize: '2rem',
                                            fontWeight: 800,
                                            color: 'warning.main',
                                            boxShadow: '0 8px 16px rgba(255, 152, 0, 0.2)'
                                        }}
                                    >
                                        {step.step}
                                    </Box>

                                    {/* Title */}
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 700,
                                            mb: 2,
                                            fontSize: '1.25rem'
                                        }}
                                    >
                                        {step.title}
                                    </Typography>

                                    {/* Description */}
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            lineHeight: 1.6,
                                            maxWidth: '300px',
                                            mx: 'auto'
                                        }}
                                    >
                                        {step.description}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>

            {/* Final CTA Section */}
            <Container maxWidth="md">
                <Box
                    sx={{
                        textAlign: 'center',
                        pb: { xs: 8, md: 12 },
                        pt: { xs: 4, md: 6 }
                    }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '2rem', md: '2.75rem' },
                            fontWeight: 700,
                            mb: 4
                        }}
                    >
                        {t('cta.title')}
                    </Typography>

                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            px: 6,
                            py: 2,
                            bgcolor: 'warning.main',
                            color: 'grey.900',
                            fontWeight: 700,
                            fontSize: '1.125rem',
                            borderRadius: 2,
                            boxShadow: '0 8px 24px rgba(255, 152, 0, 0.4)',
                            '&:hover': {
                                bgcolor: 'warning.dark',
                                boxShadow: '0 12px 32px rgba(255, 152, 0, 0.5)',
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {t('cta.button')}
                    </Button>
                </Box>
            </Container>

            {/* Footer Branding */}
            <Box
                sx={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    py: 4,
                    textAlign: 'center'
                }}
            >
                <Container>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: '0.875rem'
                        }}
                    >
                        © 2025 Adlites SEO. All rights reserved.
                    </Typography>
                </Container>
            </Box>
        </Box>
    )
}
