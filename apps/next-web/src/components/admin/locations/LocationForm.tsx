'use client'

import { useMemo } from 'react'

import { useRouter } from 'next/navigation'

import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import Grid from '@mui/material/Grid'

import Typography from '@mui/material/Typography'

import type { ApiResponse, ApiPayload } from '@platform/contracts'

import CustomTextBox from '@/components/shared/form/custom-text-box'
import CustomSelectBox from '@/components/shared/form/custom-select'
import FormBackendAutocomplete from '@/components/shared/form/FormBackendAutocomplete'

import { useTranslation } from '@/hooks/useTranslation'
import apiClient from '@/lib/apiClient'
import FormPageWrapper from '@/components/shared/form/form-wrapper'


const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    address: Yup.string(),
    timezone: Yup.string(),
    tags: Yup.array().of(Yup.string()),
    businessId: Yup.string().required('Account is required'),
    platformIds: Yup.object({
        googlePlaceId: Yup.string(),
        facebookPageId: Yup.string()
    }).nullable(),
    status: Yup.string().oneOf(['active', 'archived', 'deleted'])
})

interface LocationFormData {
    name: string
    address?: string
    timezone?: string
    tags?: string[]
    businessId: string
    platformIds?: {
        googlePlaceId?: string
        facebookPageId?: string
    }
    status?: string
}

interface LocationFormProps {
    initialData?: LocationFormData & { id?: string }
    isEdit?: boolean
    onCancel?: () => void
    onSuccess?: () => void
}

const LocationForm = ({ initialData, isEdit = false, onCancel, onSuccess }: LocationFormProps) => {
    const router = useRouter()
    const t = useTranslation('dashboard')

    const initialValues: LocationFormData = useMemo(() => ({
        name: initialData?.name || '',
        address: initialData?.address || '',
        timezone: initialData?.timezone || '',
        tags: initialData?.tags || [],
        businessId: initialData?.businessId || '',
        status: initialData?.status || 'active',
        platformIds: {
            googlePlaceId: initialData?.platformIds?.googlePlaceId || '',
            facebookPageId: initialData?.platformIds?.facebookPageId || ''
        }
    }), [initialData])

    const statusOptions = useMemo(() => [
        { value: 'active', label: t('locations.form.active') },
        { value: 'archived', label: t('locations.form.archived') }
    ], [t])

    const getPayload = (values: LocationFormData): ApiPayload<LocationFormData> => {
        return {
            data: values
        }
    }

    const createActionFunc = async (payload: ApiPayload<LocationFormData>): Promise<ApiResponse<LocationFormData>> => {
        const { data } = payload

        if (isEdit && initialData?.id) {
            const res = await apiClient.patch(`/admin/locations/${initialData.id}`, data)


            return res.data
        } else {
            const res = await apiClient.post('/admin/locations', data)


            return res.data
        }
    }

    const onActionSuccess = () => {
        if (onSuccess) {
            onSuccess()
        } else {
            router.push('/admin/locations')
            router.refresh()
        }
    }

    return (
        <FormPageWrapper
            title={t('locations.listTitle')}
            translatedTitle={isEdit ? t('locations.editTitle') : t('locations.createTitle')}
            edit={isEdit}
            initialValues={initialValues}
            validationSchema={validationSchema}
            getPayload={getPayload}
            createActionFunc={createActionFunc}
            onActionSuccess={onActionSuccess}
            baseUrl="/admin/locations"
            renderPage={!onCancel}
            onCancel={onCancel}
        >
            {(formik: FormikProps<LocationFormData>) => (
                <Grid container spacing={5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextBox
                            formik={formik}
                            fullWidth
                            label={t('locations.form.name')}
                            name='name'
                            placeholder={t('locations.form.name')}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormBackendAutocomplete
                            label={t('locations.form.businessId')}
                            name='businessId'
                            endpoint='/admin/businesses'
                            placeholder={t('locations.form.businessId')}
                            disabled={isEdit}
                            initialObject={initialData ? (initialData as any).business : null}
                        />
                    </Grid>
                    <Grid size={12}>
                        <CustomTextBox
                            fullWidth
                            label={t('locations.form.address')}
                            name='address'
                            placeholder={t('locations.form.address')}
                            multiline
                            rows={2}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextBox
                            fullWidth
                            label={t('locations.form.timezone')}
                            name='timezone'
                            placeholder='America/New_York'
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomSelectBox
                            fullWidth
                            label={t('locations.form.status')}
                            name='status'
                            options={statusOptions}
                        />
                    </Grid>

                    <Grid size={12}>
                        <Typography variant='h6' sx={{ mb: 2 }}>{t('locations.form.platformConnections')}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextBox
                            fullWidth
                            label={t('locations.form.googlePlaceId')}
                            name='platformIds.googlePlaceId'
                            placeholder='ChIJ...'
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextBox
                            fullWidth
                            label={t('locations.form.facebookPageId')}
                            name='platformIds.facebookPageId'
                        />
                    </Grid>
                </Grid>
            )}
        </FormPageWrapper>
    )
}


export default LocationForm
