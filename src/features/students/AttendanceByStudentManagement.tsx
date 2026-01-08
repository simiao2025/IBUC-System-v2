import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { PresencasAPI } from '../attendance/presenca.service';

const AttendanceByStudentManagement: React.FC = () => {
  const [alunoId, setAlunoId] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [summary, setSummary] = useState<{
    totalAulas: number;
    presencas: number;
    faltas: number;
    frequenciaPercentual: number;
    aptoCertificacao: boolean;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoId) {
      setError('Informe o ID do aluno.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await PresencasAPI.porAluno(alunoId, inicio || undefined, fim || undefined);
      setData(response.data);

      const presencas = response.data.registros;
      const totalAulas = presencas.length;
      const presencasCount = presencas.filter((p) => p.status === 'presente').length;
      const faltasCount = totalAulas - presencasCount;
      const frequenciaPercentual = totalAulas > 0 ? (presencasCount / totalAulas) * 100 : 0;
      const aptoCertificacao = frequenciaPercentual >= 75;

      setSummary({
        totalAulas,
        presencas: presencasCount,
        faltas: faltasCount,
        frequenciaPercentual,
        aptoCertificacao,
      });
    } catch (err) {
      console.error('Erro ao buscar frequência do aluno:', err);
      setError('Não foi possível carregar a frequência do aluno.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Frequência por Aluno</h1>

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
            <h2 className="text-lg font-semibold mb-2">Resumo</h2>
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                  <p className="text-xs text-gray-500">Total de Aulas</p>
                  <p className="text-lg font-semibold text-gray-900">{summary.totalAulas}</p>
                </div>
                <div>
                  <p className="text-gray-600">Presenças</p>
                  <p className="text-lg font-bold text-green-600">{data.resumo?.presentes ?? 0}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                  <p className="text-xs text-gray-500">Faltas</p>
                  <p className="text-lg font-semibold text-red-700">{summary.faltas}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                  <p className="text-xs text-gray-500">Frequência / Certificação</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {summary.frequenciaPercentual.toFixed(1)}% - {summary.aptoCertificacao ? 'Apto à certificação (>= 75%)' : 'Não apto (frequência abaixo de 75%)'}
                  </p>
                </div>
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
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Turma</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Observação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.registros.map((r: any) => (
                      <tr key={r.id}>
                        <td className="px-4 py-2">{r.data}</td>
                        <td className="px-4 py-2">{r.turma_id}</td>
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

export default AttendanceByStudentManagement;
