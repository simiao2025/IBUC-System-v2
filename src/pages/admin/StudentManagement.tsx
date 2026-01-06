import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { 
  ArrowLeft,
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye,
  Download,
  Filter,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  GraduationCap
} from 'lucide-react';
import type { StudentData, Level } from '../../types';
import { LEVELS } from '../../types';

const StudentManagement: React.FC = () => {
  const { students, addStudent, polos } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<Level | 'all'>('all');
  const [filterPolo, setFilterPolo] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);
  const [viewingStudent, setViewingStudent] = useState<StudentData | null>(null);

  // Mock student data - em um sistema real viria do backend
  const [mockStudents] = useState<(StudentData & { 
    status: 'active' | 'inactive';
    enrollmentDate: string;
    level: Level;
    polo: string;
    attendance: number;
    lastActivity: string;
  })[]>([
    {
      id: '1',
      name: 'Ana Silva Santos',
      birthDate: '2010-05-15',
      cpf: '123.456.789-00',
      gender: 'female',
      address: {
        cep: '77000-000',
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'Palmas',
        state: 'TO'
      },
      phone: '(63) 99999-1111',
      email: 'ana.santos@email.com',
      parents: {
        fatherName: 'João Santos',
        motherName: 'Maria Santos',
        phone: '(63) 98888-2222',
        email: 'pais.santos@email.com',
        fatherCpf: '111.222.333-44',
        motherCpf: '555.666.777-88'
      },
      status: 'active',
      enrollmentDate: '2024-02-01',
      level: 'NIVEL_II',
      polo: '1',
      attendance: 92.5,
      lastActivity: '2024-01-14'
    },
    {
      id: '2',
      name: 'Pedro Lima Costa',
      birthDate: '2012-08-22',
      cpf: '987.654.321-00',
      gender: 'male',
      address: {
        cep: '77001-000',
        street: 'Avenida Norte',
        number: '456',
        neighborhood: 'Plano Diretor Norte',
        city: 'Palmas',
        state: 'TO'
      },
      phone: '(63) 99999-3333',
      email: 'pedro.costa@email.com',
      parents: {
        fatherName: 'Carlos Costa',
        motherName: 'Lucia Costa',
        phone: '(63) 98888-4444',
        email: 'pais.costa@email.com',
        fatherCpf: '222.333.444-55',
        motherCpf: '666.777.888-99'
      },
      status: 'active',
      enrollmentDate: '2024-01-15',
      level: 'NIVEL_I',
      polo: '2',
      attendance: 87.3,
      lastActivity: '2024-01-13'
    }
  ]);

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.cpf.includes(searchTerm) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || student.level === filterLevel;
    const matchesPolo = filterPolo === 'all' || student.polo === filterPolo;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    
    return matchesSearch && matchesLevel && matchesPolo && matchesStatus;
  });

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleView = (student: any) => {
    setViewingStudent(student);
  };

  const handleDelete = (studentId: string) => {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
      // Em um sistema real, faria a chamada para API
      console.log('Deletar aluno:', studentId);
    }
  };

  const exportStudents = () => {
    // Simulação de exportação
    alert('Lista de alunos exportada com sucesso!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return 'text-green-600';
    if (attendance >= 80) return 'text-yellow-600';
    return 'text-red-600';
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
                <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Alunos</h1>
                <p className="text-sm text-gray-600">Cadastro e acompanhamento de todos os alunos</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={exportStudents}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Aluno
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center bg-blue-50 border-blue-200">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-blue-900">{mockStudents.length}</h3>
            <p className="text-blue-700">Total de Alunos</p>
          </Card>
          <Card className="text-center bg-green-50 border-green-200">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-green-900">
              {mockStudents.filter(s => s.status === 'active').length}
            </h3>
            <p className="text-green-700">Alunos Ativos</p>
          </Card>
          <Card className="text-center bg-purple-50 border-purple-200">
            <GraduationCap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-purple-900">
              {Math.round(mockStudents.reduce((acc, s) => acc + s.attendance, 0) / mockStudents.length)}%
            </h3>
            <p className="text-purple-700">Frequência Média</p>
          </Card>
          <Card className="text-center bg-orange-50 border-orange-200">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-orange-900">
              {mockStudents.filter(s => {
                const daysDiff = Math.floor((new Date().getTime() - new Date(s.lastActivity).getTime()) / (1000 * 3600 * 24));
                return daysDiff <= 7;
              }).length}
            </h3>
            <p className="text-orange-700">Ativos esta Semana</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, CPF ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterLevel}
              onChange={(value) => setFilterLevel(value as Level | 'all')}
              options={[
                { value: 'all', label: 'Todos os Níveis' },
                ...Object.entries(LEVELS).map(([key, label]) => ({ value: key, label }))
              ]}
            />
            <Select
              value={filterPolo}
              onChange={(value) => setFilterPolo(value)}
              options={[
                { value: 'all', label: 'Todos os Polos' },
                ...polos.map(polo => ({ value: polo.id, label: polo.name }))
              ]}
            />
            <Select
              value={filterStatus}
              onChange={(value) => setFilterStatus(value as 'all' | 'active' | 'inactive')}
              options={[
                { value: 'all', label: 'Todos os Status' },
                { value: 'active', label: 'Ativos' },
                { value: 'inactive', label: 'Inativos' }
              ]}
            />
            <div className="flex items-center text-sm text-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              {filteredStudents.length} aluno(s) encontrado(s)
            </div>
          </div>
        </Card>

        {/* Students List */}
        <div className="grid gap-4">
          {filteredStudents.map((student) => {
            const polo = polos.find(p => p.id === student.polo);
            return (
              <Card key={student.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(student.status)}`}>
                          {student.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {LEVELS[student.level]}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date().getFullYear() - new Date(student.birthDate).getFullYear()} anos
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {student.phone}
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {student.email}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {polo?.name || 'Polo não encontrado'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="text-gray-600">
                          Matrícula: {new Date(student.enrollmentDate).toLocaleDateString('pt-BR')}
                        </span>
                        <span className={`font-medium ${getAttendanceColor(student.attendance)}`}>
                          Frequência: {student.attendance}%
                        </span>
                        <span className="text-gray-600">
                          Último acesso: {new Date(student.lastActivity).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(student)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(student)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(student.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <Card className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum aluno encontrado</h3>
            <p className="text-gray-600">Ajuste os filtros ou cadastre um novo aluno.</p>
          </Card>
        )}
      </div>

      {/* Student Details Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Detalhes do Aluno</h2>
              <Button variant="outline" size="sm" onClick={() => setViewingStudent(null)}>
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Nome:</strong> {viewingStudent.name}</p>
                  <p><strong>CPF:</strong> {viewingStudent.cpf}</p>
                  <p><strong>Data de Nascimento:</strong> {new Date(viewingStudent.birthDate).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Gênero:</strong> {viewingStudent.gender === 'male' ? 'Masculino' : viewingStudent.gender === 'female' ? 'Feminino' : 'Outro'}</p>
                  <p><strong>Telefone:</strong> {viewingStudent.phone}</p>
                  <p><strong>Email:</strong> {viewingStudent.email}</p>
                </div>

                <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>CEP:</strong> {viewingStudent.address.cep}</p>
                  <p><strong>Rua:</strong> {viewingStudent.address.street}, {viewingStudent.address.number}</p>
                  <p><strong>Bairro:</strong> {viewingStudent.address.neighborhood}</p>
                  <p><strong>Cidade:</strong> {viewingStudent.address.city}/{viewingStudent.address.state}</p>
                </div>
              </div>

              {/* Parents & Academic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Informações dos Pais</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Pai:</strong> {viewingStudent.parents.fatherName}</p>
                  <p><strong>CPF do Pai:</strong> {viewingStudent.parents.fatherCpf}</p>
                  <p><strong>Mãe:</strong> {viewingStudent.parents.motherName}</p>
                  <p><strong>CPF da Mãe:</strong> {viewingStudent.parents.motherCpf}</p>
                  <p><strong>Telefone:</strong> {viewingStudent.parents.phone}</p>
                  <p><strong>Email:</strong> {viewingStudent.parents.email}</p>
                </div>

                <h3 className="text-lg font-semibold text-gray-900">Informações Acadêmicas</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Nível:</strong> {LEVELS[(viewingStudent as any).level]}</p>
                  <p><strong>Polo:</strong> {polos.find(p => p.id === (viewingStudent as any).polo)?.name}</p>
                  <p><strong>Data de Matrícula:</strong> {new Date((viewingStudent as any).enrollmentDate).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${getStatusColor((viewingStudent as any).status)}`}>
                    {(viewingStudent as any).status === 'active' ? 'Ativo' : 'Inativo'}
                  </span></p>
                  <p><strong>Frequência:</strong> <span className={getAttendanceColor((viewingStudent as any).attendance)}>
                    {(viewingStudent as any).attendance}%
                  </span></p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add/Edit Student Form Modal - Simplified for now */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingStudent ? 'Editar Aluno' : 'Novo Aluno'}
            </h2>
            <p className="text-gray-600 mb-4">
              Para cadastrar um novo aluno, utilize o formulário de matrícula no menu principal.
            </p>
            <div className="flex space-x-3">
              <Button asChild className="flex-1">
                <Link to="/matricula">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Ir para Matrícula
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => {
                  setShowForm(false);
                  setEditingStudent(null);
                }}
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

export default StudentManagement;
