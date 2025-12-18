import { Fragment, useState } from 'react';

import { Box, Button, IconButton, Typography } from '@mui/material';

import useTranslation from '@/hooks/useTranslation';

import CustomTextField from '@core/components/mui/TextField';
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

const ListHeader = (props: ListHeaderProps) => {
  const { title, features } = props;
  const t = useTranslation('common');

  const { filter, export: exportFeature, search } = features

  // ** Props
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const [exportOpen, setExportOpen] = useState<boolean>(false);

  const toggleExport = () => {
    setExportOpen(!exportOpen);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);



  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;

    setSearchTerm(term);

    if (timerId) {
      clearTimeout(timerId);
    }

    const newTimerId = setTimeout(() => {
      search?.onSearch?.(term, features?.search?.searchKeys || []);
    }, 2000);

    setTimerId(newTimerId);
  };

  const handleFilterSubmit = (values: Record<string, any>) => {
    filter?.onFilter?.(values);
  };

  const handleExportSubmit = (exportConfig: {
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
  };


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
};

export default ListHeader;
