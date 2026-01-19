import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export type FeedbackType = 'success' | 'error' | 'info' | 'warning';

interface FeedbackDialogProps {
  isOpen: boolean;
  type: FeedbackType;
  title: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose,
  confirmText = 'OK'
}) => {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle className="h-12 w-12 text-green-500" />,
    error: <AlertCircle className="h-12 w-12 text-red-500" />,
    warning: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
    info: <Info className="h-12 w-12 text-blue-500" />,
  };

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform animate-in zoom-in-95 duration-200`}>
        <div className={`p-1 ${type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
        
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full ${colors[type]}`}>
              {icons[type]}
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{message}</p>
          </div>
          
          <div className="mt-8">
            <Button 
              onClick={onClose} 
              className="w-full py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              variant={type === 'error' ? 'danger' : 'primary'}
            >
              {confirmText}
            </Button>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

