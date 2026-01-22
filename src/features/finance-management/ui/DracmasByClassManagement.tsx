import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/app/providers/AppContext';
import { Card, Button, Input, PageHeader } from '@/shared/ui';
import { DracmasAPI } from '../api/dracmas.service';
import AccessControl from '@/features/auth/ui/AccessControl';

type DracmaTransacao = {
  id: string;
  data: string;
  aluno_id: string;
  tipo: string;
  quantidade: number;
  descricao?: string;
};

type ResumoPorAluno = {
  aluno_id: string;
  total_dracmas: number;
};

type DracmasPorTurmaResponse = {
  turma_id: string;
  totalTurma: number;
  resumoPorAluno: ResumoPorAluno[];
  transacoes: DracmaTransacao[];
};

const DracmasByClassManagement: React.FC = () => {
  const { currentUser, showFeedback } = useApp();
  const [turmaId, setTurmaId] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DracmasPorTurmaResponse | null>(null);

  // Resgate State
  const [showResgateModal, setShowResgateModal] = useState(false);
  const [resgateLoading, setResgateLoading] = useState(false);

  // Auto-fill from URL
  const [searchParams] = useSearchParams();
  const urlTurmaId = searchParams.get('turma_id');

  useEffect(() => {
    if (urlTurmaId) {
      setTurmaId(urlTurmaId);
      // Auto submit if ID exists
      // Workaround to trigger fetch
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await DracmasAPI.porTurma(urlTurmaId);
          setData(response as DracmasPorTurmaResponse);
        } catch (err) {
          console.error('Erro ao buscar Drácmas da turma:', err);
          setError('Não foi possível carregar as informações da turma.');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [urlTurmaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turmaId) {
      setError('Informe o ID da turma.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await DracmasAPI.porTurma(turmaId, inicio || undefined, fim || undefined);
      setData(response as DracmasPorTurmaResponse);
    } catch (err) {
      console.error('Erro ao buscar Drácmas da turma:', err);
      setError('Não foi possível carregar as informações de Drácmas da turma.');
    } finally {
      setLoading(false);
    }
  };

  const handleResgatar = async () => {
    if (!turmaId || !currentUser?.id) return;

    setResgateLoading(true);
    try {
      const result: any = await DracmasAPI.resgatar({
        turma_id: turmaId,
        resgatado_por: currentUser.id
      });

      showFeedback('success', 'Resgate Realizado', `Foram resgatadas drácmas de ${result.count} registros.`);
      setShowResgateModal(false);
      // Recarregar dados
      await handleSubmit({ preventDefault: () => { } } as any);
    } catch (err) {
      console.error('Erro ao resgatar:', err);
      showFeedback('error', 'Erro', 'Falha ao realizar o resgate.');
    } finally {
      setResgateLoading(false);
    }
  };

  return (
    <AccessControl allowedRoles={['super_admin', 'admin_geral', 'diretor_geral', 'coordenador_geral', 'secretario_geral', 'tesoureiro_geral', 'professor']}>
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Drácmas por Turma"
          subtitle="Consulta de saldo e histórico de transações"
          showBackButton={true}
          backTo="/admin/frequencia"
          actionIcon={undefined} // Default icon or custom
        />
        <div className="max-w-5xl mx-auto py-8">

          <Card className="p-6 mb-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID da Turma</label>
                <Input
                  value={turmaId}
                  onChange={e => setTurmaId(e.target.value)}
                  placeholder="ID interno da turma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                <Input type="date" value={inicio} onChange={e => setInicio(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                <Input type="date" value={fim} onChange={e => setFim(e.target.value)} />
              </div>
              <div className="flex md:justify-end">
                <Button type="submit" loading={loading} className="w-full md:w-auto">
                  Buscar
                </Button>
              </div>
            </form>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </Card>

          {data && (
            <div className="space-y-4">
              <Card className="p-4">
                <h2 className="text-lg font-semibold mb-2">Resumo por Aluno</h2>
                {(!data.resumoPorAluno || data.resumoPorAluno.length === 0) && (
                  <p className="text-sm text-gray-600">Nenhuma transação encontrada para o período informado.</p>
                )}
                {data.resumoPorAluno && data.resumoPorAluno.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Aluno</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Total de Drácmas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.resumoPorAluno.map((item) => (
                          <tr key={item.aluno_id}>
                            <td className="px-4 py-2">{item.aluno_id}</td>
                            <td className="px-4 py-2 font-semibold">{item.total_dracmas}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              <Card className="p-4">
                <h2 className="text-lg font-semibold mb-2">Transações</h2>
                {(!data.transacoes || data.transacoes.length === 0) && (
                  <p className="text-sm text-gray-600">Nenhuma transação encontrada para o período informado.</p>
                )}
                {data.transacoes && data.transacoes.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Data</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Aluno</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Tipo</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Quantidade</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Descrição</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.transacoes.map((t) => (
                          <tr key={t.id}>
                            <td className="px-4 py-2">{t.data}</td>
                            <td className="px-4 py-2">{t.aluno_id}</td>
                            <td className="px-4 py-2 capitalize">{t.tipo}</td>
                            <td className="px-4 py-2 font-semibold">{t.quantidade}</td>
                            <td className="px-4 py-2 text-gray-600">{t.descricao || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Resgate Confirmation Modal */}
      {showResgateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar Resgate?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Esta ação irá <strong>zerar o saldo digital</strong> de todos os alunos desta turma e mover os registros para o histórico de resgate.
              <br /><br />
              Isso deve ser feito quando as drácmas forem "sacadas" para uso em feirinhas ou eventos.
            </p>

            <div className="bg-yellow-50 p-3 rounded mb-6 border border-yellow-200">
              <p className="text-xs text-yellow-800 font-semibold">
                Turma ID: {turmaId}
              </p>
              <p className="text-xs text-yellow-800">
                Total a resgatar: {data?.totalTurma} drácmas
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowResgateModal(false)} disabled={resgateLoading}>
                Cancelar
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleResgatar}
                loading={resgateLoading}
              >
                Confirmar Resgate
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AccessControl>
  );
};

export default DracmasByClassManagement;
