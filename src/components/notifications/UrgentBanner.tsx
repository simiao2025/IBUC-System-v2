import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UrgentBannerProps {
  count: number;
  message: string;
  actionLabel?: string;
  onAction: () => void;
}

export const UrgentBanner: React.FC<UrgentBannerProps> = ({
  count,
  message,
  actionLabel = "Revisar Agora →",
  onAction,
}) => {
  if (count === 0) return null;

  return (
    <div className="bg-red-600 text-white py-3 px-4 shadow-lg mb-6 rounded-md animate-in slide-in-from-top-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-6 w-6 text-white animate-pulse" />
          <span className="font-bold text-lg">
            {message}
          </span>
        </div>
        <Button
          variant="secondary"
          className="bg-white text-red-600 hover:bg-gray-100 font-semibold border-none"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
};
