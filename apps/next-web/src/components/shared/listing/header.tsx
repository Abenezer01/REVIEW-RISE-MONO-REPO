// ** MUI Imports
import { Fragment, useContext, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

// ** Custom Component Import

// ** Icon Imports


import { IconButton, Typography } from '@mui/material';

import { useTranslation } from '@/hooks/useTranslation';
import FilterList from './filter';

import type { ExportConfigValues, ExportFieldOption } from './export';
import ExportComponentOption from './export';
import CustomTextField from '@/@core/components/mui/TextField';
import { AbilityContext } from '../layouts/other/Can';
import type { CreateActionConfig } from '@/types/general/listing';

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

  const { filter, export: exportFeature, search } = features

  // ** Props
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const transl = useTranslation();
  const [exportOpen, setExportOpen] = useState<boolean>(false);

  const toggleExport = () => {
    setExportOpen(!exportOpen);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const ability = useContext(AbilityContext);



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
          <Typography variant="h5">{transl(props.title)}</Typography>
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
            <CustomTextField
              value={searchTerm}
              sx={{ mr: 4 }}
              placeholder={"Search " + transl(title)}
              onChange={handleSearchChange}
            />
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
              ability.can(props.createActionConfig.permission.action, props.createActionConfig.permission.subject) &&
              (props.createActionConfig.onlyIcon ? (
                <IconButton color="primary" onClick={props.createActionConfig.onClick}>
                  <i className="tabler:plus text-2xl" />
                </IconButton>
              ) : (
                <Button onClick={props.createActionConfig.onClick} variant="contained" sx={{ '& svg': { mr: 2 } }}>
                  <i className="tabler:plus text-2xl" />
                  {transl('common.create')}
                </Button>
              ))}
            {filter?.enabled && (
              <Button
                onClick={toggleFilter}
                variant="contained"
                sx={{ "& svg": { mr: 2 }, ml: 2 }}
              >
                <i className="tabler:adjustments text-2xl" />
                {transl("filter")}
              </Button>
            )}
            {exportFeature?.enabled && exportFeature.onExport && (
              <Button
                onClick={toggleExport}
                variant="contained"
                sx={{ "& svg": { mr: 2 }, ml: 2 }}
              >
                <i className="tabler:file-export text-2xl" />
                {transl("export")}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Fragment>
  );
};

export default ListHeader;
