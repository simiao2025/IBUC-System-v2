import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/app/providers/AppContext';
import { useAccessControl } from '@/features/auth/ui/AccessControl';
import { useNavigationConfirm } from '@/hooks/useNavigationConfirm';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Icon3D } from '@/components/ui/Icon3D';
import { ADMIN_NAV_ITEMS } from '@/shared/config/navigation';
import {
  Users,
  MapPin,
  BookOpen,
  UserCheck,
  Calendar,
  Award,
  BarChart3,
  Settings,
  DollarSign,
  ClipboardList,
  Building2,
  FileCheck,
  Clock,
  ShoppingCart
} from 'lucide-react';
import { UserService } from '@/services/userService';
import { api } from '@/shared/api/api';
import { UrgentBanner } from '@/components/notifications/UrgentBanner';
import { useNavigate } from 'react-router-dom';
import { formatLocalDate, getLocalDay, getLocalMonth } from '@/shared/utils/dateUtils';

const AdminDashboard: React.FC = () => {
  const { students, enrollments, polos, logout, currentUser, preMatriculas } = useApp();
  const {
    canManageStaff,
    canManagePolos,
    canViewReports,
    canAccessModule,
    getFilteredPolos
  } = useAccessControl();


  const { isDialogOpen, confirmNavigation, handleConfirm, handleCancel } = useNavigationConfirm({
    title: 'Confirmar saída',
    message: 'Você tem certeza que deseja sair do sistema?'
  });

  const isPoloScoped = currentUser?.adminUser?.accessLevel === 'polo_especifico' && Boolean(currentUser?.adminUser?.poloId);

  const [certCount, setCertCount] = React.useState<number>(0);
  const [upcomingEvents, setUpcomingEvents] = React.useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = React.useState(true);

  const [hasStaff, setHasStaff] = React.useState(true); // Oculto por padrão até validar
  const [pendingDraftsCount, setPendingDraftsCount] = React.useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkDrafts = async () => {
      // Secretários e Diretor Geral devem ver isso
      if (['secretario_polo', 'diretor_geral', 'super_admin'].includes(currentUser?.adminUser?.role || '')) {
        try {
          const result = await api.get<any[]>('/turmas?status=rascunho');
          if (result && Array.isArray(result)) {
            setPendingDraftsCount(result.length);
          }
        } catch (e) {
          console.error('Erro ao buscar rascunhos', e);
        }
      }
    };
    checkDrafts();
  }, [currentUser]);

  React.useEffect(() => {
    const checkStaff = async () => {
      if (currentUser?.adminUser?.role === 'diretor_polo' && currentUser?.adminUser?.poloId) {
        try {
          const staff = await UserService.listUsers({
            polo_id: currentUser.adminUser.poloId,
            ativo: true
          });
          // Verifica se existe alguém além do próprio diretor que seja professor ou auxiliar
          const team = staff.filter(u => u.role === 'professor' || u.role === 'auxiliar');
          setHasStaff(team.length > 0);
        } catch (e) {
          console.error('Erro ao validar equipe do polo', e);
          setHasStaff(true);
        }
      }
    };
    checkStaff();
  }, [currentUser?.adminUser?.id, currentUser?.adminUser?.poloId, currentUser?.adminUser?.role]);

  React.useEffect(() => {
    const loadCertCount = async () => {
      const { CertificadoService } = await import('@/services/certificado.service');
      const total = await CertificadoService.contarTotal();
      setCertCount(total);
    };
    loadCertCount();
  }, []);

  React.useEffect(() => {
    const loadEvents = async () => {
      try {
        const { EventosService } = await import('@/services/eventos.service');
        const today = new Date().toISOString().split('T')[0];
        const data = await EventosService.listar({
          date_from: today,
          limit: 3,
          polo_id: isPoloScoped ? currentUser?.adminUser?.poloId : undefined,
          include_geral: true
        });
        setUpcomingEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Erro ao carregar eventos no dashboard', e);
      } finally {
        setLoadingEvents(false);
      }
    };
    loadEvents();
  }, [isPoloScoped, currentUser?.adminUser?.poloId]);

  // Filtra polos baseado no nível de acesso do usuário
  const accessiblePolos = getFilteredPolos(polos);

  const stats = [
    {
      title: 'Total de Alunos',
      value: students.length,
      iconName: 'student',
      fallbackIcon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Matrículas Ativas',
      value: enrollments.length,
      iconName: 'turmas',
      fallbackIcon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Polos Acessíveis',
      value: accessiblePolos.length,
      iconName: 'polos',
      fallbackIcon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Certificados Emitidos',
      value: certCount,
      iconName: 'certificado',
      fallbackIcon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {

      title: 'Matrículas Pendentes',
      value: preMatriculas.filter(p => p.status === 'em_analise').length,
      iconName: 'pre_matricula',
      fallbackIcon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const quickActions = ADMIN_NAV_ITEMS.filter(item => {
    switch (item.module) {
      case 'lessons':
        return canAccessModule('lessons');
      case 'settings':
        return canAccessModule('settings') || canAccessModule('manage_users') || canAccessModule('settings_events') || canAccessModule('dracmas_settings') || canAccessModule('security') || canAccessModule('backup');
      case 'directorate':
        return canAccessModule('directorate');
      case 'polos':
        return canManagePolos();
      case 'students':
        return canAccessModule('students');
      case 'staff':
        return canManageStaff();
      case 'enrollments':
        return canAccessModule('enrollments');
      case 'attendance':
        return canAccessModule('attendance');
      case 'financeiro':
        return canAccessModule('financeiro') || canAccessModule('finance_control') || canAccessModule('finance_materials') || canAccessModule('finance_config');
      case 'materials':
        return canAccessModule('materials') || canAccessModule('materials_catalog') || canAccessModule('materials_orders');
      case 'reports':
        return canViewReports();
      case 'pre-enrollments':
        return canAccessModule('pre-enrollments');
      default:
        return false;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 md:py-6 gap-4">
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <img
                src="https://ibuc.com.br/wp-content/uploads/2023/05/logo-site.png"
                alt="IBUC Logo"
                className="h-8 sm:h-10 w-auto shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  Painel Administrativo
                  {currentUser?.adminUser?.poloId && (
                    <span className="text-blue-600 ml-2 block sm:inline">
                      - <strong className="truncate">{polos.find(p => p.id === currentUser.adminUser?.poloId)?.name || 'Polo não encontrado'}</strong>
                    </span>
                  )}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <p className="text-xs sm:text-sm text-gray-600">
                    IBUC - Palmas, TO
                  </p>
                  {currentUser?.adminUser && (
                    <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        Olá, <span className="font-bold">
                          {currentUser.adminUser.name || currentUser.adminUser.email || currentUser.email || 'Usuário'}
                        </span>
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                        {currentUser.adminUser.role === 'super_admin' && 'Super Admin'}
                        {currentUser.adminUser.role === 'admin_geral' && 'Admin Geral'}
                        {currentUser.adminUser.role === 'coordenador_geral' && 'Coordenador Geral'}
                        {currentUser.adminUser.role === 'diretor_geral' && 'Diretor Geral'}
                        {currentUser.adminUser.role === 'primeiro_secretario_geral' && '1º Secretário Geral'}
                        {currentUser.adminUser.role === 'segundo_secretario_geral' && '2º Secretário Geral'}
                        {currentUser.adminUser.role === 'primeiro_tesoureiro_geral' && '1º Tesoureiro Geral'}
                        {currentUser.adminUser.role === 'segundo_tesoureiro_geral' && '2º Tesoureiro Geral'}
                        {currentUser.adminUser.role === 'coordenador_polo' && 'Coordenador do Polo'}
                        {currentUser.adminUser.role === 'diretor_polo' && 'Diretor do Polo'}
                        {currentUser.adminUser.role === 'primeiro_secretario_polo' && '1º Secretário do Polo'}
                        {currentUser.adminUser.role === 'segundo_secretario_polo' && '2º Secretário do Polo'}
                        {currentUser.adminUser.role === 'primeiro_tesoureiro_polo' && '1º Tesoureiro do Polo'}
                        {currentUser.adminUser.role === 'segundo_tesoureiro_polo' && '2º Tesoureiro do Polo'}
                        {currentUser.adminUser.role === 'professor' && 'Professor'}
                        {currentUser.adminUser.role === 'auxiliar' && 'Auxiliar'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {pendingDraftsCount > 0 && (
              <UrgentBanner
                count={pendingDraftsCount}
                message={`Existem ${pendingDraftsCount} turmas pendentes de ativação!`}
                onAction={() => navigate('/admin/turmas/pendentes')}
              />
            )}

            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              {currentUser?.adminUser?.role === 'secretario_polo' && (
                <Button
                  asChild
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white border-none shrink-0"
                >
                  <Link to="/admin/alunos/novo" state={{ from: '/admin/dashboard' }}>
                    <span className="flex items-center text-xs sm:text-sm">
                      <UserCheck className="mr-1 sm:mr-2 h-4 w-4" />
                      Fazer Matrícula
                    </span>
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => confirmNavigation(logout)}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Urgent Banner for Drafts */}
        <UrgentBanner
          count={pendingDraftsCount}
          message={`Existem ${pendingDraftsCount} turmas pendentes de ativação!`}
          actionLabel="Revisar Turmas Agora"
          onAction={() => navigate('/admin/turmas/pendentes')}
        />

        {/* Orientation for Polo Director */}
        {currentUser?.adminUser?.role === 'diretor_polo' && !hasStaff && (
          <Card className="mb-8 border-l-4 border-l-purple-600 bg-purple-50">
            <div className="flex items-start">
              <div className="p-2 bg-purple-100 rounded-lg mr-4 underline-offset-4">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-purple-900">Bem-vindo, Diretor!</h2>
                <p className="text-sm text-purple-800 mb-4">
                  Como Diretor do Polo, uma de suas primeiras tarefas é garantir que sua equipe esteja completa.
                  Por favor, acesse a gestão de equipe para cadastrar os <strong>Professores</strong> e <strong>Auxiliares</strong> do seu polo.
                </p>
                <Button asChild size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                  <Link to="/admin/equipe">Ir para Equipe do Polo</Link>
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.filter(stat => !(isPoloScoped && stat.title === 'Polos Acessíveis')).map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-transform hover:-translate-y-1 duration-200">
              <div className="flex items-center">
                <div className="mr-4">
                  <Icon3D
                    name={stat.iconName}
                    fallbackIcon={stat.fallbackIcon}
                    size="lg"
                    className="h-16 w-16"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-transform hover:-translate-y-1 duration-200 flex flex-col items-center text-center p-6">
                <div className="mb-4">
                  <Icon3D
                    name={action.iconName}
                    fallbackIcon={action.fallbackIcon}
                    size="xl"
                    className="h-24 w-24"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-500 mb-6 flex-grow">{action.description}</p>
                <Button asChild size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
                  <Link to={action.href}>Acessar</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Enrollments */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <UserCheck className="inline h-5 w-5 mr-2 text-green-600" />
              Matrículas Recentes
            </h3>
            {(() => {
              const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
              const recentEnrollments = enrollments.filter(e => new Date(e.enrollmentDate) >= cutoff);

              if (recentEnrollments.length > 0) {
                return (
                  <div className="space-y-3">
                    {recentEnrollments.slice(0, 5).map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{enrollment.studentName}</p>
                          <p className="text-sm text-gray-600">{enrollment.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {formatLocalDate(enrollment.enrollmentDate, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              return <p className="text-gray-500 text-center py-4">Nenhuma matrícula registrada nas últimas 24 horas</p>;
            })()}
          </Card>

          {/* Upcoming Events */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Calendar className="inline h-5 w-5 mr-2 text-blue-600" />
              Próximos Eventos
            </h3>
            {loadingEvents ? (
              <div className="text-gray-500 text-sm p-4 text-center">Carregando eventos...</div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum evento próximo</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((evt: any, idx: number) => {
                  const day = getLocalDay(evt.data_inicio);
                  const month = getLocalMonth(evt.data_inicio);
                  const colors = [
                    { bg: 'bg-blue-50', text: 'text-blue-600' },
                    { bg: 'bg-yellow-50', text: 'text-yellow-600' },
                    { bg: 'bg-green-50', text: 'text-green-600' }
                  ];
                  const color = colors[idx % colors.length];

                  return (
                    <div key={evt.id} className={`flex items-center justify-between p-3 ${color.bg} rounded-lg`}>
                      <div>
                        <p className="font-medium text-gray-900">{evt.titulo}</p>
                        <p className="text-sm text-gray-600">{evt.local || 'Local não informado'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${color.text} font-medium uppercase`}>{day} {month}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDialogOpen}
        title="Confirmar saída"
        message="Você tem certeza que deseja sair do sistema?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText="Sim"
        cancelText="Não"
      />
    </div>
  );
};

export default AdminDashboard;
