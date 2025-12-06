import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
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
  Filter
} from 'lucide-react';
import type { AdminUser, AdminRole, AccessLevel } from '../../types';

const UserManagement: React.FC = () => {
  const { polos } = useApp();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
    {
      id: '1',
      name: 'Dr. João Silva',
      email: 'joao.silva@ibuc.org.br',
      cpf: '123.456.789-00',
      phone: '(63) 99999-9999',
      role: 'diretor_geral',
      accessLevel: 'geral',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Ana Costa',
      email: 'ana.costa@ibuc.org.br',
      cpf: '987.654.321-00',
      phone: '(63) 98888-8888',
      role: 'coordenador_geral',
      accessLevel: 'geral',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    }
  ]);

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

  const roleLabels: Record<AdminRole, string> = {
    coordenador_geral: 'Coordenador Geral',
    diretor_geral: 'Diretor Geral',
    coordenador_polo: 'Coordenador de Polo',
    diretor_polo: 'Diretor de Polo',
    professor: 'Professor',
    auxiliar: 'Auxiliar',
    secretario: 'Secretário(a)',
    tesoureiro: 'Tesoureiro(a)'
  };

  const accessLevelLabels: Record<AccessLevel, string> = {
    geral: 'Acesso Geral',
    polo_especifico: 'Polo Específico'
  };

  const filteredUsers = adminUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesAccessLevel = filterAccessLevel === 'all' || user.accessLevel === filterAccessLevel;
    
    return matchesSearch && matchesRole && matchesAccessLevel;
  });

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.cpf || !newUser.phone) return;

    const user: AdminUser = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      cpf: newUser.cpf,
      phone: newUser.phone,
      role: newUser.role as AdminRole,
      accessLevel: newUser.accessLevel as AccessLevel,
      poloId: newUser.poloId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAdminUsers([...adminUsers, user]);
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
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    setAdminUsers(adminUsers.map(user => 
      user.id === editingUser.id 
        ? { ...editingUser, updatedAt: new Date().toISOString() }
        : user
    ));
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setAdminUsers(adminUsers.filter(user => user.id !== userId));
    }
  };

  const toggleUserStatus = (userId: string) => {
    setAdminUsers(adminUsers.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive, updatedAt: new Date().toISOString() }
        : user
    ));
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
            >
              <option value="all">Todas as funções</option>
              {Object.entries(roleLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
            <Select
              value={filterAccessLevel}
              onChange={(value) => setFilterAccessLevel(value as AccessLevel | 'all')}
            >
              <option value="all">Todos os níveis</option>
              {Object.entries(accessLevelLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
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
              >
                <option value="">Selecione uma função</option>
                {Object.entries(roleLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
              
              <Select
                label="Nível de Acesso"
                value={newUser.accessLevel || ''}
                onChange={(value) => setNewUser({...newUser, accessLevel: value as AccessLevel})}
              >
                {Object.entries(accessLevelLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
              
              {newUser.accessLevel === 'polo_especifico' && (
                <Select
                  label="Polo"
                  value={newUser.poloId || ''}
                  onChange={(value) => setNewUser({...newUser, poloId: value})}
                >
                  <option value="">Selecione um polo</option>
                  {polos.map((polo) => (
                    <option key={polo.id} value={polo.id}>{polo.name}</option>
                  ))}
                </Select>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button className="flex-1" onClick={handleCreateUser}>
                Criar Usuário
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
              >
                {Object.entries(roleLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
              
              <Select
                label="Nível de Acesso"
                value={editingUser.accessLevel}
                onChange={(value) => setEditingUser({...editingUser, accessLevel: value as AccessLevel})}
              >
                {Object.entries(accessLevelLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
              
              {editingUser.accessLevel === 'polo_especifico' && (
                <Select
                  label="Polo"
                  value={editingUser.poloId || ''}
                  onChange={(value) => setEditingUser({...editingUser, poloId: value})}
                >
                  <option value="">Selecione um polo</option>
                  {polos.map((polo) => (
                    <option key={polo.id} value={polo.id}>{polo.name}</option>
                  ))}
                </Select>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button className="flex-1" onClick={handleUpdateUser}>
                Salvar Alterações
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
