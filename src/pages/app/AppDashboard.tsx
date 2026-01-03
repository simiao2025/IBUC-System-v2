import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import { Calendar } from 'lucide-react';
import { EventosService, type Evento } from '../../services/eventos.service';

const AppDashboard: React.FC = () => {
  const { currentUser } = useApp();
  const [upcomingEvents, setUpcomingEvents] = useState<Evento[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Load Events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        // RLS on backend handles filtering by user's polo automatically
        const data = await EventosService.listar({
          date_from: today,
          limit: 3,
          include_geral: true 
        });
        setUpcomingEvents(data || []);
      } catch (e) {
        console.error('Erro ao carregar eventos:', e);
      } finally {
        setLoadingEvents(false);
      }
    };
    loadEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {currentUser?.name?.split(' ')[0] || 'Aluno'}
        </h1>
        <p className="text-sm text-gray-600">
          Bem-vindo ao seu portal do aluno.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events Card */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Próximos Eventos
          </h3>
          
          {loadingEvents ? (
            <div className="text-center py-8 text-gray-500 text-sm">Carregando eventos...</div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Nenhum evento próximo agendado.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((evt, idx) => {
                const date = new Date(evt.data_inicio);
                const day = date.getDate();
                const month = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
                
                const colors = [
                  { bg: 'bg-blue-50', text: 'text-blue-600' },
                  { bg: 'bg-yellow-50', text: 'text-yellow-600' },
                  { bg: 'bg-green-50', text: 'text-green-600' }
                ];
                const color = colors[idx % colors.length];

                return (
                  <div key={evt.id} className={`flex items-center justify-between p-3 ${color.bg} rounded-lg`}>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{evt.titulo}</p>
                      <div className="flex items-center text-xs text-gray-600 mt-1">
                         <span>{evt.local || 'Local a definir'}</span>
                         {evt.polo_id && <span className="ml-2 px-1.5 py-0.5 rounded bg-white/50 border border-gray-200 text-xs">Polo</span>}
                         {!evt.polo_id && <span className="ml-2 px-1.5 py-0.5 rounded bg-white/50 border border-gray-200 text-xs text-blue-700">Geral</span>}
                      </div>
                    </div>
                    <div className="text-right min-w-[3rem]">
                      <p className={`text-sm ${color.text} font-bold uppercase`}>{day}</p>
                      <p className={`text-xs ${color.text} uppercase`}>{month}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Placeholder for future widgets */}
        <Card className="flex items-center justify-center min-h-[200px] bg-gray-50 border-dashed">
          <p className="text-gray-400 text-sm text-center">
            Mais funcionalidades em breve<br/>
            (Financeiro, Notas, Frequência)
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AppDashboard;
