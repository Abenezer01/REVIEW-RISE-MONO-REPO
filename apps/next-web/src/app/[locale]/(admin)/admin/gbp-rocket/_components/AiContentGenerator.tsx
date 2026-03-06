/* eslint-disable import/no-unresolved */
/* eslint-disable react/jsx-no-literals */
'use client'

import { useMemo, useState } from 'react'
import { isAxiosError } from 'axios'

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
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
  postType?: string
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

const generatorMeta: Record<GeneratorType, { title: string; helper: string; icon: React.ReactNode }> = {
  business_description: {
    title: 'Business Description',
    helper: 'Generate 2-3 GBP-ready business descriptions.',
    icon: <LightbulbOutlinedIcon fontSize='small' />
  },
  service_descriptions: {
    title: 'Service Descriptions',
    helper: 'Create short service blurbs users can copy to GBP.',
    icon: <LocalOfferOutlinedIcon fontSize='small' />
  },
  category_recommendations: {
    title: 'Category Recommendations',
    helper: 'Get category ideas with quick reasoning.',
    icon: <CategoryOutlinedIcon fontSize='small' />
  },
  post_generator: {
    title: 'GBP Post Generator',
    helper: 'Generate post-ready text with CTA and policy checks.',
    icon: <AutoAwesomeIcon fontSize='small' />
  },
  qa_suggestions: {
    title: 'Q&A Suggestions',
    helper: 'Generate customer question/answer pairs.',
    icon: <HelpOutlineIcon fontSize='small' />
  }
}

const getItemTitle = (item: GeneratedItem, index: number) =>
  item.title || item.serviceName || item.category || item.question || `Suggestion ${index + 1}`

const getPrimaryText = (item: GeneratedItem) => item.text || item.blurb || item.reason || item.answer || 'N/A'

const isCompliant = (item: GeneratedItem) => {
  if (!item.compliance) return true

  return Boolean(item.compliance.withinLimit && item.compliance.noSpam && item.compliance.formattingOk)
}

const getCharProgress = (charCount?: number, maxRecommended?: number) => {
  if (!charCount || !maxRecommended || maxRecommended <= 0) return 0

  return Math.min(100, Math.round((charCount / maxRecommended) * 100))
}

const buildCopyText = (type: GeneratorType, item: GeneratedItem) => {
  if (type === 'service_descriptions') {
    return `${item.serviceName || 'Service'}\n${item.blurb || ''}`.trim()
  }

  if (type === 'category_recommendations') {
    return `Category: ${item.category || ''}\nReason: ${item.reason || ''}`.trim()
  }

  if (type === 'qa_suggestions') {
    return `Q: ${item.question || ''}\nA: ${item.answer || ''}`.trim()
  }

  if (type === 'post_generator') {
    return `Post (${item.postType || 'update'})\n${item.text || ''}${item.cta ? `\nCTA: ${item.cta}` : ''}`.trim()
  }

  return item.text || getPrimaryText(item)
}

function ContentPreview({ type, item }: { type: GeneratorType; item: GeneratedItem }) {
  const boxStyle = {
    p: 1.25,
    borderRadius: 1.5,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper'
  } as const

  if (type === 'service_descriptions') {
    return (
      <Stack spacing={1} sx={boxStyle}>
        <Typography variant='caption' color='text.secondary'>Service</Typography>
        <Typography variant='subtitle2'>{item.serviceName || 'N/A'}</Typography>
        <Typography variant='caption' color='text.secondary'>Description</Typography>
        <Typography variant='body2'>{item.blurb || 'N/A'}</Typography>
      </Stack>
    )
  }

  if (type === 'category_recommendations') {
    return (
      <Stack spacing={1} sx={boxStyle}>
        <Typography variant='caption' color='text.secondary'>Recommended Category</Typography>
        <Typography variant='subtitle2'>{item.category || 'N/A'}</Typography>
        <Typography variant='caption' color='text.secondary'>Why</Typography>
        <Typography variant='body2'>{item.reason || 'N/A'}</Typography>
      </Stack>
    )
  }

  if (type === 'qa_suggestions') {
    return (
      <Stack spacing={1} sx={boxStyle}>
        <Typography variant='caption' color='text.secondary'>Question</Typography>
        <Typography variant='subtitle2'>{item.question || 'N/A'}</Typography>
        <Typography variant='caption' color='text.secondary'>Answer</Typography>
        <Typography variant='body2'>{item.answer || 'N/A'}</Typography>
      </Stack>
    )
  }

  if (type === 'post_generator') {
    return (
      <Stack spacing={1} sx={boxStyle}>
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Typography variant='caption' color='text.secondary'>Post Content</Typography>
          <Chip size='small' variant='outlined' label={(item.postType || 'update').toUpperCase()} />
        </Stack>
        <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>{item.text || 'N/A'}</Typography>
        {item.cta ? <Chip size='small' color='secondary' variant='outlined' label={`CTA: ${item.cta}`} sx={{ width: 'fit-content' }} /> : null}
      </Stack>
    )
  }

  return (
    <Stack spacing={1} sx={boxStyle}>
      <Typography variant='caption' color='text.secondary'>Description</Typography>
      <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>{item.text || 'N/A'}</Typography>
    </Stack>
  )
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
        { type: generatorType, item: { ...item, postType } },
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
      await navigator.clipboard.writeText(buildCopyText(generatorType, { ...item, postType }))
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
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.15)} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`
        }}
      >
        <CardContent>
          <Stack spacing={1.5}>
            <Stack direction='row' spacing={1} alignItems='center'>
              <AutoAwesomeIcon color='secondary' />
              <Typography variant='h6' fontWeight={700}>AI Content Studio</Typography>
            </Stack>
            <Typography variant='body2' color='text.secondary'>
              Generate structured GBP-ready content, then copy or save the best option as a suggestion.
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
                  <Stack direction='row' spacing={0.75} alignItems='center'>
                    {generatorMeta[key].icon}
                    <span>{generatorMeta[key].title}</span>
                  </Stack>
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
              Generate content to see structured suggestions.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {items.map((item, index) => {
            const itemId = item.id || `${index}`
            const compliant = isCompliant(item)
            const saved = Boolean(savedIds[itemId])
            const charCount = item.charCount || getPrimaryText(item).length
            const max = item.compliance?.maxRecommended
            const progress = getCharProgress(charCount, max)

            return (
              <Grid key={itemId} size={{ xs: 12, md: 6 }}>
                <Card variant='outlined' sx={{ height: '100%', borderColor: compliant ? alpha(theme.palette.success.main, 0.45) : alpha(theme.palette.warning.main, 0.45) }}>
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

                      <ContentPreview type={generatorType} item={{ ...item, postType }} />

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
                            color={progress > 85 ? 'warning' : 'success'}
                          />
                        ) : null}
                      </Stack>

                      <Stack direction='row' spacing={1}>
                        <Tooltip title='Copy formatted content'>
                          <span>
                            <Button
                              size='small'
                              variant='outlined'
                              startIcon={<ContentCopyIcon />}
                              onClick={() => handleCopy(item, index)}
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
