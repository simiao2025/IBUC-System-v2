import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/ui';
import { Select } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { AttendanceReportsAPI } from '@/entities/attendance/api/attendance-reports.api';
import { TurmaService } from '@/features/classes/services/turma.service';
import { Loader2, Download, BarChart2, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ConsolidadoFrequenciaView: React.FC = () => {
  const { currentUser } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [turmas, setTurmas] = useState<any[]>([]);
  
  const [filtros, setFiltros] = useState({
    turma_id: '',
    polo_id: currentUser?.adminUser?.poloId || '',
    inicio: '',
    fim: '',
  });

  useEffect(() => {
    TurmaService.listarTurmas(filtros.polo_id ? { polo_id: filtros.polo_id } : {}).then(res => setTurmas(res as any[]));
  }, [filtros.polo_id]);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const res = await AttendanceReportsAPI.relatorioConsolidadoFrequencia(filtros);
      setData(res as any[]);
    } catch (error) {
      console.error('Erro ao buscar frequÃªncia:', error);
      alert('Erro ao carregar consolidado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 print:hidden">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
          <Search className="h-4 w-4 mr-2" />
          Filtros de FrequÃªncia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Turma (Opcional)</label>
            <Select value={filtros.turma_id} onChange={val => setFiltros(f => ({ ...f, turma_id: val }))}>
              <option value="">Todas as Turmas</option>
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Data InÃ­cio</label>
            <Input type="date" value={filtros.inicio} onChange={e => setFiltros(f => ({ ...f, inicio: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Data Fim</label>
            <Input type="date" value={filtros.fim} onChange={e => setFiltros(f => ({ ...f, fim: e.target.value }))} />
          </div>
          <Button onClick={handleFetch} loading={loading}>
            <BarChart2 className="h-4 w-4 mr-2" />
            Analisar FrequÃªncia
          </Button>
        </div>
      </Card>

      {loading && (
        <div className="p-12 text-center text-gray-500">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2 text-blue-500" />
          Consolidando dados...
        </div>
      )}

      {data.length > 0 && !loading && (
        <Card className="p-8 print:shadow-none print:border-none">
          <div className="flex justify-between items-start mb-8 border-b pb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <BarChart2 className="h-6 w-6 mr-2 text-pink-500" />
                Consolidado de FrequÃªncia
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {filtros.inicio && filtros.fim 
                  ? `PerÃ­odo: ${new Date(filtros.inicio).toLocaleDateString()} atÃ© ${new Date(filtros.fim).toLocaleDateString()}`
                  : 'AnÃ¡lise Geral'}
              </p>
            </div>
            <div className="print:hidden">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Exportar RelatÃ³rio
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turma</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PresenÃ§as</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Faltas</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">% FrequÃªncia</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item) => (
                  <tr key={item.aluno_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.turma}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-bold">{item.presentes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600 font-bold">{item.faltas}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${item.frequencia >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${item.frequencia}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-bold ${item.frequencia >= 75 ? 'text-green-700' : 'text-red-700'}`}>
                          {item.frequencia}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {data.length === 0 && !loading && (
        <Card className="p-12 text-center text-gray-500 italic">
          Nenhum registro de frequÃªncia encontrado para os filtros selecionados.
        </Card>
      )}
    </div>
  );
};

export default ConsolidadoFrequenciaView;
