import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { RelatorioService } from '../../services/relatorio.service';
import { AlunosAPI } from '../../services/aluno.service';
import { TurmasAPI } from '../../services/turma.service';
import { Loader2, FileText, Download } from 'lucide-react';

const BoletimView: React.FC = () => {
  const [alunos, setAlunos] = useState<{ id: string, nome: string }[]>([]);
  const [turmas, setTurmas] = useState<{ id: string, nome: string }[]>([]);
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedAluno, setSelectedAluno] = useState('');
  // Periodo is often 'modulo_id' or a date range, simplifying to just month/Year or general
  // Assuming the backend expects a generic 'periodo' string
  const [periodo, setPeriodo] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM

  const [boletim, setBoletim] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Carregar Turmas para filtro
    TurmasAPI.listar({}).then((data: any) => {
      setTurmas(Array.isArray(data) ? data.map((t: any) => ({ id: t.id, nome: t.nome })) : []);
    });
  }, []);

  useEffect(() => {
    if (selectedTurma) {
      AlunosAPI.listar({ turma_id: selectedTurma }).then((data: any) => {
        setAlunos(Array.isArray(data) ? data.map((a: any) => ({ id: a.id, nome: a.nome })) : []);
      });
    } else {
      setAlunos([]);
    }
  }, [selectedTurma]);

  const handleGerarBoletim = async () => {
    if (!selectedAluno) return;
    
    setGenerating(true);
    try {
      const data = await RelatorioService.gerarBoletim(selectedAluno, periodo);
      setBoletim(data);
    } catch (error) {
      console.error('Erro ao gerar boletim:', error);
      alert('Erro ao gerar boletim. Verifique se há dados para o período.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
            <Select value={selectedTurma} onChange={val => setSelectedTurma(val)}>
              <option value="">Selecione...</option>
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aluno</label>
            <Select value={selectedAluno} onChange={val => setSelectedAluno(val)} disabled={!selectedTurma}>
              <option value="">Selecione...</option>
              {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período (Mês Referência)</label>
            <Input type="month" value={periodo} onChange={e => setPeriodo(e.target.value)} />
          </div>
          <Button onClick={handleGerarBoletim} disabled={!selectedAluno || generating}>
            {generating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
            Gerar Boletim
          </Button>
        </div>
      </Card>

      {boletim && (
        <Card className="p-8 print:shadow-none print:border-none">
          <div className="text-center mb-8 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Boletim Escolar</h2>
            <p className="text-gray-600">{boletim.aluno?.nome}</p>
            <p className="text-sm text-gray-500">Período: {periodo}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Resumo Acadêmico</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Média Geral:</span>
                  <span className="font-bold text-gray-900">{boletim.resumo?.media_geral?.toFixed(1) || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Presença:</span>
                  <span className="font-bold text-gray-900">{boletim.resumo?.frequencia_percentual}%</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Drácmas (Recompensas)</h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 space-y-2">
                 <div className="flex justify-between">
                  <span className="text-yellow-800">Saldo Atual:</span>
                  <span className="font-bold text-yellow-900">{boletim.dracmas?.saldo || 0} ð</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-800">Ganho no Período:</span>
                  <span className="font-bold text-yellow-900">+{boletim.dracmas?.ganho_periodo || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
             <h3 className="text-lg font-semibold mb-3">Detalhamento por Disciplina</h3>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disciplina</th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Média</th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Faltas</th>
                     <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {boletim.disciplinas?.map((d: any, idx: number) => (
                     <tr key={idx}>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.nome}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{d.media}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{d.faltas}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-center">
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                           d.media >= 7 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                         }`}>
                           {d.status}
                         </span>
                       </td>
                     </tr>
                   ))}
                   {(!boletim.disciplinas || boletim.disciplinas.length === 0) && (
                     <tr>
                       <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Nenhuma disciplina registrada neste período.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
          
          <div className="mt-8 flex justify-end print:hidden">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Imprimir / PDF
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BoletimView;
