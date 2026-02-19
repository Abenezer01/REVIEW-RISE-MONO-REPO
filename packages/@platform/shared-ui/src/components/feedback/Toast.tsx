import type { ToastOptions } from 'react-hot-toast';
import toast, { Toaster } from 'react-hot-toast';

/**
 * @deprecated Use useSystemMessages().notify(code) instead for standardized localized messaging.
 */
export const showToast = {
    success: (message: string, options?: ToastOptions) => {
        // Fallback for legacy calls during refactoring
        console.warn('showToast.success is deprecated. Use notify(SystemMessageCode) instead.');
        toast.success(message, options);
    },
    error: (message: string, options?: ToastOptions) => {
        console.warn('showToast.error is deprecated. Use notify(SystemMessageCode) instead.');
        toast.error(message, options);
    },
    loading: (message: string, options?: ToastOptions) => toast.loading(message, options),
    dismiss: (toastId?: string) => toast.dismiss(toastId),
};

export const ToastContainer = () => {
    return <Toaster position="top-right" />;
};
