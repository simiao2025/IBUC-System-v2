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
import { useApp } from '../../context/AppContext';
import { BookOpen, GraduationCap, Calendar as CalendarIcon, Beaker } from 'lucide-react';

type TurmaOption = {
  id: string;
  nome: string;
  modulo_id?: string;
  modulo_titulo?: string;
};

type AlunoOption = {
  aluno_id: string;
  nome: string;
};

type StatusPresenca = 'presente' | 'falta' | 'justificativa' | 'atraso' | null;

type LinhaLancamento = {
  aluno_id: string;
  nome: string;
  status: StatusPresenca;
  observacao?: string;
  dracmas: Record<string, number>; // codigo -> quantidade
  data: string;
  licao_id: string;
};

const AdminFrequencia: React.FC = () => {
  const { currentUser } = useApp();
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [turmas, setTurmas] = useState<TurmaOption[]>([]);
  const [turmaId, setTurmaId] = useState('');
  const [alunos, setAlunos] = useState<LinhaLancamento[]>([]);
  const [loadingTurmas, setLoadingTurmas] = useState(false);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [criteriosDracma, setCriteriosDracma] = useState<{ codigo: string, nome: string }[]>([]);
  const [licoes, setLicoes] = useState<{ id: string, titulo: string, ordem: number }[]>([]);

  const adminUser = (currentUser as any)?.adminUser;
  const isProfessor = adminUser?.role === 'professor';

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
    const carregarTurmas = async () => {
      if (!currentUser) {
        setTurmas([]);
        return;
      }

      setLoadingTurmas(true);
      setError(null);
      try {
        const adminRole = (currentUser as any)?.adminUser?.role as string | undefined;
        const accessLevel = (currentUser as any)?.adminUser?.accessLevel as string | undefined;
        const poloId = (currentUser as any)?.adminUser?.poloId as string | undefined;

        const params = adminRole === 'professor'
          ? { professor_id: currentUser.id }
          : accessLevel === 'polo_especifico' && poloId
            ? { polo_id: poloId }
            : undefined;

        const response = await TurmasAPI.listar(params as any);
        const lista = (response as any) as any[];
        const mappedTurmas = (Array.isArray(lista) ? lista : []).map(t => ({ 
          id: String(t.id), 
          nome: String(t.nome ?? t.id),
          modulo_id: t.modulo_atual_id,
          modulo_titulo: t.modulo?.titulo || 'Módulo não definido'
        }));
        
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
  }, [currentUser, turmaId]);

  useEffect(() => {
    const carregarAlunos = async () => {
      if (!turmaId) {
        setAlunos([]);
        return;
      }

      setLoadingAlunos(true);
      setError(null);
      try {
        const response = await AlunosAPI.listar({ turma_id: turmaId });
        const lista = (response as any) as any[];
        const items: AlunoOption[] = (Array.isArray(lista) ? lista : []).map(a => ({
          aluno_id: String(a.id),
          nome: String(a.nome ?? a.id),
        }));

        // Carregar lições do módulo da turma
        const tSelected = turmas.find(t => t.id === turmaId);
        if (tSelected?.modulo_id) {
          const lResponse = await LicoesAPI.listar({ modulo_id: tSelected.modulo_id });
          setLicoes(Array.isArray(lResponse) ? lResponse : []);
        } else {
          setLicoes([]);
        }

        setAlunos(items.map(a => ({
          aluno_id: a.aluno_id,
          nome: a.nome,
          status: null,
          dracmas: {},
          data: data,
          licao_id: '',
        })));
      } catch (e) {
        console.error('Erro ao carregar alunos da turma:', e);
        setError('Não foi possível carregar os alunos da turma.');
        setAlunos([]);
      } finally {
        setLoadingAlunos(false);
      }
    };

    carregarAlunos();
  }, [turmaId, data, turmas, criteriosDracma]);

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
        const porTipo: Record<string, { aluno_id: string; quantidade: number }[]> = {};
        
        alunos.forEach(a => {
          Object.entries(a.dracmas).forEach(([tipo, quantidade]) => {
            if (quantidade > 0) {
              if (!porTipo[tipo]) porTipo[tipo] = [];
              porTipo[tipo].push({ aluno_id: a.aluno_id, quantidade });
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
        status: null, 
        observacao: undefined, 
        dracmas: {},
        data: data,
        licao_id: ''
      })));
    } catch (err: any) {
      console.error('Erro ao lançar frequência/drácmas:', err);
      const apiMessage = err.response?.data?.message || err.message;
      setError(apiMessage || 'Não foi possível salvar o lançamento.');
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
            {isProfessor && turmas.length === 1 ? (
              <div className="md:col-span-2">
                <div className="bg-gradient-to-br from-teal-50 to-white border border-teal-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-teal-100 p-2 rounded-lg">
                      <GraduationCap className="text-teal-600 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Ciclo Acadêmico</h4>
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
                  <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl">
                    <div className="flex items-center space-x-2 mb-1">
                      <GraduationCap className="text-teal-600 w-4 h-4" />
                      <span className="text-xs font-bold text-teal-700 uppercase tracking-tight">Módulo Atual</span>
                    </div>
                    <p className="text-md font-bold text-gray-900">
                      {turmas.find(t => t.id === turmaId)?.modulo_titulo}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Selecionar Turma</label>
                  <Select value={turmaId} onChange={val => setTurmaId(val)} required className="w-full">
                    <option value="">{loadingTurmas ? 'Carregando...' : 'Escolha uma turma'}</option>
                    {turmas.map(t => (
                      <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Data de Referência</label>
                <div className="relative">
                  <Input 
                    type="date" 
                    value={data} 
                    onChange={e => setData(e.target.value)} 
                    required 
                    className="w-full pl-10"
                  />
                  <CalendarIcon className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                </div>
                <button 
                  type="button" 
                  onClick={syncAllRows}
                  className="mt-1 text-[10px] text-teal-600 font-bold hover:underline ml-1"
                >
                  Aplicar esta data a todos os alunos
                </button>
              </div>

              <div className="flex items-start space-x-3 bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <Beaker className="text-blue-600 w-5 h-5" />
                </div>
                <div className="text-xs text-blue-800 leading-relaxed">
                  <span className="font-bold block uppercase mb-1">Dica de Produtividade</span>
                  Agora você pode definir <strong>data</strong> e <strong>lição</strong> individualmente por aluno na lista abaixo.
                </div>
              </div>
            </div>
          </div>


          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alunos</label>
            {loadingAlunos && <p className="text-sm text-gray-600">Carregando alunos...</p>}
            {!loadingAlunos && turmaId && alunos.length === 0 && (
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
                          onChange={val => updateStatus(aluno.aluno_id, (val || null) as StatusPresenca)}
                          className="h-9 text-xs"
                        >
                          <option value="">Sem registro</option>
                          <option value="presente">Presente</option>
                          <option value="falta">Falta</option>
                          <option value="atraso">Atraso</option>
                          <option value="justificativa">Justificativa</option>
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
                                value={aluno.dracmas[c.codigo] || 0}
                                onChange={e => updateDracmas(aluno.aluno_id, c.codigo, e.target.value)}
                                className="h-7 text-[10px] w-16"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={submitting} disabled={submitting || loadingTurmas || loadingAlunos}>
              Salvar lançamento
            </Button>
          </div>
        </form>
      </Card>
      </div>
    </div>
  );
};

export default AdminFrequencia;
