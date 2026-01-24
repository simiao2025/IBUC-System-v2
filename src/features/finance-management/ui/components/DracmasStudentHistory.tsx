import React, { useState } from 'react';
import { Card } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { dracmasApi as DracmasAPI } from '@/entities/finance';
import { studentApi } from '@/entities/student';
import AccessControl from '@/features/auth/ui/AccessControl';

type DracmaTransacao = {
  id: string;
  data: string;
  turma_id: string;
  tipo: string;
  quantidade: number;
  descricao?: string;
};

type DracmasPorAlunoResponse = {
  aluno_id: string;
  saldo: number;
  transacoes: DracmaTransacao[];
};

const DracmasStudentHistory: React.FC = () => {
  const [alunoId, setAlunoId] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DracmasPorAlunoResponse | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoId) {
      setError('Informe o ID do aluno.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await DracmasAPI.porAluno(alunoId, inicio || undefined, fim || undefined);
      setData(response as DracmasPorAlunoResponse);
      
      const hist = await studentApi.getHistory(alunoId);
      setHistorico(hist);
    } catch (err) {
      console.error('Erro ao buscar DrÃ¡cmas do aluno:', err);
      setError('NÃ£o foi possÃ­vel carregar as informaÃ§Ãµes de DrÃ¡cmas do aluno.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccessControl allowedRoles={['super_admin', 'admin_geral', 'diretor_geral', 'coordenador_geral', 'secretario_geral', 'tesoureiro_geral']}>
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">DrÃ¡cmas por Aluno</h1>

      <Card className="p-6 mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID do Aluno</label>
            <Input
              value={alunoId}
              onChange={e => setAlunoId(e.target.value)}
              placeholder="ID interno do aluno"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data InÃ­cio</label>
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
            <h2 className="text-lg font-semibold mb-2">Resumo</h2>
            <p className="text-sm text-gray-700">
              Saldo atual de DrÃ¡cmas: <span className="font-bold text-indigo-700">{data.saldo ?? 0}</span>
            </p>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-2">TransaÃ§Ãµes</h2>
            {(!data.transacoes || data.transacoes.length === 0) && (
              <p className="text-sm text-gray-600">Nenhuma transaÃ§Ã£o encontrada para o perÃ­odo informado.</p>
            )}
            {data.transacoes && data.transacoes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Data</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Turma</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Tipo</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Quantidade</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">DescriÃ§Ã£o</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.transacoes.map((t) => (
                      <tr key={t.id}>
                        <td className="px-4 py-2">{t.data}</td>
                        <td className="px-4 py-2">{t.turma_id}</td>
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

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-2 text-indigo-900 border-b pb-1">HistÃ³rico de MÃ³dulos ConcluÃ­dos</h2>
            {historico.length === 0 ? (
              <p className="text-sm text-gray-600">Nenhum registro de conclusÃ£o de mÃ³dulo encontrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">MÃ³dulo</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Ano</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">SituaÃ§Ã£o</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Data Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historico.map((h, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 font-semibold">MÃ³dulo {h.modulo_numero.toString().padStart(2, '0')}</td>
                        <td className="px-4 py-2">{h.ano_conclusao}</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs uppercase font-medium">
                            {h.situacao}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-500">
                          {new Date(h.created_at).toLocaleDateString('pt-BR')}
                        </td>
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
  </AccessControl>
);
};

export default DracmasStudentHistory;
