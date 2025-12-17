import type { ToastOptions } from 'react-hot-toast';
import toast, { Toaster } from 'react-hot-toast';

export const showToast = {
    success: (message: string, options?: ToastOptions) => toast.success(message, options),
    error: (message: string, options?: ToastOptions) => toast.error(message, options),
    loading: (message: string, options?: ToastOptions) => toast.loading(message, options),
    dismiss: (toastId?: string) => toast.dismiss(toastId),
};

export const ToastContainer = () => {
    return <Toaster position="top-right" />;
};
