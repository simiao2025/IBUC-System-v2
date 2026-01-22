import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/ui';
import { PoloReportsAPI } from '@/entities/polo';
import { Loader2, TrendingUp, Users, GraduationCap, BarChart } from 'lucide-react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Nota: Vamos assumir uma interface simples para estatísticas
// Se quiser usar gráficos (Recharts) podemos adicionar depois. 
// Por enquanto, faremos cards com métricas (KPIs).

const EstatisticasView: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState('2024-01-01|2024-12-31');

  useEffect(() => {
    const loadStatsInternal = async () => {
      setLoading(true);
      try {
        const data = await PoloReportsAPI.estatisticasPorPolo(periodo);
        setStats(data);
      } catch (error) {
        console.error('Erro ao carregar stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStatsInternal();
  }, [periodo]);

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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Dados para o gráfico de barras (Alunos por Polo)
  const chartData = data.polos?.map((p: any) => ({
    name: p.nome,
    alunos: p.total_alunos,
    media: parseFloat(p.media) || 0
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
         <h2 className="text-xl font-bold text-gray-800">Painel de Indicadores</h2>
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
        <Card className="p-6 flex items-center space-x-4 border-l-4 border-blue-500">
          <div className="p-3 bg-blue-100 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Alunos</p>
            <p className="text-2xl font-bold text-gray-900">{data.total_alunos}</p>
          </div>
        </Card>
        
        <Card className="p-6 flex items-center space-x-4 border-l-4 border-green-500">
          <div className="p-3 bg-green-100 rounded-full">
            <GraduationCap className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Matrículas Ativas</p>
            <p className="text-2xl font-bold text-gray-900">{data.matriculas_ativas}</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4 border-l-4 border-red-500">
          <div className="p-3 bg-red-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-red-600 transform rotate-180" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Taxa de Evasão</p>
            <p className="text-2xl font-bold text-gray-900">{data.evasao_percentual}%</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4 border-l-4 border-purple-500">
          <div className="p-3 bg-purple-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Média Geral</p>
            <p className="text-2xl font-bold text-gray-900">{data.media_notas_geral}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-blue-500" />
            Distribuição de Alunos por Polo
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="alunos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
            Média de Desempenho por Polo
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="media"
                >
                  {chartData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
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
