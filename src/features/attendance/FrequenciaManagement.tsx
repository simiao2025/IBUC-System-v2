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
import { useApp } from '../../context/AppContext';
import { ClipboardList } from 'lucide-react';

type TurmaOption = {
  id: string;
  nome: string;
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
  dracmas: number;
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
  const [tipoDracma, setTipoDracma] = useState('');
  const [descricaoDracma, setDescricaoDracma] = useState('');

  const hasAnyPresence = useMemo(() => alunos.some(a => Boolean(a.status)), [alunos]);
  const hasAnyDracmas = useMemo(() => alunos.some(a => a.dracmas > 0), [alunos]);

  useEffect(() => {
    // Carregar critérios de Drácmas
    const carregarCriterios = async () => {
      try {
        const response: any = await DracmasAPI.listarCriterios();
        const lista = Array.isArray(response) ? response : [];
        const ativos = lista.filter((c: any) => c.ativo);
        
        setCriteriosDracma(ativos);
        if (ativos.length > 0) {
          setTipoDracma(ativos[0].codigo);
        } else {
          // Fallback se não houver critérios
          setTipoDracma('presenca'); 
        }
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
        const response = await TurmasAPI.listar({ professor_id: currentUser.id });
        const lista = (response as any) as any[];
        setTurmas((Array.isArray(lista) ? lista : []).map(t => ({ id: String(t.id), nome: String(t.nome ?? t.id) })));
      } catch (e) {
        console.error('Erro ao carregar turmas:', e);
        setError('Não foi possível carregar as turmas.');
      } finally {
        setLoadingTurmas(false);
      }
    };

    carregarTurmas();
  }, [currentUser]);

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

        setAlunos(items.map(a => ({
          aluno_id: a.aluno_id,
          nome: a.nome,
          status: null,
          dracmas: 0,
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
  }, [turmaId]);

  const updateStatus = (alunoId: string, status: StatusPresenca) => {
    setAlunos(prev => prev.map(a => (a.aluno_id === alunoId ? { ...a, status } : a)));
  };

  const updateObservacao = (alunoId: string, observacao: string) => {
    setAlunos(prev => prev.map(a => (a.aluno_id === alunoId ? { ...a, observacao } : a)));
  };

  const updateDracmas = (alunoId: string, value: string) => {
    const quantidade = Math.max(0, parseInt(value || '0', 10) || 0);
    setAlunos(prev => prev.map(a => (a.aluno_id === alunoId ? { ...a, dracmas: quantidade } : a)));
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
            data,
            status: a.status,
            observacao: a.observacao || undefined,
          }));

        await PresencasAPI.lancarLote(presencasPayload);
      }

      if (hasAnyDracmas) {
        const transacoes = alunos
          .filter(a => a.dracmas > 0)
          .map(a => ({ aluno_id: a.aluno_id, quantidade: a.dracmas }));

        await DracmasAPI.lancarLote({
          turma_id: turmaId,
          data,
          tipo: tipoDracma,
          descricao: descricaoDracma || undefined,
          registrado_por: currentUser.id,
          transacoes,
        });
      }

      setAlunos(prev => prev.map(a => ({ ...a, status: null, observacao: undefined, dracmas: 0 })));
      setDescricaoDracma('');
    } catch (err) {
      console.error('Erro ao lançar frequência/drácmas:', err);
      setError('Não foi possível salvar o lançamento.');
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <Input type="date" value={data} onChange={e => setData(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
              <Select value={turmaId} onChange={val => setTurmaId(val)} required>
                <option value="">{loadingTurmas ? 'Carregando...' : 'Selecione a turma'}</option>
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Drácma (opcional)</label>
              <Select value={tipoDracma} onChange={val => setTipoDracma(val)}>
                {criteriosDracma.length > 0 ? (
                  criteriosDracma.map(c => (
                    <option key={c.codigo} value={c.codigo}>{c.nome}</option>
                  ))
                ) : (
                  <option value="presenca">Presença (Padrão)</option>
                )}
                <option value="outro">Outro</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição de Drácma (opcional)</label>
            <textarea
              value={descricaoDracma}
              onChange={e => setDescricaoDracma(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={2}
            />
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
                  className="p-3 border rounded-lg bg-white"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="font-medium text-gray-900">{aluno.nome}</div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:items-center">
                      <Select
                        value={aluno.status ?? ''}
                        onChange={val => updateStatus(aluno.aluno_id, (val || null) as StatusPresenca)}
                      >
                        <option value="">Sem registro</option>
                        <option value="presente">Presente</option>
                        <option value="falta">Falta</option>
                        <option value="atraso">Atraso</option>
                        <option value="justificativa">Justificativa</option>
                      </Select>

                      <Input
                        value={aluno.observacao ?? ''}
                        onChange={e => updateObservacao(aluno.aluno_id, e.target.value)}
                        placeholder="Observação (opcional)"
                      />

                      <Input
                        type="number"
                        min={0}
                        value={aluno.dracmas}
                        onChange={e => updateDracmas(aluno.aluno_id, e.target.value)}
                        placeholder="Drácmas"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAlunos(prev => prev.map(a => (a.aluno_id === aluno.aluno_id ? { ...a, status: null, observacao: undefined, dracmas: 0 } : a)))}
                      >
                        Limpar
                      </Button>
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
