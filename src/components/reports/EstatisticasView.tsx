import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { RelatorioService } from '../../services/relatorio.service';
import { Loader2, TrendingUp, Users, GraduationCap } from 'lucide-react';
import Button from '../../components/ui/Button';

// Nota: Vamos assumir uma interface simples para estatísticas
// Se quiser usar gráficos (Recharts) podemos adicionar depois. 
// Por enquanto, faremos cards com métricas (KPIs).

const EstatisticasView: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState('2024-01-01|2024-12-31');

  useEffect(() => {
    loadStats();
  }, [periodo]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await RelatorioService.estatisticasPorPolo(periodo);
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return <div className="p-8 text-center text-gray-500"><Loader2 className="animate-spin h-8 w-8 mx-auto mb-2" />Carregando dados...</div>;
  }

  // Mock de estrutura caso o endpoint retorne vazio ou estrutura diferente
  // Adaptar conforme o retorno real do backend
  const data = stats || {
    total_alunos: 0,
    matriculas_ativas: 0,
    evasao_percentual: 0,
    media_notas_geral: 0,
    polos: []
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
         <select 
           value={periodo} 
           onChange={e => setPeriodo(e.target.value)}
           className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
         >
           <option value="2024-01-01|2024-12-31">2024</option>
           <option value="2025-01-01|2025-12-31">2025</option>
         </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Alunos</p>
            <p className="text-2xl font-bold text-gray-900">{data.total_alunos}</p>
          </div>
        </Card>
        
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-full">
            <GraduationCap className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Matrículas Ativas</p>
            <p className="text-2xl font-bold text-gray-900">{data.matriculas_ativas}</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-red-600 transform rotate-180" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Taxa de Evasão</p>
            <p className="text-2xl font-bold text-gray-900">{data.evasao_percentual}%</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Média Geral</p>
            <p className="text-2xl font-bold text-gray-900">{data.media_notas_geral}</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Desempenho por Polo</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Polo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Alunos</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Média</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Frequência</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.polos?.map((polo: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{polo.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{polo.total_alunos}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{polo.media}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{polo.frequencia}%</td>
                </tr>
              ))}
              {(!data.polos || data.polos.length === 0) && (
                 <tr>
                   <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Sem dados detalhados por polo.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default EstatisticasView;
