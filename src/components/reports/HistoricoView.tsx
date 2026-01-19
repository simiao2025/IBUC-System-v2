/*
 * ------------------------------------------------------------------
 * ðŸ”’ ARQUIVO BLINDADO / SHIELDED FILE ðŸ”’
 * ------------------------------------------------------------------
 * ESTE ARQUIVO CONTÃ‰M LÃ“GICA CRÃTICA DE GERAÃ‡ÃƒO DE RELATÃ“RIOS.
 * (Certificado, HistÃ³rico, Boletim)
 *
 * NÃƒO REFATORE OU MODIFIQUE SEM UM PLANO DE REFATORAÃ‡ÃƒO APROVADO
 * E UMA ANÃLISE DE IMPACTO PRÃ‰VIA (/impact-analysis).
 *
 * QUALQUER ALTERAÃ‡ÃƒO DEVE SER ESTRITAMENTE NECESSÃRIA E VALIDADA.
 * ------------------------------------------------------------------
 */
import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/ui';
import { Select } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { StudentReportsAPI } from '@/entities/student/api/student-reports.api';
import { AlunosAPI } from '@/features/student-management';
import { turmaApi as TurmasAPI } from '@/entities/turma';
import { poloApi as PolosAPI } from '@/entities/polo';
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
      PolosAPI.list().then((data: any) => {
        setPolos(Array.isArray(data) ? data : []);
      });
    }
  }, [isAdminGlobal]);

  // Carregar Turmas (Depende do Polo)
  useEffect(() => {
    if (selectedPolo) {
      TurmasAPI.list({ polo_id: selectedPolo }).then((data: any) => {
        setTurmas(Array.isArray(data) ? data.map((t: any) => ({ id: t.id, nome: t.nome })) : []);
      });
    } else if (isAdminGlobal) {
      setTurmas([]);
    } else {
      // Fallback
      TurmasAPI.list({}).then((data: any) => {
        setTurmas(Array.isArray(data) ? data.map((t: any) => ({ id: t.id, nome: t.nome })) : []);
      });
    }
    // Reiniciar seleÃ§Ãµes
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
      // TODO: Talvez listar alunos do polo todo se nÃ£o selecionar turma?
      // Por enquanto manter lÃ³gica antiga de limpar.
    }
    setSelectedAluno('');
  }, [selectedTurma]);

  // Estado de alunos separado Ã© necessÃ¡rio? 
  // No cÃ³digo original `HistoricoView.tsx`, `alunos` e `setAlunos` eram usados.
  // Vou garantir que estÃ£o declarados.
  const [alunos, setAlunos] = useState<{ id: string, nome: string }[]>([]);


  const handleConsultar = async () => {
    if (!selectedAluno) return;
    setLoading(true);
    try {
      const data = await StudentReportsAPI.historicoAluno(selectedAluno);
      setHistorico(data);
    } catch (error) {
      console.error('Erro ao buscar histÃ³rico:', error);
      alert('Erro ao buscar histÃ³rico.');
    } finally {
      setLoading(false);
    }
  };

  const handleGerarPdf = async () => {
    if (!selectedAluno) return;
    setGeneratingPdf(true);
    try {
      const res = await StudentReportsAPI.gerarHistoricoPdf(selectedAluno) as any;
      // Backend refatonado retorna agora direto: { status: 'completed', result: { success: true, path: ... } }
      // Ou compatibilidade: o res jÃ¡ Ã© o objeto

      const result = res.data?.result || res?.result || res;
      const path = result?.path;
      
      if (path) {
        const { data } = supabase.storage.from('documentos').getPublicUrl(path);
        if (data?.publicUrl) {
          window.open(data.publicUrl, '_blank');
        } else {
          alert('Erro ao obter URL pÃºblica do PDF.');
        }
      } else {
        alert('Erro ao gerar PDF: Caminho nÃ£o retornado.');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF.');
    } finally {
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
            Buscar HistÃ³rico
          </Button>
        </div>
      </Card>

      {historico && (
        <Card className="p-8">
          <div className="text-center mb-8 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-900">HistÃ³rico Escolar</h2>
            <p className="text-xl text-gray-700 mt-2">{historico.aluno?.nome}</p>
            <div className="flex justify-center gap-4 text-sm text-gray-500 mt-2">
              <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> MatrÃ­cula: {historico.matricula?.data_inicio ? new Date(historico.matricula.data_inicio).toLocaleDateString() : 'N/A'}</span>
              <span className="flex items-center"><GraduationCap className="h-4 w-4 mr-1" /> Status: {historico.matricula?.status}</span>
            </div>
          </div>

          <div className="space-y-6">
            {historico.disciplinas?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Aula</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LiÃ§Ã£o</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">DrÃ¡cmas</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">FrequÃªncia</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aprovado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historico.disciplinas.map((d: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {d.data_aula ? new Date(d.data_aula).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-indigo-600 font-bold">{d.dracmas}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-700">{d.frequencia}</td>
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
              <p className="text-gray-500 italic">Nenhuma liÃ§Ã£o estudada registrada.</p>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3 print:hidden">
            <Button
              variant="primary"
              onClick={handleGerarPdf}
              disabled={generatingPdf}
            >
              {generatingPdf ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando...</>
              ) : (
                <><Download className="h-4 w-4 mr-2" /> Gerar PDF</>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HistoricoView;
