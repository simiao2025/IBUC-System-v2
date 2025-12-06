import { useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavigationConfirmProps {
  message?: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  shouldConfirm?: boolean;
}

export const useNavigationConfirm = ({ 
  message = 'Você tem certeza que deseja sair desta página?',
  title = 'Confirmar navegação',
  confirmText = 'Sim',
  cancelText = 'Não',
  shouldConfirm = true
}: NavigationConfirmProps = {}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const pendingNavigationRef = useRef<string | (() => void) | null>(null);
  const navigate = useNavigate();

  const confirmNavigation = useCallback((destination: string | (() => void)) => {
    if (!shouldConfirm) {
      // Se não precisa confirmar, executa diretamente
      if (typeof destination === 'string') {
        navigate(destination);
      } else {
        destination();
      }
      return;
    }

    pendingNavigationRef.current = destination;
    setIsDialogOpen(true);
  }, [navigate, shouldConfirm]);

  const handleConfirm = useCallback(() => {
    const pending = pendingNavigationRef.current;
    if (pending) {
      try {
        if (typeof pending === 'string') {
          navigate(pending);
        } else {
          pending();
        }
      } catch (error) {
        console.error('Erro ao executar navegação confirmada:', error);
      }
    }
    setIsDialogOpen(false);
    pendingNavigationRef.current = null;
  }, [navigate]);

  const handleCancel = useCallback(() => {
    setIsDialogOpen(false);
    pendingNavigationRef.current = null;
  }, []);

  const showConfirm = useCallback((callback: () => void) => {
    confirmNavigation(callback);
  }, [confirmNavigation]);

  const dialogProps = useMemo(() => ({
    isOpen: isDialogOpen,
    title,
    message,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
    confirmText,
    cancelText
  }), [isDialogOpen, title, message, handleConfirm, handleCancel, confirmText, cancelText]);

  return {
    isDialogOpen,
    confirmNavigation,
    handleConfirm,
    handleCancel,
    showConfirm,
    dialogProps
  };
};
