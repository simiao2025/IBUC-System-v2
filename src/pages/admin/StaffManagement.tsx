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
  Users,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  UserCheck,
  DollarSign,
  FileText,
  Loader2
} from 'lucide-react';
import type { StaffMember, AdminRole } from '../../types';

// Roles que são considerados "staff" (equipe)
// Apenas valores válidos para o enum role_usuario no banco de dados
const STAFF_ROLES: AdminRole[] = ['professor', 'coordenador_polo', 'diretor_polo', 'auxiliar'];

const StaffManagement: React.FC = () => {
  const { polos } = useApp();
  console.log('StaffManagement - polos no contexto:', polos);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPolo, setFilterPolo] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<AdminRole | 'all'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    role: 'professor',
    poloId: '',
    isActive: true,
    qualifications: [],
    hireDate: new Date().toISOString().split('T')[0]
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

  // Carregar staff ao montar
  useEffect(() => {
    carregarStaff();
  }, []);

  // Recarregar quando filtros mudarem
  useEffect(() => {
    if (!loading) {
      carregarStaff();
    }
  }, [filterPolo, filterRole, searchTerm]);

  const carregarStaff = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os usuários com roles de staff
      const rolesFiltro = filterRole !== 'all' ? [filterRole] : STAFF_ROLES;
      const usuarios: any[] = [];
      
      for (const role of rolesFiltro) {
        const filtros: any = { role };
        if (filterPolo !== 'all') filtros.polo_id = filterPolo;
        if (searchTerm) filtros.search = searchTerm;
        
        const data = await UsuarioService.listarUsuarios(filtros);
        usuarios.push(...data);
      }

      // Remover duplicatas e mapear para StaffMember
      const uniqueUsuarios = Array.from(new Map(usuarios.map(u => [u.id, u])).values());
      
      const staffMapeados = uniqueUsuarios
        .filter((u: any) => STAFF_ROLES.includes(u.role))
        .map((u: any) => ({
          id: u.id,
          name: u.nome_completo,
          cpf: u.cpf || '',
          phone: u.telefone || '',
          email: u.email,
          role: u.role as AdminRole,
          poloId: u.polo_id || '',
          isActive: u.ativo,
          qualifications: u.metadata?.qualifications || [],
          hireDate: u.metadata?.hireDate || u.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
        }));

      // Aplicar filtros locais
      let staffFiltrados = staffMapeados;
      if (filterPolo !== 'all') {
        staffFiltrados = staffFiltrados.filter(s => s.poloId === filterPolo);
      }
      if (filterRole !== 'all') {
        staffFiltrados = staffFiltrados.filter(s => s.role === filterRole);
      }
      if (searchTerm) {
        staffFiltrados = staffFiltrados.filter(s => 
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setStaffMembers(staffFiltrados);
    } catch (error) {
      console.error('Erro ao carregar equipe:', error);
      alert('Erro ao carregar equipe. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staffMembers;

  const handleCreateStaff = async () => {
    if (!newStaff.name || !newStaff.email || !newStaff.cpf || !newStaff.phone || !newStaff.poloId) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);
      await UsuarioService.criarUsuario({
        nome_completo: newStaff.name,
        email: newStaff.email,
        cpf: newStaff.cpf,
        telefone: newStaff.phone,
        role: newStaff.role,
        polo_id: newStaff.poloId,
        ativo: newStaff.isActive !== false,
        metadata: {
          qualifications: newStaff.qualifications || [],
          hireDate: newStaff.hireDate,
        },
      });

      alert('Membro da equipe criado com sucesso!');
      await carregarStaff();
      setNewStaff({
        name: '',
        cpf: '',
        phone: '',
        email: '',
        role: 'professor',
        poloId: '',
        isActive: true,
        qualifications: [],
        hireDate: new Date().toISOString().split('T')[0]
      });
      setShowCreateForm(false);
    } catch (error: any) {
      console.error('Erro ao criar membro da equipe:', error);
      alert(error.message || 'Erro ao criar membro da equipe. Verifique o console.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff) return;

    try {
      setSaving(true);
      await UsuarioService.atualizarUsuario(editingStaff.id, {
        nome_completo: editingStaff.name,
        email: editingStaff.email,
        cpf: editingStaff.cpf,
        telefone: editingStaff.phone,
        role: editingStaff.role,
        polo_id: editingStaff.poloId,
        ativo: editingStaff.isActive,
        metadata: {
          qualifications: editingStaff.qualifications || [],
          hireDate: editingStaff.hireDate,
        },
      });

      alert('Membro da equipe atualizado com sucesso!');
      await carregarStaff();
      setEditingStaff(null);
    } catch (error: any) {
      console.error('Erro ao atualizar membro da equipe:', error);
      alert(error.message || 'Erro ao atualizar membro da equipe. Verifique o console.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Tem certeza que deseja excluir este membro da equipe?')) return;

    try {
      await UsuarioService.deletarUsuario(staffId);
      alert('Membro da equipe deletado com sucesso!');
      await carregarStaff();
    } catch (error: any) {
      console.error('Erro ao deletar membro da equipe:', error);
      alert(error.message || 'Erro ao deletar membro da equipe. Verifique o console.');
    }
  };

  const toggleStaffStatus = async (staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId);
    if (!staff) return;

    try {
      if (staff.isActive) {
        await UsuarioService.atualizarUsuario(staffId, { ativo: false });
      } else {
        await UsuarioService.atualizarUsuario(staffId, { ativo: true });
      }
      alert(`Membro da equipe ${staff.isActive ? 'desativado' : 'ativado'} com sucesso!`);
      await carregarStaff();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      alert(error.message || 'Erro ao alterar status. Verifique o console.');
    }
  };

  const getRoleIcon = (role: AdminRole) => {
    switch (role) {
      case 'coordenador_polo':
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case 'diretor_polo':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'professor':
        return <GraduationCap className="h-4 w-4 text-green-600" />;
      case 'auxiliar':
        return <BookOpen className="h-4 w-4 text-orange-600" />;
      case 'secretario':
        return <FileText className="h-4 w-4 text-indigo-600" />;
      case 'tesoureiro':
        return <DollarSign className="h-4 w-4 text-yellow-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStaffByPolo = () => {
    const staffByPolo: Record<string, StaffMember[]> = {};
    
    filteredStaff.forEach(staff => {
      if (!staffByPolo[staff.poloId]) {
        staffByPolo[staff.poloId] = [];
      }
      staffByPolo[staff.poloId].push(staff);
    });
    
    return staffByPolo;
  };

  const staffByPolo = getStaffByPolo();

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div className="h-20 w-20 flex items-center justify-center bg-white rounded-xl shadow-sm p-1 mr-4">
                <img
                  src="/icons/3d/equipes_polos.png"
                  alt="Equipes de Polos"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Equipes de Polos</h1>
                <p className="text-sm text-gray-600">Coordenadores, professores, auxiliares, secretários e tesoureiros dos polos</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Membro
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <span className="ml-2 text-gray-600">Carregando equipe...</span>
          </div>
        ) : (
          <>
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
              value={filterPolo}
              onChange={(value) => setFilterPolo(value)}
            >
              <option value="all">Todos os polos</option>
              {polos.map((polo) => (
                <option key={polo.id} value={polo.id}>{polo.name}</option>
              ))}
            </Select>
            <Select
              value={filterRole}
              onChange={(value) => setFilterRole(value as AdminRole | 'all')}
            >
              <option value="all">Todas as funções</option>
              {Object.entries(roleLabels)
                .filter(([key]) => !['coordenador_geral', 'diretor_geral'].includes(key))
                .map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              {filteredStaff.length} membro(s) encontrado(s)
            </div>
          </div>
        </Card>

        {/* Staff by Polo */}
        <div className="space-y-6">
          {Object.entries(staffByPolo).map(([poloId, staff]) => {
            const polo = polos.find(p => p.id === poloId);
            if (!polo) return null;

            return (
              <Card key={poloId}>
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <h2 className="text-xl font-semibold text-gray-900">{polo.name}</h2>
                    </div>
                    <span className="text-sm text-gray-600">
                      {staff.length} membro(s)
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {polo.address.city}, {polo.address.state}
                  </p>
                </div>

                <div className="grid gap-4">
                  {staff.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getRoleIcon(member.role)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              member.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {member.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-blue-600 mb-1">{roleLabels[member.role]}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span>{member.email}</span>
                            <span>{member.phone}</span>
                            {member.qualifications && member.qualifications.length > 0 && (
                              <span className="flex items-center">
                                <GraduationCap className="h-3 w-3 mr-1" />
                                {member.qualifications.join(', ')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Contratado em {new Date(member.hireDate).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStaffStatus(member.id)}
                        >
                          {member.isActive ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingStaff(member)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStaff(member.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {filteredStaff.length === 0 && (
          <Card className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum membro encontrado</h3>
            <p className="text-gray-600">Ajuste os filtros ou cadastre um novo membro da equipe.</p>
          </Card>
        )}
          </>
        )}
      </div>

      {/* Create Staff Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Novo Membro da Equipe</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Polo</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  value={newStaff.poloId || ''}
                  onChange={(e) => setNewStaff({ ...newStaff, poloId: e.target.value })}
                >
                  <option value="">Selecione um polo</option>
                  {polos.map((polo) => (
                    <option key={polo.id} value={polo.id}>{polo.name}</option>
                  ))}
                </select>
              </div>
              
              <Input
                label="Nome Completo"
                placeholder="Digite o nome completo"
                value={newStaff.name || ''}
                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
              />
              
              <Input
                label="Email"
                type="email"
                placeholder="email@ibuc.org.br"
                value={newStaff.email || ''}
                onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
              />
              
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                value={newStaff.cpf || ''}
                onChange={(e) => setNewStaff({...newStaff, cpf: e.target.value})}
              />
              
              <Input
                label="Telefone"
                placeholder="(63) 99999-9999"
                value={newStaff.phone || ''}
                onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
              />
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Função</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  value={newStaff.role || ''}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as AdminRole })}
                >
                  <option value="">Selecione uma função</option>
                  {Object.entries(roleLabels)
                    .filter(([key]) => !['coordenador_geral', 'diretor_geral'].includes(key))
                    .map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                </select>
              </div>
              
              <Input
                label="Data de Contratação"
                type="date"
                value={newStaff.hireDate || ''}
                onChange={(e) => setNewStaff({...newStaff, hireDate: e.target.value})}
              />
              
              <Input
                label="Qualificações (separadas por vírgula)"
                placeholder="Teologia, Pedagogia, etc."
                value={newStaff.qualifications?.join(', ') || ''}
                onChange={(e) => setNewStaff({...newStaff, qualifications: e.target.value.split(',').map(q => q.trim()).filter(q => q)})}
              />
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button className="flex-1" onClick={handleCreateStaff}>
                Adicionar Membro
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

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Editar Membro</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Polo</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  value={editingStaff.poloId}
                  onChange={(e) => setEditingStaff({ ...editingStaff, poloId: e.target.value })}
                >
                  {polos.map((polo) => (
                    <option key={polo.id} value={polo.id}>{polo.name}</option>
                  ))}
                </select>
              </div>
              
              <Input
                label="Nome Completo"
                value={editingStaff.name}
                onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})}
              />
              
              <Input
                label="Email"
                type="email"
                value={editingStaff.email}
                onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})}
              />
              
              <Input
                label="CPF"
                value={editingStaff.cpf}
                onChange={(e) => setEditingStaff({...editingStaff, cpf: e.target.value})}
              />
              
              <Input
                label="Telefone"
                value={editingStaff.phone}
                onChange={(e) => setEditingStaff({...editingStaff, phone: e.target.value})}
              />
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Função</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value as AdminRole })}
                >
                  {Object.entries(roleLabels)
                    .filter(([key]) => !['coordenador_geral', 'diretor_geral'].includes(key))
                    .map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                </select>
              </div>
              
              <Input
                label="Data de Contratação"
                type="date"
                value={editingStaff.hireDate}
                onChange={(e) => setEditingStaff({...editingStaff, hireDate: e.target.value})}
              />
              
              <Input
                label="Qualificações (separadas por vírgula)"
                value={editingStaff.qualifications?.join(', ') || ''}
                onChange={(e) => setEditingStaff({...editingStaff, qualifications: e.target.value.split(',').map(q => q.trim()).filter(q => q)})}
              />
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button className="flex-1" onClick={handleUpdateStaff} disabled={saving}>
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
                onClick={() => setEditingStaff(null)}
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

export default StaffManagement;
