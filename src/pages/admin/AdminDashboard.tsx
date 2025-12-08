import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAccessControl } from '../../components/AccessControl';
import { useNavigationConfirm } from '../../hooks/useNavigationConfirm';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  Users,
  MapPin,
  BookOpen,
  UserCheck,
  Calendar,
  Award,
  BarChart3,
  Settings,
} from 'lucide-react';
import dashboardIcon from '/icons/3d/dashboard.png';
import equipesPolosIcon from '/icons/3d/equipes_polos.png';
import studentIcon from '/icons/3d/student.png';

const AdminDashboard: React.FC = () => {
  const { students, enrollments, polos, logout, currentUser } = useApp();
  const {
    canManageUsers,
    canManageStaff,
    canManagePolos,
    canViewReports,
    canManageEnrollments,
    getFilteredPolos
  } = useAccessControl();

  const { isDialogOpen, confirmNavigation, handleConfirm, handleCancel } = useNavigationConfirm({
    title: 'Confirmar saída',
    message: 'Você tem certeza que deseja sair do sistema?'
  });

  // Filtra polos baseado no nível de acesso do usuário
  const accessiblePolos = getFilteredPolos(polos);

  const stats = [
    {
      title: 'Total de Alunos',
      value: students.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Matrículas Ativas',
      value: enrollments.length,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Polos Acessíveis',
      value: accessiblePolos.length,
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Certificados Emitidos',
      value: '12', // Mock data
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  const allQuickActions = [
    {
      title: 'Diretoria Geral',
      description: 'Cadastro da diretoria executiva do IBUC',
      href: '/admin/directorate',
      icon: Settings,
      color: 'bg-red-600 hover:bg-red-700',
      image: null,
      permission: true
    },
    {
      title: 'Gerenciar Polos',
      description: 'Cadastro completo de polos e congregações',
      href: '/admin/enhanced-polos',
      icon: MapPin,
      color: 'bg-blue-600 hover:bg-blue-700',
      image: null,
      permission: true
    },
    {
      title: 'Usuários Administrativos',
      description: 'Coordenadores, diretores e acesso geral',
      href: '/admin/users',
      icon: Users,
      color: 'bg-green-600 hover:bg-green-700',
      image: null,
      permission: true
    },
    {
      title: 'Equipes dos Polos',
      description: 'Professores, auxiliares, secretários e tesoureiros',
      href: '/admin/staff',
      icon: UserCheck,
      color: 'bg-purple-600 hover:bg-purple-700',
      image: equipesPolosIcon,
      permission: true
    },
    {
      title: 'Configurações',
      description: 'Usuários, acessos e configurações do sistema',
      href: '/admin/settings',
      icon: Settings,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      image: null,
      permission: true
    },
    {
      title: 'Gerenciar Alunos',
      description: 'Visualizar, editar e gerenciar dados dos alunos',
      href: '/admin/students',
      icon: BookOpen,
      color: 'bg-orange-600 hover:bg-orange-700',
      image: studentIcon,
      permission: true
    },
    {
      title: 'Matrículas',
      description: 'Acompanhar e gerenciar matrículas',
      href: '/admin/enrollments',
      icon: BarChart3,
      color: 'bg-yellow-600 hover:bg-yellow-700',
      image: null,
      permission: true
    },
    {
      title: 'Relatórios',
      description: 'Gerar relatórios e estatísticas',
      href: '/admin/reports',
      icon: BarChart3,
      color: 'bg-gray-600 hover:bg-gray-700',
      image: null,
      permission: true
    }
  ];

  // Filtra ações baseado nas permissões
  const quickActions = allQuickActions.filter(action => action.permission);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-40 w-40 flex items-center justify-center bg-white rounded-xl shadow-sm p-3">
                <img
                  src={dashboardIcon}
                  alt="Painel Administrativo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-sm text-gray-600">
                  IBUC - Palmas, TO
                  {currentUser?.adminUser && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {currentUser.adminUser.role === 'coordenador_geral' && 'Coordenador Geral'}
                      {currentUser.adminUser.role === 'diretor_geral' && 'Diretor Geral'}
                      {currentUser.adminUser.role === 'coordenador_polo' && 'Coordenador de Polo'}
                      {currentUser.adminUser.role === 'diretor_polo' && 'Diretor de Polo'}
                      {currentUser.adminUser.role === 'professor' && 'Professor'}
                      {currentUser.adminUser.role === 'auxiliar' && 'Auxiliar'}
                      {currentUser.adminUser.role === 'secretario' && 'Secretário(a)'}
                      {currentUser.adminUser.role === 'tesoureiro' && 'Tesoureiro(a)'}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Link>
              </Button>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.bgColor} mr-4`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <div className="text-center">
                  {action.image ? (
                    <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center bg-white rounded-xl shadow-sm p-1">
                      <img
                        src={action.image}
                        alt={action.title}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className={`inline-flex p-3 rounded-full text-white mb-4 ${action.color}`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                  <Button asChild size="sm" className="w-full">
                    <Link to={action.href}>Acessar</Link>
                  </Button>
                </div>
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
              <p className="text-gray-500 text-center py-4">Nenhuma matr��cula registrada ainda</p>
            )}
          </Card>

          {/* Upcoming Events */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Calendar className="inline h-5 w-5 mr-2 text-blue-600" />
              Próximos Eventos
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Início das Aulas - Nível I</p>
                  <p className="text-sm text-gray-600">Igreja Central</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600 font-medium">15 Fev</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Reunião de Coordenadores</p>
                  <p className="text-sm text-gray-600">Planejamento semestral</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-yellow-600 font-medium">20 Fev</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Formatura Nível IV</p>
                  <p className="text-sm text-gray-600">Cerimônia de certificação</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 font-medium">25 Jun</p>
                </div>
              </div>
            </div>
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
