import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { UsuarioService } from '../../services/usuario.service';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Filter,
  Loader2
} from 'lucide-react';
import type { AdminUser, AdminRole, AccessLevel } from '../../types';

const UserManagement: React.FC = () => {
  const { polos } = useApp();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados para dados dinâmicos dos selects
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [accessLevels, setAccessLevels] = useState<{ value: string; label: string }[]>([]);
  const [polosOptions, setPolosOptions] = useState<{ id: string; name: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<AdminRole | 'all'>('all');
  const [filterAccessLevel, setFilterAccessLevel] = useState<AccessLevel | 'all'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  
  const [newUser, setNewUser] = useState<Partial<AdminUser>>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    role: 'professor',
    accessLevel: 'polo_especifico',
    poloId: '',
    isActive: true
  });

  // Carregar usuários ao montar
  useEffect(() => {
    carregarUsuarios();
    carregarOpcoesSelects();
  }, []);

  // Carregar opções para selects dinâmicos
  const carregarOpcoesSelects = async () => {
    try {
      setLoadingOptions(true);
      
      // Buscar roles, access levels e polos em paralelo
      const [rolesData, accessLevelsData] = await Promise.all([
        UsuarioService.listarRoles(),
        UsuarioService.listarAccessLevels(),
      ]);
      
      setRoles(rolesData);
      setAccessLevels(accessLevelsData);
      setPolosOptions(polos || []);
    } catch (error) {
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
  };

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const filtros: any = {};
      if (filterRole !== 'all') filtros.role = filterRole;
      if (filterAccessLevel !== 'all' && filterAccessLevel === 'polo_especifico') {
        // Se for polo específico, precisamos filtrar por polo_id depois
      }
      if (searchTerm) filtros.search = searchTerm;

      const data = await UsuarioService.listarUsuarios(filtros);
      
      // Mapear dados da API para o formato do componente
      const usuariosMapeados = data.map((u: any) => ({
        id: u.id,
        name: u.nome_completo,
        email: u.email,
        cpf: u.cpf || '',
        phone: u.telefone || '',
        role: u.role as AdminRole,
        accessLevel: u.polo_id ? 'polo_especifico' : 'geral' as AccessLevel,
        poloId: u.polo_id || '',
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
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      alert('Erro ao carregar usuários. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  // Recarregar quando filtros mudarem
  useEffect(() => {
    if (!loading) {
      carregarUsuarios();
    }
  }, [filterRole, filterAccessLevel, searchTerm]);

  // Helper para obter labels dinamicamente
  const getRoleLabel = (roleValue: string) => {
    const role = roles.find(r => r.value === roleValue);
    return role?.label || roleValue;
  };

  const getAccessLevelLabel = (accessLevelValue: string) => {
    const accessLevel = accessLevels.find(al => al.value === accessLevelValue);
    return accessLevel?.label || accessLevelValue;
  };

  const roleLabels: Record<AdminRole, string> = {};
  roles.forEach(role => {
    roleLabels[role.value as AdminRole] = role.label;
  });

  const accessLevelLabels: Record<AccessLevel, string> = {};
  accessLevels.forEach(level => {
    accessLevelLabels[level.value as AccessLevel] = level.label;
  });

  const filteredUsers = adminUsers;

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.cpf || !newUser.phone) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);
      await UsuarioService.criarUsuario({
        nome_completo: newUser.name,
        email: newUser.email,
        cpf: newUser.cpf,
        telefone: newUser.phone,
        role: newUser.role,
        polo_id: newUser.accessLevel === 'polo_especifico' ? newUser.poloId : undefined,
        ativo: newUser.isActive !== false,
      });

      alert('Usuário criado com sucesso!');
      await carregarUsuarios();
      setNewUser({
        name: '',
        email: '',
        cpf: '',
        phone: '',
        role: 'professor',
        accessLevel: 'polo_especifico',
        poloId: '',
        isActive: true
      });
      setShowCreateForm(false);
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      alert(error.message || 'Erro ao criar usuário. Verifique o console.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);
      await UsuarioService.atualizarUsuario(editingUser.id, {
        nome_completo: editingUser.name,
        email: editingUser.email,
        cpf: editingUser.cpf,
        telefone: editingUser.phone,
        role: editingUser.role,
        polo_id: editingUser.accessLevel === 'polo_especifico' ? editingUser.poloId : undefined,
        ativo: editingUser.isActive,
      });

      alert('Usuário atualizado com sucesso!');
      await carregarUsuarios();
      setEditingUser(null);
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      alert(error.message || 'Erro ao atualizar usuário. Verifique o console.');
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
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);
      alert(error.message || 'Erro ao deletar usuário. Verifique o console.');
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
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      alert(error.message || 'Erro ao alterar status. Verifique o console.');
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
                <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
                <p className="text-sm text-gray-600">Cadastro e controle de coordenadores, diretores e equipe</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
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
                          {polos.find(p => p.id === user.poloId)?.name || 'Polo não encontrado'}
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
      {showCreateForm && (
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
              
              <Select
                label="Função"
                value={newUser.role || ''}
                onChange={(value) => setNewUser({...newUser, role: value as AdminRole})}
                disabled={loadingOptions}
              >
                <option value="">Selecione uma função</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </Select>
              
              <Select
                label="Nível de Acesso"
                value={newUser.accessLevel || ''}
                onChange={(value) => setNewUser({...newUser, accessLevel: value as AccessLevel})}
                disabled={loadingOptions}
              >
                {accessLevels.map((level) => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </Select>
              
              {newUser.accessLevel === 'polo_especifico' && (
                <Select
                  label="Polo"
                  value={newUser.poloId || ''}
                  onChange={(value) => setNewUser({...newUser, poloId: value})}
                  disabled={loadingOptions}
                >
                  <option value="">Selecione um polo</option>
                  {polosOptions.map((polo) => (
                    <option key={polo.id} value={polo.id}>{polo.name}</option>
                  ))}
                </Select>
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
                onClick={() => setShowCreateForm(false)}
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
                disabled={loadingOptions}
              >
                {accessLevels.map((level) => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </Select>
              
              {editingUser.accessLevel === 'polo_especifico' && (
                <Select
                  label="Polo"
                  value={editingUser.poloId || ''}
                  onChange={(value) => setEditingUser({...editingUser, poloId: value})}
                  disabled={loadingOptions}
                >
                  <option value="">Selecione um polo</option>
                  {polosOptions.map((polo) => (
                    <option key={polo.id} value={polo.id}>{polo.name}</option>
                  ))}
                </Select>
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
  );
};

export default UserManagement;
