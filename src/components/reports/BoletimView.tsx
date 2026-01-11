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

  const [selectedPolo, setSelectedPolo] = useState(currentUser?.adminUser?.poloId || '');
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedAluno, setSelectedAluno] = useState('');
  const [selectedModulo, setSelectedModulo] = useState('');

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

  // 2. Carregar Módulos
  useEffect(() => {
    const loadModulos = async () => {
      try {
        const response = await ModulosAPI.listar() as any;
        const todosModulos = (response?.data || response || []).sort((a: any, b: any) => a.numero - b.numero);

        if (selectedAluno) {
          try {
            const hist = await AlunosAPI.buscarHistorico(selectedAluno) as any;
            const dadosBoletim = await RelatorioService.getDadosBoletim(selectedAluno, 'atual').catch(() => null) as any;
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
          const res = await TurmasAPI.listar({ polo_id: selectedPolo, status: 'ativa' }) as any;
          dados = res?.data || res || [];
        } else if (isAdminGlobal) {
          dados = [];
        } else {
          const res = await TurmasAPI.listar({ status: 'ativa' }) as any;
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
    setPreviewAlunos([]);
    setShowPreview(false);
  }, [selectedPolo, selectedTurma, selectedAluno, selectedModulo]);

  const handleConsultar = async () => {
    if (!selectedModulo) return;

    setGenerating(true);
    setPreviewAlunos([]);
    setShowPreview(false);

    try {
      // Sempre usar modo lista (mesmo para aluno individual)
      const filtros: any = { status: 'ativo' };

      // Validação: pelo menos um critério além do módulo (para admin global)
      if (isAdminGlobal && !selectedPolo && !selectedTurma && !selectedAluno) {
        alert('Selecione ao menos um filtro (Polo, Turma ou Aluno) além do Módulo.');
        setGenerating(false);
        return;
      }

      // Filtrar alunos por módulo
      let alunosEncontrados: any[] = [];

      if (selectedTurma) {
        // Se turma selecionada, buscar alunos dessa turma
        filtros.turma_id = selectedTurma;

        if (selectedAluno) {
          filtros.aluno_id = selectedAluno;
        }

        alunosEncontrados = await AlunosAPI.listar(filtros);
      } else if (selectedAluno) {
        // Se apenas aluno selecionado (sem turma), buscar este aluno
        // mas validar se ele está em uma turma que cursa o módulo selecionado
        filtros.aluno_id = selectedAluno;

        const alunoData = await AlunosAPI.listar(filtros);

        if (alunoData && alunoData.length > 0) {
          const aluno = alunoData[0];

          // Verificar se o aluno está em uma turma que cursa o módulo
          if (aluno.turma_id) {
            try {
              const turmaAlunoRes = await TurmasAPI.buscarPorId(aluno.turma_id) as any;
              const turmaAluno = turmaAlunoRes?.data || turmaAlunoRes;

              if (turmaAluno && turmaAluno.modulo_atual_id === selectedModulo) {
                alunosEncontrados = alunoData;
              } else {
                alert(`O aluno selecionado não está cursando o módulo "${modulos.find(m => m.id === selectedModulo)?.titulo || 'selecionado'}".`); setGenerating(false);
                return;
              }
            } catch (err) {
              console.error('Erro ao buscar turma do aluno:', err);
              alert('Erro ao validar turma do aluno.');
              setGenerating(false);
              return;
            }
          } else {
            alert('O aluno selecionado não está matriculado em nenhuma turma.');
            setGenerating(false);
            return;
          }
        }
      } else if (selectedPolo) {
        // Se apenas polo selecionado, buscar turmas que cursam o módulo
        try {
          const turmasDoModuloRes = await TurmasAPI.listar({
            modulo_atual_id: selectedModulo,
            status: 'ativa',
            polo_id: selectedPolo
          }) as any;
          const turmasDoModulo = turmasDoModuloRes?.data || turmasDoModuloRes || [];

          if (Array.isArray(turmasDoModulo) && turmasDoModulo.length > 0) {
            const turmaIds = turmasDoModulo.map(t => t.id);

            // Buscar alunos matriculados nessas turmas
            const alunosPromises = turmaIds.map(tId =>
              AlunosAPI.listar({ ...filtros, turma_id: tId })
            );
            const results = await Promise.all(alunosPromises);
            const todosAlunos = results.flat();
            alunosEncontrados = Array.from(new Map(todosAlunos.map((a: any) => [a.id, a])).values());
          } else {
            alert('Nenhuma turma ativa encontrada cursando o módulo selecionado neste polo.');
            setGenerating(false);
            return;
          }
        } catch (err) {
          console.error('Erro ao buscar turmas do polo:', err);
          alert('Erro ao buscar turmas do polo.');
          setGenerating(false);
          return;
        }
      } else {
        // Caso sem polo (usuário de polo específico)
        if (selectedAluno) {
          filtros.aluno_id = selectedAluno;
          alunosEncontrados = await AlunosAPI.listar(filtros);
        } else {
          // Buscar turmas que cursam o módulo (sem filtro de polo)
          try {
            const turmasDoModuloRes = await TurmasAPI.listar({
              modulo_atual_id: selectedModulo,
              status: 'ativa'
            }) as any;
            const turmasDoModulo = turmasDoModuloRes?.data || turmasDoModuloRes || [];

            if (Array.isArray(turmasDoModulo) && turmasDoModulo.length > 0) {
              const turmaIds = turmasDoModulo.map(t => t.id);
              const alunosPromises = turmaIds.map(tId =>
                AlunosAPI.listar({ ...filtros, turma_id: tId })
              );
              const results = await Promise.all(alunosPromises);
              const todosAlunos = results.flat();
              alunosEncontrados = Array.from(new Map(todosAlunos.map((a: any) => [a.id, a])).values());
            } else {
              alert('Nenhuma turma ativa encontrada cursando o módulo selecionado.');
              setGenerating(false);
              return;
            }
          } catch (err) {
            console.error('Erro ao buscar turmas:', err);
            alert('Erro ao buscar turmas.');
            setGenerating(false);
            return;
          }
        }
      }

      // Sempre exibir lista (mesmo para 1 aluno)
      if (Array.isArray(alunosEncontrados) && alunosEncontrados.length > 0) {
        setPreviewAlunos(alunosEncontrados);
        setShowPreview(true);
      } else {
        alert('Nenhum aluno ativo encontrado para os filtros selecionados.');
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
    if (isAdminGlobal && !selectedPolo && !selectedTurma) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 print:hidden bg-gray-50 border border-gray-200">
        <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase flex items-center">
          <Layers className="w-4 h-4 mr-2" />
          Gerador de Boletins
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
            <label className="block text-xs font-bold text-gray-600 mb-1">Aluno</label>
            <Select value={selectedAluno} onChange={val => setSelectedAluno(val)}>
              <option value="">Todos os Alunos</option>
              {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mt-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Módulo (Obrigatório)
              {isAdminGlobal && !selectedPolo && (
                <span className="text-red-500 text-xs ml-2">* Selecione um Polo primeiro</span>
              )}
            </label>
            <Select
              value={selectedModulo}
              onChange={val => setSelectedModulo(val)}
              disabled={isAdminGlobal && !selectedPolo}
            >
              <option value="">Selecione o Módulo...</option>
              {modulos.map(m => <option key={m.id} value={m.id}>{m.numero} - {m.titulo}</option>)}
            </Select>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleConsultar} disabled={!canConsult() || generating} variant="primary">
              {generating && !showPreview ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
              Listar Alunos
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview Lista de Alunos (Modo Lote ou Individual) */}
      {showPreview && previewAlunos.length > 0 && (
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
    </div>
  );
};

export default BoletimView;
