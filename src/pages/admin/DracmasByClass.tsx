import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { DracmasAPI } from '../../services/dracmas.service';

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

const DracmasByClass: React.FC = () => {
  const [turmaId, setTurmaId] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DracmasPorTurmaResponse | null>(null);

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

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Drácmas por Turma</h1>

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
  );
};

export default DracmasByClass;
