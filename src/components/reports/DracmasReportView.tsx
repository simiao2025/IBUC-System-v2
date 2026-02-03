import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { RelatorioService } from '../../services/relatorio.service';
import { AlunosAPI } from '../../features/students/aluno.service';
import { TurmaService } from '../../services/turma.service';
import { Loader2, FileText, Download, Award, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatLocalDate } from '../../shared/utils/dateUtils';

const DracmasReportView: React.FC = () => {
  const { currentUser } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [filtros, setFiltros] = useState({
    aluno_id: '',
    turma_id: '',
    nivel_id: '',
    polo_id: currentUser?.adminUser?.poloId || '',
    inicio: '',
    fim: '',
  });

  // Opções para os filtros
  const [opcoes, setOpcoes] = useState({
    turmas: [] as any[],
    niveis: [] as any[],
    alunos: [] as any[],
  });

  useEffect(() => {
    // Carregar opções iniciais
    const loadOpcoes = async () => {
      try {
        const [turmasRes, niveisRes] = await Promise.all([
          TurmaService.listarTurmas(filtros.polo_id ? { polo_id: filtros.polo_id } : {}),
          TurmaService.listarNiveis(),
        ]);
        setOpcoes(prev => ({
          ...prev,
          turmas: turmasRes as any[],
          niveis: niveisRes as any[],
        }));
      } catch (error) {
        console.error('Erro ao carregar opções de filtro:', error);
      }
    };
    loadOpcoes();
  }, [filtros.polo_id]);

  useEffect(() => {
    if (filtros.turma_id) {
      AlunosAPI.listar({ turma_id: filtros.turma_id }).then(res => {
        setOpcoes(prev => ({ ...prev, alunos: res as any[] }));
      });
    } else {
      setOpcoes(prev => ({ ...prev, alunos: [] }));
    }
  }, [filtros.turma_id]);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const res = await RelatorioService.relatorioDracmas(filtros);
      setData(res);
    } catch (error) {
      console.error('Erro ao gerar relatório de drácmas:', error);
      alert('Erro ao carregar relatório.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 print:hidden">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
          <Search className="h-4 w-4 mr-2" />
          Filtros do Relatório
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Nível</label>
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
              onChange={val => setFiltros(f => ({ ...f, turma_id: val, aluno_id: '' }))}
            >
              <option value="">Todas as Turmas</option>
              {opcoes.turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Aluno Específico</label>
            <Select
              value={filtros.aluno_id}
              onChange={val => setFiltros(f => ({ ...f, aluno_id: val }))}
              disabled={!filtros.turma_id}
            >
              <option value="">Todos os Alunos da Turma</option>
              {opcoes.alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Data Início</label>
            <Input
              type="date"
              value={filtros.inicio}
              onChange={e => setFiltros(f => ({ ...f, inicio: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Data Fim</label>
            <Input
              type="date"
              value={filtros.fim}
              onChange={e => setFiltros(f => ({ ...f, fim: e.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={handleFetch}
              loading={loading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </div>
      </Card>

      {loading && (
        <div className="p-12 text-center text-gray-500">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2 text-blue-500" />
          Processando dados...
        </div>
      )}

      {data && !loading && (
        <Card className="p-8 print:shadow-none print:border-none">
          <div className="flex justify-between items-start mb-8 border-b pb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Award className="h-6 w-6 mr-2 text-yellow-500" />
                Relatório de Drácmas
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {filtros.inicio && filtros.fim
                  ? `Período: ${formatLocalDate(filtros.inicio)} até ${formatLocalDate(filtros.fim)}`
                  : 'Período: Completo'}
              </p>
            </div>
            <div className="text-right print:hidden">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs font-medium text-blue-600 uppercase">Total de Drácmas</p>
              <p className="text-2xl font-bold text-blue-900">{data.resumo?.total_dracmas || 0} ð</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-yellow-900 font-bold border-l-4 border-yellow-400">
              <p className="text-xs font-medium text-yellow-600 uppercase">Alunos Premiados</p>
              <p className="text-2xl font-bold">{data.resumo?.alunos_atendidos || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs font-medium text-gray-500 uppercase">Total de Lançamentos</p>
              <p className="text-2xl font-bold text-gray-900">{data.resumo?.total_transacoes || 0}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turma</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.transacoes?.map((t: any) => (
                  <tr key={t.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatLocalDate(t.data)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {t.aluno?.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {t.turma?.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {t.tipo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-indigo-600">
                      {t.quantidade > 0 ? `+${t.quantidade}` : t.quantidade} ð
                    </td>
                  </tr>
                ))}
                {(!data.transacoes || data.transacoes.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 italic">
                      Nenhum registro encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DracmasReportView;
