
import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import PageHeader from '../../components/ui/PageHeader';
import { AlunosAPI } from '../students/aluno.service';
import { DracmasAPI } from '../finance/dracmas.service';
import { PresencasAPI } from './presenca.service';
import { TurmasAPI } from '../../services/turma.service';
import { LicoesAPI } from '../../services/modulos.service';
import { PolosAPI } from '../../services/polo.service';
import { useApp } from '../../context/AppContext';
import { BookOpen, GraduationCap, Calendar as CalendarIcon, Beaker, Trash2, Edit2, History, X, User, Banknote } from 'lucide-react';

type TurmaOption = {
  id: string;
  nome: string;
  modulo_id?: string;
  modulo_titulo?: string;
  alunos_matriculados?: number;
  professor_nome?: string;
};

type AlunoOption = {
  aluno_id: string;
  nome: string;
};

type StatusPresenca = 'presente' | 'falta' | 'justificativa' | 'atraso' | 'reposicao' | null;

type LinhaLancamento = {
  aluno_id: string;
  nome: string;
  status: StatusPresenca;
  observacao?: string;
  dracmas: Record<string, number>; // codigo -> quantidade
  data: string;
  licao_id: string;
  historico: any[];
};

const AdminFrequencia: React.FC = () => {
  const { currentUser } = useApp();
  // const navigate = useNavigate(); // Removed unused navigation

  const [data, setData] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [polos, setPolos] = useState<any[]>([]);
  const [filterPoloId, setFilterPoloId] = useState('');
  const [turmas, setTurmas] = useState<TurmaOption[]>([]);
  const [turmaId, setTurmaId] = useState('');
  const [alunos, setAlunos] = useState<LinhaLancamento[]>([]);
  const [loadingTurmas, setLoadingTurmas] = useState(false);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [criteriosDracma, setCriteriosDracma] = useState<{ codigo: string, nome: string }[]>([]);
  const [licoes, setLicoes] = useState<{ id: string, titulo: string, ordem: number }[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [dracmasTransactions, setDracmasTransactions] = useState<any[]>([]); // To store all transactions for redemption calculation

  const [resgateModalData, setResgateModalData] = useState<{
    alunoId: string;
    alunoNome: string;
    saldo: number;
    breakdown: Record<string, number>;
  } | null>(null);

  const { showFeedback, showConfirm } = useApp();

  const adminUser = (currentUser as any)?.adminUser;
  const isProfessor = adminUser?.role === 'professor';
  const isGlobalAdmin = adminUser?.accessLevel === 'geral';

  const hasAnyPresence = useMemo(() => alunos.some(a => Boolean(a.status)), [alunos]);
  const hasAnyDracmas = useMemo(() => alunos.some(a => Object.values(a.dracmas).some(v => v > 0)), [alunos]);

  useEffect(() => {
    // Carregar critérios de Drácmas
    const carregarCriterios = async () => {
      try {
        const response: any = await DracmasAPI.listarCriterios();
        const lista = Array.isArray(response) ? response : [];
        const ativos = lista.filter((c: any) => c.ativo);

        setCriteriosDracma(ativos);
      } catch (error) {
        console.error('Erro ao carregar critérios:', error);
      }
    };

    carregarCriterios();
  }, []);

  useEffect(() => {
    const carregarPolos = async () => {
      if (!isGlobalAdmin) return;
      try {
        const response: any = await PolosAPI.listar(true);
        setPolos(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Erro ao carregar polos:', error);
      }
    };
    carregarPolos();
  }, [isGlobalAdmin]);

  useEffect(() => {
    const carregarTurmas = async () => {
      if (!currentUser) {
        setTurmas([]);
        return;
      }

      setLoadingTurmas(true);
      setError(null);
      try {
        const accessLevel = (currentUser as any)?.adminUser?.accessLevel as string | undefined;
        const poloId = (currentUser as any)?.adminUser?.poloId as string | undefined;

        if (isGlobalAdmin && !filterPoloId) {
          setTurmas([]);
          return;
        }

        const params: any = { status: 'ativa' }; // Filtra apenas turmas ativas para todos
        if (isProfessor) {
          params.professor_id = adminUser?.id;
        } else if (isGlobalAdmin) {
          params.polo_id = filterPoloId;
        } else if (accessLevel === 'polo_especifico' && poloId) {
          params.polo_id = poloId;
        }

        const response = await TurmasAPI.listar(params as any);
        const lista = (response as any) as any[];
        const mappedTurmas = (Array.isArray(lista) ? lista : []).map(t => {
          // PostgREST pode retornar objeto ou array dependendo da PK/FK
          const mod = Array.isArray(t.modulos) ? t.modulos[0] : t.modulos;
          // Extrair nome do professor se disponível
          const professor = Array.isArray(t.usuarios) ? t.usuarios[0] : t.usuarios;
          return {
            id: String(t.id),
            nome: String(t.nome ?? t.id),
            modulo_id: t.modulo_atual_id,
            modulo_titulo: mod?.titulo || 'Módulo não definido',
            alunos_matriculados: t.alunos_matriculados || 0,
            professor_nome: professor?.name || professor?.nome
          };
        });

        setTurmas(mappedTurmas);

        // Auto-selecionar se houver apenas uma turma (comum para professores)
        if (mappedTurmas.length === 1 && !turmaId) {
          setTurmaId(mappedTurmas[0].id);
        }
      } catch (e) {
        console.error('Erro ao carregar turmas:', e);
        setError('Não foi possível carregar as turmas.');
      } finally {
        setLoadingTurmas(false);
      }
    };

    carregarTurmas();
  }, [currentUser, filterPoloId]); // Added filterPoloId as dependency

  useEffect(() => {
    const carregarDadosTurma = async () => {
      if (!turmaId) {
        setAlunos([]);
        setLicoes([]);
        return;
      }

      setLoadingAlunos(true);
      setError(null);
      try {
        // Encontra o módulo_id da turma (pode vir do state ou de uma busca rápida)
        let moduloId = turmas.find(t => t.id === turmaId)?.modulo_id;

        // Se não encontrou no state (ex: primeira carga), busca os detalhes da turma
        if (!moduloId) {
          const tDetail = await TurmasAPI.buscarPorId(turmaId) as any;
          moduloId = tDetail?.modulo_atual_id;
        }

        console.log('Frequencia - Carregando dados para Turma:', turmaId, 'Modulo:', moduloId);

        // Carregar alunos e lições em paralelo
        const [alunosRes, licoesRes] = await Promise.all([
          AlunosAPI.listar({ turma_id: turmaId }),
          moduloId ? LicoesAPI.listar({ modulo_id: moduloId }) : Promise.resolve([])
        ]);

        const listaAlunos = (alunosRes as any) as any[];
        const items: AlunoOption[] = (Array.isArray(listaAlunos) ? listaAlunos : []).map((a: any) => ({
          aluno_id: String(a.id),
          nome: String(a.nome ?? a.id),
        }));

        const listaLicoes = Array.isArray(licoesRes) ? licoesRes : [];
        setLicoes(listaLicoes);

        console.log(`Frequencia - Alunos: ${items.length}, Lições: ${listaLicoes.length}`);

        setAlunos(items.map(a => ({
          aluno_id: a.aluno_id,
          nome: a.nome,
          status: 'presente',
          dracmas: {},
          data: data,
          licao_id: '',
          historico: [],
        })));

        // Carregar histórico logo após os alunos serem definidos
        carregarHistorico();
      } catch (e) {
        console.error('Erro ao carregar dados da turma:', e);
        setError('Não foi possível carregar os alunos ou lições da turma.');
        setAlunos([]);
        setLicoes([]);
      } finally {
        setLoadingAlunos(false);
      }
    };

    carregarDadosTurma();
  }, [turmaId, data, turmas]);

  const updateStatus = (alunoId: string, status: StatusPresenca) => {
    setAlunos(prev => prev.map(a => (a.aluno_id === alunoId ? { ...a, status } : a)));
  };

  const updateObservacao = (alunoId: string, observacao: string) => {
    setAlunos(prev => prev.map(a => (a.aluno_id === alunoId ? { ...a, observacao } : a)));
  };

  const updateDracmas = (alunoId: string, codigo: string, value: string) => {
    const quantidade = Math.max(0, parseInt(value || '0', 10) || 0);
    setAlunos(prev => prev.map(a => (a.aluno_id === alunoId ? {
      ...a,
      dracmas: { ...a.dracmas, [codigo]: quantidade }
    } : a)));
  };

  const updateDataPerRow = (alunoId: string, value: string) => {
    setAlunos(prev => prev.map(a => (a.aluno_id === alunoId ? { ...a, data: value } : a)));
  };

  const updateLicaoPerRow = (alunoId: string, value: string) => {
    setAlunos(prev => prev.map(a => (a.aluno_id === alunoId ? { ...a, licao_id: value } : a)));
  };

  const syncAllRows = () => {
    setAlunos(prev => prev.map(a => ({ ...a, data: data })));
  };

  const formatarDataLocal = (isoString: string) => {
    if (!isoString) return '';
    const [year, month, day] = isoString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const carregarHistorico = async () => {
    if (!turmaId) return;
    setLoadingHistory(true);
    try {
      const [presencasResponse, dracmasResponse] = await Promise.all([
        PresencasAPI.porTurma(turmaId),
        DracmasAPI.porTurma(turmaId)
      ]);

      const presencas = (presencasResponse as any)?.registros || [];
      const dracmas = (dracmasResponse as any)?.transacoes || [];

      setDracmasTransactions(dracmas);

      setAlunos(prev => prev.map(aluno => {
        // Encontra presenças do aluno
        const alunoPresencas = presencas.filter((r: any) => r.aluno_id === aluno.aluno_id);

        // Mapeia histórico combinando presença com drácmas daquela data
        const historicoCombinado = alunoPresencas.map((p: any) => {
          // Filtra drácmas desta data para este aluno
          const dracmasDoDia = dracmas.filter((d: any) => d.aluno_id === aluno.aluno_id && d.data === p.data);

          const totalDracmas = dracmasDoDia.reduce((acc: number, curr: any) => acc + (curr.quantidade || 0), 0);

          // Agrupa por tipo (código do critério)
          const dracmasPorTipo = dracmasDoDia.reduce((acc: any, curr: any) => {
            acc[curr.tipo] = (acc[curr.tipo] || 0) + curr.quantidade;
            return acc;
          }, {});

          return { ...p, dracmas: totalDracmas, dracmasPorTipo };
        });

        return {
          ...aluno,
          historico: historicoCombinado.reverse()
        };
      }));
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const [editingModalData, setEditingModalData] = useState<{
    alunoId: string;
    alunoNome: string;
    originalRecord: any;
    data: string;
    status: StatusPresenca;
    observacao: string;
    dracmas: Record<string, number | string>;
  } | null>(null);

  const handleEditRecord = (alunoId: string, record: any) => {
    const aluno = alunos.find(a => a.aluno_id === alunoId);
    if (!aluno) return;

    setEditingModalData({
      alunoId,
      alunoNome: aluno.nome,
      originalRecord: record,
      data: record.data,
      status: record.status,
      observacao: record.observacao || '',
      dracmas: record.dracmasPorTipo ? { ...record.dracmasPorTipo } : {}
    });
  };

  const handleCloseEditModal = () => {
    setEditingModalData(null);
  };

  const handleSaveEditModal = async () => {
    if (!editingModalData) return;
    setSubmitting(true);
    try {
      // 1. Atualizar Presença (Upsert)
      await PresencasAPI.lancarLote([{
        aluno_id: editingModalData.alunoId,
        turma_id: turmaId,
        data: editingModalData.data,
        licao_id: editingModalData.originalRecord.licao_id || null,
        status: editingModalData.status,
        observacao: editingModalData.observacao,
        lancado_por: currentUser!.id
      }]);

      // 2. Atualizar Drácmas
      // Primeiro limpar antigas DESTE ALUNO nesta data
      await DracmasAPI.excluirLoteAluno({
        turma_id: turmaId,
        aluno_id: editingModalData.alunoId,
        data: editingModalData.data
      });

      // Preparar novas drácmas
      const dracmasList: any[] = [];
      Object.entries(editingModalData.dracmas).forEach(([tipo, qtd]) => {
        const quantidade = Number(qtd);
        if (quantidade > 0) {
          dracmasList.push({
            aluno_id: editingModalData.alunoId,
            quantidade,
            tipo
          });
        }
      });

      if (dracmasList.length > 0) {
        await DracmasAPI.lancarLote({
          turma_id: turmaId,
          data: editingModalData.data,
          tipo: 'AJUSTE',
          descricao: `Ajuste manual do aluno ${editingModalData.alunoNome}`,
          registrado_por: currentUser!.id,
          transacoes: dracmasList
        });
      }

      showFeedback('success', 'Atualizado', 'Registro atualizado com sucesso.');
      await carregarHistorico();
      setEditingModalData(null);
    } catch (err: any) {
      console.error(err);
      showFeedback('error', 'Erro', 'Falha ao salvar a edição. Verifique o console.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    showConfirm(
      'Excluir Presença',
      'Tem certeza que deseja excluir este registro de presença individual?',
      async () => {
        try {
          await PresencasAPI.excluir(id);
          showFeedback('success', 'Excluído', 'Registro excluído com sucesso.');
          carregarHistorico();
        } catch (err) {
          console.error('Erro ao excluir:', err);
          showFeedback('error', 'Erro', 'Não foi possível excluir o registro.');
        }
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turmaId) {
      setError('Selecione uma turma.');
      return;
    }

    if (!hasAnyPresence && !hasAnyDracmas) {
      setError('Registre pelo menos uma presença ou lance Drácmas para algum aluno.');
      return;
    }

    if (!currentUser) {
      setError('Usuário não autenticado.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (hasAnyPresence) {
        const presencasPayload = alunos
          .filter(a => Boolean(a.status))
          .map(a => ({
            aluno_id: a.aluno_id,
            turma_id: turmaId,
            data: a.data || data,
            licao_id: a.licao_id || undefined,
            status: a.status,
            lancado_por: currentUser.id,
            observacao: a.observacao || undefined,
          }));

        await PresencasAPI.lancarLote(presencasPayload);
      }

      if (hasAnyDracmas) {
        // Agrupar por tipo de Drácma
        const porTipo: Record<string, { aluno_id: string; quantidade: number; tipo: string }[]> = {};

        alunos.forEach(a => {
          Object.entries(a.dracmas).forEach(([tipo, quantidade]) => {
            if (quantidade > 0) {
              if (!porTipo[tipo]) porTipo[tipo] = [];
              porTipo[tipo].push({ aluno_id: a.aluno_id, quantidade, tipo });
            }
          });
        });

        // Lançar um lote para cada tipo
        for (const [tipo, transacoes] of Object.entries(porTipo)) {
          await DracmasAPI.lancarLote({
            turma_id: turmaId,
            data,
            tipo,
            registrado_por: currentUser.id,
            transacoes,
          });
        }
      }

      setAlunos(prev => prev.map(a => ({
        ...a,
        status: 'presente',
        observacao: undefined,
        dracmas: {},
        data: data,
        licao_id: ''
      })));

      showFeedback('success', 'Salvo', 'Frequência e premiações salvas com sucesso.');
      carregarHistorico();
    } catch (err: any) {
      console.error('Erro ao lançar frequência/drácmas:', err);
      const apiMessage = err.response?.data?.message || err.message;
      setError(apiMessage || 'Não foi possível salvar o lançamento.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenResgate = (alunoId: string) => {
    const aluno = alunos.find(a => a.aluno_id === alunoId);
    if (!aluno) return;

    // Filter transactions for this student
    const studentDracmas = dracmasTransactions.filter(t => t.aluno_id === alunoId);
    const total = studentDracmas.reduce((acc, t) => acc + (t.quantidade || 0), 0);

    // Breakdown
    const breakdown: Record<string, number> = {};
    studentDracmas.forEach(t => {
      const typeName = t.tipo; // Or map to friendly name if available
      breakdown[typeName] = (breakdown[typeName] || 0) + (t.quantidade || 0);
    });

    setResgateModalData({
      alunoId,
      alunoNome: aluno.nome,
      saldo: total,
      breakdown
    });
  };

  const handleConfirmResgate = async () => {
    if (!resgateModalData || !turmaId) return;

    setSubmitting(true);
    try {
      await DracmasAPI.resgatar({
        turma_id: turmaId,
        aluno_id: resgateModalData.alunoId,
        resgatado_por: currentUser!.id
      });

      showFeedback('success', 'Resgate Realizado', `Foram resgatadas ${resgateModalData.saldo} drácmas com sucesso.`);
      setResgateModalData(null);
      carregarHistorico(); // Refresh to clear balance
    } catch (err) {
      console.error('Erro ao resgatar:', err);
      showFeedback('error', 'Erro', 'Falha ao realizar o resgate.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Controle de Frequência"
        subtitle="Gerenciar presença dos alunos nas aulas"
        showBackButton={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Card className="p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              {isGlobalAdmin && !isProfessor && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Filtrar por Polo</label>
                    <Select value={filterPoloId} onChange={val => { setFilterPoloId(val); setTurmaId(''); }}>
                      <option value="">Todos os Polos</option>
                      {polos.map(p => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              )}

              {isProfessor && turmas.length === 1 ? (
                <div className="md:col-span-2">
                  <div className="bg-gradient-to-br from-teal-50 to-white border border-teal-100 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-teal-100 p-2 rounded-lg">
                        <GraduationCap className="text-teal-600 w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider">MÓDULO</h4>
                        <p className="text-lg font-extrabold text-gray-900">{turmas[0].modulo_titulo}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 pt-3 border-t border-teal-50">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <BookOpen className="text-gray-600 w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase">Sua Turma</h4>
                        <p className="text-sm font-semibold text-gray-700">{turmas[0].nome}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="md:col-span-2 space-y-4">
                  {turmaId && (
                    <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl space-y-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <GraduationCap className="text-teal-600 w-4 h-4" />
                          <span className="text-xs font-bold text-teal-700 uppercase tracking-tight">Módulo Atual</span>
                        </div>
                        <p className="text-md font-bold text-gray-900">
                          {turmas.find(t => t.id === turmaId)?.modulo_titulo}
                        </p>
                      </div>
                      {!isProfessor && turmas.find(t => t.id === turmaId)?.professor_nome && (
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="text-purple-600 w-4 h-4" />
                            <span className="text-xs font-bold text-purple-700 uppercase tracking-tight">Professor(a)</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {turmas.find(t => t.id === turmaId)?.professor_nome}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Selecionar Turma</label>
                    <Select value={turmaId} onChange={val => setTurmaId(val)} required className="w-full" disabled={isGlobalAdmin && !filterPoloId}>
                      <option value="">{loadingTurmas ? 'Carregando...' : isGlobalAdmin && !filterPoloId ? 'Selecione primeiro o Polo' : 'Escolha uma turma'}</option>
                      {turmas.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.nome} ({t.modulo_titulo}){!isProfessor && t.professor_nome ? ` - Prof. ${t.professor_nome}` : ''}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              )}


            </div>


            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alunos</label>
              {loadingAlunos && <p className="text-sm text-gray-600">Carregando alunos...</p>}

              {!loadingAlunos && turmaId && turmas.find(t => t.id === turmaId)?.alunos_matriculados === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center shadow-inner">
                  <GraduationCap className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-bold text-amber-800 mb-1">Turma sem alunos</h3>
                  <p className="text-sm text-amber-700 max-w-md mx-auto">
                    Esta turma já está vinculada a você, porém ainda não possui alunos matriculados ativos para o lançamento de frequência.
                  </p>
                </div>
              )}

              {!loadingAlunos && turmaId && turmas.find(t => t.id === turmaId)?.alunos_matriculados! > 0 && alunos.length === 0 && (
                <p className="text-sm text-gray-600">Nenhum aluno encontrado para a turma selecionada.</p>
              )}

              <div className="space-y-2">
                {alunos.map(aluno => (
                  <div
                    key={aluno.aluno_id}
                    className="p-4 border rounded-xl bg-white shadow-sm hover:border-teal-200 transition-colors"
                  >
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="font-bold text-gray-900 text-lg flex items-center">
                          <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-sm text-gray-500">
                            {aluno.nome.charAt(0)}
                          </span>
                          {aluno.nome}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-gray-400 hover:text-red-600 px-2 py-1"
                          onClick={() => setAlunos(prev => prev.map(a => (a.aluno_id === aluno.aluno_id ? { ...a, status: null, observacao: undefined, dracmas: {}, licao_id: '' } : a)))}
                        >
                          Limpar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 ml-2 border border-amber-200"
                          onClick={() => handleOpenResgate(aluno.aluno_id)}
                          title="Resgatar Drácmas (saque)"
                        >
                          <Banknote className="w-4 h-4 mr-1" />
                          Resgatar Drácmas
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Data da Aula</label>
                          <Input
                            type="date"
                            value={aluno.data}
                            onChange={e => updateDataPerRow(aluno.aluno_id, e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Lição Ministrada</label>
                          <Select
                            value={aluno.licao_id}
                            onChange={val => updateLicaoPerRow(aluno.aluno_id, val)}
                            className="h-9 text-xs"
                          >
                            <option value="">Selecione lição...</option>
                            {licoes.map(l => (
                              <option key={l.id} value={l.id}>Lição {l.ordem}: {l.titulo}</option>
                            ))}
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Status Presença</label>
                          <Select
                            value={aluno.status ?? ''}
                            onChange={val => updateStatus(aluno.aluno_id, (val === '' ? null : val) as StatusPresenca)}
                            className="h-9 text-xs"
                          >
                            <option value="">Sem registro</option>
                            <option value="presente">Presente</option>
                            <option value="falta">Falta</option>
                            <option value="atraso">Atraso</option>
                            <option value="justificativa">Justificativa</option>
                            <option value="reposicao">Reposição</option>
                          </Select>
                        </div>

                        <div className="space-y-1 lg:col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Observação</label>
                          <Input
                            value={aluno.observacao ?? ''}
                            onChange={e => updateObservacao(aluno.aluno_id, e.target.value)}
                            placeholder="Nota interna ou justificativa"
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Beaker className="w-3 h-3 text-blue-500" />
                          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Premiação em Drácmas</span>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {criteriosDracma.map(c => (
                            <div key={c.codigo} className="flex flex-col space-y-1 min-w-[120px]">
                              <label className="text-[9px] font-bold text-gray-500 truncate" title={c.nome}>
                                {c.nome}
                              </label>
                              <div className="flex items-center space-x-1">
                                <Input
                                  type="number"
                                  min={0}
                                  value={aluno.dracmas[c.codigo] || ''}
                                  onChange={e => updateDracmas(aluno.aluno_id, c.codigo, e.target.value)}
                                  className="h-7 text-[10px] w-16"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {aluno.historico.length > 0 && (
                      <div className="border-t pt-3 mt-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <History className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Histórico Recente {loadingHistory && <span className="ml-2 text-teal-600 animate-pulse">(Carregando...)</span>}
                          </span>
                        </div>
                        <div className="max-h-40 overflow-y-auto rounded-lg border bg-gray-50">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100 sticky top-0">
                              <tr>
                                <th className="px-3 py-1.5 text-left text-[9px] font-bold text-gray-500 uppercase">Data</th>
                                <th className="px-3 py-1.5 text-left text-[9px] font-bold text-gray-500 uppercase">Lição</th>
                                <th className="px-3 py-1.5 text-left text-[9px] font-bold text-gray-500 uppercase">Status</th>
                                {criteriosDracma
                                  .filter(c => aluno.historico.some((h: any) => h.dracmasPorTipo && h.dracmasPorTipo[c.codigo] > 0))
                                  .map(c => (
                                    <th key={c.codigo} className="px-3 py-1.5 text-center text-[9px] font-bold text-gray-500 uppercase" title={c.nome}>
                                      {c.nome.substring(0, 15)}{c.nome.length > 15 ? '...' : ''}
                                    </th>
                                  ))}
                                <th className="px-3 py-1.5 text-right text-[9px] font-bold text-gray-500 uppercase">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {aluno.historico.slice(0, 10).map((reg: any) => (
                                <tr key={reg.id} className="hover:bg-white transition-colors">
                                  <td className="px-3 py-1.5 text-[10px] text-gray-700">{formatarDataLocal(reg.data)}</td>
                                  <td className="px-3 py-1.5 text-[10px] text-gray-600 truncate max-w-[150px]" title={reg.licoes?.titulo}>
                                    {reg.licoes?.titulo || 'Sem lição'}
                                  </td>
                                  <td className="px-3 py-1.5">
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${reg.status === 'presente' ? 'bg-green-100 text-green-700' :
                                      reg.status === 'falta' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                      }`}>
                                      {reg.status}
                                    </span>
                                  </td>
                                  {criteriosDracma
                                    .filter(c => aluno.historico.some((h: any) => h.dracmasPorTipo && h.dracmasPorTipo[c.codigo] > 0))
                                    .map(c => (
                                      <td key={c.codigo} className="px-3 py-1.5 text-center">
                                        {reg.dracmasPorTipo && reg.dracmasPorTipo[c.codigo] > 0 ? (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                            +{reg.dracmasPorTipo[c.codigo]}
                                          </span>
                                        ) : (
                                          <span className="text-[9px] text-gray-300">-</span>
                                        )}
                                      </td>
                                    ))}
                                  <td className="px-3 py-1.5 text-right space-x-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditRecord(aluno.aluno_id, reg)}
                                      className="text-teal-600 hover:text-teal-800 hover:bg-teal-50"
                                      title="Editar"
                                    >
                                      <Edit2 className="w-3 h-3 mr-1" />
                                      Editar
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteRecord(reg.id)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                                      title="Excluir"
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      Excluir
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>


            <div className="flex justify-end">
              <Button type="submit" loading={submitting} disabled={submitting || loadingTurmas || loadingAlunos || !turmaId}>
                Salvar lançamento
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {editingModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                Editar Lançamento
              </h3>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={submitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-teal-100 p-2 rounded-full">
                  <User className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Aluno</p>
                  <p className="text-base font-bold text-gray-900">{editingModalData.alunoNome}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                  <Input
                    type="date"
                    value={editingModalData.data}
                    disabled
                    className="bg-gray-100 text-gray-500 font-medium"
                  />
                  <p className="text-[9px] text-gray-400 mt-1">A data não pode ser alterada na edição rápida.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                  <Select
                    value={editingModalData.status ?? ''}
                    onChange={v => setEditingModalData({ ...editingModalData, status: (v === '' ? null : v) as StatusPresenca })}
                  >
                    <option value="presente">Presente</option>
                    <option value="falta">Falta</option>
                    <option value="atraso">Atraso</option>
                    <option value="justificativa">Justificativa</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center">
                  Drácmas <span className="ml-2 text-[9px] font-normal normal-case text-gray-400">(Deixe vazio para 0)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {criteriosDracma.map(c => (
                    <div key={c.codigo}>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5 truncate" title={c.nome}>
                        {c.nome}
                      </span>
                      <Input
                        type="number"
                        min={0}
                        value={editingModalData.dracmas[c.codigo] || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setEditingModalData({
                            ...editingModalData,
                            dracmas: {
                              ...editingModalData.dracmas,
                              [c.codigo]: val
                            }
                          });
                        }}
                        className="h-8 text-xs"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Observação</label>
                <textarea
                  className="w-full text-xs p-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
                  rows={2}
                  value={editingModalData.observacao}
                  onChange={e => setEditingModalData({ ...editingModalData, observacao: e.target.value })}
                  placeholder="Justificativa ou anotação..."
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
              <Button variant="outline" onClick={handleCloseEditModal} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEditModal} disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {resgateModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <Banknote className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">Resgate de Drácmas</h3>
              <p className="text-amber-100 text-sm mt-1">Converte saldo em produtos</p>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Aluno(a)</p>
                <h4 className="text-lg font-bold text-gray-900">{resgateModalData.alunoNome}</h4>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3 border-b pb-2">Extrato Acumulado</p>
                {Object.entries(resgateModalData.breakdown).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(resgateModalData.breakdown).map(([tipo, qtd]) => (
                      <div key={tipo} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 capitalize">{tipo}</span>
                        <span className="font-bold text-gray-800">{qtd}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-2">Sem saldo disponível.</p>
                )}

                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700 uppercase">Total Disponível</span>
                  <span className="text-2xl font-extrabold text-amber-600">{resgateModalData.saldo}</span>
                </div>
              </div>

              <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex items-start space-x-2 text-red-700 text-xs mb-6">
                <div className="font-bold">Atenção:</div>
                <div>Esta ação é irreversível. O saldo será zerado e registrado no histórico de resgates.</div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1" onClick={() => setResgateModalData(null)} disabled={submitting}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white border-transparent"
                  onClick={handleConfirmResgate}
                  disabled={submitting || resgateModalData.saldo <= 0}
                >
                  {submitting ? 'Processando...' : 'Confirmar Resgate'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFrequencia;
