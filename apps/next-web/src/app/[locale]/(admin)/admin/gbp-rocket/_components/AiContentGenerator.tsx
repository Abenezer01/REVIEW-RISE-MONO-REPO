/* eslint-disable import/no-unresolved */
/* eslint-disable react/jsx-no-literals */
'use client'

import { useMemo, useState } from 'react'
import { isAxiosError } from 'axios'

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import FlagCircleIcon from '@mui/icons-material/FlagCircle'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { SERVICES_CONFIG } from '@/configs/services'
import apiClient from '@/lib/apiClient'

type GeneratorType =
  | 'business_description'
  | 'service_descriptions'
  | 'category_recommendations'
  | 'post_generator'
  | 'qa_suggestions'

type GeneratedItem = {
  id?: string
  title?: string
  text?: string
  serviceName?: string
  blurb?: string
  category?: string
  reason?: string
  question?: string
  answer?: string
  cta?: string
  charCount?: number
  compliance?: {
    maxRecommended?: number
    withinLimit?: boolean
    noSpam?: boolean
    formattingOk?: boolean
  }
}

type Props = {
  locationId: string
  profileCategory?: string | null
  onError: (message: string) => void
}

const GBP_API_URL = SERVICES_CONFIG.gbp.url

const generatorMeta: Record<GeneratorType, { title: string; helper: string }> = {
  business_description: {
    title: 'Business Description',
    helper: 'Generate 3 GBP-ready business descriptions with character checks.'
  },
  service_descriptions: {
    title: 'Service Descriptions',
    helper: 'Create concise service blurbs users can copy directly to GBP.'
  },
  category_recommendations: {
    title: 'Category Recommendations',
    helper: 'Get category ideas with brief reasoning text.'
  },
  post_generator: {
    title: 'GBP Post Generator',
    helper: 'Generate offer/event/update posts with CTA and compliance checks.'
  },
  qa_suggestions: {
    title: 'Q&A Suggestions',
    helper: 'Generate common customer Q&A pairs for GBP.'
  }
}

const getItemTitle = (item: GeneratedItem, index: number) =>
  item.title || item.serviceName || item.category || item.question || `Suggestion ${index + 1}`

const getItemText = (item: GeneratedItem) => item.text || item.blurb || item.reason || item.answer || 'N/A'

const isCompliant = (item: GeneratedItem) => {
  if (!item.compliance) return true

  return Boolean(item.compliance.withinLimit && item.compliance.noSpam && item.compliance.formattingOk)
}

const getCharProgress = (charCount?: number, maxRecommended?: number) => {
  if (!charCount || !maxRecommended || maxRecommended <= 0) return 0

  return Math.min(100, Math.round((charCount / maxRecommended) * 100))
}

export default function AiContentGenerator({ locationId, profileCategory, onError }: Props) {
  const theme = useTheme()

  const [generatorType, setGeneratorType] = useState<GeneratorType>('business_description')
  const [items, setItems] = useState<GeneratedItem[]>([])
  const [generating, setGenerating] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [postType, setPostType] = useState<'offer' | 'event' | 'update'>('update')
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({})

  const selectedMeta = useMemo(() => generatorMeta[generatorType], [generatorType])

  const extractMessage = (error: unknown, fallback: string) => {
    if (isAxiosError(error)) {
      const message = (error.response?.data as any)?.message

      if (typeof message === 'string' && message.trim().length > 0) return message
    }

    if (error instanceof Error && error.message.trim().length > 0) return error.message

    return fallback
  }

  const handleGenerate = async () => {
    try {
      setGenerating(true)

      const response = await apiClient.post<{ items: GeneratedItem[] }>(
        `${GBP_API_URL}/locations/${locationId}/ai-content/generate`,
        {
          type: generatorType,
          input: {
            category: profileCategory || '',
            postType
          }
        },
        { headers: { 'x-skip-system-message': '1' } }
      )

      setItems(response.data?.items || [])
      setSavedIds({})
      setCopiedId(null)
    } catch (error) {
      onError(extractMessage(error, 'Failed to generate AI content'))
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async (item: GeneratedItem, index: number) => {
    const itemId = item.id || `${index}`

    try {
      setSavingId(itemId)

      await apiClient.post(
        `${GBP_API_URL}/locations/${locationId}/ai-content/suggestions`,
        { type: generatorType, item },
        { headers: { 'x-skip-system-message': '1' } }
      )

      setSavedIds((prev) => ({ ...prev, [itemId]: true }))
    } catch (error) {
      onError(extractMessage(error, 'Failed to save suggestion'))
    } finally {
      setSavingId(null)
    }
  }

  const handleCopy = async (item: GeneratedItem, index: number) => {
    const itemId = item.id || `${index}`

    try {
      await navigator.clipboard.writeText(getItemText(item))
      setCopiedId(itemId)
      setTimeout(() => setCopiedId((prev) => (prev === itemId ? null : prev)), 1600)
    } catch {
      onError('Unable to copy content')
    }
  }

  return (
    <Stack spacing={2.5}>
      <Card
        variant='outlined'
        sx={{
          borderColor: alpha(theme.palette.secondary.main, 0.35),
          background: `linear-gradient(145deg, ${alpha(theme.palette.secondary.main, 0.14)} 0%, ${alpha(theme.palette.info.main, 0.08)} 100%)`
        }}
      >
        <CardContent>
          <Stack spacing={1.5}>
            <Stack direction='row' spacing={1} alignItems='center'>
              <AutoAwesomeIcon color='secondary' />
              <Typography variant='h6' fontWeight={700}>AI Content Studio</Typography>
            </Stack>
            <Typography variant='body2' color='text.secondary'>
              Pick a generator, create GBP-ready variations, then copy or save the best ones as suggestions.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card variant='outlined'>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant='subtitle2'>1. Choose Generator</Typography>
            <ToggleButtonGroup
              value={generatorType}
              exclusive
              onChange={(_, value) => {
                if (value) setGeneratorType(value as GeneratorType)
              }}
              sx={{ flexWrap: 'wrap', gap: 1 }}
            >
              {(Object.keys(generatorMeta) as GeneratorType[]).map((key) => (
                <ToggleButton key={key} value={key} size='small'>
                  {generatorMeta[key].title}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Typography variant='body2' color='text.secondary'>
              {selectedMeta.helper}
            </Typography>

            {generatorType === 'post_generator' ? (
              <Stack spacing={1}>
                <Typography variant='subtitle2'>Post Type</Typography>
                <ToggleButtonGroup
                  value={postType}
                  exclusive
                  onChange={(_, value) => {
                    if (value) setPostType(value)
                  }}
                >
                  <ToggleButton value='offer' size='small'>Offer</ToggleButton>
                  <ToggleButton value='event' size='small'>Event</ToggleButton>
                  <ToggleButton value='update' size='small'>Update</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            ) : null}

            <Stack direction='row' spacing={1}>
              <Button variant='contained' color='secondary' onClick={handleGenerate} disabled={generating}>
                {generating ? 'Generating...' : 'Generate Variations'}
              </Button>
              <Button variant='outlined' color='inherit' onClick={() => setItems([])} disabled={generating || items.length === 0}>
                Clear
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Card variant='outlined'>
          <CardContent>
            <Typography variant='body2' color='text.secondary'>
              Generate content to see suggestions.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {items.map((item, index) => {
            const itemId = item.id || `${index}`
            const compliant = isCompliant(item)
            const saved = Boolean(savedIds[itemId])
            const charCount = item.charCount || getItemText(item).length
            const max = item.compliance?.maxRecommended
            const progress = getCharProgress(charCount, max)

            return (
              <Grid key={itemId} size={{ xs: 12, md: 6 }}>
                <Card variant='outlined' sx={{ height: '100%', borderColor: compliant ? alpha(theme.palette.success.main, 0.5) : alpha(theme.palette.warning.main, 0.5) }}>
                  <CardContent>
                    <Stack spacing={1.25}>
                      <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={1}>
                        <Typography variant='subtitle2'>{getItemTitle(item, index)}</Typography>
                        <Chip
                          size='small'
                          color={compliant ? 'success' : 'warning'}
                          icon={compliant ? <CheckCircleOutlineIcon /> : <WarningAmberIcon />}
                          label={compliant ? 'Compliant' : 'Needs review'}
                        />
                      </Stack>

                      <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', minHeight: 84 }}>
                        {getItemText(item)}
                      </Typography>

                      {item.cta ? (
                        <Chip size='small' variant='outlined' icon={<FlagCircleIcon />} label={`CTA: ${item.cta}`} sx={{ width: 'fit-content' }} />
                      ) : null}

                      <Stack spacing={0.5}>
                        <Stack direction='row' justifyContent='space-between'>
                          <Typography variant='caption' color='text.secondary'>Length</Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {max ? `${charCount} / ${max}` : `${charCount} chars`}
                          </Typography>
                        </Stack>
                        {max ? (
                          <LinearProgress
                            variant='determinate'
                            value={progress}
                            color={progress > 100 ? 'warning' : progress > 85 ? 'warning' : 'success'}
                          />
                        ) : null}
                      </Stack>

                      <Stack direction='row' spacing={1}>
                        <Tooltip title='Copy text'>
                          <span>
                            <Button
                              size='small'
                              variant='outlined'
                              startIcon={<ContentCopyIcon />}
                              onClick={() => handleCopy(item, index)}
                              sx={{ minWidth: 0 }}
                            >
                              {copiedId === itemId ? 'Copied' : 'Copy'}
                            </Button>
                          </span>
                        </Tooltip>

                        <Button
                          size='small'
                          variant='contained'
                          color='secondary'
                          startIcon={<SaveOutlinedIcon />}
                          onClick={() => handleSave(item, index)}
                          disabled={savingId === itemId || saved}
                        >
                          {saved ? 'Saved' : savingId === itemId ? 'Saving...' : 'Save Suggestion'}
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Stack>
  )
}
