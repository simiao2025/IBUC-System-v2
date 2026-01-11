import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { RelatorioService } from '../../services/relatorio.service';
import { AlunosAPI } from '../../features/students/aluno.service';
import { TurmasAPI } from '../../services/turma.service';
import { PolosAPI } from '../../services/polo.service';
import { Download, GraduationCap, Loader2, Calendar, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

const HistoricoView: React.FC = () => {
  const { currentUser } = useApp();
  const isAdminGlobal = !currentUser?.adminUser?.poloId;

  const [polos, setPolos] = useState<{ id: string, nome: string }[]>([]);
  const [turmas, setTurmas] = useState<{ id: string, nome: string }[]>([]);

  const [selectedPolo, setSelectedPolo] = useState(currentUser?.adminUser?.poloId || '');
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedAluno, setSelectedAluno] = useState('');

  const [historico, setHistorico] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Carregar Polos se for admin global
  useEffect(() => {
    if (isAdminGlobal) {
      PolosAPI.listar().then((data: any) => {
        setPolos(Array.isArray(data) ? data : []);
      });
    }
  }, [isAdminGlobal]);

  // Carregar Turmas (Depende do Polo)
  useEffect(() => {
    if (selectedPolo) {
      TurmasAPI.listar({ polo_id: selectedPolo }).then((data: any) => {
        setTurmas(Array.isArray(data) ? data.map((t: any) => ({ id: t.id, nome: t.nome })) : []);
      });
    } else if (isAdminGlobal) {
      setTurmas([]);
    } else {
      // Fallback
      TurmasAPI.listar({}).then((data: any) => {
        setTurmas(Array.isArray(data) ? data.map((t: any) => ({ id: t.id, nome: t.nome })) : []);
      });
    }
    // Reiniciar seleções
    setSelectedTurma('');
    setSelectedAluno('');
  }, [selectedPolo, isAdminGlobal]);

  // Carregar Alunos
  useEffect(() => {
    if (selectedTurma) {
      AlunosAPI.listar({ turma_id: selectedTurma }).then((data: any) => {
        setAlunos(Array.isArray(data) ? data.map((a: any) => ({ id: a.id, nome: a.nome })) : []);
      });
    } else {
      setAlunos([]);
      // TODO: Talvez listar alunos do polo todo se não selecionar turma?
      // Por enquanto manter lógica antiga de limpar.
    }
    setSelectedAluno('');
  }, [selectedTurma]);

  // Estado de alunos separado é necessário? 
  // No código original `HistoricoView.tsx`, `alunos` e `setAlunos` eram usados.
  // Vou garantir que estão declarados.
  const [alunos, setAlunos] = useState<{ id: string, nome: string }[]>([]);


  const handleConsultar = async () => {
    if (!selectedAluno) return;
    setLoading(true);
    try {
      const data = await RelatorioService.historicoAluno(selectedAluno);
      setHistorico(data);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      alert('Erro ao buscar histórico.');
    } finally {
      setLoading(false);
    }
  };

  const handleGerarPdf = async () => {
    if (!selectedAluno) return;
    setGeneratingPdf(true);
    try {
      const res = await RelatorioService.gerarHistoricoPdf(selectedAluno) as any;
      const jobId = res?.jobId || res?.data?.jobId;

      if (!jobId) {
        throw new Error('ID do Job não recebido');
      }

      // Polling para aguardar o PDF
      const poll = async () => {
        const statusRes = await RelatorioService.getJobStatus(jobId) as any;
        const status = statusRes?.data || statusRes;

        if (status.state === 'completed') {
          setGeneratingPdf(false);
          // O retorno do backend no processor é { success: true, path: storagePath }
          const path = status.result?.path;
          if (path) {
            const { data } = supabase.storage.from('documentos').getPublicUrl(path);
            if (data?.publicUrl) {
              window.open(data.publicUrl, '_blank');
            } else {
              alert('Erro ao obter URL pública do PDF.');
            }
          } else {
            alert('PDF gerado, mas caminho não encontrado.');
          }
        } else if (status.state === 'failed') {
          setGeneratingPdf(false);
          alert('Erro ao gerar PDF: ' + (status.failedReason || 'Erro desconhecido'));
        } else {
          // Continua tentando após 2 segundos
          setTimeout(poll, 2000);
        }
      };

      poll();
    } catch (error) {
      console.error('Erro ao iniciar geração de PDF:', error);
      alert('Erro ao iniciar geração de PDF.');
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {isAdminGlobal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center"><Building2 className="w-3 h-3 mr-1" /> Polo</div>
              </label>
              <Select value={selectedPolo} onChange={val => setSelectedPolo(val)}>
                <option value="">Selecione o Polo...</option>
                {polos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turma Filha (para busca)</label>
            <Select value={selectedTurma} onChange={val => setSelectedTurma(val)} disabled={isAdminGlobal && !selectedPolo}>
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
          <Button onClick={handleConsultar} disabled={!selectedAluno || loading}>
            {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <GraduationCap className="h-4 w-4 mr-2" />}
            Buscar Histórico
          </Button>
        </div>
      </Card>

      {historico && (
        <Card className="p-8">
          <div className="text-center mb-8 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Histórico Escolar</h2>
            <p className="text-xl text-gray-700 mt-2">{historico.aluno?.nome}</p>
            <div className="flex justify-center gap-4 text-sm text-gray-500 mt-2">
              <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> Matrícula: {historico.matricula?.data_inicio ? new Date(historico.matricula.data_inicio).toLocaleDateString() : 'N/A'}</span>
              <span className="flex items-center"><GraduationCap className="h-4 w-4 mr-1" /> Status: {historico.matricula?.status}</span>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Disciplinas Concluídas</h3>
            {historico.disciplinas?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disciplina</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Média Final</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Freq. %</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historico.disciplinas.map((d: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{d.periodo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{d.media}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{d.frequencia}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${d.aprovado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {d.aprovado ? 'APROVADO' : 'REPROVADO'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">Nenhuma disciplina concluída registrada.</p>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3 print:hidden">
            <Button
              variant="outline"
              onClick={handleGerarPdf}
              className="bg-primary-50 text-primary-700 border-primary-100 hover:bg-primary-100"
              disabled={generatingPdf}
            >
              {generatingPdf ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando...</>
              ) : (
                <><Download className="h-4 w-4 mr-2" /> Gerar PDF (Oficial)</>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HistoricoView;
