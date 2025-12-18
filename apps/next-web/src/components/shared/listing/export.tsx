import React from 'react';

import { Formik } from 'formik';
import { LoadingButton } from '@mui/lab';
import {
    Box, Button, Grid, Typography, FormControl,
    InputLabel, Select, MenuItem, Checkbox,
    FormControlLabel
} from '@mui/material';

import useTranslation from '@/hooks/useTranslation';
import CustomSwitch from '../form/custom-switch';
import CustomSideDrawer from '../drawer/side-drawer';
import type { ExportConfigValues, ExportFieldOption } from '@/types/general/listing';

interface ExportComponentOptionProps {
    open: boolean;
    toggle: () => void;

    // Function to handle the final export request
    handleExport: (exportConfig: ExportConfigValues) => void;

    // List of fields available for export (e.g., all database columns)
    availableFields: ExportFieldOption[];

    // List of formats the server supports
    availableFormats?: string[];
    initialExportValues?: ExportConfigValues;
}

const ExportComponentOption: React.FC<ExportComponentOptionProps> = ({
    open,
    toggle,
    handleExport,
    availableFields,
    availableFormats = ["csv", "excel", "pdf"],
    initialExportValues = {
        format: 'csv',
        fields: availableFields.map(field => field.field),
        currentPageOnly: false,
    },
}) => {
    const t = useTranslation('common');

    const handleClose = () => {
        toggle();
    };

    const handleApplyExport = async (values: ExportConfigValues, { setSubmitting }: any) => {
        try {
            await handleExport(values);
            handleClose();
        } catch (error) {
            console.error("Export failure:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <CustomSideDrawer title={t('common.export')} handleClose={handleClose} open={open}>
            {() => (
                <Formik
                    initialValues={initialExportValues}
                    onSubmit={handleApplyExport}
                    enableReinitialize={true}
                >
                    {(formik) => (
                        <form onSubmit={formik.handleSubmit}>
                            <Grid container spacing={4}>
                                {/* 1. Format Selector */}
                                <Grid size={12}>
                                    <FormControl fullWidth>
                                        <InputLabel id="export-format-label">
                                            {t('common.exportFormat')}
                                        </InputLabel>
                                        <Select
                                            labelId="export-format-label"
                                            id="format"
                                            name="format"
                                            label={t('common.exportFormat')}
                                            value={formik.values.format}
                                            onChange={formik.handleChange}
                                            error={formik.touched.format && Boolean(formik.errors.format)}
                                        >
                                            {availableFormats.map(format => (
                                                <MenuItem key={format} value={format}>
                                                    {format.toUpperCase()}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* 2. Page Scope Toggle (Common Option) */}
                                <Grid size={12}>
                                    <FormControlLabel
                                        control={
                                            <CustomSwitch
                                                checked={formik.values.currentPageOnly}
                                                onChange={formik.handleChange}
                                                name="currentPageOnly"
                                                color="primary"
                                            />
                                        }
                                        label={t("common.exportCurrentPageOnly")}
                                    />
                                </Grid>

                                {/* 3. Fields Selector (Checkboxes) */}
                                <Grid size={12}>
                                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                        {t("common.selectFields")}
                                    </Typography>
                                    <Box sx={{ maxHeight: 250, overflowY: 'auto', border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                                        {availableFields.map(field => (
                                            <FormControlLabel
                                                key={field.field}
                                                control={
                                                    <Checkbox
                                                        checked={formik.values.fields.includes(field.field)}
                                                        onChange={() => {
                                                            const set = new Set(formik.values.fields);

                                                            if (set.has(field.field)) {
                                                                set.delete(field.field);
                                                            } else {
                                                                set.add(field.field);
                                                            }

                                                            formik.setFieldValue('fields', Array.from(set));
                                                        }}
                                                        name="fields"
                                                        color="default"
                                                    />
                                                }
                                                label={t(field.headerName)}
                                            />
                                        ))}
                                    </Box>
                                </Grid>

                                {/* Action Buttons */}
                                <Grid size={12} sx={{ mt: 5 }}>
                                    <LoadingButton
                                        loading={formik.isSubmitting}
                                        loadingPosition="center"
                                        disabled={formik.isSubmitting || !formik.isValid}
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                    >
                                        <span>
                                            {t("common.export")}
                                        </span>
                                    </LoadingButton>

                                    <Button
                                        onClick={handleClose}
                                        sx={{ ml: 2 }}
                                        variant="outlined"
                                        color="secondary"
                                    >
                                        {t("common.cancel")}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    )}
                </Formik>
            )}
        </CustomSideDrawer>
    );
};

export default ExportComponentOption;