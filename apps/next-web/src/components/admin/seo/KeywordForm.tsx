'use client'

import { useState } from 'react'

import * as Yup from 'yup'
import axios from 'axios'
import { Grid, Stack, Button, TextField, Typography, Card, CardContent } from '@mui/material'

import type { KeywordDTO } from '@platform/contracts'

import FormPageWrapper from '@/components/shared/form/form-wrapper'
import CustomTextBox from '@/components/shared/form/custom-text-box'
import CustomTagsInput from '@/components/shared/form/custom-tags-input'
import CustomSelectBox from '@/components/shared/form/custom-select'

const API_URL = 'http://localhost:3012/api/v1'

interface KeywordFormProps {
  businessId: string
  initialData?: KeywordDTO | null
  onCancel: () => void
  onSuccess: () => Promise<void> | void
}

const KeywordForm = ({ businessId, initialData, onCancel, onSuccess }: KeywordFormProps) => {
  const [competitorDomain, setCompetitorDomain] = useState('')
  const [suggestions, setSuggestions] = useState<{ keyword: string; tags: string[] }[]>([])
  const [harvested, setHarvested] = useState<{ keyword: string; tags: string[] }[]>([])

  const handleSuggest = async () => {
    const res = await axios.get(`${API_URL}/keywords/suggest`, {
      params: { businessId, category: 'services', limit: 20 }
    })

    setSuggestions(res.data?.data?.suggestions || [])
  }

  const handleHarvest = async () => {
    if (!competitorDomain) return

    const res = await axios.post(`${API_URL}/keywords/harvest`, {
      businessId,
      competitorDomain,
      limit: 20
    })

    setHarvested(res.data?.data?.keywords || [])
  }

  return (
    <FormPageWrapper
      renderPage={false}
      validationSchema={Yup.object().shape({
        keyword: Yup.string().required('Keyword is required'),
        language: Yup.string().nullable(),
        deviceType: Yup.string().oneOf(['mobile', 'desktop']).nullable(),
        city: Yup.string().nullable(),
        country: Yup.string().nullable(),
        tags: Yup.array().of(Yup.string()).nullable(),
        businessId: Yup.string().required('Account is required')
      })}
      initialValues={{
        businessId: businessId || '',
        keyword: initialData?.keyword || '',
        language: initialData?.language || 'en',
        deviceType: initialData?.deviceType || 'mobile',
        city: initialData?.city || '',
        country: initialData?.country || '',
        tags: initialData?.tags || []
      } as any}
      title="SEO Keyword"
      translatedTitle="SEO Keyword"
      edit={!!initialData}
      onCancel={onCancel}
      getPayload={(values: any) => ({
        data: {
          ...values,
          tags: Array.isArray(values.tags)
            ? values.tags
            : String(values.tags || '')
              .split(',')
              .map(t => t.trim())
              .filter(Boolean)
        },
        files: []
      })}
      createActionFunc={async (payload: any) => {
        const res = await axios.post(`${API_URL}/keywords`, payload.data)


        return res.data
      }}
      onActionSuccess={onSuccess}
    >
      {(formik) => (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CustomTextBox name="keyword" label="Keyword" fullWidth />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CustomSelectBox
              name="language"
              label="Language"
              options={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'Arabic' }]}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CustomSelectBox
              name="deviceType"
              label="Device"
              options={[{ value: 'mobile', label: 'Mobile' }, { value: 'desktop', label: 'Desktop' }]}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CustomTextBox name="city" label="City" fullWidth />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CustomTextBox name="country" label="Country" fullWidth />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomTagsInput name="tags" label="Tags (comma separated)" fullWidth multiline />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button variant="outlined" onClick={handleSuggest} disabled={!businessId}>Auto-suggest</Button>
              <TextField label="Competitor Domain" value={competitorDomain} onChange={e => setCompetitorDomain(e.target.value)} sx={{ minWidth: 240 }} />
              <Button variant="outlined" onClick={handleHarvest} disabled={!businessId || !competitorDomain}>Harvest Competitor</Button>
            </Stack>
          </Grid>
          {(suggestions.length > 0 || harvested.length > 0) && (
            <Grid size={{ xs: 12 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mt={2}>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h6">Auto-suggested</Typography>
                    <Stack spacing={1} mt={2}>
                      {suggestions.map((s, i) => (
                        <Stack key={i} direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" sx={{ flex: 1 }}>{s.keyword}</Typography>
                          <Button
                            size="small"
                            onClick={() => {
                              formik.setFieldValue('keyword', s.keyword)
                              formik.setFieldValue('tags', s.tags)
                            }}
                          >
                            Use
                          </Button>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h6">Competitor Harvest</Typography>
                    <Stack spacing={1} mt={2}>
                      {harvested.map((s, i) => (
                        <Stack key={i} direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" sx={{ flex: 1 }}>{s.keyword}</Typography>
                          <Button
                            size="small"
                            onClick={() => {
                              formik.setFieldValue('keyword', s.keyword)
                              formik.setFieldValue('tags', s.tags)
                            }}
                          >
                            Use
                          </Button>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          )}
        </Grid>
      )}
    </FormPageWrapper>
  )
}

export default KeywordForm

