import React from 'react';
import { EventList } from './components/EventList';
import { PageHeader } from '@/shared/ui';
import { Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const EventManagement: React.FC = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  // Basic access control check at container level
  // Although the route should be protected, this is a second layer
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Gerenciar Eventos"
        subtitle="Agendamento e controle de eventos do ministÃ©rio"
        icon={<Calendar className="h-6 w-6 text-gray-400" />}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <EventList />
      </div>
    </div>
  );
};

export default EventManagement;
