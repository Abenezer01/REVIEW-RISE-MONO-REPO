import type { AbilityRule } from './permission';

export interface CreateActionConfig {
  onClick: () => void;
  permission: AbilityRule;
  onlyIcon: boolean;
  show: boolean;
}
export const defaultCreateActionConfig = {
  show: true,
  permission: { action: '', subject: '' },
  onlyIcon: false,
  onClick: () => { }
};

export interface ExportFieldOption {
  field: string;
  headerName: string;
}

export interface ExportConfigValues {
  format: string;
  fields: string[];
  currentPageOnly: boolean;
}
