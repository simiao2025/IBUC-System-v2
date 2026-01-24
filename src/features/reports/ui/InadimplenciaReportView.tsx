import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/ui';
import { Select } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { FinanceReportsAPI } from '@/entities/finance/api/finance-reports.api';
import { poloApi as PolosAPI } from '@/entities/polo';
import { Loader2, Download, DollarSign, Search, AlertCircle, Phone } from 'lucide-react';
import { useAuth } from '@/entities/user';

const InadimplenciaReportView: React.FC = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [polos, setPolos] = useState<any[]>([]);
  
  const [filtros, setFiltros] = useState({
    polo_id: currentUser?.adminUser?.poloId || '',
    data_referencia: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    // Apenas Diretoria Geral pode trocar de polo aqui se nÃ£o estiver fixo
    if (!currentUser?.adminUser?.poloId) {
       PolosAPI.list().then(res => setPolos(res as any[]));
    }
  }, [currentUser]);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const res = await FinanceReportsAPI.relatorioInadimplencia(filtros);
      setData(res);
    } catch (error) {
      console.error('Erro ao buscar inadimplÃªncia:', error);
      alert('Erro ao carregar relatÃ³rio financeiro.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 print:hidden">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
          <Search className="h-4 w-4 mr-2" />
          Filtros Financeiros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {!currentUser?.adminUser?.poloId && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Polo</label>
              <Select value={filtros.polo_id} onChange={val => setFiltros(f => ({ ...f, polo_id: val }))}>
                <option value="">Todos os Polos</option>
                {polos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </Select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Data de ReferÃªncia</label>
            <Input 
              type="date" 
              value={filtros.data_referencia} 
              onChange={e => setFiltros(f => ({ ...f, data_referencia: e.target.value }))} 
            />
          </div>
          <Button onClick={handleFetch} loading={loading} variant="primary">
            <DollarSign className="h-4 w-4 mr-2" />
            Gerar RelatÃ³rio
          </Button>
        </div>
      </Card>

      {loading && (
        <div className="p-12 text-center text-gray-500">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2 text-red-500" />
          Analisando histÃ³rico financeiro...
        </div>
      )}

      {data && !loading && (
        <Card className="p-8 border-l-4 border-red-500 print:shadow-none print:border-none">
          <div className="flex justify-between items-start mb-8 border-b pb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <AlertCircle className="h-6 w-6 mr-2 text-red-500" />
                RelatÃ³rio de InadimplÃªncia
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                ReferÃªncia: {new Date(data.data_referencia).toLocaleDateString()}
              </p>
            </div>
            <div className="print:hidden">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-xs font-medium text-red-600 uppercase">Total em Atraso</p>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(data.total_geral_cents)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs font-medium text-gray-500 uppercase">Alunos Inadimplentes</p>
              <p className="text-2xl font-bold text-gray-900">{data.resumoPorAluno?.length || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs font-medium text-gray-500 uppercase">Total de Parcelas</p>
              <p className="text-2xl font-bold text-gray-900">{data.detalhado?.length || 0}</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo por Aluno</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Parcelas</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Venc. Mais Antigo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.resumoPorAluno?.map((item: any) => (
                  <tr key={item.aluno_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-green-500" />
                        {item.whatsapp || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{item.parcelas_atrasadas}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600">
                      {new Date(item.vencimento_mais_antigo).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-700">
                      {formatCurrency(item.total_atrasado_cents)}
                    </td>
                  </tr>
                ))}
                {(!data.resumoPorAluno || data.resumoPorAluno.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 italic">
                      ParabÃ©ns! NÃ£o foram encontradas inadimplÃªncias para os filtros selecionados.
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

export default InadimplenciaReportView;
