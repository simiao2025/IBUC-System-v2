import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useAccessControl } from '@/features/auth/ui/AccessControl';
import { useNavigationConfirm } from '@/hooks/useNavigationConfirm';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Icon3D } from '@/components/ui/Icon3D';
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

  const allQuickActions = [
    {
      title: 'Módulos',
      description: 'Cadastro e edição de módulos e lições',
      href: '/admin/modulos',
      iconName: 'turmas',
      fallbackIcon: BookOpen,
      color: 'bg-purple-600 hover:bg-purple-700',
      permission: canAccessModule('settings') || canAccessModule('enrollments') // Módulos geralmente segue configurações ou turmas
    },
    {
      title: isPoloScoped ? 'Diretoria do Polo' : 'Diretoria Geral',
      description: isPoloScoped ? 'Cadastro e gestão da liderança do polo' : 'Cadastro da diretoria executiva do IBUC',
      href: '/admin/diretoria',
      iconName: 'diretoria',
      fallbackIcon: Building2,
      color: 'bg-red-600 hover:bg-red-700',
      permission: canAccessModule('directorate')
    },
    {
      title: 'Gerenciar Polos',
      description: 'Cadastro completo de polos e congregações',
      href: '/admin/polos',
      iconName: 'polos',
      fallbackIcon: MapPin,
      color: 'bg-blue-600 hover:bg-blue-700',
      permission: canManagePolos()
    },
    {
      title: 'Gerenciar Alunos',
      description: 'Matrículas, editar e gerenciar dados dos alunos',
      href: '/admin/alunos',
      iconName: 'student',
      fallbackIcon: Users,
      color: 'bg-green-600 hover:bg-green-700',
      permission: canAccessModule('students')
    },
    {
      title: 'Equipes',
      description: isPoloScoped ? 'Coordenadores, professores e auxiliares do polo' : 'Coordenadores, professores e auxiliares',
      href: '/admin/equipe',
      iconName: 'equipes_polos', // Using existing asset
      fallbackIcon: UserCheck,
      color: 'bg-teal-600 hover:bg-teal-700',
      permission: canManageStaff()
    },
    {
      title: 'Gerenciar Turmas',
      description: 'Cadastro e gestão de turmas e níveis',
      href: '/admin/turmas',
      iconName: 'turmas',
      fallbackIcon: BookOpen,
      color: 'bg-purple-600 hover:bg-purple-700',
      permission: canAccessModule('enrollments')
    },
    {
      title: 'Frequência/Drácmas',
      description: 'Controle de presença e Drácmas',
      href: '/admin/frequencia',
      iconName: 'frequencia',
      fallbackIcon: ClipboardList,
      color: 'bg-orange-600 hover:bg-orange-700',
      permission: canAccessModule('attendance')
    },
    {
      title: 'Financeiro',
      description: 'Gestão financeira e faturas',
      href: '/admin/financeiro',
      iconName: 'financeiro',
      fallbackIcon: DollarSign,
      color: 'bg-yellow-600 hover:bg-yellow-700',
      permission: canAccessModule('dracmas')
    },
    {
      title: 'Gerenciar Materiais',
      description: 'Cadastro de materiais e gestão de pedidos',
      href: '/admin/materiais',
      iconName: 'pre_matricula',
      fallbackIcon: ShoppingCart,
      color: 'bg-red-600 hover:bg-red-700',
      permission: canAccessModule('materials')
    },
    {
      title: 'Relatórios',
      description: 'Gerar relatórios e estatísticas',
      href: '/admin/relatorios',
      iconName: 'relatorios',
      fallbackIcon: BarChart3,
      color: 'bg-gray-600 hover:bg-gray-700',
      permission: canViewReports()
    },
    {
      title: 'Gerenciar Pré-matrículas',
      description: 'Análise de documentos e conclusão de novas matrículas.',
      iconName: 'pre_matricula',
      fallbackIcon: FileCheck,
      href: '/admin/pre-matriculas',
      color: 'bg-orange-500',
      permission: canAccessModule('pre-enrollments')
    },
    {
      title: 'Configurações',
      description: 'Usuários, acessos e configurações do sistema',
      href: '/admin/configuracoes',
      iconName: 'configuracoes',
      fallbackIcon: Settings,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      permission: canAccessModule('settings') || canAccessModule('manage_users') || canAccessModule('security') || canAccessModule('backup')
    }
  ];

  // Filtra ações baseado nas permissões
  const quickActions = allQuickActions.filter(action => action.permission);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <img
                src="https://ibuc.com.br/wp-content/uploads/2023/05/logo-site.png"
                alt="IBUC Logo"
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Painel Administrativo
                  {currentUser?.adminUser?.poloId && (
                    <span className="text-blue-600 ml-2">
                      - <strong>{polos.find(p => p.id === currentUser.adminUser?.poloId)?.name || 'Polo não encontrado'}</strong>
                    </span>
                  )}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <p className="text-sm text-gray-600">
                    IBUC - Palmas, TO
                  </p>
                  {currentUser?.adminUser && (
                    <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                      <span className="text-sm font-medium text-gray-700">
                        Olá, <span className="font-bold">
                          {currentUser.adminUser.name || currentUser.adminUser.email || currentUser.email || 'Usuário'}
                        </span>
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
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

            <div className="flex items-center space-x-4">
              {currentUser?.adminUser?.role === 'secretario_polo' && (
                <Button
                  asChild
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white border-none"
                >
                  <Link to="/admin/alunos/novo" state={{ from: '/admin/dashboard' }}>
                    <span className="flex items-center">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Fazer Matrícula
                    </span>
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
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
            {enrollments.length > 0 ? (
              <div className="space-y-3">
                {enrollments.slice(-5).map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{enrollment.studentName}</p>
                      <p className="text-sm text-gray-600">{enrollment.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(enrollment.enrollmentDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhuma matrícula registrada ainda</p>
            )}
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
