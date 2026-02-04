'use client'

import { useState, useEffect, useMemo } from 'react'

import { useTranslations } from 'next-intl'

import {
    Box,
    Switch,
    TextField,
    Button,
    Drawer,
    FormControlLabel,
    Typography,
    Divider,
    IconButton,
    Autocomplete,
    Chip,
    Slider,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material'

import { createFeatureFlag, updateFeatureFlag, type FeatureFlag } from '@/app/actions/feature-flags'

interface CreateFeatureFlagDrawerProps {
    open: boolean
    onClose: () => void
    editFlag?: FeatureFlag | null
}

interface Condition {
    id: string
    attribute: string
    operator: string
    values: string[]
}

export default function CreateFeatureFlagDrawer({ open, onClose, editFlag }: CreateFeatureFlagDrawerProps) {
    const t = useTranslations('admin.featureFlags')
    const tc = useTranslations('common')

    const ATTRIBUTES = useMemo(() => [
        { label: t('attributes.country'), value: 'country' },
        { label: t('attributes.group'), value: 'group' },
        { label: t('attributes.emailDomain'), value: 'emailDomain' },
        { label: t('attributes.browser'), value: 'browser' },
        { label: t('attributes.os'), value: 'os' },
        { label: t('attributes.deviceType'), value: 'deviceType' },
        { label: t('attributes.language'), value: 'language' },
    ], [t])

    const OPERATORS = useMemo(() => [
        { label: t('operators.in'), value: 'in' },
        { label: t('operators.not_in'), value: 'not_in' },
    ], [t])

    const [newFlag, setNewFlag] = useState({
        name: '',
        description: '',
        isEnabled: false,
        rolloutPercentage: 100,
    })

    // Specific Identity Targets
    const [targets, setTargets] = useState({
        userIds: [] as string[],
        emails: [] as string[],
    })

    // Dynamic Rule Conditions
    const [conditions, setConditions] = useState<Condition[]>([])

    // Validation errors
    const [errors, setErrors] = useState({
        name: '',
        description: '',
    })

    // Populate form when editing
    useEffect(() => {
        if (editFlag) {
            setNewFlag({
                name: editFlag.name,
                description: editFlag.description || '',
                isEnabled: editFlag.isEnabled,
                rolloutPercentage: editFlag.rolloutPercentage,
            })

            // Parse rules to populate targets and conditions
            if (editFlag.rules) {
                const rules = editFlag.rules as any

                // Extract targets
                const userIds: string[] = []
                
                const emails: string[] = []
                
                if (rules.targets && Array.isArray(rules.targets)) {
                    rules.targets.forEach((target: any) => {
                        if (target.userIds) userIds.push(...target.userIds)
                        if (target.emails) emails.push(...target.emails)
                    })
                }
                
                setTargets({ userIds, emails })

                // Extract conditions
                if (rules.conditions && Array.isArray(rules.conditions)) {
                    const parsedConditions = rules.conditions.map((cond: any, index: number) => ({
                        id: `${index}-${Date.now()}`,
                        attribute: cond.field || 'country',
                        operator: cond.operator || 'in',
                        values: cond.values || [],
                    }))
                    
                    setConditions(parsedConditions)
                }
            }
        } else {
            // Reset form when not editing
            setNewFlag({ name: '', description: '', isEnabled: false, rolloutPercentage: 100 })
            setTargets({ userIds: [], emails: [] })
            setConditions([])
            setErrors({ name: '', description: '' })
        }
    }, [editFlag])

    const handleAddCondition = () => {
        setConditions([
            ...conditions,
            {
                id: Math.random().toString(36).substr(2, 9),
                attribute: 'country',
                operator: 'in',
                values: [],
            },
        ])
    }

    const handleRemoveCondition = (id: string) => {
        setConditions(conditions.filter((c) => c.id !== id))
    }

    const handleConditionChange = (id: string, field: keyof Condition, value: any) => {
        setConditions(
            conditions.map((c) => (c.id === id ? { ...c, [field]: value } : c))
        )
    }

    const validateForm = () => {
        const newErrors = {
            name: '',
            description: '',
        }

        if (!newFlag.name.trim()) {
            newErrors.name = t('validation.nameRequired')
        } else if (newFlag.name.length < 3) {
            newErrors.name = t('validation.nameMin', { count: 3 })
        }

        if (newFlag.description && newFlag.description.length > 500) {
            newErrors.description = t('validation.descriptionMax', { count: 500 })
        }

        setErrors(newErrors)
        
        return !newErrors.name && !newErrors.description
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }

        const formData = new FormData()

        formData.append('name', newFlag.name)
        formData.append('description', newFlag.description)
        if (newFlag.isEnabled) formData.append('isEnabled', 'on')
        formData.append('rolloutPercentage', newFlag.rolloutPercentage.toString())

        // Construct complex rules JSON
        const rulesStructure: any = {
            variation: 'boolean',
            defaultValue: false,
            targets: [],
            percentage: {
                enabled: true,
                rollout: newFlag.rolloutPercentage,
            },
            conditions: [],
        }

        // Add Targets (Identity based)
        if (targets.userIds.length > 0) {
            rulesStructure.targets.push({ userIds: targets.userIds })
        }
        
        if (targets.emails.length > 0) {
            rulesStructure.targets.push({ emails: targets.emails })
        }

        // Add Conditions (Attribute based)
        conditions.forEach((cond) => {
            if (cond.values.length > 0) {
                rulesStructure.conditions.push({
                    field: cond.attribute,
                    operator: cond.operator,
                    values: cond.values,
                })
            }
        })

        formData.append('rules', JSON.stringify(rulesStructure))

        const res = editFlag
            ? await updateFeatureFlag(editFlag.id, formData)
            : await createFeatureFlag(formData)

        if (res.success) {
            onClose()
            setNewFlag({
                name: '',
                description: '',
                isEnabled: false,
                rolloutPercentage: 100,
            })
            setTargets({ userIds: [], emails: [] })
            setConditions([])
            setErrors({ name: '', description: '' })
        } else {
            alert(JSON.stringify(res.error))
        }
    }

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 600, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">{editFlag ? t('editTitle') : t('createTitle')}</Typography>
                    <IconButton onClick={onClose} edge="end">
                        <i className="tabler-x" />
                    </IconButton>
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Basic Info */}
                    <TextField
                        label={t('name')}
                        fullWidth
                        value={newFlag.name}
                        onChange={(e) => {
                            setNewFlag({ ...newFlag, name: e.target.value })
                            if (errors.name) setErrors({ ...errors, name: '' })
                        }}
                        onBlur={validateForm}
                        error={!!errors.name}
                        helperText={errors.name}
                        placeholder={t('namePlaceholder')}
                        required
                    />
                    <TextField
                        label={t('description')}
                        fullWidth
                        multiline
                        rows={2}
                        value={newFlag.description}
                        onChange={(e) => {
                            setNewFlag({ ...newFlag, description: e.target.value })
                            if (errors.description) setErrors({ ...errors, description: '' })
                        }}
                        onBlur={validateForm}
                        error={!!errors.description}
                        helperText={errors.description}
                    />
                    <Box sx={{ mt: 1 }}>
                        <Typography gutterBottom variant="body2">{t('rolloutPercentage', { value: newFlag.rolloutPercentage })}</Typography>
                        <Slider
                            value={newFlag.rolloutPercentage}
                            onChange={(_, newValue) =>
                                setNewFlag({ ...newFlag, rolloutPercentage: newValue as number })
                            }
                            valueLabelDisplay="auto"
                            min={0}
                            max={100}
                        />
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Identity Targeting */}
                    <Typography variant="subtitle2" color="text.secondary">
                        {t('identityTargets')}
                    </Typography>
                    <Stack gap={2}>
                        <Autocomplete
                            multiple
                            freeSolo
                            options={[]}
                            value={targets.userIds}
                            onChange={(_, newValue) => setTargets({ ...targets, userIds: newValue })}
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => (
                                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField {...params} label={t('userIds')} placeholder={t('userIdsPlaceholder')} size="small" />
                            )}
                        />
                        <Autocomplete
                            multiple
                            freeSolo
                            options={[]}
                            value={targets.emails}
                            onChange={(_, newValue) => setTargets({ ...targets, emails: newValue })}
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => (
                                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField {...params} label={t('emails')} placeholder={t('emailsPlaceholder')} size="small" />
                            )}
                        />
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    {/* Dynamic Conditions */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            {t('targetingRules')}
                        </Typography>
                        <Button
                            size="small"
                            startIcon={<i className="tabler-plus" />}
                            onClick={handleAddCondition}
                            variant="outlined"
                        >
                            {t('addCondition')}
                        </Button>
                    </Box>

                    <Stack gap={2}>
                        {conditions.length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.875rem' }}>
                                {t('noConditions')}
                            </Typography>
                        )}
                        {conditions.map((cond, index) => (
                            <Box key={cond.id} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{t('conditionNumber', { number: index + 1 })}</Typography>
                                    <IconButton size="small" color="error" onClick={() => handleRemoveCondition(cond.id)}>
                                        <i className="tabler-trash" />
                                    </IconButton>
                                </Box>

                                <Stack spacing={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>{t('attribute')}</InputLabel>
                                        <Select
                                            value={cond.attribute}
                                            label={t('attribute')}
                                            onChange={(e) => handleConditionChange(cond.id, 'attribute', e.target.value)}
                                        >
                                            {ATTRIBUTES.map((attr) => (
                                                <MenuItem key={attr.value} value={attr.value}>{attr.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth size="small">
                                        <InputLabel>{t('operator')}</InputLabel>
                                        <Select
                                            value={cond.operator}
                                            label={t('operator')}
                                            onChange={(e) => handleConditionChange(cond.id, 'operator', e.target.value)}
                                        >
                                            {OPERATORS.map((op) => (
                                                <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <Autocomplete
                                        multiple
                                        freeSolo
                                        size="small"
                                        options={[]}
                                        value={cond.values}
                                        onChange={(_, newValue) => handleConditionChange(cond.id, 'values', newValue)}
                                        renderTags={(value: readonly string[], getTagProps) =>
                                            value.map((option: string, index: number) => (
                                                <Chip size="small" variant="filled" label={option} {...getTagProps({ index })} key={index} />
                                            ))
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t('values')}
                                                placeholder={t('valuesPlaceholder')}
                                            />
                                        )}
                                    />
                                </Stack>
                            </Box>
                        ))}
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={newFlag.isEnabled}
                                onChange={(e) => setNewFlag({ ...newFlag, isEnabled: e.target.checked })}
                            />
                        }
                        label={t('enabled')}
                    />
                </Box>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button onClick={onClose}>{tc('cancel')}</Button>
                    <Button onClick={handleSubmit} variant="contained">{editFlag ? tc('update') : tc('create')}</Button>
                </Box>
            </Box>
        </Drawer>
    )
}
