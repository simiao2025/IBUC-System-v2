import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, Search, Edit2, Trash2, Mail, Phone, User, Shield, Loader2,
  ArrowLeft, MapPin, Calendar
} from 'lucide-react';
import { useAuth } from '@/entities/user';
import { useUI } from '@/shared/lib/providers/UIProvider';
import { usePolos } from '@/entities/polo';
import { userApi } from '@/entities/user';
import { poloApi as PoloService } from '@/entities/polo';
import { Button, Card, Input, Select } from '@/shared/ui';
import type { AdminUser, AdminRole, AccessLevel } from '@/types';

import { UserFormModal } from './UserFormModal';
import { getRoleLabel } from '../utils/roleLabels';

const RESTRICTED_ROLES: AdminRole[] = ['professor', 'primeiro_tesoureiro_polo', 'segundo_tesoureiro_polo'];

interface UserManagementUnifiedProps {
  showBackButton?: boolean;
}

const UserManagementUnified: React.FC<UserManagementUnifiedProps> = ({ showBackButton = false }) => {
  const { currentUser } = useAuth();
  const { showFeedback, showConfirm } = useUI();
  const { polos } = usePolos();

  // UI States
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    cargo?: string;
  }>>([]);
  const [directoratePeopleLoading, setDirectoratePeopleLoading] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<AdminRole | 'all'>('all');
  const [filterAccessLevel, setFilterAccessLevel] = useState<AccessLevel | 'all'>('all');

  // New User Template State
  const initialNewUser: Partial<AdminUser> & { password?: string } = {
    name: '',
    email: '',
    cpf: '',
    phone: '',
    password: '',
    role: 'professor',
    accessLevel: 'polo_especifico',
    poloId: '',
    isActive: true
  };
  const [newUser, setNewUser] = useState(initialNewUser);

  const resetNewUserForm = () => {
    setNewUser(initialNewUser);
  };

  // Permission Selectors
  const currentAdmin = currentUser?.adminUser;
  const isSuperAdmin = currentAdmin?.role === 'super_admin' || currentAdmin?.role === 'admin_geral';
  const isGeneralManagement = currentAdmin?.role === 'diretor_geral' || currentAdmin?.role === 'coordenador_geral';
  const isPoloDirector = currentAdmin?.role === 'diretor_polo';
  const creatorIsPoloScoped = currentAdmin?.accessLevel === 'polo_especifico';

  const isRestrictedUser = useMemo(() => {
    return currentUser?.adminUser?.role ? RESTRICTED_ROLES.includes(currentUser.adminUser.role) : false;
  }, [currentUser]);

  const isGeneralRole = (role?: AdminRole | string) => {
    return [
      'super_admin', 'admin_geral',
      'diretor_geral', 'vice_diretor_geral',
      'coordenador_geral', 'vice_coordenador_geral',
      'secretario_geral', 'primeiro_secretario_geral', 'segundo_secretario_geral',
      'tesoureiro_geral', 'primeiro_tesoureiro_geral', 'segundo_tesoureiro_geral'
    ].includes(role || '');
  };

  const roleRequiresPolo = (role?: AdminRole | string) => {
    if (!role) return false;
    if (isGeneralRole(role)) return false;
    return [
      'diretor_polo', 'vice_diretor_polo',
      'coordenador_polo', 'vice_coordenador_polo',
      'secretario_polo', 'primeiro_secretario_polo', 'segundo_secretario_polo',
      'tesoureiro_polo', 'primeiro_tesoureiro_polo', 'segundo_tesoureiro_polo',
      'professor', 'auxiliar'
    ].includes(role);
  };

  const allowedRolesForCreator = (): string[] => {
    if (isSuperAdmin) {
      return [
        'super_admin', 'admin_geral',
        'diretor_geral', 'vice_diretor_geral', 'coordenador_geral', 'vice_coordenador_geral',
        'secretario_geral', 'primeiro_secretario_geral', 'segundo_secretario_geral',
        'tesoureiro_geral', 'primeiro_tesoureiro_geral', 'segundo_tesoureiro_geral',
        'diretor_polo', 'vice_diretor_polo', 'coordenador_polo', 'vice_coordenador_polo',
        'secretario_polo', 'primeiro_secretario_polo', 'segundo_secretario_polo',
        'tesoureiro_polo', 'primeiro_tesoureiro_polo', 'segundo_tesoureiro_polo',
        'professor', 'auxiliar'
      ];
    }

    if (isGeneralManagement) {
      return [
        'diretor_polo', 'vice_diretor_polo', 'coordenador_polo', 'vice_coordenador_polo',
        'secretario_polo', 'primeiro_secretario_polo', 'segundo_secretario_polo',
        'tesoureiro_polo', 'primeiro_tesoureiro_polo', 'segundo_tesoureiro_polo',
        'professor', 'auxiliar'
      ];
    }

    if (isPoloDirector) {
      return [
        'diretor_polo', // Permitir gerenciar Diretores de Polo do mesmo polo
        'vice_diretor_polo', 'coordenador_polo', 'vice_coordenador_polo',
        'secretario_polo', 'primeiro_secretario_polo', 'segundo_secretario_polo',
        'tesoureiro_polo', 'primeiro_tesoureiro_polo', 'segundo_tesoureiro_polo',
        'professor', 'auxiliar'
      ];
    }

    return [];
  };

  const canConfigurePermissionsForRole = (role: string): boolean => {
    return ['secretario_polo', 'tesoureiro_polo', 'professor', 'auxiliar', 'secretario_geral', 'tesoureiro_geral'].includes(role);
  };

  // Data Loading
  const loadOptions = useCallback(async () => {
    try {
      const [rolesData, accessLevelsData, polosData] = await Promise.all([
        userApi.listRoles(),
        userApi.listAccessLevels(),
        PoloService.list(true)
      ]);
      setRoles(rolesData);
      setAccessLevels(accessLevelsData);
      setPolosOptions((polosData || []).map((p: any) => ({ id: p.id, name: p.name })));
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

      const data = await userApi.list(filters);
      let filtered = data;

      if (isRestrictedUser && currentUser?.adminUser) {
        filtered = data.filter(u => u.id === currentUser.adminUser?.id);
      } else if (filterAccessLevel !== 'all') {
        filtered = data.filter(u => u.accessLevel === filterAccessLevel);
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
        PoloService.listDirectoryGeral(true),
        creatorIsPoloScoped && currentAdmin?.poloId
          ? PoloService.listDirectoryPolo(currentAdmin.poloId, true)
          : PoloService.listDirectoryPolo(undefined, true),
      ]);

      const geralList = (Array.isArray(geralResp) ? geralResp : []);
      const poloList = (Array.isArray(poloResp) ? poloResp : []);

      const mapped = [
        ...geralList.map((r: any) => ({
          key: `geral:${String(r.id)}`,
          nome_completo: String(r.nome_completo ?? ''),
          telefone: r.telefone,
          email: r.email,
          cpf: r.cpf,
          origem: 'geral' as const,
          cargo: r.cargo // 'diretor_geral', etc
        })),
        ...poloList.map((r: any) => ({
          key: `polo:${String(r.id)}`,
          nome_completo: String(r.nome_completo ?? ''),
          telefone: r.telefone,
          email: r.email,
          cpf: r.cpf,
          origem: 'polo' as const,
          cargo: r.cargo // 'diretor_polo', etc
        })),
      ].filter(p => p.nome_completo);

      const unique = new Map<string, typeof mapped[number]>();
      for (const p of mapped) {
        const dedupeKey = (p.email || p.cpf || p.nome_completo).toLowerCase();
        if (!unique.has(dedupeKey)) unique.set(dedupeKey, p);
      }
      setDirectoratePeople(Array.from(unique.values()) as any);
    } catch (error) {
      console.error('Error loading directorate people:', error);
      setDirectoratePeople([]);
    } finally {
      setDirectoratePeopleLoading(false);
    }
  }, [creatorIsPoloScoped, currentAdmin?.poloId]);

  useEffect(() => {
    loadOptions();
    loadUsers();
  }, [loadOptions, loadUsers]);

  const handleCreateCallback = async (userData: Partial<AdminUser> & { password?: string }) => {
    try {
      setSaving(true);
      await userApi.create(userData as any);
      showFeedback('success', 'Sucesso', 'Usuário criado com sucesso!');
      setShowUserForm(false);
      resetNewUserForm();
      loadUsers();
    } catch (error: any) {
      showFeedback('error', 'Erro', error.message || 'Erro ao criar usuário.');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCallback = async (userData: Partial<AdminUser> & { password?: string }) => {
    if (!editingUser) return;
    try {
      setSaving(true);
      const updateData = { ...userData };
      if (!updateData.password) delete updateData.password;
      
      await userApi.update(editingUser.id, updateData);
      showFeedback('success', 'Sucesso', 'Usuário atualizado com sucesso!');
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      showFeedback('error', 'Erro', error.message || 'Erro ao atualizar usuário.');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    showConfirm({
      title: 'Confirmar exclusão',
      message: 'Tem certeza que deseja remover este usuário?',
      onConfirm: async () => {
        try {
          await userApi.delete(id);
          showFeedback('success', 'Sucesso', 'Usuário removido com sucesso!');
          loadUsers();
        } catch (error: any) {
          showFeedback('error', 'Erro', 'Não foi possível remover o usuário.');
        }
      }
    });
  };

  const toggleStatus = async (user: AdminUser) => {
    try {
      await userApi.update(user.id, { isActive: !user.isActive });
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
                    <p className="text-sm font-medium text-blue-600 mb-2">{getRoleLabel(user.role)}</p>
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
                  <Button variant="outline" size="sm" onClick={() => { setEditingUser(user); void loadDirectoratePeople(); }}>
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

      {/* Modal Unificado */}
      {(showUserForm || !!editingUser) && (
        <UserFormModal
          isOpen={showUserForm || !!editingUser}
          onClose={() => {
            setShowUserForm(false);
            setEditingUser(null);
            resetNewUserForm();
          }}
          onSave={editingUser ? handleUpdateCallback : handleCreateCallback}
          initialData={editingUser}
          roles={roles}
          polos={polosOptions}
          directoratePeople={directoratePeople}
          onLoadDirectoratePeople={() => void loadDirectoratePeople()}
          directoratePeopleLoading={directoratePeopleLoading}
          isRestrictedUser={isRestrictedUser}
          allowedRoles={allowedRolesForCreator()}
          roleRequiresPolo={(r) => roleRequiresPolo(r)}
          canConfigurePermissions={(r) => canConfigurePermissionsForRole(r)}
          isPoloAdmin={creatorIsPoloScoped}
          currentPoloId={currentAdmin?.poloId || ''}
        />
      )}
    </div>
  );
};

export default UserManagementUnified;
