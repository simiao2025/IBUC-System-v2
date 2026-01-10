import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { RelatorioService } from '../../services/relatorio.service';
import { AlunosAPI } from '../../features/students/aluno.service';
import { TurmasAPI } from '../../services/turma.service';
import { ModulosAPI } from '../../services/modulos.service';
import { PolosAPI } from '../../services/polo.service';
import { Loader2, FileText, Download, Building2, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

const BoletimView: React.FC = () => {
  const { currentUser } = useApp();
  const isAdminGlobal = !currentUser?.adminUser?.poloId;

  const [polos, setPolos] = useState<{ id: string, nome: string }[]>([]);
  const [turmas, setTurmas] = useState<{ id: string, nome: string }[]>([]);
  const [alunos, setAlunos] = useState<{ id: string, nome: string }[]>([]);
  const [modulos, setModulos] = useState<{ id: string, titulo: string, numero: number }[]>([]);
  const [niveis, setNiveis] = useState<{ id: string, nome: string }[]>([]);
  const [professores, setProfessores] = useState<{ id: string, nome_completo: string }[]>([]);

  const [selectedPolo, setSelectedPolo] = useState(currentUser?.adminUser?.poloId || '');
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedAluno, setSelectedAluno] = useState('');
  const [selectedModulo, setSelectedModulo] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');
  const [selectedProfessor, setSelectedProfessor] = useState('');

  const [boletim, setBoletim] = useState<any | null>(null);
  const [previewAlunos, setPreviewAlunos] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);

  // 1. Carregar Polos (apenas se admin global)
  useEffect(() => {
    if (isAdminGlobal) {
      PolosAPI.listar()
        .then((response: any) => {
          const dados = response?.data || response || [];
          setPolos(Array.isArray(dados) ? dados : []);
        })
        .catch(err => console.error('Erro ao carregar polos:', err));
    }
  }, [isAdminGlobal]);

  // 2. Carregar Níveis
  useEffect(() => {
    const loadNiveis = async () => {
      try {
        const { data } = await supabase.from('niveis').select('id, nome').order('ordem');
        setNiveis(data || []);
      } catch (err) {
        console.error('Erro ao carregar níveis:', err);
      }
    };
    loadNiveis();
  }, []);

  // 3. Carregar Professores (filtrados por Polo se selecionado)
  useEffect(() => {
    const loadProfessores = async () => {
      try {
        let query = supabase
          .from('usuarios')
          .select('id, nome_completo')
          .eq('role', 'professor')
          .eq('ativo', true)
          .order('nome_completo');

        if (selectedPolo) {
          query = query.eq('polo_id', selectedPolo);
        }

        const { data } = await query;
        setProfessores(data || []);
      } catch (err) {
        console.error('Erro ao carregar professores:', err);
      }
    };
    loadProfessores();
  }, [selectedPolo]);

  // 4. Carregar Módulos
  useEffect(() => {
    const loadModulos = async () => {
      try {
        const response = await ModulosAPI.listar() as any;
        const todosModulos = (response?.data || response || []).sort((a: any, b: any) => a.numero - b.numero);

        if (selectedAluno) {
          try {
            const hist = await AlunosAPI.buscarHistorico(selectedAluno) as any;
            const dadosBoletim = await RelatorioService.getDadosBoletim(selectedAluno, 'atual').catch(() => null);
            const moduloAtual = dadosBoletim?.modulo?.numero;

            const numerosPermitidos = new Set(hist?.map((h: any) => h.modulo_info?.numero));

            if (moduloAtual) numerosPermitidos.add(moduloAtual);

            if (numerosPermitidos.size > 0) {
              const maxHist = Math.max(...Array.from(numerosPermitidos) as number[]);
              const maxPermitido = Math.max(maxHist, moduloAtual || 0);

              const filtrados = todosModulos.filter((m: any) => m.numero <= maxPermitido);
              setModulos(filtrados.length > 0 ? filtrados : todosModulos);
            } else {
              setModulos(todosModulos);
            }
          } catch (e) {
            console.warn('Erro ao filtrar módulos do aluno:', e);
            setModulos(todosModulos);
          }
        } else if (selectedPolo) {
          try {
            const res = await TurmasAPI.listar({ polo_id: selectedPolo, status: 'ativa' }) as any;
            const turmasAtivas = res?.data || res || [];

            const modulosAtivosIds = new Set(turmasAtivas.map((t: any) => t.modulo_atual_id).filter(Boolean));

            let maxModuloNumero = 0;
            todosModulos.forEach((m: any) => {
              if (modulosAtivosIds.has(m.id)) {
                if (m.numero > maxModuloNumero) maxModuloNumero = m.numero;
              }
            });

            if (maxModuloNumero > 0) {
              const filtrados = todosModulos.filter((m: any) => m.numero <= maxModuloNumero);
              setModulos(filtrados);
            } else {
              setModulos(todosModulos);
            }
          } catch (e) {
            console.warn('Erro ao filtrar módulos do polo:', e);
            setModulos(todosModulos);
          }
        } else {
          setModulos(todosModulos);
        }
      } catch (err) {
        console.error('Erro ao carregar módulos:', err);
        setModulos([]);
      }
    };

    loadModulos();
  }, [selectedAluno, selectedPolo]);

  // 5. Carregar Turmas quando Polo mudar
  useEffect(() => {
    const loadTurmas = async () => {
      try {
        let dados = [];
        if (selectedPolo) {
          const res = await TurmasAPI.listar({ polo_id: selectedPolo }) as any;
          dados = res?.data || res || [];
        } else if (isAdminGlobal) {
          dados = [];
        } else {
          const res = await TurmasAPI.listar({}) as any;
          dados = res?.data || res || [];
        }
        setTurmas(Array.isArray(dados) ? dados.map((t: any) => ({ id: t.id, nome: t.nome })) : []);
      } catch (err) {
        console.error('Erro ao listar turmas:', err);
        setTurmas([]);
      }
    };

    loadTurmas();
    setSelectedTurma('');
    setSelectedAluno('');
  }, [selectedPolo, isAdminGlobal]);

  // 6. Carregar Alunos quando filtros mudarem
  useEffect(() => {
    const loadAlunos = async () => {
      const filtros: any = {};

      if (selectedTurma) {
        filtros.turma_id = selectedTurma;
      } else if (selectedPolo) {
        filtros.polo_id = selectedPolo;
      } else {
        if (isAdminGlobal) {
          setAlunos([]);
          return;
        }
      }

      try {
        const response = await AlunosAPI.listar(filtros) as any;
        const dados = response?.data || response || [];
        setAlunos(Array.isArray(dados) ? dados.map((a: any) => ({ id: a.id, nome: a.nome })) : []);
      } catch (err) {
        console.error('Erro ao carregar alunos:', err);
        setAlunos([]);
      }
    };

    loadAlunos();
    setSelectedAluno('');
  }, [selectedTurma, selectedPolo, isAdminGlobal]);

  // Limpar visualizações ao mudar filtros
  useEffect(() => {
    setBoletim(null);
    setPreviewAlunos([]);
    setShowPreview(false);
  }, [selectedPolo, selectedTurma, selectedAluno, selectedModulo, selectedNivel, selectedProfessor]);

  const handleConsultar = async () => {
    if (!selectedModulo) return;

    setGenerating(true);
    setBoletim(null);
    setPreviewAlunos([]);
    setShowPreview(false);

    try {
      if (selectedAluno) {
        // Modo Individual
        const data = await RelatorioService.getDadosBoletim(selectedAluno, selectedModulo);
        setBoletim(data);
      } else {
        // Modo Lote - Construir filtros dinamicamente
        const filtros: any = { status: 'ativo' };

        if (selectedPolo) filtros.polo_id = selectedPolo;
        if (selectedTurma) filtros.turma_id = selectedTurma;
        if (selectedNivel) filtros.nivel_atual_id = selectedNivel;

        // Se professor selecionado, buscar turmas do professor
        if (selectedProfessor) {
          const { data: turmasProf } = await supabase
            .from('turmas')
            .select('id')
            .eq('professor_id', selectedProfessor)
            .eq('status', 'ativa');

          if (turmasProf && turmasProf.length > 0) {
            const turmaIds = turmasProf.map(t => t.id);

            // Se já tem turma selecionada, verificar se está na lista
            if (selectedTurma && !turmaIds.includes(selectedTurma)) {
              alert('A turma selecionada não pertence a este professor.');
              setGenerating(false);
              return;
            }

            // Se não tem turma específica, buscar alunos de todas as turmas do professor
            if (!selectedTurma) {
              const alunosPromises = turmaIds.map(tId =>
                AlunosAPI.listar({ ...filtros, turma_id: tId })
              );
              const results = await Promise.all(alunosPromises);
              const todosAlunos = results.flat();
              const alunosUnicos = Array.from(new Map(todosAlunos.map(a => [a.id, a])).values());

              if (alunosUnicos.length > 0) {
                setPreviewAlunos(alunosUnicos);
                setShowPreview(true);
              } else {
                alert('Nenhum aluno ativo encontrado para os filtros selecionados.');
              }
              setGenerating(false);
              return;
            }
          } else {
            alert('Este professor não possui turmas ativas.');
            setGenerating(false);
            return;
          }
        }

        // Validação: pelo menos um critério além do módulo (para admin global)
        if (isAdminGlobal && !selectedPolo && !selectedTurma && !selectedNivel && !selectedProfessor) {
          alert('Selecione ao menos um filtro (Polo, Turma, Nível ou Professor) além do Módulo.');
          setGenerating(false);
          return;
        }

        const alunosEncontrados = await AlunosAPI.listar(filtros);

        if (Array.isArray(alunosEncontrados) && alunosEncontrados.length > 0) {
          setPreviewAlunos(alunosEncontrados);
          setShowPreview(true);
        } else {
          alert('Nenhum aluno ativo encontrado para os filtros selecionados.');
        }
      }
    } catch (error) {
      console.error('Erro ao consultar:', error);
      alert('Erro ao buscar dados.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGerarPDF = async () => {
    if (previewAlunos.length === 0) return;

    setGenerating(true);
    try {
      const alunoIds = previewAlunos.map(a => a.id);

      const res = await RelatorioService.gerarBoletimLote({
        polo_id: selectedPolo || undefined,
        turma_id: selectedTurma || undefined,
        aluno_id: undefined,
        modulo_id: selectedModulo,
        aluno_ids: alunoIds
      }) as any;

      const jobId = res.jobId;

      // Polling
      const checkStatus = async () => {
        try {
          const status = await RelatorioService.getJobStatus(jobId) as any;

          if (status.state === 'completed') {
            const path = status.result.path;
            const { data } = supabase.storage.from('documentos').getPublicUrl(path);

            if (data?.publicUrl) {
              window.open(data.publicUrl, '_blank');
            } else {
              alert('Erro ao obter URL do arquivo.');
            }
            setGenerating(false);
          } else if (status.state === 'failed') {
            console.error('Falha no Job:', status.failedReason, status.stacktrace);
            alert(`Erro no processamento: ${status.failedReason || 'Erro desconhecido'}`);
            setGenerating(false);
          } else {
            setTimeout(checkStatus, 2000);
          }
        } catch (e) {
          console.error('Erro no polling:', e);
          setGenerating(false);
          alert('Erro ao verificar status.');
        }
      };

      checkStatus();

    } catch (error) {
      console.error('Erro ao iniciar geração:', error);
      alert('Erro ao processar lote.');
      setGenerating(false);
    }
  };

  const canConsult = () => {
    if (!selectedModulo) return false;
    if (selectedAluno) return true;
    // Para lote: precisa de pelo menos um critério (ou ser usuário de polo)
    if (isAdminGlobal && !selectedPolo && !selectedTurma && !selectedNivel && !selectedProfessor) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 print:hidden bg-gray-50 border border-gray-200">
        <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase flex items-center">
          <Layers className="w-4 h-4 mr-2" />
          Gerador de Boletins
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {isAdminGlobal && (
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                <div className="flex items-center"><Building2 className="w-3 h-3 mr-1" /> Polo</div>
              </label>
              <Select value={selectedPolo} onChange={val => setSelectedPolo(val)}>
                <option value="">Todos os Polos</option>
                {polos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </Select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Turma</label>
            <Select value={selectedTurma} onChange={val => setSelectedTurma(val)}>
              <option value="">Todas as Turmas</option>
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Nível</label>
            <Select value={selectedNivel} onChange={val => setSelectedNivel(val)}>
              <option value="">Todos os Níveis</option>
              {niveis.map(n => <option key={n.id} value={n.id}>{n.nome}</option>)}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Professor(a)</label>
            <Select value={selectedProfessor} onChange={val => setSelectedProfessor(val)}>
              <option value="">Todos os Professores</option>
              {professores.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Aluno</label>
            <Select value={selectedAluno} onChange={val => setSelectedAluno(val)}>
              <option value="">Todos os Alunos</option>
              {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mt-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Módulo (Obrigatório)</label>
            <Select value={selectedModulo} onChange={val => setSelectedModulo(val)}>
              <option value="">Selecione o Módulo...</option>
              {modulos.map(m => <option key={m.id} value={m.id}>{m.numero} - {m.titulo}</option>)}
            </Select>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleConsultar} disabled={!canConsult() || generating} variant="primary">
              {generating && !showPreview ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
              {selectedAluno ? 'Visualizar Boletim' : 'Listar Alunos (Pré-visualização)'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview Lista de Alunos (Modo Lote) */}
      {showPreview && !selectedAluno && previewAlunos.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Alunos Selecionados ({previewAlunos.length})
            </h3>
            <span className="text-sm text-gray-500">
              Confira a lista abaixo antes de gerar o PDF unificado.
            </span>
          </div>

          <div className="overflow-x-auto border rounded-lg mb-6 max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewAlunos.map((a) => (
                  <tr key={a.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{a.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.cpf || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button onClick={handleGerarPDF} disabled={generating} variant="secondary" className="w-full md:w-auto">
              {generating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              {generating ? 'Processando PDF...' : `Confirmar e Gerar PDF (${previewAlunos.length} alunos)`}
            </Button>
          </div>
        </Card>
      )}

      {/* Visualização Individual (Apenas se Aluno Selecionado) */}
      {boletim && selectedAluno && (
        <Card className="p-8 print:shadow-none print:border-none max-w-[21cm] mx-auto">
          <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 uppercase">Boletim Escolar</h2>
            <h3 className="text-lg text-gray-700 font-semibold">{boletim.aluno?.polo || 'IBUC System'}</h3>
            <div className="mt-4 grid grid-cols-2 text-left text-sm gap-y-2">
              <div><span className="font-bold">Aluno:</span> {boletim.aluno?.nome}</div>
              <div><span className="font-bold">Turma:</span> {boletim.aluno?.turma || '-'}</div>
              <div><span className="font-bold">Módulo:</span> {boletim.modulo?.numero} - {boletim.modulo?.titulo}</div>
              <div><span className="font-bold">Nível:</span> {boletim.aluno?.nivel || '-'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 border-b border-gray-200 pb-2">Desempenho Acadêmico</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nota / Conceito:</span>
                  <span className="font-bold text-lg text-blue-700">{boletim.resumo?.conceito || '-'} ({boletim.resumo?.media_geral?.toFixed(1)})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Frequência:</span>
                  <span className={`font-bold text-lg ${boletim.resumo?.frequencia_percentual >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                    {boletim.resumo?.frequencia_percentual}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  * Baseado em {boletim.resumo?.total_presencas} presenças de {boletim.resumo?.total_aulas} aulas/lições previstas.
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 border-b border-gray-200 pb-2">Recompensas (Gamification)</h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-yellow-800 font-medium">Saldo de Drácmas:</span>
                  <div className="flex items-center">
                    <span className="font-bold text-2xl text-yellow-900 mr-1">{boletim.dracmas?.saldo || 0}</span>
                    <span className="text-xl">🪙</span>
                  </div>
                </div>
                <p className="text-xs text-yellow-700 italic">
                  Moeda digital para troca por benefícios e materiais no IBUC Store.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 uppercase">Detalhamento Modular</h3>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Componente / Módulo</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Nota</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Faltas</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Situação Final</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {boletim.disciplinas?.map((d: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900">{d.media}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{d.faltas}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${d.status === 'APROVADO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!boletim.disciplinas || boletim.disciplinas.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Nenhum dado registrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-gray-500 text-right">Documento emitido em {new Date().toLocaleDateString()}</p>
          </div>

          <div className="mt-8 flex justify-end print:hidden">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Imprimir Boletim
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BoletimView;
