import type { MouseEvent } from 'react';
import { useState } from 'react';

import { IconButton, Menu, MenuItem } from '@mui/material';

import toast from 'react-hot-toast';

import type { AbilityRule } from '@/types/general/permission';


import DeleteConfirmationDialog from '../dialog/delete-confirmation-dialog';
import Can from '../layouts/other/Can';

interface RowOption {
  name: string;
  icon: string;
  onClick: () => void;
  permission: AbilityRule;
}

interface RowOptionsProps<T extends { id?: string }> {
  item: T;
  options?: RowOption[];
  onEdit?: (item: T) => void;
  onDelete?: () => Promise<void> | void;
  deletePermissionRule?: AbilityRule;
  editPermissionRule?: AbilityRule;
}

const RowOptions = <T extends { id?: string }>({
  item,
  options,
  onEdit,
  onDelete,
  deletePermissionRule,
  editPermissionRule,
}: RowOptionsProps<T>) => {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);
  const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      await onDelete();
      toast.success('Item successfully deleted');
      handleCloseDeleteDialog();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleRowOptionsClose = () => setAnchorEl(null);

  const handleEdit = () => {
    if (!onEdit) return;
    onEdit(item);
    handleRowOptionsClose();
  };

  const rowOptionsOpen = Boolean(anchorEl);

  return (
    <>
      <IconButton size="small" onClick={handleRowOptionsClick}>
        <i className="tabler:dots-vertical" />
      </IconButton>

      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={rowOptionsOpen}
        onClose={handleRowOptionsClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ style: { minWidth: '8rem' } }}
      >
        {options?.map((option, index) => (
          <MenuItem key={index} onClick={option.onClick} sx={{ '& svg': { mr: 2 } }}>
            <i className={option.icon + ' text-[20px]'} />
            {option.name}
          </MenuItem>
        ))}

        {onEdit && editPermissionRule && (
          <Can do={editPermissionRule.action} on={editPermissionRule.subject}>
            <MenuItem onClick={handleEdit} sx={{ '& svg': { mr: 2 } }}>
              <i className="tabler:edit text-[20px]" />
              Edit
            </MenuItem>
          </Can>
        )}

        {onDelete && deletePermissionRule && (
          <Can do={deletePermissionRule.action} on={deletePermissionRule.subject}>
            <MenuItem onClick={handleOpenDeleteDialog} sx={{ '& svg': { mr: 2 } }}>
              <i className="tabler:trash text-[20px]" />
              Delete
            </MenuItem>
          </Can>
        )}
      </Menu>

      <DeleteConfirmationDialog
        handleClose={handleCloseDeleteDialog}
        open={isDeleteDialogOpen}
        onCancel={handleCloseDeleteDialog}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default RowOptions;
