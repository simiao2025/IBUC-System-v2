import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FeedbackDialog, FeedbackType } from '../../ui/FeedbackDialog';
import { ConfirmDialog } from '../../ui/ConfirmDialog';

interface UIContextType {
  showFeedback: (type: FeedbackType, title: string, message: string, confirmText?: string) => void;
  showConfirm: (params: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
  }) => Promise<boolean>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    type: FeedbackType;
    title: string;
    message: string;
    confirmText?: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const [confirm, setConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onResolve: (value: boolean) => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onResolve: () => { }
  });

  const showFeedback = (type: FeedbackType, title: string, message: string, confirmText?: string) => {
    setFeedback({ isOpen: true, type, title, message, confirmText });
  };

  const showConfirm = ({ title, message, onConfirm, confirmText, cancelText }: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirm({
        isOpen: true,
        title,
        message,
        onResolve: (value: boolean) => {
          if (value && onConfirm) onConfirm();
          resolve(value);
          setConfirm(prev => ({ ...prev, isOpen: false }));
        },
        confirmText,
        cancelText
      });
    });
  };

  return (
    <UIContext.Provider value={{ showFeedback, showConfirm }}>
      {children}
      <FeedbackDialog
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        confirmText={feedback.confirmText}
        onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
      />
      <ConfirmDialog
        isOpen={confirm.isOpen}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        onConfirm={() => confirm.onResolve(true)}
        onCancel={() => confirm.onResolve(false)}
      />
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
