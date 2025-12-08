import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import {
  ArrowLeft,
  Settings,
  User,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Plus,
  Edit2,
  Trash2,
  Key,
  Users,
  Database,
  Mail,
  Calendar,
  FileText,
  Save,
  RefreshCw
} from 'lucide-react';

interface SystemUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'admin' | 'coordinator' | 'teacher' | 'staff';
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  poloAccess?: string[];
}

interface SystemConfig {
  schoolYear: string;
  enrollmentPeriod: {
    start: string;
    end: string;
  };
  classSchedule: {
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    whatsappEnabled: boolean;
    autoReminders: boolean;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    twoFactorRequired: boolean;
  };
  backup: {
    frequency: 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
    lastBackup?: string;
  };
}

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'config' | 'security' | 'backup'>('users');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [users, setUsers] = useState<SystemUser[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@ibuc.org.br',
      fullName: 'Administrador Sistema',
      role: 'super_admin',
      permissions: ['all'],
      isActive: true,
      lastLogin: '2024-01-15T10:30:00',
      createdAt: '2024-01-01',
      poloAccess: []
    },
    {
      id: '2',
      username: 'coordenador.geral',
      email: 'coordenador@ibuc.org.br',
      fullName: 'Ana Costa Silva',
      role: 'coordinator',
      permissions: ['manage_polos', 'view_reports', 'manage_students'],
      isActive: true,
      lastLogin: '2024-01-14T09:15:00',
      createdAt: '2024-01-02',
      poloAccess: []
    }
  ]);

  const [newUser, setNewUser] = useState<Partial<SystemUser>>({
    username: '',
    email: '',
    fullName: '',
    role: 'staff',
    permissions: [],
    isActive: true,
    poloAccess: []
  });

  const [newPassword, setNewPassword] = useState('');

  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    schoolYear: '2024',
    enrollmentPeriod: {
      start: '2024-01-01',
      end: '2024-02-29'
    },
    classSchedule: {
      startTime: '08:00',
      endTime: '11:00',
      daysOfWeek: ['sunday']
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      whatsappEnabled: true,
      autoReminders: true
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 120,
      twoFactorRequired: false
    },
    backup: {
      frequency: 'daily',
      retentionDays: 30,
      lastBackup: '2024-01-15T02:00:00'
    }
  });

  const roleLabels = {
    super_admin: 'Super Administrador',
    admin: 'Administrador',
    coordinator: 'Coordenador',
    teacher: 'Professor',
    staff: 'Funcionário'
  };

  const availablePermissions = [
    { id: 'manage_users', label: 'Gerenciar Usuários' },
    { id: 'manage_polos', label: 'Gerenciar Polos' },
    { id: 'manage_students', label: 'Gerenciar Alunos' },
    { id: 'manage_enrollments', label: 'Gerenciar Matrículas' },
    { id: 'view_reports', label: 'Visualizar Relatórios' },
    { id: 'export_data', label: 'Exportar Dados' },
    { id: 'system_config', label: 'Configurações do Sistema' },
    { id: 'backup_restore', label: 'Backup e Restauração' }
  ];

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...editingUser, ...newUser } as SystemUser
          : user
      ));
    } else {
      const user: SystemUser = {
        id: Date.now().toString(),
        username: newUser.username!,
        email: newUser.email!,
        fullName: newUser.fullName!,
        role: newUser.role!,
        permissions: newUser.permissions!,
        isActive: true,
        createdAt: new Date().toISOString(),
        poloAccess: newUser.poloAccess || []
      };
      setUsers(prev => [...prev, user]);
    }

    setNewUser({
      username: '',
      email: '',
      fullName: '',
      role: 'staff',
      permissions: [],
      isActive: true,
      poloAccess: []
    });
    setNewPassword('');
    setShowUserForm(false);
    setEditingUser(null);
  };

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setNewUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  const handlePermissionToggle = (permission: string) => {
    const currentPermissions = newUser.permissions || [];
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    
    setNewUser(prev => ({ ...prev, permissions: newPermissions }));
  };

  const saveSystemConfig = () => {
    // Aqui seria feita a chamada para salvar as configurações
    alert('Configurações salvas com sucesso!');
  };

  const performBackup = () => {
    // Simular backup
    setSystemConfig(prev => ({
      ...prev,
      backup: {
        ...prev.backup,
        lastBackup: new Date().toISOString()
      }
    }));
    alert('Backup realizado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
                <p className="text-sm text-gray-600">Gerenciamento de usuários, acessos e configurações gerais</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'users', label: 'Usuários', icon: Users },
              { id: 'config', label: 'Configurações', icon: Settings },
              { id: 'security', label: 'Segurança', icon: Shield },
              { id: 'backup', label: 'Backup', icon: Database }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Usuários do Sistema</h2>
              <Button onClick={() => setShowUserForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Função
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Último Acesso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-8 w-8 bg-gray-200 rounded-full p-2 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.username} • {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {roleLabels[user.role]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleString('pt-BR')
                            : 'Nunca'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id)}
                          >
                            {user.isActive ? 'Desativar' : 'Ativar'}
                          </Button>
                          {user.role !== 'super_admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Config Tab */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Configurações Gerais</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Período Letivo
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Ano Letivo"
                    value={systemConfig.schoolYear}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      schoolYear: e.target.value
                    }))}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Início das Matrículas"
                      type="date"
                      value={systemConfig.enrollmentPeriod.start}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        enrollmentPeriod: {
                          ...prev.enrollmentPeriod,
                          start: e.target.value
                        }
                      }))}
                    />
                    <Input
                      label="Fim das Matrículas"
                      type="date"
                      value={systemConfig.enrollmentPeriod.end}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        enrollmentPeriod: {
                          ...prev.enrollmentPeriod,
                          end: e.target.value
                        }
                      }))}
                    />
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  Horário das Aulas
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Horário de Início"
                      type="time"
                      value={systemConfig.classSchedule.startTime}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        classSchedule: {
                          ...prev.classSchedule,
                          startTime: e.target.value
                        }
                      }))}
                    />
                    <Input
                      label="Horário de Término"
                      type="time"
                      value={systemConfig.classSchedule.endTime}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        classSchedule: {
                          ...prev.classSchedule,
                          endTime: e.target.value
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dias da Semana
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: 'sunday', label: 'Domingo' },
                        { id: 'monday', label: 'Segunda-feira' },
                        { id: 'tuesday', label: 'Terça-feira' },
                        { id: 'wednesday', label: 'Quarta-feira' },
                        { id: 'thursday', label: 'Quinta-feira' },
                        { id: 'friday', label: 'Sexta-feira' },
                        { id: 'saturday', label: 'Sábado' }
                      ].map(day => (
                        <label key={day.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={systemConfig.classSchedule.daysOfWeek.includes(day.id)}
                            onChange={(e) => {
                              const days = systemConfig.classSchedule.daysOfWeek;
                              const newDays = e.target.checked
                                ? [...days, day.id]
                                : days.filter(d => d !== day.id);
                              setSystemConfig(prev => ({
                                ...prev,
                                classSchedule: {
                                  ...prev.classSchedule,
                                  daysOfWeek: newDays
                                }
                              }));
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          {day.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-purple-600" />
                  Notificações
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'emailEnabled', label: 'Notificações por Email' },
                    { key: 'smsEnabled', label: 'Notificações por SMS' },
                    { key: 'whatsappEnabled', label: 'Notificações por WhatsApp' },
                    { key: 'autoReminders', label: 'Lembretes Automáticos' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={systemConfig.notifications[key as keyof typeof systemConfig.notifications] as boolean}
                        onChange={(e) => setSystemConfig(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            [key]: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={saveSystemConfig}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Configurações de Segurança</h2>
            
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-red-600" />
                Políticas de Senha
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tamanho Mínimo da Senha"
                  type="number"
                  min="6"
                  max="20"
                  value={systemConfig.security.passwordMinLength.toString()}
                  onChange={(e) => setSystemConfig(prev => ({
                    ...prev,
                    security: {
                      ...prev.security,
                      passwordMinLength: parseInt(e.target.value)
                    }
                  }))}
                />
                <Input
                  label="Timeout da Sessão (minutos)"
                  type="number"
                  min="30"
                  max="480"
                  value={systemConfig.security.sessionTimeout.toString()}
                  onChange={(e) => setSystemConfig(prev => ({
                    ...prev,
                    security: {
                      ...prev.security,
                      sessionTimeout: parseInt(e.target.value)
                    }
                  }))}
                />
              </div>
              
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemConfig.security.twoFactorRequired}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      security: {
                        ...prev.security,
                        twoFactorRequired: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-2"
                  />
                  Exigir Autenticação de Dois Fatores
                </label>
              </div>
            </Card>
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Backup e Restauração</h2>
            
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2 text-green-600" />
                Configurações de Backup
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequência do Backup
                  </label>
                  <select
                    value={systemConfig.backup.frequency}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      backup: {
                        ...prev.backup,
                        frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>
                
                <Input
                  label="Retenção (dias)"
                  type="number"
                  min="7"
                  max="365"
                  value={systemConfig.backup.retentionDays.toString()}
                  onChange={(e) => setSystemConfig(prev => ({
                    ...prev,
                    backup: {
                      ...prev.backup,
                      retentionDays: parseInt(e.target.value)
                    }
                  }))}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-2">Último Backup</h4>
                <p className="text-sm text-gray-600">
                  {systemConfig.backup.lastBackup 
                    ? new Date(systemConfig.backup.lastBackup).toLocaleString('pt-BR')
                    : 'Nenhum backup realizado'
                  }
                </p>
              </div>

              <div className="flex space-x-4">
                <Button onClick={performBackup}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Fazer Backup Agora
                </Button>
                <Button variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Restaurar Backup
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome Completo"
                  value={newUser.fullName || ''}
                  onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
                
                <Input
                  label="Nome de Usuário"
                  value={newUser.username || ''}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
                
                <Input
                  label="Email"
                  type="email"
                  value={newUser.email || ''}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Função
                  </label>
                  <select
                    value={newUser.role || ''}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as SystemUser['role'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {Object.entries(roleLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required={!editingUser}
                  placeholder={editingUser ? 'Deixe em branco para manter a senha atual' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissões
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {availablePermissions.map(permission => (
                    <label key={permission.id} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={(newUser.permissions || []).includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      {permission.label}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <Button type="submit" className="flex-1">
                  <Key className="h-4 w-4 mr-2" />
                  {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setShowUserForm(false);
                    setEditingUser(null);
                    setNewUser({
                      username: '',
                      email: '',
                      fullName: '',
                      role: 'staff',
                      permissions: [],
                      isActive: true,
                      poloAccess: []
                    });
                    setNewPassword('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}


    </div>
  );
};

export default SystemSettings;
