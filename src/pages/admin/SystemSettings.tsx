import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  Shield, 
  Database, 
  ArrowLeft,
  Award,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UsuarioService } from '../../services/usuario.service';
import { PoloService } from '../../services/polo.service';
import { DracmasAPI } from '../../lib/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

type DracmasCriterio = {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string | null;
  ativo: boolean;
  quantidade_padrao: number;
};

type PermissionMode = 'full' | 'limited';

type AdminModuleKey =
  | 'settings'
  | 'polos'
  | 'staff'
  | 'students'
  | 'enrollments'
  | 'reports'
  | 'dracmas'
  | 'attendance'
  | 'directorate';

interface AdminPermissions {
  mode: PermissionMode;
  modules: AdminModuleKey[];
}

type BackendPolo = {
  id: string;
  nome: string;
};

type BackendUsuario = {
  id: string;
  nome_completo: string;
  email: string;
  cpf?: string | null;
  telefone?: string | null;
  role: AdminRole;
  polo_id?: string | null;
  metadata?: { permissions?: AdminPermissions } | null;
  ativo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

// Types (migrados do UserManagement)
interface AdminUser {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  password?: string;
  role: AdminRole;
  accessLevel: AccessLevel;
  poloId?: string;
  permissions?: AdminPermissions;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type AdminRole = 
  | 'coordenador_geral'
  | 'diretor_geral'
  | 'coordenador_polo'
  | 'diretor_polo'
  | 'professor'
  | 'auxiliar'
  | 'secretario'
  | 'tesoureiro';

type AccessLevel = 'geral' | 'polo_especifico';

// Interface SystemConfig
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
  const { polos, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'config' | 'security' | 'backup' | 'dracmas'>('users');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [dracmasCriterios, setDracmasCriterios] = useState<DracmasCriterio[]>([]);
  const [dracmasCriteriosLoading, setDracmasCriteriosLoading] = useState(false);
  
  // Estados para dados dinâmicos dos selects (migrado do UserManagement)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [accessLevels, setAccessLevels] = useState<{ value: string; label: string }[]>([]);
  const [polosOptions, setPolosOptions] = useState<{ id: string; name: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [emailLookupLoading, setEmailLookupLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<AdminRole | 'all'>('all');
  const [filterAccessLevel, setFilterAccessLevel] = useState<AccessLevel | 'all'>('all');

  const [newUser, setNewUser] = useState<Partial<AdminUser>>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    password: '',
    role: 'professor',
    accessLevel: 'polo_especifico',
    poloId: '',
    permissions: { mode: 'full', modules: [] },
    isActive: true
  });

  const moduleOptions: { key: AdminModuleKey; label: string }[] = [
    { key: 'polos', label: 'Polos' },
    { key: 'staff', label: 'Equipe (Polo)' },
    { key: 'students', label: 'Alunos' },
    { key: 'enrollments', label: 'Matrículas' },
    { key: 'reports', label: 'Relatórios' },
    { key: 'dracmas', label: 'Dracmas' },
    { key: 'attendance', label: 'Presenças' },
    { key: 'directorate', label: 'Diretoria' },
    { key: 'settings', label: 'Configurações' },
  ];

  const isGeneralManagement = currentUser?.adminUser?.role === 'diretor_geral' || currentUser?.adminUser?.role === 'coordenador_geral';
  const isPoloDirector = currentUser?.adminUser?.role === 'diretor_polo';
  const isSuperAdmin = currentUser?.adminUser?.role === 'super_admin' || currentUser?.adminUser?.role === 'admin_geral';
  const currentPoloId = currentUser?.adminUser?.poloId;
  const creatorIsPoloScoped = currentUser?.adminUser?.accessLevel === 'polo_especifico';
  const visiblePolosOptions = creatorIsPoloScoped && currentPoloId
    ? polosOptions.filter(p => p.id === currentPoloId)
    : polosOptions;

  const isGeneralRole = (role?: AdminRole) => {
    return role === 'diretor_geral' || role === 'coordenador_geral' || role === 'secretario' || role === 'tesoureiro';
  };

  const roleRequiresPolo = (role?: AdminRole) => {
    if (!role) return false;
    if (isGeneralRole(role)) return false;
    return ['diretor_polo', 'coordenador_polo', 'professor', 'auxiliar'].includes(role);
  };

  const resolveAccessLevelForRole = (role?: AdminRole): AccessLevel => {
    if (creatorIsPoloScoped) return 'polo_especifico';
    if (!role) return 'polo_especifico';
    if (isGeneralRole(role)) return 'geral';
    return 'polo_especifico';
  };

  const allowedRolesForCreator = (): AdminRole[] => {
    if (isSuperAdmin) return ['diretor_geral', 'coordenador_geral', 'secretario', 'tesoureiro', 'diretor_polo', 'coordenador_polo'];
    if (isGeneralManagement) return ['diretor_polo', 'coordenador_polo'];
    if (isPoloDirector) return ['secretario', 'tesoureiro', 'professor', 'auxiliar'];
    return [];
  };

  const canConfigurePermissionsForRole = (role: AdminRole): boolean => {
    return ['secretario', 'tesoureiro', 'professor', 'auxiliar'].includes(role);
  };

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

  // Carregar usuários ao montar (migrado do UserManagement)
  // Carregar opções para selects dinâmicos
  const carregarOpcoesSelects = useCallback(async () => {
    try {
      setLoadingOptions(true);
      
      // Buscar roles, access levels e polos em paralelo
      const [rolesData, accessLevelsData, polosData] = await Promise.all([
        UsuarioService.listarRoles(),
        UsuarioService.listarAccessLevels(),
        PoloService.listarPolos(),
      ]);

      const resolvedRoles = Array.isArray(rolesData) && rolesData.length > 0
        ? rolesData
        : [
            { value: 'coordenador_geral', label: 'Coordenador Geral' },
            { value: 'diretor_geral', label: 'Diretor Geral' },
            { value: 'coordenador_polo', label: 'Coordenador de Polo' },
            { value: 'diretor_polo', label: 'Diretor de Polo' },
            { value: 'professor', label: 'Professor' },
            { value: 'auxiliar', label: 'Auxiliar' },
            { value: 'secretario', label: 'Secretário(a)' },
            { value: 'tesoureiro', label: 'Tesoureiro(a)' }
          ];

      const resolvedAccessLevels = Array.isArray(accessLevelsData) && accessLevelsData.length > 0
        ? accessLevelsData
        : [
            { value: 'geral', label: 'Acesso Geral' },
            { value: 'polo_especifico', label: 'Polo Específico' }
          ];

      setRoles(resolvedRoles);
      setAccessLevels(resolvedAccessLevels);

      const polosFromApi = Array.isArray(polosData)
        ? (polosData as BackendPolo[]).map((p) => ({ id: p.id, name: p.nome }))
        : [];

      setPolosOptions(polosFromApi.length > 0 ? polosFromApi : (polos || []));
    } catch (error: unknown) {
      console.error('Erro ao carregar opções dos selects:', error);
      // Fallback para valores estáticos em caso de erro
      setRoles([
        { value: 'coordenador_geral', label: 'Coordenador Geral' },
        { value: 'diretor_geral', label: 'Diretor Geral' },
        { value: 'coordenador_polo', label: 'Coordenador de Polo' },
        { value: 'diretor_polo', label: 'Diretor de Polo' },
        { value: 'professor', label: 'Professor' },
        { value: 'auxiliar', label: 'Auxiliar' },
        { value: 'secretario', label: 'Secretário(a)' },
        { value: 'tesoureiro', label: 'Tesoureiro(a)' }
      ]);
      setAccessLevels([
        { value: 'geral', label: 'Acesso Geral' },
        { value: 'polo_especifico', label: 'Polo Específico' }
      ]);
      setPolosOptions(polos || []);
    } finally {
      setLoadingOptions(false);
    }
  }, [polos]);

  const carregarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const filtros: Record<string, unknown> = {};
      if (filterRole !== 'all') filtros.role = filterRole;
      if (filterAccessLevel !== 'all' && filterAccessLevel === 'polo_especifico') {
        // Se for polo específico, precisamos filtrar por polo_id depois
      }
      if (searchTerm) filtros.search = searchTerm;

      if (currentUser?.adminUser?.accessLevel === 'polo_especifico' && currentPoloId) {
        filtros.polo_id = currentPoloId;
      }

      const data = await UsuarioService.listarUsuarios(filtros);
      
      // Mapear dados da API para o formato do componente
      const usuariosMapeados = (data as BackendUsuario[]).map((u) => ({
        id: u.id,
        name: u.nome_completo,
        email: u.email,
        cpf: u.cpf || '',
        phone: u.telefone || '',
        role: u.role,
        accessLevel: u.polo_id ? ('polo_especifico' as AccessLevel) : ('geral' as AccessLevel),
        poloId: u.polo_id || '',
        permissions: u.metadata?.permissions,
        isActive: u.ativo,
        createdAt: u.created_at || new Date().toISOString(),
        updatedAt: u.updated_at || new Date().toISOString(),
      }));

      // Filtrar por accessLevel se necessário
      let usuariosFiltrados = usuariosMapeados;
      if (filterAccessLevel !== 'all') {
        usuariosFiltrados = usuariosMapeados.filter(u => u.accessLevel === filterAccessLevel);
      }

      setAdminUsers(usuariosFiltrados);
    } catch (error: unknown) {
      console.error('Erro ao carregar usuários:', error);
      alert('Erro ao carregar usuários. Verifique o console.');
    } finally {
      setLoading(false);
    }
  }, [filterRole, filterAccessLevel, searchTerm, currentUser?.adminUser?.accessLevel, currentPoloId]);

  // Carregar usuários ao montar (migrado do UserManagement)
  useEffect(() => {
    carregarUsuarios();
    carregarOpcoesSelects();
  }, [carregarUsuarios, carregarOpcoesSelects]);

  useEffect(() => {
    if (!currentUser?.adminUser) return;
    if (!creatorIsPoloScoped || !currentPoloId) return;

    setNewUser(prev => ({
      ...prev,
      accessLevel: 'polo_especifico',
      poloId: currentPoloId,
    }));

    if (editingUser) {
      setEditingUser(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          accessLevel: 'polo_especifico',
          poloId: currentPoloId,
        };
      });
    }
  }, [creatorIsPoloScoped, currentPoloId, currentUser?.adminUser, editingUser]);

  // Recarregar quando filtros mudarem
  useEffect(() => {
    if (loading) return;
    carregarUsuarios();
  }, [filterRole, filterAccessLevel, searchTerm, carregarUsuarios, loading]);

  const roleLabels: Record<AdminRole, string> = {};
  roles.forEach(role => {
    roleLabels[role.value as AdminRole] = role.label;
  });

  const accessLevelLabels: Record<AccessLevel, string> = {};
  accessLevels.forEach(level => {
    accessLevelLabels[level.value as AccessLevel] = level.label;
  });

  const filteredUsers = adminUsers;

  const handleNewUserEmailBlur = async (email: string) => {
    const normalized = (email || '').trim();
    if (!normalized) return;

    try {
      setEmailLookupLoading(true);
      const existing = await UsuarioService.buscarPorEmail(normalized);
      if (!existing) return;

      setNewUser(prev => ({
        ...prev,
        name: existing.nome_completo || prev.name,
        cpf: existing.cpf || prev.cpf,
        phone: existing.telefone || prev.phone,
      }));
    } catch (error: unknown) {
      console.error('Erro ao buscar usuário por e-mail:', error);
    } finally {
      setEmailLookupLoading(false);
    }
  };

  // Métodos de manipulação de usuários (migrados do UserManagement)
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.cpf || !newUser.phone) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (!newUser.password || String(newUser.password).trim().length === 0) {
      alert('Informe uma senha (máximo 6 caracteres).');
      return;
    }

    if (String(newUser.password).length > 6) {
      alert('Senha deve ter no máximo 6 caracteres.');
      return;
    }

    if (!currentUser?.adminUser) {
      alert('Usuário atual não identificado. Faça login novamente.');
      return;
    }

    const allowedRoles = allowedRolesForCreator();
    if (!newUser.role || !allowedRoles.includes(newUser.role as AdminRole)) {
      alert('Você não tem permissão para cadastrar este tipo de usuário.');
      return;
    }

    const resolvedAccessLevelFromRole = resolveAccessLevelForRole(newUser.role as AdminRole);

    if (isGeneralManagement || isSuperAdmin) {
      // Diretor/Coordenador do polo sempre devem ser polo-específico e com polo definido
      if (roleRequiresPolo(newUser.role as AdminRole)) {
        if (!newUser.poloId) {
          alert('Selecione o polo para este usuário.');
          return;
        }
      }
    }

    const resolvedAccessLevel: AccessLevel = resolvedAccessLevelFromRole;
    const resolvedPoloId = creatorIsPoloScoped
      ? currentPoloId
      : (resolvedAccessLevel === 'polo_especifico' ? newUser.poloId : undefined);

    try {
      setSaving(true);
      await UsuarioService.criarUsuario({
        nome_completo: newUser.name,
        email: newUser.email,
        cpf: newUser.cpf,
        telefone: newUser.phone,
        password: newUser.password,
        role: newUser.role,
        polo_id: resolvedPoloId,
        ativo: newUser.isActive,
        metadata: {
          permissions: canConfigurePermissionsForRole(newUser.role as AdminRole)
            ? (newUser.permissions || { mode: 'full', modules: [] })
            : { mode: 'full', modules: [] },
        },
      });

      alert('Usuário criado com sucesso!');
      await carregarUsuarios();
      setNewUser({
        name: '',
        email: '',
        cpf: '',
        phone: '',
        password: '',
        role: allowedRolesForCreator()[0] || 'professor',
        accessLevel: isGeneralManagement ? 'polo_especifico' : (creatorIsPoloScoped ? 'polo_especifico' : currentUser.adminUser.accessLevel),
        poloId: creatorIsPoloScoped ? (currentPoloId || '') : '',
        permissions: { mode: 'full', modules: [] },
        isActive: true
      });
      setShowUserForm(false);
    } catch (error: unknown) {
      console.error('Erro ao criar usuário:', error);
      alert((error as Error)?.message || 'Erro ao criar usuário. Verifique o console.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    if (!currentUser?.adminUser) {
      alert('Usuário atual não identificado. Faça login novamente.');
      return;
    }

    if (creatorIsPoloScoped && currentPoloId && editingUser.poloId && editingUser.poloId !== currentPoloId) {
      alert('Você não tem permissão para editar usuários de outro polo.');
      return;
    }

    try {
      setSaving(true);
      await UsuarioService.atualizarUsuario(editingUser.id, {
        nome_completo: editingUser.name,
        email: editingUser.email,
        cpf: editingUser.cpf,
        telefone: editingUser.phone,
        role: editingUser.role,
        polo_id: creatorIsPoloScoped
          ? (currentPoloId || undefined)
          : (editingUser.accessLevel === 'polo_especifico' ? editingUser.poloId : undefined),
        ativo: editingUser.isActive,
        metadata: {
          permissions: canConfigurePermissionsForRole(editingUser.role)
            ? editingUser.permissions
            : undefined,
        },
      });

      alert('Usuário atualizado com sucesso!');
      await carregarUsuarios();
      setEditingUser(null);
    } catch (error: unknown) {
      console.error('Erro ao atualizar usuário:', error);
      alert((error as Error)?.message || 'Erro ao atualizar usuário. Verifique o console.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      await UsuarioService.deletarUsuario(userId);
      alert('Usuário deletado com sucesso!');
      await carregarUsuarios();
    } catch (error: unknown) {
      console.error('Erro ao deletar usuário:', error);
      const message = (error as Error)?.message || '';
      if (message.includes('violates foreign key constraint') || message.includes('foreign key')) {
        if (confirm('Este usuário possui vínculos (ex: diretoria). Deseja desativar em vez de excluir?')) {
          try {
            await UsuarioService.atualizarUsuario(userId, { ativo: false });
            alert('Usuário desativado com sucesso!');
            await carregarUsuarios();
            return;
          } catch (inner: unknown) {
            console.error('Erro ao desativar usuário após falha de exclusão:', inner);
            alert((inner as Error)?.message || 'Erro ao desativar usuário. Verifique o console.');
            return;
          }
        }
      }

      alert(message || 'Erro ao deletar usuário. Verifique o console.');
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const user = adminUsers.find(u => u.id === userId);
    if (!user) return;

    try {
      if (user.isActive) {
        await UsuarioService.atualizarUsuario(userId, { ativo: false });
      } else {
        await UsuarioService.atualizarUsuario(userId, { ativo: true });
      }
      alert(`Usuário ${user.isActive ? 'desativado' : 'ativado'} com sucesso!`);
      await carregarUsuarios();
    } catch (error: unknown) {
      console.error('Erro ao alterar status:', error);
      alert((error as Error)?.message || 'Erro ao alterar status. Verifique o console.');
    }
  };

  const getRoleIcon = (role: AdminRole) => {
    switch (role) {
      case 'diretor_geral':
      case 'diretor_polo':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'coordenador_geral':
      case 'coordenador_polo':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
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

  const carregarDracmasCriterios = useCallback(async () => {
    try {
      setDracmasCriteriosLoading(true);
      const data = (await DracmasAPI.listarCriterios()) as DracmasCriterio[];
      setDracmasCriterios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar critérios de Drácmas:', error);
      setDracmasCriterios([]);
    } finally {
      setDracmasCriteriosLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'dracmas') {
      void carregarDracmasCriterios();
    }
  }, [activeTab, carregarDracmasCriterios]);

  const toggleCriterioAtivo = async (criterio: DracmasCriterio) => {
    try {
      await DracmasAPI.atualizarCriterio(criterio.id, { ativo: !criterio.ativo });
      await carregarDracmasCriterios();
    } catch (error) {
      console.error('Erro ao atualizar critério de Drácmas:', error);
      alert('Não foi possível atualizar o critério.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
                <p className="text-sm text-gray-600">Gerencie as configurações gerais do sistema</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Settings className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs Navigation */}
        <Card className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px space-x-8">
              {[
                { id: 'users', label: 'Usuários', icon: Users },
                { id: 'config', label: 'Configurações', icon: Settings },
                { id: 'dracmas', label: 'Drácmas', icon: Award },
                { id: 'security', label: 'Segurança', icon: Shield },
                { id: 'backup', label: 'Backup', icon: Database }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
        </Card>

        {/* Users Tab - Interface migrada do UserManagement */}
        {activeTab === 'users' && (
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-6">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
                      <p className="text-sm text-gray-600">Cadastro e controle de coordenadores, diretores e equipe</p>
                    </div>
                  </div>
                  <Button onClick={() => setShowUserForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Usuário
                  </Button>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Filters */}
              <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={filterRole}
                    onChange={(value) => setFilterRole(value as AdminRole | 'all')}
                    disabled={loadingOptions}
                  >
                    <option value="all">Todas as funções</option>
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </Select>
                  <Select
                    value={filterAccessLevel}
                    onChange={(value) => setFilterAccessLevel(value as AccessLevel | 'all')}
                    disabled={loadingOptions}
                  >
                    <option value="all">Todos os níveis</option>
                    {accessLevels.map((level) => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </Select>
                  <div className="flex items-center text-sm text-gray-600">
                    <Filter className="h-4 w-4 mr-2" />
                    {filteredUsers.length} usuário(s) encontrado(s)
                  </div>
                </div>
              </Card>

              {/* Users List */}
              <div className="grid gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getRoleIcon(user.role)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-blue-600 mb-1">{roleLabels[user.role]}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {user.email}
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {user.phone}
                            </div>
                            {user.poloId && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {(() => {
                                  const poloName = polosOptions.find(p => p.id === user.poloId)?.name;
                                  return poloName ? `Polo ${poloName}` : 'Polo não encontrado';
                                })()}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id)}
                        >
                          {user.isActive ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <Card className="text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
                  <p className="text-gray-600">Ajuste os filtros ou cadastre um novo usuário.</p>
                </Card>
              )}
            </div>

            {/* Create User Modal */}
            {showUserForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Novo Usuário Administrativo</h2>
                  
                  <div className="space-y-4">
                    <Input
                      label="Nome Completo"
                      placeholder="Digite o nome completo"
                      value={newUser.name || ''}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    />
                    
                    <Input
                      label="Email"
                      type="email"
                      placeholder="email@ibuc.org.br"
                      value={newUser.email || ''}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      onBlur={(e) => void handleNewUserEmailBlur(e.target.value)}
                      helperText={emailLookupLoading ? 'Buscando usuário...' : undefined}
                    />
                    
                    <Input
                      label="CPF"
                      placeholder="000.000.000-00"
                      value={newUser.cpf || ''}
                      onChange={(e) => setNewUser({...newUser, cpf: e.target.value})}
                    />
                    
                    <Input
                      label="Telefone"
                      placeholder="(63) 99999-9999"
                      value={newUser.phone || ''}
                      onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    />

                    <Input
                      label="Senha"
                      type="password"
                      placeholder="Até 6 caracteres"
                      value={(newUser.password as string) || ''}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      maxLength={6}
                    />
                    
                    <Select
                      label="Função"
                      value={newUser.role || ''}
                      onChange={(value) => {
                        const nextRole = value as AdminRole;
                        const nextAccessLevel = resolveAccessLevelForRole(nextRole);
                        const nextPoloId = nextAccessLevel === 'polo_especifico'
                          ? (creatorIsPoloScoped ? (currentPoloId || '') : (newUser.poloId || ''))
                          : '';

                        setNewUser({
                          ...newUser,
                          role: nextRole,
                          accessLevel: nextAccessLevel,
                          poloId: nextPoloId,
                        });
                      }}
                      disabled={loadingOptions}
                    >
                      <option value="">Selecione uma função</option>
                      {roles
                        .filter(r => allowedRolesForCreator().includes(r.value as AdminRole))
                        .map((role) => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                    </Select>

                    {!currentPoloId && newUser.accessLevel === 'polo_especifico' && roleRequiresPolo(newUser.role as AdminRole) && (
                      <Select
                        label="Polo"
                        value={newUser.poloId || ''}
                        onChange={(value) => setNewUser({...newUser, poloId: value})}
                        disabled={loadingOptions}
                      >
                        <option value="">Selecione um polo</option>
                        {visiblePolosOptions.map((polo) => (
                          <option key={polo.id} value={polo.id}>{polo.name}</option>
                        ))}
                      </Select>
                    )}

                    {newUser.role && canConfigurePermissionsForRole(newUser.role as AdminRole) && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">Permissões</div>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="radio"
                            name="newUserPermissionMode"
                            checked={(newUser.permissions?.mode || 'full') === 'full'}
                            onChange={() => setNewUser({
                              ...newUser,
                              permissions: { mode: 'full', modules: [] }
                            })}
                          />
                          Acesso total
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="radio"
                            name="newUserPermissionMode"
                            checked={(newUser.permissions?.mode || 'full') === 'limited'}
                            onChange={() => setNewUser({
                              ...newUser,
                              permissions: { mode: 'limited', modules: newUser.permissions?.modules || [] }
                            })}
                          />
                          Acesso limitado
                        </label>

                        {(newUser.permissions?.mode || 'full') === 'limited' && (
                          <div className="grid grid-cols-1 gap-2 border border-gray-200 rounded-lg p-3">
                            {moduleOptions.map(m => (
                              <label key={m.key} className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={(newUser.permissions?.modules || []).includes(m.key)}
                                  onChange={(e) => {
                                    const prev = newUser.permissions?.modules || [];
                                    const next = e.target.checked
                                      ? Array.from(new Set([...prev, m.key]))
                                      : prev.filter(x => x !== m.key);
                                    setNewUser({
                                      ...newUser,
                                      permissions: { mode: 'limited', modules: next }
                                    });
                                  }}
                                />
                                {m.label}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <Button className="flex-1" onClick={handleCreateUser} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        'Criar Usuário'
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setShowUserForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Editar Usuário</h2>
                  
                  <div className="space-y-4">
                    <Input
                      label="Nome Completo"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    />
                    
                    <Input
                      label="Email"
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    />
                    
                    <Input
                      label="CPF"
                      value={editingUser.cpf}
                      onChange={(e) => setEditingUser({...editingUser, cpf: e.target.value})}
                    />
                    
                    <Input
                      label="Telefone"
                      value={editingUser.phone}
                      onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                    />
                    
                    <Select
                      label="Função"
                      value={editingUser.role}
                      onChange={(value) => setEditingUser({...editingUser, role: value as AdminRole})}
                      disabled={loadingOptions}
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </Select>
                    
                    <Select
                      label="Nível de Acesso"
                      value={editingUser.accessLevel}
                      onChange={(value) => setEditingUser({...editingUser, accessLevel: value as AccessLevel})}
                      disabled={loadingOptions || creatorIsPoloScoped}
                    >
                      {accessLevels.map((level) => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </Select>
                    
                    {!currentPoloId && editingUser.accessLevel === 'polo_especifico' && (
                      <Select
                        label="Polo"
                        value={editingUser.poloId || ''}
                        onChange={(value) => setEditingUser({...editingUser, poloId: value})}
                        disabled={loadingOptions}
                      >
                        <option value="">Selecione um polo</option>
                        {visiblePolosOptions.map((polo) => (
                          <option key={polo.id} value={polo.id}>{polo.name}</option>
                        ))}
                      </Select>
                    )}

                    {canConfigurePermissionsForRole(editingUser.role) && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">Permissões</div>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="radio"
                            name="editUserPermissionMode"
                            checked={(editingUser.permissions?.mode || 'full') === 'full'}
                            onChange={() => setEditingUser({
                              ...editingUser,
                              permissions: { mode: 'full', modules: [] }
                            })}
                          />
                          Acesso total
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="radio"
                            name="editUserPermissionMode"
                            checked={(editingUser.permissions?.mode || 'full') === 'limited'}
                            onChange={() => setEditingUser({
                              ...editingUser,
                              permissions: { mode: 'limited', modules: editingUser.permissions?.modules || [] }
                            })}
                          />
                          Acesso limitado
                        </label>

                        {(editingUser.permissions?.mode || 'full') === 'limited' && (
                          <div className="grid grid-cols-1 gap-2 border border-gray-200 rounded-lg p-3">
                            {moduleOptions.map(m => (
                              <label key={m.key} className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={(editingUser.permissions?.modules || []).includes(m.key)}
                                  onChange={(e) => {
                                    const prev = editingUser.permissions?.modules || [];
                                    const next = e.target.checked
                                      ? Array.from(new Set([...prev, m.key]))
                                      : prev.filter(x => x !== m.key);
                                    setEditingUser({
                                      ...editingUser,
                                      permissions: { mode: 'limited', modules: next }
                                    });
                                  }}
                                />
                                {m.label}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <Button className="flex-1" onClick={handleUpdateUser} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar Alterações'
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setEditingUser(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Dracmas Tab */}
        {activeTab === 'dracmas' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Configuração de Drácmas (Critérios)</h2>
            <p className="text-sm text-gray-600">
              Defina quais critérios ficam ativos para lançamento e consulta.
            </p>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Critérios</h3>
                {dracmasCriteriosLoading && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Carregando...
                  </div>
                )}
              </div>

              {!dracmasCriteriosLoading && dracmasCriterios.length === 0 && (
                <p className="text-sm text-gray-600">Nenhum critério encontrado.</p>
              )}

              {dracmasCriterios.length > 0 && (
                <div className="space-y-3">
                  {dracmasCriterios.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">{c.nome}</p>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              c.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {c.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{c.codigo}</p>
                        {c.descricao && <p className="text-sm text-gray-600 mt-1">{c.descricao}</p>}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-700">
                          Padrão: <span className="font-semibold">{c.quantidade_padrao}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void toggleCriterioAtivo(c)}
                        >
                          {c.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Config Tab */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Configurações Gerais</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ano Letivo</h3>
                <Input
                  label="Ano"
                  value={systemConfig.schoolYear}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, schoolYear: e.target.value }))}
                />
              </Card>

              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Período de Matrícula</h3>
                <div className="space-y-4">
                  <Input
                    label="Data de Início"
                    type="date"
                    value={systemConfig.enrollmentPeriod.start}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      enrollmentPeriod: { ...prev.enrollmentPeriod, start: e.target.value }
                    }))}
                  />
                  <Input
                    label="Data de Término"
                    type="date"
                    value={systemConfig.enrollmentPeriod.end}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      enrollmentPeriod: { ...prev.enrollmentPeriod, end: e.target.value }
                    }))}
                  />
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Horário das Aulas</h3>
                <div className="space-y-4">
                  <Input
                    label="Horário de Início"
                    type="time"
                    value={systemConfig.classSchedule.startTime}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      classSchedule: { ...prev.classSchedule, startTime: e.target.value }
                    }))}
                  />
                  <Input
                    label="Horário de Término"
                    type="time"
                    value={systemConfig.classSchedule.endTime}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      classSchedule: { ...prev.classSchedule, endTime: e.target.value }
                    }))}
                  />
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notificações</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemConfig.notifications.emailEnabled}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, emailEnabled: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Notificações por Email</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemConfig.notifications.smsEnabled}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, smsEnabled: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Notificações por SMS</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemConfig.notifications.whatsappEnabled}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, whatsappEnabled: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Notificações por WhatsApp</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemConfig.notifications.autoReminders}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, autoReminders: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Lembretes Automáticos</span>
                  </label>
                </div>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={saveSystemConfig}>
                Salvar Configurações
              </Button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Configurações de Segurança</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Política de Senhas</h3>
                <div className="space-y-4">
                  <Input
                    label="Comprimento Mínimo"
                    type="number"
                    value={systemConfig.security.passwordMinLength}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      security: { ...prev.security, passwordMinLength: parseInt(e.target.value) }
                    }))}
                  />
                  <Input
                    label="Timeout de Sessão (minutos)"
                    type="number"
                    value={systemConfig.security.sessionTimeout}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                    }))}
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemConfig.security.twoFactorRequired}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        security: { ...prev.security, twoFactorRequired: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Exigir Autenticação de Dois Fatores</span>
                  </label>
                </div>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={saveSystemConfig}>
                Salvar Configurações
              </Button>
            </div>
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Backup e Restauração</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Backup</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequência
                    </label>
                    <select
                      value={systemConfig.backup.frequency}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        backup: { ...prev.backup, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>
                  <Input
                    label="Dias de Retenção"
                    type="number"
                    value={systemConfig.backup.retentionDays}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      backup: { ...prev.backup, retentionDays: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Último Backup</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      {systemConfig.backup.lastBackup 
                        ? new Date(systemConfig.backup.lastBackup).toLocaleString('pt-BR')
                        : 'Nenhum backup realizado'
                      }
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Button onClick={performBackup}>
                      <Database className="h-4 w-4 mr-2" />
                      Realizar Backup
                    </Button>
                    <Button variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Restaurar Backup
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={saveSystemConfig}>
                Salvar Configurações
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default SystemSettings;
