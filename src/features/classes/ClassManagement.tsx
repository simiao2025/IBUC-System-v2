import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { TurmasAPI, NiveisAPI, type TurmaItem } from './services/turma.service';
import { ModulosAPI } from '../../services/modulos.service';
import type { Modulo } from '../../types/database';
import { PolosAPI } from '../../services/polo.service';
import { UserService } from '../../services/userService';
import { ConfiguracoesService } from '../../services/configuracoes.service';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/ui/PageHeader';
import { Lock, Users, UserPlus, Eye, Calendar } from 'lucide-react';

import { ModuleTransitionWizard } from './ModuleTransitionWizard';
import { BatchClosureModal } from './BatchClosureModal';
import { ClassCalendarModal } from '../calendar/ui/ClassCalendarModal';

type PoloOption = { id: string; nome: string };
type NivelOption = { id: string; nome: string; ordem?: number };
type ProfessorOption = { id: string; nome_completo: string };

type TurmaFormState = {
  nome: string;
  polo_id: string;
  nivel_id: string;
  professor_id: string;
  capacidade: string;
  ano_letivo: string;
  turno: 'manha' | 'tarde' | 'noite';
  status: 'ativa' | 'inativa' | 'concluida';
  modulo_atual_id: string;
  dias_semana: number[];
  horario_inicio: string;
  data_inicio: string;
  data_previsao_termino: string;
  data_conclusao: string;
  migracao_concluida: boolean;
};

const DEFAULT_FORM: TurmaFormState = {
  nome: '',
  polo_id: '',
  nivel_id: '',
  professor_id: '',
  capacidade: '30',
  ano_letivo: String(new Date().getFullYear()),
  turno: 'manha',
  status: 'ativa',
  modulo_atual_id: '',
  dias_semana: [],
  horario_inicio: '',
  data_inicio: '',
  data_previsao_termino: '',
  data_conclusao: '',
  migracao_concluida: false,
};

export const ClassManagement: React.FC = () => {
  const { currentUser, showFeedback, showConfirm } = useApp();
  const [polos, setPolos] = useState<PoloOption[]>([]);
  const [niveis, setNiveis] = useState<NivelOption[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [professores, setProfessores] = useState<ProfessorOption[]>([]);

  const [turmas, setTurmas] = useState<TurmaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterPolo, setFilterPolo] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ativa');
  const [form, setForm] = useState<TurmaFormState>(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [transitionTurma, setTransitionTurma] = useState<{ id: string; nome: string } | null>(null);
  const [calendarTurma, setCalendarTurma] = useState<{ id: string; nome: string } | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [viewingTurma, setViewingTurma] = useState<TurmaItem | null>(null);
  const [globalConfigs, setGlobalConfigs] = useState<any>({});

  const isPoloScoped = currentUser?.adminUser?.accessLevel === 'polo_especifico' && Boolean(currentUser?.adminUser?.poloId);
  const userPoloId = currentUser?.adminUser?.poloId || '';


  // Roles allowed to perform batch closure (Directors and Coordinators)
  const canBatchClose = ['coordenador_polo', 'super_admin'].includes(currentUser?.adminUser?.role || '');

  useEffect(() => {
    if (isPoloScoped && userPoloId) {
      if (filterPolo !== userPoloId) setFilterPolo(userPoloId);
      if (form.polo_id !== userPoloId) setForm(prev => ({ ...prev, polo_id: userPoloId }));
    }
  }, [isPoloScoped, userPoloId]);

  const polosById = useMemo(() => new Map(polos.map(p => [p.id, p.nome])), [polos]);
  const niveisById = useMemo(() => new Map(niveis.map(n => [n.id, n.nome])), [niveis]);
  const modulosById = useMemo(() => new Map(modulos.map(m => [m.id, m.titulo])), [modulos]);
  const professoresById = useMemo(() => new Map(professores.map(p => [p.id, p.nome_completo])), [professores]);

  const carregarOpcoes = async () => {
    setError(null);
    try {
      const professorFilters: any = { role: 'professor', ativo: true };
      if (isPoloScoped && userPoloId) professorFilters.polo_id = userPoloId;

      const [polosResp, niveisResp, modulosResp, professoresResp] = await Promise.all([
        PolosAPI.listar(true),
        NiveisAPI.listar(),
        ModulosAPI.listar(),
        UserService.listUsers(professorFilters),
      ]);

      const polosList = (polosResp as any) as any[];
      const polosMapped = (Array.isArray(polosList) ? polosList : []).map(p => ({ id: String(p.id), nome: String(p.nome ?? p.id) }));
      setPolos(isPoloScoped && userPoloId ? polosMapped.filter(p => p.id === userPoloId) : polosMapped);

      const niveisList = (niveisResp as any) as any[];
      setNiveis((Array.isArray(niveisList) ? niveisList : []).map(n => ({
        id: String(n.id),
        nome: String(n.nome ?? n.id),
        ordem: typeof n.ordem === 'number' ? n.ordem : undefined,
      })));

      setModulos(Array.isArray(modulosResp) ? modulosResp : []);

      const profList = (professoresResp as any) as any[];
      setProfessores((Array.isArray(profList) ? profList : []).map(u => ({
        id: String(u.id),
        nome_completo: String(u.name ?? u.email ?? u.id),
      })));

      const configs = await (ConfiguracoesService as any).buscarTodasComoObjeto();
      setGlobalConfigs(configs);
    } catch (e) {
      console.error('Erro ao carregar opções de turma:', e);
      setError('Não foi possível carregar polos, níveis e professores.');
    }
  };

  const carregarTurmas = async () => {
    setLoading(true);
    setError(null);
    try {
      const poloId = (isPoloScoped && userPoloId) ? userPoloId : (filterPolo || undefined);
      const resp = await TurmasAPI.listar({
        polo_id: poloId,
        status: filterStatus || undefined,
      });
      const list = (resp as any) as any[];
      setTurmas((Array.isArray(list) ? list : []).map(t => ({
        id: String(t.id),
        nome: String(t.nome ?? t.id),
        polo_id: String(t.polo_id),
        nivel_id: String(t.nivel_id),
        professor_id: t.professor_id ?? null,
        capacidade: Number(t.capacidade ?? 0),
        ano_letivo: Number(t.ano_letivo ?? new Date().getFullYear()),
        turno: (t.turno ?? 'manha') as 'manha' | 'tarde' | 'noite',
        status: (t.status ?? 'ativa') as 'ativa' | 'inativa' | 'concluida',
        modulo_atual_id: t.modulo_atual_id,
        dias_semana: (t as any).dias_semana || [],
        horario_inicio: (t as any).horario_inicio || '',
        created_at: t.created_at,
      })));
    } catch (e) {
      console.error('Erro ao carregar turmas:', e);
      setError('Não foi possível carregar as turmas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await carregarOpcoes();
      await carregarTurmas();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    carregarTurmas();
  }, [filterPolo, filterStatus]);

  const startCreate = () => {
    setEditingId(null);
    setForm({
      ...DEFAULT_FORM,
      dias_semana: globalConfigs.dias_semana || [],
      horario_inicio: globalConfigs.horario_aulas || '',
      data_inicio: new Date().toISOString().split('T')[0],
    });
  };

  const startEdit = (t: TurmaItem) => {
    setEditingId(t.id);
    setForm({
      nome: t.nome,
      polo_id: t.polo_id,
      nivel_id: t.nivel_id,
      professor_id: t.professor_id ? String(t.professor_id) : '',
      capacidade: String(t.capacidade ?? ''),
      ano_letivo: String(t.ano_letivo ?? ''),
      turno: t.turno,
      status: (t.status ?? 'ativa') as 'ativa' | 'inativa' | 'concluida',
      modulo_atual_id: t.modulo_atual_id || '',
      dias_semana: (t as any).dias_semana || [],
      horario_inicio: (t as any).horario_inicio || '',
      data_inicio: t.data_inicio || '',
      data_previsao_termino: t.data_previsao_termino || '',
      data_conclusao: t.data_conclusao || '',
      migracao_concluida: !!t.migracao_concluida,
    });
  };

  const handleSave = async () => {
    setError(null);

    if (!form.nome.trim()) {
      setError('Informe o nome da turma.');
      return;
    }
    if (!form.polo_id) {
      setError('Selecione o polo.');
      return;
    }
    if (!form.nivel_id) {
      setError('Selecione o nível.');
      return;
    }

    const capacidade = parseInt(form.capacidade, 10);
    if (!Number.isFinite(capacidade) || capacidade <= 0) {
      setError('Capacidade deve ser maior que 0.');
      return;
    }

    const anoLetivo = parseInt(form.ano_letivo, 10);
    if (!Number.isFinite(anoLetivo)) {
      setError('Ano letivo inválido.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nome: form.nome.trim(),
        polo_id: form.polo_id,
        nivel_id: form.nivel_id,
        professor_id: form.professor_id ? form.professor_id : undefined,
        capacidade,
        ano_letivo: anoLetivo,
        turno: form.turno,
        status: form.status,
        modulo_atual_id: form.modulo_atual_id || undefined,
        dias_semana: form.dias_semana,
        horario_inicio: form.horario_inicio || undefined,
        data_inicio: form.data_inicio || undefined,
        data_previsao_termino: form.data_previsao_termino || undefined,
        data_conclusao: form.data_conclusao || undefined,
        migracao_concluida: form.migracao_concluida,
      };

      if (editingId) {
        await TurmasAPI.atualizar(editingId, payload);
      } else {
        await TurmasAPI.criar(payload);
      }

      showFeedback('success', 'Sucesso', editingId ? 'Turma atualizada com sucesso.' : 'Turma criada com sucesso.');
      await carregarTurmas();
      startCreate();
    } catch (e: any) {
      console.error('Erro ao salvar turma:', e);
      const msg = e?.message || 'Não foi possível salvar a turma.';
      setError(msg);
      showFeedback('error', 'Erro', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleTrazerAlunos = (t: TurmaItem) => {
    // Busca o módulo atual da turma
    const currentModule = modulos.find(m => m.id === t.modulo_atual_id);
    
    if (!currentModule) {
      showFeedback('error', 'Erro', 'A turma não possui um módulo atual definido.');
      return;
    }

    const previousNum = (currentModule.numero || 1) - 1;

    if (previousNum < 1) {
      showFeedback('warning', 'Atenção', `O módulo atual é o ${currentModule.numero}. Não há módulo anterior para migrar.`);
      return;
    }

    showConfirm(
      'Migrar Alunos',
      `Deseja buscar alunos APROVADOS no Módulo ${previousNum} (do mesmo Polo e Nível) e vinculá-los a esta turma (${t.nome})?`,
      async () => {
        setSaving(true);
        try {
          const resp: any = await TurmasAPI.trazerAlunos(t.id, previousNum);
          if (resp.total_migrado === 0) {
            showFeedback('info', 'Aviso', resp.message);
          } else {
            showFeedback('success', 'Sucesso', resp.message);
          }
          await carregarTurmas();
        } catch (e: any) {
          console.error('Erro ao trazer alunos:', e);
          showFeedback('error', 'Erro', e?.message || 'Falha ao migrar alunos.');
        } finally {
          setSaving(false);
        }
      }
    );
  };

  const handleDelete = (id: string) => {
    showConfirm(
      'Excluir Turma',
      'Deseja realmente excluir esta turma? Esta ação não pode ser desfeita.',
      async () => {
        setError(null);
        setSaving(true);
        try {
          await TurmasAPI.deletar(id);
          showFeedback('success', 'Sucesso', 'Turma excluída com sucesso.');
          await carregarTurmas();
          if (editingId === id) {
            startCreate();
          }
        } catch (e: any) {
          console.error('Erro ao deletar turma:', e);
          const msg = e?.message || 'Não foi possível deletar a turma.';
          setError(msg);
          showFeedback('error', 'Erro', msg);
        } finally {
          setSaving(false);
        }
      },
      'Excluir',
      'Cancelar'
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerenciar Turmas"
        subtitle="Cadastro e gestão de turmas e níveis"
        actionLabel={canBatchClose ? "Encerrar Módulo" : undefined}
        actionIcon={canBatchClose ? <Lock className="h-4 w-4 mr-2" /> : undefined}
        onAction={canBatchClose ? () => setShowBatchModal(true) : undefined}
      />

      {error && (
        <Card className="p-4 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Polo</label>
            {isPoloScoped ? (
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-900">
                {polos.find(p => p.id === userPoloId)?.nome || 'Polo'}
              </div>
            ) : (
              <Select value={filterPolo} onChange={val => setFilterPolo(val)}>
                <option value="">Todos</option>
                {polos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </Select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select value={filterStatus} onChange={val => setFilterStatus(val)}>
              <option value="">Todos</option>
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
              <option value="concluida">Concluída</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" onClick={carregarTurmas} loading={loading}>
              Recarregar
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar turma' : 'Criar turma'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <Input value={form.nome} onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Polo (apenas ativos)</label>
            <Select value={isPoloScoped ? userPoloId : form.polo_id} onChange={val => setForm(prev => ({ ...prev, polo_id: val }))} disabled={isPoloScoped}>
              <option value="">Selecione</option>
              {polos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nível</label>
            <Select value={form.nivel_id} onChange={val => setForm(prev => ({ ...prev, nivel_id: val }))}>
              <option value="">Selecione</option>
              {niveis.map(n => (
                <option key={n.id} value={n.id}>
                  {n.nome}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Professor</label>
            <Select value={form.professor_id} onChange={val => setForm(prev => ({ ...prev, professor_id: val }))}>
              <option value="">(sem professor)</option>
              {professores.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome_completo}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vagas (capacidade)</label>
            <Input
              type="number"
              min={1}
              value={form.capacidade}
              onChange={e => setForm(prev => ({ ...prev, capacidade: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ano letivo</label>
            <Input
              type="number"
              value={form.ano_letivo}
              onChange={e => setForm(prev => ({ ...prev, ano_letivo: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
            <Select value={form.turno} onChange={val => setForm(prev => ({ ...prev, turno: val as any }))}>
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="noite">Noite</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Módulo Inicial/Atual</label>
            <Select value={form.modulo_atual_id} onChange={val => setForm(prev => ({ ...prev, modulo_atual_id: val }))}>
              <option value="">Selecione o módulo</option>
              {modulos.map(m => (
                <option key={m.id} value={m.id}>
                  {m.titulo}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horário de Início</label>
            <Input
              type="time"
              value={form.horario_inicio}
              onChange={e => setForm(prev => ({ ...prev, horario_inicio: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
            <Input
              type="date"
              value={form.data_inicio}
              onChange={e => setForm(prev => ({ ...prev, data_inicio: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Previsão de Término</label>
            <Input
              type="date"
              value={form.data_previsao_termino}
              onChange={e => setForm(prev => ({ ...prev, data_previsao_termino: e.target.value }))}
            />
          </div>
          {editingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Conclusão</label>
              <Input
                type="date"
                value={form.data_conclusao}
                onChange={e => setForm(prev => ({ ...prev, data_conclusao: e.target.value }))}
              />
            </div>
          )}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Dias da Semana</label>
            <div className="flex flex-wrap gap-4">
              {[
                { val: 1, label: 'Dom' },
                { val: 2, label: 'Seg' },
                { val: 3, label: 'Ter' },
                { val: 4, label: 'Qua' },
                { val: 5, label: 'Qui' },
                { val: 6, label: 'Sex' },
                { val: 7, label: 'Sáb' },
              ].map(day => (
                <label key={day.val} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    checked={form.dias_semana.includes(day.val)}
                    onChange={e => {
                      const newDays = e.target.checked
                        ? [...form.dias_semana, day.val]
                        : form.dias_semana.filter(d => d !== day.val);
                      setForm(prev => ({ ...prev, dias_semana: newDays.sort() }));
                    }}
                  />
                  <span className="text-sm text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {
          form.modulo_atual_id && form.nivel_id && !editingId && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
              <p className="font-semibold mb-1">Sugestão de Nome (Padrão: [Módulo].[Índice] - [Nível]):</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map(idx => {
                  const mod = modulos.find(m => m.id === form.modulo_atual_id);
                  const modNum = mod?.numero || '?';
                  const niv = niveis.find(n => n.id === form.nivel_id);
                  const suggestedName = `${modNum}.${idx} - ${niv?.nome || 'Nível'}`;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, nome: suggestedName }))}
                      className="bg-white px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      {suggestedName}
                    </button>
                  );
                })}
              </div>
            </div>
          )
        }

        <div className="flex justify-end gap-3 mt-6">
          {editingId && (
            <Button type="button" variant="outline" onClick={startCreate}>
              Cancelar
            </Button>
          )}
          <Button type="button" onClick={handleSave} loading={saving}>
            Salvar
          </Button>
        </div>
      </Card >

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Turmas cadastradas</h2>
        {loading && <p className="text-sm text-gray-600">Carregando...</p>}
        {!loading && turmas.length === 0 && (
          <p className="text-sm text-gray-600">Nenhuma turma encontrada.</p>
        )}

        {!loading && turmas.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Nome</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Polo</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Nível</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Professor</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Módulo</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Vagas</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Ano</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Turno</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {turmas.map(t => (
                  <tr key={t.id}>
                    <td className="px-4 py-2">{t.nome}</td>
                    <td className="px-4 py-2">{polosById.get(t.polo_id) || t.polo_id}</td>
                    <td className="px-4 py-2">{niveisById.get(t.nivel_id) || t.nivel_id}</td>
                    <td className="px-4 py-2">{t.professor_id ? (professoresById.get(String(t.professor_id)) || t.professor_id) : '—'}</td>
                    <td className="px-4 py-2">{t.modulo_atual_id ? (modulosById.get(t.modulo_atual_id) || t.modulo_atual_id) : '—'}</td>
                    <td className="px-4 py-2">{t.capacidade}</td>
                    <td className="px-4 py-2">{t.ano_letivo}</td>
                    <td className="px-4 py-2 capitalize">{t.turno}</td>
                    <td className="px-4 py-2 capitalize">{t.status || 'ativa'}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        {t.status === 'concluida' ? (
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setViewingTurma(t)} 
                            title="Visualizar Detalhes"
                            className="bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </Button>
                        ) : (
                          <>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setCalendarTurma({ id: t.id, nome: t.nome })} 
                              title="Calendário de Aulas"
                              className="text-red-600 border-red-100 hover:bg-red-50"
                            >
                              <Calendar className="h-4 w-4 mr-1" />
                              Calendário
                            </Button>

                            {t.status === 'ativa' && (
                              <Button 
                                type="button" 
                                variant="primary" 
                                size="sm"
                                onClick={() => handleTrazerAlunos(t)}
                                title="Trazer alunos aprovados do módulo anterior"
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Trazer Alunos
                              </Button>
                            )}

                            <Button type="button" variant="outline" onClick={() => handleDelete(t.id)} title="Excluir Turma">
                              Excluir
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {calendarTurma && (
        <ClassCalendarModal 
          turma={calendarTurma} 
          onClose={() => setCalendarTurma(null)} 
        />
      )}

      {
        transitionTurma && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-2xl w-full">
              <ModuleTransitionWizard
                turmaId={transitionTurma.id}
                turmaNome={transitionTurma.nome}
                onClose={() => setTransitionTurma(null)}
                onSuccess={() => {
                  showFeedback('success', 'Sucesso', 'Módulo encerrado e alunos avançados com sucesso.');
                  setTransitionTurma(null);
                  carregarTurmas();
                }}
              />
            </div>
          </div>
        )
      }

      {/* Modal de Visualização (Somente Leitura) */}
      {viewingTurma && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full p-0 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-gray-500" />
                Detalhes da Turma Concluída
              </h3>
              <button 
                onClick={() => setViewingTurma(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nome da Turma</label>
                  <p className="text-gray-900 font-medium">{viewingTurma.nome}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold leading-5 text-gray-800 bg-gray-100 rounded-full capitalize">
                    {viewingTurma.status}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Polo</label>
                  <p className="text-gray-900">{polosById.get(viewingTurma.polo_id) || viewingTurma.polo_id}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nível</label>
                  <p className="text-gray-900">{niveisById.get(viewingTurma.nivel_id) || viewingTurma.nivel_id}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Professor</label>
                  <p className="text-gray-900">{viewingTurma.professor_id ? (professoresById.get(String(viewingTurma.professor_id)) || '—') : '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Módulo Encerrado</label>
                  <p className="text-gray-900">{viewingTurma.modulo_atual_id ? (modulosById.get(viewingTurma.modulo_atual_id) || '—') : '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Ano Letivo</label>
                  <p className="text-gray-900">{viewingTurma.ano_letivo}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Turno</label>
                  <p className="text-gray-900 capitalize">{viewingTurma.turno}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
              <Button onClick={() => setViewingTurma(null)}>
                Fechar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {
        showBatchModal && (
          <BatchClosureModal
            turmas={turmas}
            polos={polos}
            onClose={() => setShowBatchModal(false)}
            onSuccess={() => {
              setShowBatchModal(false);
              carregarTurmas();
            }}
          />
        )
      }
    </div >
  );
};
