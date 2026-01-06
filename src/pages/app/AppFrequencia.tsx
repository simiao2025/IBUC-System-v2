import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useApp } from '../../context/AppContext';
import { PresencaService } from '../../features/attendance/presenca.service';
import type { Presenca } from '../../types/database';

const AppFrequencia: React.FC = () => {
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presencas, setPresencas] = useState<Presenca[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!currentUser || currentUser.role !== 'student' || !currentUser.studentId) {
        setPresencas([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = (await PresencaService.porAluno(currentUser.studentId)) as Presenca[];
        setPresencas(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Não foi possível carregar a frequência.';
        setError(message);
        setPresencas([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser]);

  const resumo = useMemo(() => {
    const total = presencas.length;
    const presentes = presencas.filter(p => p.status === 'presente').length;
    const percentual = total > 0 ? Math.round((presentes / total) * 100) : 0;
    return { total, presentes, percentual };
  }, [presencas]);

  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="secondary" size="sm" className="bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white">
          <Link to="/app/dashboard">Voltar</Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Frequência</h1>
      <p className="text-sm text-gray-600 mb-6">Histórico de presença (somente leitura).</p>

      {error && (
        <Card className="p-4 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Aulas registradas</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : resumo.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Presenças</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : resumo.presentes}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Percentual</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : `${resumo.percentual}%`}</p>
        </Card>
      </div>

      <Card className="p-4">
        {loading ? (
          <p className="text-sm text-gray-600">Carregando frequência...</p>
        ) : presencas.length === 0 ? (
          <p className="text-sm text-gray-600">Nenhum registro de presença encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Data</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Observação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {presencas
                  .slice()
                  .sort((a, b) => String(b.data).localeCompare(String(a.data)))
                  .map((p) => {
                    const dataFmt = p.data ? new Date(p.data).toLocaleDateString('pt-BR') : '—';
                    const badge =
                      p.status === 'presente'
                        ? 'bg-green-100 text-green-800'
                        : p.status === 'falta'
                          ? 'bg-red-100 text-red-800'
                          : p.status === 'atraso'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800';

                    return (
                      <tr key={p.id}>
                        <td className="px-4 py-2">{dataFmt}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${badge}`}>{p.status}</span>
                        </td>
                        <td className="px-4 py-2 text-gray-700">{p.observacao || '—'}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AppFrequencia;
