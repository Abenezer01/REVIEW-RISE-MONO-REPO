/* eslint-disable react/jsx-no-literals */
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Snackbar from '@mui/material/Snackbar'

// Icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BlockIcon from '@mui/icons-material/Block'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import GoogleIcon from '@mui/icons-material/Google'

import { useTranslations } from 'next-intl'
import apiClient from '@/lib/apiClient'
import ConnectGoogleModal from './ConnectGoogleModal'
import LocationSelectorModal from './LocationSelectorModal'

interface ConnectionStatus {
    connected: boolean
    status?: 'active' | 'error' | 'disconnected'
    integrationId?: string
    gbpLocationTitle?: string
    gbpLocationName?: string
    connectedAt?: string
}

export default function IntegrationsDashboard() {
    const t = useTranslations('locations.ReviewSources') // Reusing translations for now
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { id: locationId } = params

    const [status, setStatus] = useState<ConnectionStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
    
    // Auth flow states
    const pendingGoogleId = searchParams.get('pending_google')
    const googleError = searchParams.get('google_error')
    
    const [isSelectorOpen, setIsSelectorOpen] = useState(!!pendingGoogleId)
    const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null)

    const fetchStatus = useCallback(async () => {
        if (!locationId) return

        try {
            setLoading(true)
            const res = await apiClient.get(`/auth/google/status/${locationId}`)

            setStatus(res.data.data)
        } catch (error) {
            console.error('Failed to fetch integration status:', error)
        } finally {
            setLoading(false)
        }
    }, [locationId])

    useEffect(() => {
        fetchStatus()
    }, [fetchStatus])

    useEffect(() => {
        if (googleError) {
            let msg = t('errors.default')

            if (googleError === 'access_denied') msg = t('errors.accessDenied')
            else if (googleError === 'no_accounts') msg = t('errors.noAccounts')
            else if (googleError === 'no_locations') msg = t('errors.noLocations')
            else if (googleError === 'session_expired') msg = t('errors.sessionExpired')

            setSnackbarMsg(msg)

            // Strip from URL after showing
            const newUrl = new URL(window.location.href)

            newUrl.searchParams.delete('google_error')
            router.replace(newUrl.pathname + newUrl.search)
        }

        if (pendingGoogleId) {
            setIsSelectorOpen(true)

            // Strip pending ID
            const newUrl = new URL(window.location.href)

            newUrl.searchParams.delete('pending_google')
            router.replace(newUrl.pathname + newUrl.search)
        }
    }, [googleError, pendingGoogleId, router, t])

    const handleConnectGoogle = async () => {
        try {
            const res = await apiClient.get(`/auth/google/connect?locationId=${locationId}`)

            if (res.data?.data?.url) {
                window.location.href = res.data.data.url
            } else {
                setSnackbarMsg('Failed to generate connection link.')
            }
        } catch {
            setSnackbarMsg('An error occurred. Please try again.')
        }
    }

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect this location? Features relying on this connection will stop working.')) return

        try {
            setLoading(true)
            await apiClient.post(`/auth/google/disconnect/${locationId}`)
            await fetchStatus()
            setSnackbarMsg('Google Business Profile disconnected.')
        } catch {
            setSnackbarMsg('Failed to disconnect. Please try again.')
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box sx={{ p: { xs: 2, sm: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" fontWeight="bold">{t('connectedPlatforms')}</Typography>
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {t('integrationsDesc')}
            </Typography>

            <Card sx={{ p: 4, borderRadius: 2, display: 'flex', alignItems: 'flex-start', border: status?.connected ? '1px solid #4CAF50' : 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', bgcolor: 'background.default', mr: 3 }}>
                    <GoogleIcon fontSize="large" sx={{ color: '#4285F4' }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>{t('googleBusiness')}</Typography>
                    
                    {status?.connected && status.status === 'active' ? (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <CheckCircleIcon color="success" fontSize="small" />
                                <Typography variant="body2" color="success.main" fontWeight="bold">{t('connected')}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('to')} <strong>{status.gbpLocationTitle || status.gbpLocationName}</strong>
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {t('connectionActiveDesc')}
                            </Typography>
                            <Button 
                                variant="outlined" 
                                color="error" 
                                size="small"
                                startIcon={<LinkOffIcon />}
                                onClick={handleDisconnect}
                            >
                                {t('disconnect')}
                            </Button>
                        </>
                    ) : status?.connected && status.status === 'error' ? (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <BlockIcon color="error" fontSize="small" />
                                <Typography variant="body2" color="error.main" fontWeight="bold">{t('connectionError')}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {t('lostAccessDesc')}
                            </Typography>
                            <Button variant="contained" color="primary" onClick={() => setIsConnectModalOpen(true)}>
                                {t('reconnectGoogle')}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {t('connectGoogleDesc')}
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                startIcon={<AddCircleOutlineIcon />}
                                onClick={() => setIsConnectModalOpen(true)}
                            >
                                {t('connect')}
                            </Button>
                        </>
                    )}
                </Box>
            </Card>

            <ConnectGoogleModal 
                open={isConnectModalOpen} 
                onClose={() => setIsConnectModalOpen(false)} 
                onConnect={handleConnectGoogle}
            />

            <LocationSelectorModal 
                open={isSelectorOpen}
                pendingId={pendingGoogleId || ''}
                onClose={() => setIsSelectorOpen(false)}
                onSuccess={() => {
                    setIsSelectorOpen(false)
                    setSnackbarMsg('Successfully connected to Google Business Profile!')
                    fetchStatus()
                }}
            />

            <Snackbar
                open={!!snackbarMsg}
                autoHideDuration={6000}
                onClose={() => setSnackbarMsg(null)}
                message={snackbarMsg}
            />
        </Box>
    )
}
