import React, { ReactNode, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigationConfirm } from '../../hooks/useNavigationConfirm';
import ConfirmDialog from './ConfirmDialog';

interface ConfirmLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmLink: React.FC<ConfirmLinkProps> = ({
  to,
  children,
  className,
  onClick,
  title = 'Confirmar navegação',
  message = 'Você tem certeza que deseja sair desta página?',
  confirmText = 'Sim',
  cancelText = 'Não'
}) => {
  const navigate = useNavigate();
  
  const navigationConfig = useMemo(() => ({
    title,
    message
  }), [title, message]);
  
  const { isDialogOpen, confirmNavigation, handleConfirm, handleCancel } = useNavigationConfirm(navigationConfig);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    const navigationCallback = () => {
      if (onClick) {
        onClick();
      }
      navigate(to);
    };

    try {
      confirmNavigation(navigationCallback);
    } catch (error) {
      console.error('Erro na navegação com confirmação:', error);
      // Fallback: navegar diretamente em caso de erro
      navigationCallback();
    }
  }, [confirmNavigation, onClick, navigate, to]);

  return (
    <>
      <a href={to} className={className} onClick={handleClick}>
        {children}
      </a>
      <ConfirmDialog
        isOpen={isDialogOpen}
        title={title}
        message={message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText={confirmText}
        cancelText={cancelText}
      />
    </>
  );
};

export default ConfirmLink;
