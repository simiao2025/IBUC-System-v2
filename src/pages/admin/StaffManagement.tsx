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
  Users,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  UserCheck,
  DollarSign,
  FileText
} from 'lucide-react';
import type { StaffMember, AdminRole } from '../../types';

const StaffManagement: React.FC = () => {
  const { polos } = useApp();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: '1',
      name: 'Maria Santos',
      cpf: '111.222.333-44',
      phone: '(63) 91111-1111',
      email: 'maria.santos@ibuc.org.br',
      role: 'coordenador_polo',
      poloId: '1',
      isActive: true,
      qualifications: ['Teologia', 'Pedagogia'],
      hireDate: '2024-01-01'
    },
    {
      id: '2',
      name: 'Pedro Lima',
      cpf: '555.666.777-88',
      phone: '(63) 92222-2222',
      email: 'pedro.lima@ibuc.org.br',
      role: 'professor',
      poloId: '1',
      isActive: true,
      qualifications: ['Teologia'],
      hireDate: '2024-01-15'
    }
  ]);

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

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPolo = filterPolo === 'all' || staff.poloId === filterPolo;
    const matchesRole = filterRole === 'all' || staff.role === filterRole;
    
    return matchesSearch && matchesPolo && matchesRole;
  });

  const handleCreateStaff = () => {
    if (!newStaff.name || !newStaff.email || !newStaff.cpf || !newStaff.phone || !newStaff.poloId) return;

    const staff: StaffMember = {
      id: Date.now().toString(),
      name: newStaff.name,
      cpf: newStaff.cpf,
      phone: newStaff.phone,
      email: newStaff.email,
      role: newStaff.role as AdminRole,
      poloId: newStaff.poloId,
      isActive: true,
      qualifications: newStaff.qualifications || [],
      hireDate: newStaff.hireDate || new Date().toISOString().split('T')[0]
    };

    setStaffMembers([...staffMembers, staff]);
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
  };

  const handleUpdateStaff = () => {
    if (!editingStaff) return;

    setStaffMembers(staffMembers.map(staff => 
      staff.id === editingStaff.id ? editingStaff : staff
    ));
    setEditingStaff(null);
  };

  const handleDeleteStaff = (staffId: string) => {
    if (confirm('Tem certeza que deseja excluir este membro da equipe?')) {
      setStaffMembers(staffMembers.filter(staff => staff.id !== staffId));
    }
  };

  const toggleStaffStatus = (staffId: string) => {
    setStaffMembers(staffMembers.map(staff => 
      staff.id === staffId ? { ...staff, isActive: !staff.isActive } : staff
    ));
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
                <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Equipes</h1>
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
      </div>

      {/* Create Staff Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Novo Membro da Equipe</h2>
            
            <div className="space-y-4">
              <Select
                label="Polo"
                value={newStaff.poloId || ''}
                onChange={(value) => setNewStaff({...newStaff, poloId: value})}
              >
                <option value="">Selecione um polo</option>
                {polos.map((polo) => (
                  <option key={polo.id} value={polo.id}>{polo.name}</option>
                ))}
              </Select>
              
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
              
              <Select
                label="Função"
                value={newStaff.role || ''}
                onChange={(value) => setNewStaff({...newStaff, role: value as AdminRole})}
              >
                <option value="">Selecione uma função</option>
                {Object.entries(roleLabels)
                  .filter(([key]) => !['coordenador_geral', 'diretor_geral'].includes(key))
                  .map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
              
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
              <Select
                label="Polo"
                value={editingStaff.poloId}
                onChange={(value) => setEditingStaff({...editingStaff, poloId: value})}
              >
                {polos.map((polo) => (
                  <option key={polo.id} value={polo.id}>{polo.name}</option>
                ))}
              </Select>
              
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
              
              <Select
                label="Função"
                value={editingStaff.role}
                onChange={(value) => setEditingStaff({...editingStaff, role: value as AdminRole})}
              >
                {Object.entries(roleLabels)
                  .filter(([key]) => !['coordenador_geral', 'diretor_geral'].includes(key))
                  .map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
              
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
              <Button className="flex-1" onClick={handleUpdateStaff}>
                Salvar Alterações
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
