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
  onClick: () => {}
};
