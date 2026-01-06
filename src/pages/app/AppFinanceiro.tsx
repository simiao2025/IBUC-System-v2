import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useApp } from '../../context/AppContext';
import { FinanceiroService } from '../../features/finance/financeiro.service';
import type { Mensalidade } from '../../types/database';

const AppFinanceiro: React.FC = () => {
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cobrancas, setCobrancas] = useState<Mensalidade[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!currentUser || currentUser.role !== 'student' || !currentUser.studentId) {
        setCobrancas([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = (await FinanceiroService.listarCobrancas({ aluno_id: currentUser.studentId })) as Mensalidade[];
        setCobrancas(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Não foi possível carregar o financeiro.';
        setError(message);
        setCobrancas([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser]);

  const resumo = useMemo(() => {
    const pendentes = cobrancas.filter(c => c.status === 'pendente').length;
    const pagos = cobrancas.filter(c => c.status === 'pago').length;
    const vencidos = cobrancas.filter(c => c.status === 'vencido').length;
    const totalDevidoCents = cobrancas
      .filter(c => c.status !== 'pago')
      .reduce((acc, c) => acc + (c.valor_cents || 0) + (c.juros_cents || 0) - (c.desconto_cents || 0), 0);
    return { pendentes, pagos, vencidos, totalDevidoCents };
  }, [cobrancas]);

  const formatMoney = (cents: number) => {
    const val = (cents || 0) / 100;
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="secondary" size="sm" className="bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white">
          <Link to="/app/dashboard">Voltar</Link>
        </Button>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Financeiro</h1>

      <p className="text-sm text-gray-600 mb-6">Mensalidades do aluno (somente leitura).</p>

      {error && (
        <Card className="p-4 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Pendentes</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : resumo.pendentes}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Pagas</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : resumo.pagos}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Vencidas</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : resumo.vencidos}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total em aberto</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : formatMoney(resumo.totalDevidoCents)}</p>
        </Card>
      </div>

      <Card className="p-4">
        {loading ? (
          <p className="text-sm text-gray-600">Carregando mensalidades...</p>
        ) : cobrancas.length === 0 ? (
          <p className="text-sm text-gray-600">Nenhuma mensalidade encontrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Título</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Vencimento</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cobrancas
                  .slice()
                  .sort((a, b) => String(b.vencimento).localeCompare(String(a.vencimento)))
                  .map((c) => {
                    const venc = c.vencimento ? new Date(c.vencimento).toLocaleDateString('pt-BR') : '—';
                    const badge =
                      c.status === 'pago'
                        ? 'bg-green-100 text-green-800'
                        : c.status === 'vencido'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800';

                    const totalCents = (c.valor_cents || 0) + (c.juros_cents || 0) - (c.desconto_cents || 0);

                    return (
                      <tr key={c.id}>
                        <td className="px-4 py-2 font-medium text-gray-900">{c.titulo}</td>
                        <td className="px-4 py-2">{venc}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${badge}`}>{c.status}</span>
                        </td>
                        <td className="px-4 py-2 text-right">{formatMoney(totalCents)}</td>
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

export default AppFinanceiro;
