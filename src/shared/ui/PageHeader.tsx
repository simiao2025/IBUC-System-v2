import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import Button from './Button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  showBackButton?: boolean;
  backTo?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  actionIcon = <Plus className="h-4 w-4 mr-2" />,
  onAction,
  showBackButton = true,
  backTo = '/admin/dashboard',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(backTo);
  };

  return (
    <div className="bg-white border-b border-gray-200 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left: Back Button and Title */}
          <div className="flex items-center space-x-4 flex-1">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 px-4 py-2 border border-red-600 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Voltar</span>
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right: Action Button (optional) */}
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center"
            >
              {actionIcon}
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
