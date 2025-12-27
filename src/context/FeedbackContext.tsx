import React, { createContext, useContext, useState, useCallback } from 'react';
import FeedbackDialog, { FeedbackType } from '../components/ui/FeedbackDialog';

interface FeedbackState {
  isOpen: boolean;
  type: FeedbackType;
  title: string;
  message: string;
  confirmText?: string;
}

interface FeedbackContextData {
  showFeedback: (options: Omit<FeedbackState, 'isOpen'>) => void;
  hideFeedback: () => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
}

const FeedbackContext = createContext<FeedbackContextData>({} as FeedbackContextData);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FeedbackState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showFeedback = useCallback((options: Omit<FeedbackState, 'isOpen'>) => {
    setState({ ...options, isOpen: true });
  }, []);

  const hideFeedback = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    showFeedback({ type: 'success', title, message });
  }, [showFeedback]);

  const showError = useCallback((title: string, message: string) => {
    showFeedback({ type: 'error', title, message });
  }, [showFeedback]);

  const showInfo = useCallback((title: string, message: string) => {
    showFeedback({ type: 'info', title, message });
  }, [showFeedback]);

  const showWarning = useCallback((title: string, message: string) => {
    showFeedback({ type: 'warning', title, message });
  }, [showFeedback]);

  return (
    <FeedbackContext.Provider value={{ showFeedback, hideFeedback, showSuccess, showError, showInfo, showWarning }}>
      {children}
      <FeedbackDialog
        isOpen={state.isOpen}
        type={state.type}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText}
        onClose={hideFeedback}
      />
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};
