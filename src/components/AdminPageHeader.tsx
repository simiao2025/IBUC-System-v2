import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from './ui/Button';

interface AdminPageHeaderProps {
  title: string;
  subtitle: string;
  onBack?: () => void;
  actionButton?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'danger';
  };
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  subtitle,
  onBack,
  actionButton
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left: Back Button */}
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-red-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Voltar</span>
            </button>

            {/* Title and Subtitle */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            </div>
          </div>

          {/* Right: Action Button (optional) */}
          {actionButton && (
            <Button
              onClick={actionButton.onClick}
              className={
                actionButton.variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : ''
              }
            >
              {actionButton.icon && <span className="mr-2">{actionButton.icon}</span>}
              {actionButton.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPageHeader;
