import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/ui';
import { Select } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { StudentReportsAPI } from '@/entities/student/api/student-reports.api';
import { TurmasAPI as TurmaService } from '@/entities/turma';
import { Loader2, FileText, Download, Users, Search, Phone } from 'lucide-react';
import { useApp } from '@/app/providers/AppContext';

const ListaAlunosView: React.FC = () => {
  const { currentUser } = useApp();
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    turma_id: '',
    nivel_id: '',
    polo_id: currentUser?.adminUser?.poloId || '',
    status: 'ativo',
  });

  // Opções para os filtros
  const [opcoes, setOpcoes] = useState({
    turmas: [] as any[],
    niveis: [] as any[],
  });

  useEffect(() => {
    const loadOpcoes = async () => {
      try {
        const [turmasRes, niveisRes] = await Promise.all([
          TurmaService.listarTurmas(filtros.polo_id ? { polo_id: filtros.polo_id } : {}),
          TurmaService.listarNiveis(),
        ]);
        setOpcoes({
          turmas: turmasRes as any[],
          niveis: niveisRes as any[],
        });
      } catch (error) {
        console.error('Erro ao carregar opções:', error);
      }
    };
    loadOpcoes();
  }, [filtros.polo_id]);

  const [pdfLoading, setPdfLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const res = await StudentReportsAPI.relatorioListaAlunos(filtros);
      setAlunos(res);
    } catch (error) {
      console.error('Erro ao buscar lista de alunos:', error);
      alert('Erro ao carregar lista.');
    } finally {
      setLoading(false);
    }
  };

  const handlePdf = async () => {
    setPdfLoading(true);
    try {
      const res = await StudentReportsAPI.gerarListaAlunosPdf(filtros);
      if (res.url) {
        window.open(res.url, '_blank');
      } else {
        throw new Error('URL do PDF não retornada');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 print:hidden">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
          <Search className="h-4 w-4 mr-2" />
          Filtros de Listagem
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <Select 
              value={filtros.status} 
              onChange={val => setFiltros(f => ({ ...f, status: val }))}
            >
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
              <option value="concluido">Concluídos</option>
              <option value="">Todos</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nível</label>
            <Select 
              value={filtros.nivel_id} 
              onChange={val => setFiltros(f => ({ ...f, nivel_id: val }))}
            >
              <option value="">Todos os Níveis</option>
              {opcoes.niveis.map(n => <option key={n.id} value={n.id}>{n.nome}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Turma</label>
            <Select 
              value={filtros.turma_id} 
              onChange={val => setFiltros(f => ({ ...f, turma_id: val }))}
            >
              <option value="">Todas as Turmas</option>
              {opcoes.turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </Select>
          </div>
          <div className="flex items-end">
            <Button 
              className="w-full" 
              onClick={handleFetch} 
              loading={loading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Filtrar Lista
            </Button>
          </div>
        </div>
      </Card>

      {loading && (
        <div className="p-12 text-center text-gray-500">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2 text-blue-500" />
          Carregando alunos...
        </div>
      )}

      {!loading && alunos.length > 0 && (
        <Card className="p-8 print:shadow-none print:border-none">
          <div className="flex justify-between items-start mb-8 border-b pb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2 text-green-500" />
                Lista de Alunos
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Total: {alunos.length} alunos encontrados
              </p>
            </div>
            <div className="print:hidden">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePdf}
                loading={pdfLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Imprimir / PDF
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nascimento</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alunos.map((aluno) => (
                  <tr key={aluno.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {aluno.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-green-500" />
                        {aluno.whatsapp || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {aluno.data_nascimento ? new Date(aluno.data_nascimento).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        aluno.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {aluno.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && alunos.length === 0 && (
        <Card className="p-12 text-center text-gray-500">
          Clique em "Filtrar Lista" para visualizar os alunos.
        </Card>
      )}
    </div>
  );
};

export default ListaAlunosView;
