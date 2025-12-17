import type { ConfirmationDialogProps } from './confirmation-dialog';
import ConfirmationDialog from './confirmation-dialog';

type DeleteConfirmationDialogProps = Omit<ConfirmationDialogProps, 'title' | 'content'>;

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({ open, handleClose, onConfirm, onCancel }) => {
  const confirmationDialogProps: ConfirmationDialogProps = {
    open,
    handleClose,
    title: 'Delete Confirmation',
    content: 'Are you sure you want to delete this item?',
    onConfirm: onConfirm,
    onCancel
  };

  return <ConfirmationDialog {...confirmationDialogProps} />;
};

export default DeleteConfirmationDialog;
