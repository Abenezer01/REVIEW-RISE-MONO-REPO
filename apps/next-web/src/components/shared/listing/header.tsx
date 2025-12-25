import { Fragment, useState, useCallback, memo } from 'react';

import { Box, Button, IconButton, Typography } from '@mui/material';

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
}

const ListHeader = memo((props: ListHeaderProps) => {
  const { title, features } = props;
  const t = useTranslation('common');

  const { filter, export: exportFeature, search } = features

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
      {filter?.enabled && filter.component && (
        <FilterList
          open={filterOpen}
          toggle={toggleFilter}
          handleFilter={handleFilterSubmit}
          FilterComponentItems={filter.component}
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
      <Box
        sx={{
          py: 4,
          px: 6,
          rowGap: 2,
          columnGap: 4,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography variant="h5">{title}</Typography>
        </Box>
        <Box
          sx={{
            rowGap: 2,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          {search?.enabled && (
            search.component ? (
              <Box sx={{ mr: 4 }}>
                <search.component onSearch={(term: string) => search.onSearch(term, features?.search?.searchKeys || [])} />
              </Box>
            ) : (
              <CustomTextField
                value={searchTerm}
                sx={{ mr: 4 }}
                onChange={handleSearchChange}
                placeholder={search?.placeholder}
              />
            )
          )}
          <Box
            sx={{
              rowGap: 2,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}
          >
            {props.createActionConfig.show &&
              (props.createActionConfig.onlyIcon ? (
                <IconButton color="primary" onClick={props.createActionConfig.onClick}>
                  <i className="tabler:plus text-2xl" />
                </IconButton>
              ) : (
                <Button onClick={props.createActionConfig.onClick} variant="contained" sx={{ '& svg': { mr: 2 } }}>
                  <i className="tabler:plus text-2xl" />
                  {t('common.create')}
                </Button>
              ))}
            {filter?.enabled && (
              <Button
                onClick={toggleFilter}
                variant="contained"
                sx={{ "& svg": { mr: 2 }, ml: 2 }}
              >
                <i className="tabler:adjustments text-2xl" />
                {t('common.filter')}
              </Button>
            )}
            {exportFeature?.enabled && exportFeature.onExport && (
              <Button
                onClick={toggleExport}
                variant="contained"
                sx={{ "& svg": { mr: 2 }, ml: 2 }}
              >
                <i className="tabler:file-export text-2xl" />
                {t('common.export')}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Fragment>
  );
});

ListHeader.displayName = 'ListHeader';

export default ListHeader;
