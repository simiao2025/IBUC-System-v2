import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { PresencasAPI } from '../../services/presenca.service';

const AttendanceByClass: React.FC = () => {
  const [turmaId, setTurmaId] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turmaId) {
      setError('Informe o ID da turma.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await PresencasAPI.porTurma(turmaId, inicio || undefined, fim || undefined);
      setData(response.data);
    } catch (err) {
      console.error('Erro ao buscar frequência da turma:', err);
      setError('Não foi possível carregar a frequência da turma.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Frequência por Turma</h1>

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
            <h2 className="text-lg font-semibold mb-2">Resumo por Aluno / Certificação</h2>
            {(!data.resumoPorAluno || data.resumoPorAluno.length === 0) && (
              <p className="text-sm text-gray-600">Nenhum registro encontrado para o período informado.</p>
            )}
            {data.resumoPorAluno && data.resumoPorAluno.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Aluno</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Total</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Presenças</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Faltas</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Frequência</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Certificação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.resumoPorAluno.map((item: any) => (
                      <tr key={item.aluno_id}>
                        <td className="px-4 py-2">{item.aluno_id}</td>
                        <td className="px-4 py-2">{item.total}</td>
                        <td className="px-4 py-2 text-green-600">{item.presentes}</td>
                        <td className="px-4 py-2 text-red-600">{item.faltas}</td>
                        <td className="px-4 py-2">
                          {item.total > 0
                            ? `${((item.presentes / item.total) * 100).toFixed(1)}%`
                            : '—'}
                        </td>
                        <td className="px-4 py-2">
                          {item.total > 0 && (item.presentes / item.total) * 100 >= 75
                            ? 'Apto (>= 75%)'
                            : 'Não apto (< 75%)'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-2">Registros de Presença</h2>
            {(!data.registros || data.registros.length === 0) && (
              <p className="text-sm text-gray-600">Nenhum registro encontrado para o período informado.</p>
            )}
            {data.registros && data.registros.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Data</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Aluno</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Observação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.registros.map((r: any) => (
                      <tr key={r.id}>
                        <td className="px-4 py-2">{r.data}</td>
                        <td className="px-4 py-2">{r.aluno_id}</td>
                        <td className="px-4 py-2 capitalize">{r.status}</td>
                        <td className="px-4 py-2 text-gray-600">{r.observacao || '—'}</td>
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

export default AttendanceByClass;
