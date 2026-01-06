import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import { Calendar } from 'lucide-react';
import { EventosService, type Evento } from '../../services/eventos.service';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { Icon3D } from '../../components/ui/Icon3D';
import { BookOpen, ClipboardList, Wallet, FolderOpen, Award } from 'lucide-react';
import { DracmasAPI } from '../../features/finance/dracmas.service';

type DracmasSaldoResponse = {
  data?: {
    saldo?: number;
  };
  saldo?: number;
};

const AppDashboard: React.FC = () => {
  const { currentUser } = useApp();
  const [upcomingEvents, setUpcomingEvents] = useState<Evento[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [dracmasSaldo, setDracmasSaldo] = useState<number | null>(null);
  const [dracmasLoading, setDracmasLoading] = useState(false);

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

  useEffect(() => {
    const loadDracmas = async () => {
      if (!currentUser || currentUser.role !== 'student' || !currentUser.studentId) {
        setDracmasSaldo(null);
        return;
      }

      try {
        setDracmasLoading(true);
        const response = (await DracmasAPI.saldoPorAluno(currentUser.studentId)) as DracmasSaldoResponse;
        const saldo = response?.data?.saldo ?? response?.saldo ?? 0;
        setDracmasSaldo(typeof saldo === 'number' ? saldo : Number(saldo) || 0);
      } catch (e) {
        console.error('Erro ao carregar saldo de Drácmas do aluno:', e);
        setDracmasSaldo(null);
      } finally {
        setDracmasLoading(false);
      }
    };

    loadDracmas();
  }, [currentUser]);

  const studentQuickActions = [
    {
      title: 'Módulos',
      description: 'Conteúdos e aulas',
      href: '/app/modulos',
      iconName: 'turmas',
      fallbackIcon: BookOpen,
    },
    {
      title: 'Frequência',
      description: 'Presenças e faltas',
      href: '/app/frequencia',
      iconName: 'frequencia',
      fallbackIcon: ClipboardList,
    },
    {
      title: 'Financeiro',
      description: 'Pagamentos e taxas',
      href: '/app/financeiro',
      iconName: 'financeiro',
      fallbackIcon: Wallet,
    },
    {
      title: 'Documentos',
      description: 'Arquivos e envios',
      href: '/app/documentos',
      iconName: 'personalizado',
      fallbackIcon: FolderOpen,
    },
    {
      title: 'Drácmas',
      description: 'Saldo total de Drácmas',
      href: '/app/financeiro',
      iconName: 'certificado',
      fallbackIcon: Award,
      metaValue: dracmasLoading ? 'Carregando...' : dracmasSaldo === null ? '—' : String(dracmasSaldo),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {studentQuickActions.map((action, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-transform hover:-translate-y-1 duration-200 flex flex-col items-center text-center p-6"
            >
              <div className="mb-4">
                <Icon3D
                  name={action.iconName}
                  fallbackIcon={action.fallbackIcon}
                  size="xl"
                  className="h-24 w-24"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-500 mb-4 flex-grow">{action.description}</p>
              {'metaValue' in action ? (
                <div className="w-full mb-4">
                  <p className="text-xs text-gray-500">Saldo</p>
                  <p className="text-2xl font-bold text-gray-900">{action.metaValue}</p>
                </div>
              ) : null}
              <Button asChild size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
                <Link to={action.href}>Acessar</Link>
              </Button>
            </Card>
          ))}
        </div>
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

        <Card className="flex items-center justify-center min-h-[200px] bg-gray-50 border-dashed">
          <p className="text-gray-400 text-sm text-center">
            Mais funcionalidades em breve<br/>
            (conteúdos detalhados por módulo)
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AppDashboard;
