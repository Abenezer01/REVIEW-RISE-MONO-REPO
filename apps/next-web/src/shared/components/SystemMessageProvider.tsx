'use client';

import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';

import { toast, Toaster } from 'react-hot-toast';
import { useTranslations } from 'next-intl';

import type {
  SystemMessageCode
} from '@platform/contracts';
import {
  SystemMessageSeverity,
  DefaultSeverityMap
} from '@platform/contracts';
import { systemMessageEvents, SYSTEM_MESSAGE_EVENT } from '@platform/utils';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  AlertTitle
} from '@mui/material';

export type MessageVariant = 'TOAST' | 'INLINE' | 'MODAL';

export interface NotifyOptions {
  variant?: MessageVariant;
  severity?: SystemMessageSeverity | string;
  params?: Record<string, any>;
  title?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  persist?: boolean; // For INLINE variant
}

interface SystemMessageContextType {
  notify: (
    codeOrConfig: SystemMessageCode | string | ({ messageCode: SystemMessageCode | string } & NotifyOptions),
    options?: NotifyOptions
  ) => void;
}

const SystemMessageContext = createContext<SystemMessageContextType | undefined>(undefined);

export const useSystemMessages = () => {
  const context = useContext(SystemMessageContext);

  if (!context) {
    throw new Error('useSystemMessages must be used within a SystemMessageProvider');
  }

  return context;
};

interface ModalState {
  isOpen: boolean;
  code: SystemMessageCode | null;
  options?: NotifyOptions;
}

export const SystemMessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const t = useTranslations('systemMessages');
  const [modal, setModal] = useState<ModalState>({ isOpen: false, code: null });
  const [inlineMessages, setInlineMessages] = useState<Array<{ id: string; code: SystemMessageCode; options: NotifyOptions }>>([]);

  // Track active toast IDs to prevent duplicates
  const activeToasts = useRef<Set<string>>(new Set());

  const getMessage = useCallback((code: SystemMessageCode, params?: Record<string, any>) => {
    try {
      return t(code, params);
    } catch {
      // Fallback to code if translation missing
      return code;
    }
  }, [t]);

  const notify = useCallback((codeOrConfig: any, options: NotifyOptions = {}) => {
    let code: string;
    let finalOptions: NotifyOptions;

    if (typeof codeOrConfig === 'object' && codeOrConfig !== null && 'messageCode' in codeOrConfig) {
      code = codeOrConfig.messageCode;
      finalOptions = { ...codeOrConfig, ...options };
    } else {
      code = codeOrConfig;
      finalOptions = options;
    }

    const severity = finalOptions.severity || DefaultSeverityMap[code as SystemMessageCode] || SystemMessageSeverity.INFO;
    const variant = finalOptions.variant || 'TOAST';
    const message = getMessage(code as any, finalOptions.params);
    const toastId = `${code}-${JSON.stringify(finalOptions.params || {})}`;

    if (variant === 'TOAST') {
      // Deduplication
      if (activeToasts.current.has(toastId)) return;

      activeToasts.current.add(toastId);

      const duration = severity === SystemMessageSeverity.ERROR ? 5000 : 3000;

      const toastOptions = {
        id: toastId,
        duration,
      };

      // Clear from activeToasts after duration + buffer
      setTimeout(() => {
        activeToasts.current.delete(toastId);
      }, duration + 500);

      switch (severity) {
        case SystemMessageSeverity.SUCCESS:
          toast.success(message, toastOptions);
          break;
        case SystemMessageSeverity.ERROR:
          toast.error(message, toastOptions);
          break;
        case SystemMessageSeverity.WARNING:
          toast(message, { ...toastOptions, icon: '⚠️' });
          break;
        default:
          toast(message, toastOptions);
      }
    } else if (variant === 'MODAL') {
      setModal({ isOpen: true, code: code as any, options: finalOptions });
    } else if (variant === 'INLINE') {
      const id = Math.random().toString(36).substring(7);

      setInlineMessages(prev => [...prev, { id, code: code as any, options: finalOptions }]);

      if (!finalOptions.persist) {
        setTimeout(() => {
          setInlineMessages(prev => prev.filter(m => m.id !== id));
        }, 5000);
      }
    }
  }, [getMessage]);

  // Listen to global events
  useEffect(() => {
    const handler = (event: { code: SystemMessageCode | string; options?: NotifyOptions }) => {
      notify(event.code, event.options);
    };

    systemMessageEvents.on(SYSTEM_MESSAGE_EVENT, handler);

    return () => systemMessageEvents.off(SYSTEM_MESSAGE_EVENT, handler);
  }, [notify]);

  const handleModalClose = () => {
    if (modal.options?.onCancel) modal.options.onCancel();
    setModal({ isOpen: false, code: null });
  };

  const handleModalConfirm = () => {
    if (modal.options?.onConfirm) modal.options.onConfirm();
    setModal({ isOpen: false, code: null });
  };

  return (
    <SystemMessageContext.Provider value={{ notify }}>
      {children}
      <Toaster position="top-right" />

      {/* Inline Variant Container */}
      <div className="fixed bottom-4 left-4 z-[9999] flex flex-col gap-2 max-w-md">
        {inlineMessages.map((m) => (
          <Alert
            key={m.id}
            severity={((DefaultSeverityMap[m.code] || 'info').toLowerCase() as any)}
            onClose={() => setInlineMessages(prev => prev.filter(msg => msg.id !== m.id))}
          >
            <AlertTitle>{m.options.title || t(`SEVERITY_${DefaultSeverityMap[m.code] || 'INFO'}`)}</AlertTitle>
            {getMessage(m.code, m.options.params)}
          </Alert>
        ))}
      </div>

      {/* Modal Variant */}
      <Dialog open={modal.isOpen} onClose={handleModalClose}>
        <DialogTitle>
          {modal.options?.title || t(`SEVERITY_${DefaultSeverityMap[modal.code!] || 'INFO'}`)}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {modal.code ? getMessage(modal.code, modal.options?.params) : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          {modal.options?.onCancel && (
            <Button onClick={handleModalClose} color="inherit">
              {t('CLOSE') || 'Close'}
            </Button>
          )}
          <Button onClick={handleModalConfirm} variant="contained" autoFocus>
            {t('OK') || 'OK'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inline Variant Container - This could be rendered anywhere, but here as a global fallback or we could use another context to portal it */}
      {/* For now, we just expose notify and the actual UI for INLINE might need to be placed specifically by components if they want it locally */}
    </SystemMessageContext.Provider>
  );
};

/**
 * Component to render inline messages for a specific area.
 * Not strictly required but useful.
 */
export const SystemMessageInline: React.FC<{ filter?: (code: SystemMessageCode) => boolean }> = () => {
  // In a real app, we might want to separate inline state from the provider to allow local usage
  return null; // Implementation deferred or handled by specific components
};
