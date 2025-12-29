import { Fragment, useState, useCallback, memo } from 'react';

import { Box, Button, Card, CardContent, Chip, Divider, IconButton, Typography } from '@mui/material';
import { Formik } from 'formik';

import CustomTextField from '@core/components/mui/TextField';

import useTranslation from '@/hooks/useTranslation';

import ExportComponentOption from './export';
import FilterList from './filter-list';

import type { CreateActionConfig, ExportConfigValues, ExportFieldOption } from '@/types/general/listing';

interface ListHeaderProps {
  createActionConfig: CreateActionConfig;
  hasFilter: boolean;
  hasSearch: boolean;
  handleFilter: (val: { [key: string]: any }) => void;
  features: {
    filter?: {
      enabled: boolean;
      onFilter: (values: Record<string, any>) => void;
      permission: {
        action: string;
        subject: string;
      };
      component?: React.ComponentType<any>;
      position?: 'sidebar' | 'top' | 'inline';
    };
    search?: {
      enabled: boolean;
      onSearch: (searchTerm: string, searchingKey: string[]) => void;
      searchKeys?: string[];
      permission: {
        action: string;
        subject: string;
      };
      component?: React.ComponentType<any>;
      placeholder?: string;
    };
    export?: {
      enabled: boolean;
      onExport?: (exportConfig: {
        export: ExportConfigValues;
      }) => Promise<void>;
      availableFields?: ExportFieldOption[];
      permission: {
        action: string;
        subject: string;
      };
    };
  };
  FilterComponentItems?: React.ComponentType<any>;
  searchKeys: string[];
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  totalCount?: number;
}

const ListHeader = memo((props: ListHeaderProps) => {
  const { title, subtitle, icon, totalCount, features, FilterComponentItems } = props;
  const t = useTranslation('common');

  const { filter, export: exportFeature, search } = features
  const filterPosition = filter?.position || 'top';
  const FilterComponent = filter?.component || FilterComponentItems;
  const SearchComponent = search?.component;

  // ** Props
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  const toggleFilter = useCallback(() => {
    setFilterOpen((prev) => !prev);
  }, []);

  const [exportOpen, setExportOpen] = useState<boolean>(false);

  const toggleExport = useCallback(() => {
    setExportOpen((prev) => !prev);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);



  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;

    setSearchTerm(term);

    if (timerId) {
      clearTimeout(timerId);
    }

    const newTimerId = setTimeout(() => {
      search?.onSearch?.(term, features?.search?.searchKeys || []);
    }, 500); // Reduced from 2000ms to 500ms for better UX

    setTimerId(newTimerId);
  }, [timerId, search, features?.search?.searchKeys]);

  const handleFilterSubmit = useCallback((values: Record<string, any>) => {
    filter?.onFilter?.(values);
  }, [filter]);

  const handleExportSubmit = useCallback((exportConfig: {
    format: string;
    fields: string[];
    currentPageOnly: boolean;
  }) => {
    if (exportFeature?.onExport) {
      exportFeature.onExport({
        export: {
          format: exportConfig.format,
          fields: exportConfig.fields,
          currentPageOnly: exportConfig.currentPageOnly,
        },
      });
    }
  }, [exportFeature]);


  return (
    <Fragment>
      {filter?.enabled && FilterComponent && filterPosition === 'sidebar' && (
        <FilterList
          open={filterOpen}
          toggle={toggleFilter}
          handleFilter={handleFilterSubmit}
          FilterComponentItems={FilterComponent}
          initialValues={{
            is_child: false,
          }}
        />
      )}
      {exportFeature?.enabled && (
        <ExportComponentOption
          open={exportOpen}
          toggle={toggleExport}
          handleExport={handleExportSubmit}
          availableFields={exportFeature?.availableFields || []}
          availableFormats={["excel", "pdf"]}
        />
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          {/* Header Row: Icon, Title/Subtitle, Badge */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {icon && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    color: 'error.main' // Assuming warning/error icon style from image, or make configurable
                  }}
                >
                  {icon}
                </Box>
              )}
              <Box>
                <Typography variant="h5">{title}</Typography>
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
            {totalCount !== undefined && (
              <Chip
                label={`${totalCount} ${t('common.found') || 'Found'}`} // Adjust translation key as needed
                color="primary"
                variant="tonal"
                size="small"
              />
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Controls Row: Search, Filter (Inline), Buttons */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 2,
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1, minWidth: 300 }}>
              {search?.enabled && (
                SearchComponent ? (
                  <Box sx={{ flex: 1 }}>
                    <SearchComponent onSearch={(term: string) => search.onSearch(term, features?.search?.searchKeys || [])} />
                  </Box>
                ) : (
                  <CustomTextField
                    value={searchTerm}
                    placeholder={search?.placeholder || t('common.search-placeholder') || 'Search...'}
                    onChange={handleSearchChange}
                    sx={{ flex: 1 }}
                    InputProps={{
                      startAdornment: <i className="tabler-search text-xl mr-2" />
                    }}
                  />
                )
              )}

              {/* Inline Filter */}
              {filter?.enabled && FilterComponent && (filterPosition === 'inline' || filterPosition === 'top') && (
                <Box sx={{ flex: 1 }}>
                  {/* Wrap inline filter in Formik since most filter components expect it */}
                  <Formik
                    initialValues={{}}
                    onSubmit={(values) => handleFilterSubmit(values)}
                  >
                    {(formik) => (
                      <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
                        <FilterComponent formik={formik} />
                        {/* Note: Inline filters usually need to trigger submit on change or have their own logic.
                            If the component expects to be in a form, this wrapper provides it.
                        */}
                      </form>
                    )}
                  </Formik>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {/* Show separate filter button only if sidebar or collapsible top (which we replaced with inline for 'top' but let's keep logic flexible)
                   Actually, if position is 'top' or 'inline', we render it inline above.
                   If position is 'sidebar', we show the button.
               */}
              {filter?.enabled && filterPosition === 'sidebar' && (
                <Button
                  onClick={toggleFilter}
                  variant="outlined"
                  sx={{ gap: 2 }}
                >
                  <i className="tabler-adjustments" />
                  {t('common.filter')}
                </Button>
              )}

              {exportFeature?.enabled && exportFeature.onExport && (
                <Button
                  onClick={toggleExport}
                  variant="tonal"
                  color="secondary"
                  sx={{ gap: 2 }}
                >
                  <i className="tabler-upload" />
                  {t('common.export')}
                </Button>
              )}

              {props.createActionConfig.show &&
                (props.createActionConfig.onlyIcon ? (
                  <IconButton color="primary" onClick={props.createActionConfig.onClick}>
                    <i className="tabler-plus" />
                  </IconButton>
                ) : (
                  <Button onClick={props.createActionConfig.onClick} variant="contained" sx={{ gap: 2 }}>
                    <i className="tabler-plus" />
                    {t('common.create')}
                  </Button>
                ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Fragment>
  );
});

ListHeader.displayName = 'ListHeader';

export default ListHeader;
