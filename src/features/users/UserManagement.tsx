import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, Search, Edit2, Trash2, Mail, Phone, User, Shield, Loader2,
  ArrowLeft, MapPin, Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserServiceV2 } from '../../services/userService.v2';
import { PoloService } from '../../services/polo.service';
import { DiretoriaAPI } from '../../services/diretoria.service';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import type { AdminUser, AdminRole, AccessLevel, AdminModuleKey } from '../../types';

interface UserManagementUnifiedProps {
  showBackButton?: boolean;
}

const RESTRICTED_ROLES: AdminRole[] = ['professor', 'primeiro_tesoureiro_polo', 'segundo_tesoureiro_polo'];

const UserManagementUnified: React.FC<UserManagementUnifiedProps> = ({ showBackButton = false }) => {
  const { polos, currentUser, showFeedback, showConfirm } = useApp();
  const isRestrictedUser = useMemo(() => {
    return currentUser?.adminUser?.role ? RESTRICTED_ROLES.includes(currentUser.adminUser.role) : false;
  }, [currentUser]);

  // UI States
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedPermissionGroups, setExpandedPermissionGroups] = useState<string[]>([]);

  // Data States
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [accessLevels, setAccessLevels] = useState<{ value: string; label: string }[]>([]);
  const [polosOptions, setPolosOptions] = useState<{ id: string; name: string }[]>([]);
  const [directoratePeople, setDirectoratePeople] = useState<Array<{
    key: string;
    nome_completo: string;
    telefone?: string;
    email?: string;
    cpf?: string;
    origem: 'geral' | 'polo';
  }>>([]);
  const [directoratePeopleLoading, setDirectoratePeopleLoading] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<AdminRole | 'all'>('all');
  const [filterAccessLevel, setFilterAccessLevel] = useState<AccessLevel | 'all'>('all');

  // Form State
  const initialNewUser: Partial<AdminUser> & { password?: string } = {
    name: '',
    email: '',
    cpf: '',
    phone: '',
    password: '',
    role: 'professor',
    accessLevel: 'polo_especifico',
    poloId: '',
    permissions: { mode: 'full', modules: [] as AdminModuleKey[] },
    isActive: true
  };
  const [newUser, setNewUser] = useState(initialNewUser);
  const [selectedAdminTemplateId, setSelectedAdminTemplateId] = useState<string>('');

  const moduleOptions: { key: AdminModuleKey; label: string }[] = [
    { key: 'lessons', label: 'Cadastro de Módulos e Lições' },
    { key: 'directorate', label: 'Diretoria' },
    { key: 'polos', label: 'Gerenciar Polos' },
    { key: 'students', label: 'Gerenciar Alunos' },
    { key: 'staff', label: 'Equipes (Coordenadores/Professores)' },
    { key: 'enrollments', label: 'Gerenciar Turmas' },
    { key: 'attendance', label: 'Frequência/Drácmas' }, // Note: Frequência uses 'attendance'
    { key: 'dracmas', label: 'Financeiro' },
    { key: 'finance_control', label: 'Controle de Caixa' },
    { key: 'finance_materials', label: 'Validação de Pagamentos' },
    { key: 'finance_config', label: 'Parâmetros Financeiros' },
    { key: 'materials', label: 'Gerenciar Materiais' },
    { key: 'materials_catalog', label: 'Catálogo de Materiais' },
    { key: 'materials_orders', label: 'Gestão de Pedidos' },
    { key: 'reports', label: 'Relatórios' },
    { key: 'pre-enrollments', label: 'Gerenciar Pré-matrículas' },
    { key: 'settings', label: 'Configurações' },
    { key: 'manage_users', label: 'Usuários' },
    { key: 'settings_events', label: 'Eventos' },
    { key: 'dracmas_settings', label: 'Ajustes de Drácmas' }, 
    { key: 'security', label: 'Segurança' },
    { key: 'backup', label: 'Backup' },
  ];

  const groupedModules = [
    { label: 'Módulos', main: 'lessons' as AdminModuleKey, sub: [] },
    { label: 'Diretoria', main: 'directorate' as AdminModuleKey, sub: [] },
    { label: 'Gerenciar Polos', main: 'polos' as AdminModuleKey, sub: [] },
    { label: 'Gerenciar Alunos', main: 'students' as AdminModuleKey, sub: [] },
    { label: 'Equipes', main: 'staff' as AdminModuleKey, sub: [] },
    { label: 'Gerenciar Turmas', main: 'enrollments' as AdminModuleKey, sub: [] },
    { label: 'Frequência/Drácmas', main: 'attendance' as AdminModuleKey, sub: [] },
    { 
      label: 'Financeiro', 
      main: 'dracmas' as AdminModuleKey, 
      sub: ['finance_control', 'finance_materials', 'finance_config'] as AdminModuleKey[]
    },
    { 
      label: 'Gerenciar Materiais', 
      main: 'materials' as AdminModuleKey, 
      sub: ['materials_catalog', 'materials_orders'] as AdminModuleKey[]
    },
    { label: 'Relatórios', main: 'reports' as AdminModuleKey, sub: [] },
    { label: 'Gerenciar Pré-matrículas', main: 'pre-enrollments' as AdminModuleKey, sub: [] },
    { 
      label: 'Configurações', 
      main: 'settings' as AdminModuleKey, 
      sub: ['manage_users', 'settings_events', 'dracmas_settings', 'security', 'backup'] as AdminModuleKey[]
    }
  ];

  // Permission Selectors
  const currentAdmin = currentUser?.adminUser;
  const isSuperAdmin = currentAdmin?.role === 'super_admin' || currentAdmin?.role === 'admin_geral';
  const isGeneralManagement = [
    'diretor_geral', 'vice_diretor_geral', 
    'coordenador_geral', 'vice_coordenador_geral',
    'primeiro_secretario_geral', 'segundo_secretario_geral',
    'primeiro_tesoureiro_geral', 'segundo_tesoureiro_geral'
  ].includes(currentAdmin?.role || '');
  const isPoloDirector = currentAdmin?.role === 'diretor_polo' || currentAdmin?.role === 'vice_diretor_polo';
  const creatorIsPoloScoped = currentAdmin?.accessLevel === 'polo_especifico';

  const isGeneralRole = (role?: AdminRole) => {
    return [
      'super_admin', 'admin_geral',
      'diretor_geral', 'vice_diretor_geral',
      'coordenador_geral', 'vice_coordenador_geral',
      'primeiro_secretario_geral', 'segundo_secretario_geral',
      'primeiro_tesoureiro_geral', 'segundo_tesoureiro_geral'
    ].includes(role || '');
  };

  const roleRequiresPolo = (role?: AdminRole) => {
    if (!role) return false;
    if (isGeneralRole(role)) return false;
    return [
      'diretor_polo', 'vice_diretor_polo',
      'coordenador_polo', 'vice_coordenador_polo',
      'primeiro_secretario_polo', 'segundo_secretario_polo',
      'primeiro_tesoureiro_polo', 'segundo_tesoureiro_polo',
      'professor', 'auxiliar'
    ].includes(role);
  };

  const resolveAccessLevelForRole = (role?: AdminRole): AccessLevel => {
    if (creatorIsPoloScoped) return 'polo_especifico';
    if (!role) return 'polo_especifico';
    if (isGeneralRole(role)) return 'geral';
    return 'polo_especifico';
  };

  const allowedRolesForCreator = (): AdminRole[] => {
    // Admin Geral e Super Admin podem cadastrar qualquer cargo
    if (isSuperAdmin) {
      return [
        'super_admin', 'admin_geral',
        'diretor_geral', 'vice_diretor_geral', 'coordenador_geral', 'vice_coordenador_geral',
        'primeiro_secretario_geral', 'segundo_secretario_geral',
        'primeiro_tesoureiro_geral', 'segundo_tesoureiro_geral',
        'diretor_polo', 'vice_diretor_polo', 'coordenador_polo', 'vice_coordenador_polo',
        'primeiro_secretario_polo', 'segundo_secretario_polo',
        'primeiro_tesoureiro_polo', 'segundo_tesoureiro_polo',
        'professor', 'auxiliar'
      ];
    }

    // Gestão Geral pode cadastrar cargos de polo e staff
    if (isGeneralManagement) {
      return [
        'diretor_polo', 'vice_diretor_polo', 'coordenador_polo', 'vice_coordenador_polo',
        'primeiro_secretario_polo', 'segundo_secretario_polo',
        'primeiro_tesoureiro_polo', 'segundo_tesoureiro_polo',
        'professor', 'auxiliar'
      ];
    }

    // Diretores de Polo podem cadastrar outros cargos de polo e staff
    if (isPoloDirector) {
      return [
        'diretor_polo', 'vice_diretor_polo', 'coordenador_polo', 'vice_coordenador_polo',
        'primeiro_secretario_polo', 'segundo_secretario_polo',
        'primeiro_tesoureiro_polo', 'segundo_tesoureiro_polo',
        'professor', 'auxiliar'
      ];
    }

    return [];
  };



  // Data Loading
  const loadOptions = useCallback(async () => {
    try {
      const [rolesData, accessLevelsData, polosData] = await Promise.all([
        UserServiceV2.listRoles(),
        UserServiceV2.listAccessLevels(),
        PoloService.listarPolos()
      ]);
      setRoles(rolesData);
      setAccessLevels(accessLevelsData);
      setPolosOptions(polosData.map((p: any) => ({ id: p.id, name: p.nome })));
    } catch (error) {
      console.error('Error loading options:', error);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterRole !== 'all') filters.role = filterRole;
      if (searchTerm) filters.search = searchTerm;
      if (creatorIsPoloScoped && currentAdmin?.poloId) {
        filters.polo_id = currentAdmin.poloId;
      }

      const data = await UserServiceV2.listUsers(filters);

      let filtered = data;

      // Se for usuário restrito, mostrar apenas ele mesmo
      if (isRestrictedUser && currentUser?.adminUser) {
        filtered = data.filter(u => u.id === currentUser.adminUser?.id);
      } else {
        if (filterAccessLevel !== 'all') {
          filtered = data.filter(u => u.accessLevel === filterAccessLevel);
        }
      }

      setAdminUsers(filtered);
    } catch (error) {
      console.error('Error loading users:', error);
      showFeedback('error', 'Erro', 'Não foi possível carregar a lista de usuários.');
    } finally {
      setLoading(false);
    }
  }, [filterRole, filterAccessLevel, searchTerm, creatorIsPoloScoped, currentAdmin?.poloId, showFeedback, isRestrictedUser, currentUser]);

  const loadDirectoratePeople = useCallback(async () => {
    try {
      setDirectoratePeopleLoading(true);

      const [geralResp, poloResp] = await Promise.all([
        DiretoriaAPI.listarGeral(true),
        creatorIsPoloScoped && currentAdmin?.poloId
          ? DiretoriaAPI.listarPolo(currentAdmin.poloId, true)
          : DiretoriaAPI.listarPolo(undefined, true),
      ]);

      const geralList = (Array.isArray(geralResp) ? geralResp : []) as any[];
      const poloList = (Array.isArray(poloResp) ? poloResp : []) as any[];

      const mapped = [
        ...geralList.map((r) => ({
          key: `geral:${String(r.id)}`,
          nome_completo: String(r.nome_completo ?? ''),
          telefone: r.telefone ? String(r.telefone) : undefined,
          email: r.email ? String(r.email) : undefined,
          cpf: r.cpf ? String(r.cpf) : undefined,
          origem: 'geral' as const,
        })),
        ...poloList.map((r) => ({
          key: `polo:${String(r.id)}`,
          nome_completo: String(r.nome_completo ?? ''),
          telefone: r.telefone ? String(r.telefone) : undefined,
          email: r.email ? String(r.email) : undefined,
          cpf: r.cpf ? String(r.cpf) : undefined,
          origem: 'polo' as const,
        })),
      ].filter(p => p.nome_completo);

      // dedupe por email/cpf/nome
      const unique = new Map<string, typeof mapped[number]>();
      for (const p of mapped) {
        const dedupeKey = (p.email || p.cpf || p.nome_completo).toLowerCase();
        if (!unique.has(dedupeKey)) unique.set(dedupeKey, p);
      }

      setDirectoratePeople(Array.from(unique.values()));
    } catch (error) {
      console.error('Error loading directorate people:', error);
      setDirectoratePeople([]);
    } finally {
      setDirectoratePeopleLoading(false);
    }
  }, [creatorIsPoloScoped, currentAdmin?.poloId]);

  const handleSelectAdminTemplate = (templateId: string) => {
    setSelectedAdminTemplateId(templateId);
    if (!templateId) return;
    const found = directoratePeople.find(p => p.key === templateId);
    if (!found) return;

    setNewUser(prev => ({
      ...prev,
      name: found.nome_completo || prev.name,
      email: found.email || prev.email,
      cpf: found.cpf || prev.cpf,
      phone: found.telefone || prev.phone,
    }));
  };

  const resetNewUserForm = () => {
    setSelectedAdminTemplateId('');
    setNewUser(initialNewUser);
  };

  useEffect(() => {
    loadOptions();
    loadUsers();
  }, [loadOptions, loadUsers]);

  // Derived Values
  const roleLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    roles.forEach(r => labels[r.value] = r.label);
    return labels;
  }, [roles]);

  const visiblePolos = useMemo(() => {
    if (creatorIsPoloScoped && currentAdmin?.poloId) {
      return polosOptions.filter(p => p.id === currentAdmin.poloId);
    }
    return polosOptions;
  }, [creatorIsPoloScoped, currentAdmin?.poloId, polosOptions]);

  // Event Handlers
  const handleEmailBlur = async (email: string) => {
    if (!email || !email.includes('@')) return;
    try {
      const existing = await UserServiceV2.getUserByEmail(email);
      if (existing) {
        setNewUser(prev => ({
          ...prev,
          name: existing.name,
          cpf: existing.cpf,
          phone: existing.phone
        }));
      }
    } catch (error) {
      // Just fail silently for lookup
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || (roleRequiresPolo(newUser.role as AdminRole) && !newUser.poloId)) {
      showFeedback('warning', 'Atenção', 'Preencha os campos obrigatórios.');
      return;
    }

    try {
      setSaving(true);
      await UserServiceV2.createUser(newUser);
      showFeedback('success', 'Sucesso', 'Usuário criado com sucesso!');
      setShowUserForm(false);
      setNewUser(initialNewUser);
      loadUsers();
    } catch (error: any) {
      showFeedback('error', 'Erro', error.message || 'Erro ao criar usuário.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      setSaving(true);
      await UserServiceV2.updateUser(editingUser.id, editingUser);
      showFeedback('success', 'Sucesso', 'Usuário atualizado com sucesso!');
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      showFeedback('error', 'Erro', error.message || 'Erro ao atualizar usuário.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    showConfirm('Confirmar exclusão', 'Tem certeza que deseja remover este usuário?', async () => {
      try {
        await UserServiceV2.deleteUser(id);
        showFeedback('success', 'Sucesso', 'Usuário removido com sucesso!');
        loadUsers();
      } catch (error: any) {
        showFeedback('error', 'Erro', 'Não foi possível remover o usuário.');
      }
    });
  };

  const toggleStatus = async (user: AdminUser) => {
    try {
      await UserServiceV2.updateUser(user.id, { isActive: !user.isActive });
      showFeedback('success', 'Sucesso', `Usuário ${user.isActive ? 'desativado' : 'ativado'}!`);
      loadUsers();
    } catch (error) {
      showFeedback('error', 'Erro', 'Erro ao alterar status.');
    }
  };

  const renderRoleIcon = (role: AdminRole) => {
    if (isGeneralRole(role)) return <Shield className="h-4 w-4 text-blue-600" />;
    return <User className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {showBackButton && (
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
        </div>
      )}

      {/* Stats & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Usuários do Sistema</h2>
          <p className="text-sm text-gray-500">Total de {adminUsers.length} usuários encontrados</p>
        </div>
        {!isRestrictedUser && (
          <Button onClick={() => { resetNewUserForm(); setShowUserForm(true); void loadDirectoratePeople(); }}>
            <Plus className="h-4 w-4 mr-2" /> Novo Usuário
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, email ou CPF..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={filterRole}
            onChange={(val) => setFilterRole(val as AdminRole | 'all')}
          >
            <option value="all">Todas as funções</option>
            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </Select>
          <Select
            value={filterAccessLevel}
            onChange={(val) => setFilterAccessLevel(val as AccessLevel | 'all')}
          >
            <option value="all">Todos os níveis</option>
            {accessLevels.map(al => <option key={al.value} value={al.value}>{al.label}</option>)}
          </Select>
        </div>
      </Card>

      {/* User List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {adminUsers.map(user => (
            <Card key={user.id} className={`hover:shadow-md transition-shadow ${!user.isActive ? 'bg-gray-50 opacity-75' : ''}`}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-100 p-2 rounded-full mt-1">
                    {renderRoleIcon(user.role)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-blue-600 mb-2">{roleLabels[user.role] || user.role}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                      <div className="flex items-center"><Mail className="h-3 w-3 mr-2" /> {user.email}</div>
                      <div className="flex items-center"><Phone className="h-3 w-3 mr-2" /> {user.phone}</div>
                      {user.poloId && (
                        <div className="flex items-center"><MapPin className="h-3 w-3 mr-2" /> {polos.find(p => p.id === user.poloId)?.name || 'Polo Associado'}</div>
                      )}
                      <div className="flex items-center"><Calendar className="h-3 w-3 mr-2" /> {new Date(user.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  {!isRestrictedUser && (
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(user)}>
                      {user.isActive ? 'Desativar' : 'Ativar'}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {!isRestrictedUser && (
                    <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {adminUsers.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      )}

      {/* Form Modal (Simplified version of both forms) */}
      {(showUserForm || editingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingUser ? 'Editar Usuário' : 'Novo Usuário Administrativo'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Input
                label="Nome Completo"
                value={editingUser?.name ?? newUser.name}
                onChange={(e) => editingUser ? setEditingUser({ ...editingUser, name: e.target.value }) : setNewUser({ ...newUser, name: e.target.value })}
                disabled={isRestrictedUser}
              />
              <Input
                label="Email"
                value={editingUser?.email ?? newUser.email}
                onBlur={(e) => !editingUser && handleEmailBlur(e.target.value)}
                onChange={(e) => editingUser ? setEditingUser({ ...editingUser, email: e.target.value }) : setNewUser({ ...newUser, email: e.target.value })}
                disabled={isRestrictedUser && !!editingUser}
              />
              <Input
                label="CPF"
                value={editingUser?.cpf ?? newUser.cpf}
                onChange={(e) => editingUser ? setEditingUser({ ...editingUser, cpf: e.target.value }) : setNewUser({ ...newUser, cpf: e.target.value })}
                disabled={isRestrictedUser && !!editingUser}
              />
              <Input
                label="Telefone"
                value={editingUser?.phone ?? newUser.phone}
                onChange={(e) => editingUser ? setEditingUser({ ...editingUser, phone: e.target.value }) : setNewUser({ ...newUser, phone: e.target.value })}
                disabled={isRestrictedUser && !!editingUser}
              />
              <Input
                label={editingUser ? "Nova Senha (Opcional)" : "Senha (Máx 6 chars)"}
                type="password"
                placeholder={editingUser ? "Deixe em branco para manter" : ""}
                maxLength={6}
                value={editingUser ? (editingUser as any).password || '' : newUser.password}
                onChange={(e) => editingUser ? setEditingUser({ ...editingUser, password: e.target.value } as any) : setNewUser({ ...newUser, password: e.target.value })}
              />
              {isRestrictedUser ? (
                <Input
                  label="Função"
                  value={roleLabels[editingUser?.role ?? newUser.role] || (editingUser?.role ?? newUser.role)}
                  disabled={true}
                  onChange={() => { }}
                />
              ) : (
                <Select
                  label="Função"
                  value={editingUser?.role ?? newUser.role}
                  onChange={(val) => {
                    const role = val as AdminRole;
                    if (editingUser) {
                      setEditingUser({ ...editingUser, role });
                    } else {
                      setNewUser({ ...newUser, role });
                    }
                  }}
                >
                  {(() => {
                    const allowed = allowedRolesForCreator();
                    // Garantir que o cargo atual apareça mesmo que o criador não possa "criar" novos desse cargo
                    const currentRole = editingUser?.role ?? newUser.role;
                    if (currentRole && !allowed.includes(currentRole as AdminRole)) {
                      allowed.unshift(currentRole as AdminRole);
                    }
                    return allowed.map(role => (
                      <option key={role} value={role}>{roleLabels[role] || role}</option>
                    ));
                  })()}
                </Select>
              )}
              {roleRequiresPolo((editingUser?.role ?? newUser.role) as AdminRole) && (
                <Select
                  label="Polo"
                  value={editingUser?.poloId ?? newUser.poloId}
                  onChange={(val) => editingUser ? setEditingUser({ ...editingUser, poloId: val }) : setNewUser({ ...newUser, poloId: val })}
                  disabled={isRestrictedUser && !!editingUser}
                >
                  <option value="">Selecione um polo</option>
                  {visiblePolos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              )}
            </div>

            {/* Permissions Section (from Settings flow) - Hidden for restricted users editing themselves */}
            {!isRestrictedUser && (
              <div className="border-t pt-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Permissões Específicas</h3>
                <div className="flex space-x-6 mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      className="text-blue-600"
                      checked={(editingUser?.permissions ?? newUser.permissions)?.mode === 'full'}
                      onChange={() => {
                        const perm = { mode: 'full' as const, modules: [] };
                        editingUser ? setEditingUser({ ...editingUser, permissions: perm }) : setNewUser({ ...newUser, permissions: perm });
                      }}
                    />
                    <span className="text-sm">Acesso Total</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      className="text-blue-600"
                      checked={(editingUser?.permissions ?? newUser.permissions)?.mode === 'limited'}
                      onChange={() => {
                        const perm = { mode: 'limited' as const, modules: [] };
                        editingUser ? setEditingUser({ ...editingUser, permissions: perm }) : setNewUser({ ...newUser, permissions: perm });
                      }}
                    />
                    <span className="text-sm">Acesso Limitado</span>
                  </label>
                </div>
                {(editingUser?.permissions ?? newUser.permissions)?.mode === 'limited' && (
                  <div className="space-y-4 mt-6">
                    <h4 className="text-lg font-extrabold text-gray-900 mb-6 px-1">Módulos do Sistema</h4>
                    
                    <div className="grid grid-cols-1 gap-5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar pb-4">
                      {groupedModules.map(group => {
                        const mainMod = moduleOptions.find(m => m.key === group.main);
                        if (!mainMod) return null;
                        
                        const currentPerms = (editingUser?.permissions ?? newUser.permissions) || { mode: 'limited', modules: [] };
                        const isMainChecked = currentPerms.modules.includes(mainMod.key);

                        const toggleModule = (key: AdminModuleKey, checked: boolean) => {
                          let newModules = checked
                            ? [...currentPerms.modules, key]
                            : currentPerms.modules.filter(m => m !== key);
                          
                          if (!checked && group.sub.length > 0) {
                            newModules = newModules.filter(m => !group.sub.includes(m as AdminModuleKey));
                          }
                          if (checked && group.sub.includes(key) && !currentPerms.modules.includes(group.main)) {
                             newModules = [...newModules, group.main];
                          }

                          const perm = { ...currentPerms, modules: Array.from(new Set(newModules)) };
                          editingUser ? setEditingUser({ ...editingUser, permissions: perm }) : setNewUser({ ...newUser, permissions: perm });
                        };

                        return (
                          <div key={group.label} className="bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                            <label className="flex items-center space-x-4 cursor-pointer group mb-4">
                              <input
                                type="checkbox"
                                className="rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 w-6 h-6 transition-all shadow-sm"
                                checked={isMainChecked}
                                onChange={(e) => toggleModule(mainMod.key, e.target.checked)}
                              />
                              <span className={`text-lg font-bold transition-colors ${isMainChecked ? 'text-gray-900' : 'text-gray-400'}`}>
                                {group.label}
                              </span>
                            </label>

                            {isMainChecked && group.sub.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 pl-10 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                {group.sub.map(subKey => {
                                  const subMod = moduleOptions.find(m => m.key === subKey);
                                  if (!subMod) return null;
                                  const isSubChecked = currentPerms.modules.includes(subMod.key);
                                  
                                  return (
                                    <label key={subMod.key} className="flex items-center space-x-3 cursor-pointer group">
                                      <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-400 w-5 h-5 transition-all"
                                        checked={isSubChecked}
                                        onChange={(e) => toggleModule(subMod.key, e.target.checked)}
                                      />
                                      <span className={`text-[15px] font-semibold transition-colors ${isSubChecked ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {subMod.label}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-4">
              <Button className="flex-1" onClick={editingUser ? handleUpdateUser : handleCreateUser} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => { setShowUserForm(false); setEditingUser(null); resetNewUserForm(); }}>
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserManagementUnified;
