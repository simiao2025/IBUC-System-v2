import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AlunoService, AlunosAPI } from './aluno.service';
import StudentForm from '../../components/admin/StudentForm';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const StudentManagement: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, showFeedback, polos } = useApp();
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [editingLoading, setEditingLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isPoloScoped = currentUser?.adminUser?.accessLevel === 'polo_especifico' && Boolean(currentUser?.adminUser?.poloId);
  const userPoloId = currentUser?.adminUser?.poloId;

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        setLoading(true);
        const data = isPoloScoped && userPoloId
          ? await AlunoService.listarAlunos({ poloId: userPoloId })
          : await AlunosAPI.listar();
        setAlunos(data);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        showFeedback('error', 'Erro ao carregar', 'Não foi possível carregar a lista de alunos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlunos();
  }, [isPoloScoped, userPoloId, showFeedback]);

  const handleEdit = async (alunoId: string) => {
    try {
      setEditingLoading(true);
      const aluno = await AlunosAPI.buscarPorId(alunoId);
      setEditingStudent(aluno);
    } catch (error) {
      console.error('Erro ao carregar aluno para edição:', error);
      showFeedback('error', 'Erro ao editar', 'Não foi possível carregar os dados do aluno para edição.');
    } finally {
      setEditingLoading(false);
    }
  };

  const handleSaveEdit = async (studentData: any) => {
    if (!editingStudent?.id) return;
    try {
      setEditingLoading(true);
      await AlunoService.atualizarAluno(editingStudent.id, studentData);
      showFeedback('success', 'Sucesso', 'Aluno atualizado com sucesso.');
      setEditingStudent(null);

      const data = isPoloScoped && userPoloId
        ? await AlunoService.listarAlunos({ poloId: userPoloId })
        : await AlunosAPI.listar();
      setAlunos(data);
    } catch (error) {
      console.error('Erro ao salvar edição do aluno:', error);
      showFeedback('error', 'Erro ao salvar', 'Não foi possível salvar as alterações do aluno.');
    } finally {
      setEditingLoading(false);
    }
  };

  const filteredAlunos = alunos.filter(aluno => {
    const matchesSearch = 
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.cpf.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'todos' || aluno.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAlunos.length / itemsPerPage);
  const paginatedAlunos = filteredAlunos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Ativo</span>;
      case 'inativo':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Inativo</span>;
      case 'pendente':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Pendente</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const getPoloLabel = (aluno: any) => {
    const poloId = aluno?.polo_id;
    if (!poloId) return '—';
    const found = polos?.find((p: any) => p.id === poloId);
    return found?.name || found?.nome || '—';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={isPoloScoped ? 'Gerenciar Alunos do Polo' : 'Gerenciar Alunos'}
        subtitle={isPoloScoped ? 'Visualizar, editar e gerenciar dados dos alunos do polo' : 'Visualizar, editar e gerenciar dados dos alunos'}
        actionLabel="Adicionar Aluno"
        actionIcon={<Plus className="h-4 w-4 mr-2" />}
        onAction={() => navigate('/admin/alunos/novo')}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar por nome ou CPF..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-gray-400" />
            <select 
              className="border rounded-lg px-3 py-2 text-sm bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
              <option value="pendente">Pendentes</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Aluno</th>
                <th className="px-6 py-3">CPF</th>
                {!isPoloScoped && <th className="px-6 py-3">Polo</th>}
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Data Cadastro</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isPoloScoped ? 5 : 6} className="px-6 py-10 text-center text-gray-500">
                    <Clock className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Carregando alunos...
                  </td>
                </tr>
              ) : paginatedAlunos.length === 0 ? (
                <tr>
                  <td colSpan={isPoloScoped ? 5 : 6} className="px-6 py-10 text-center text-gray-500">
                    Nenhum aluno encontrado
                  </td>
                </tr>
              ) : (
                paginatedAlunos.map((aluno) => (
                  <tr key={aluno.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold">
                          {aluno.nome.charAt(0)}
                        </div>
                        <div className="font-medium text-gray-900">{aluno.nome}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{aluno.cpf}</td>
                    {!isPoloScoped && <td className="px-6 py-4">{getPoloLabel(aluno)}</td>}
                    <td className="px-6 py-4">
                      {getStatusBadge(aluno.status || 'ativo')}
                    </td>
                    <td className="px-6 py-4">{new Date(aluno.data_criacao || aluno.created_at || new Date()).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded text-gray-600" title="Ver">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 hover:bg-gray-100 rounded text-blue-600"
                          title="Editar"
                          onClick={() => handleEdit(aluno.id)}
                          disabled={editingLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded text-red-600" title="Excluir">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredAlunos.length > 0 && (
          <div className="p-4 bg-white border-t flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Mostrando {Math.min(filteredAlunos.length, (currentPage - 1) * itemsPerPage + 1)} a {Math.min(filteredAlunos.length, currentPage * itemsPerPage)} de {filteredAlunos.length} alunos
            </span>
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      </div>

      {editingStudent && (
        <StudentForm
          student={editingStudent}
          polos={polos as any}
          onSave={handleSaveEdit}
          onCancel={() => setEditingStudent(null)}
          loading={editingLoading}
        />
      )}
    </div>
  );
};

export default StudentManagement;
