import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { Select } from '@/shared/ui';
import { useApp } from '@/app/providers/AppContext';
import { EventosAPI as EventosService } from '@/features/event-management/api/eventos.api';
import type { Evento } from '@/features/event-management/model/types';

type ScopeMode = 'geral' | 'polo';

export const EventsSettings: React.FC = () => {
  const { currentUser, polos, hasAccessToAllPolos, showFeedback, showConfirm } = useApp();

  const isPoloScoped = currentUser?.adminUser?.accessLevel === 'polo_especifico' && Boolean(currentUser?.adminUser?.poloId);
  const userPoloId = currentUser?.adminUser?.poloId || '';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<Evento[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Evento | null>(null);

  const canChoosePolo = hasAccessToAllPolos();

  const [scopeMode, setScopeMode] = useState<ScopeMode>('geral');
  const [selectedPoloId, setSelectedPoloId] = useState<string>('');

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    local: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
  });

  useEffect(() => {
    if (isPoloScoped && userPoloId) {
      setScopeMode('polo');
      setSelectedPoloId(userPoloId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPoloScoped, userPoloId]);

  const polosById = useMemo(() => new Map(polos.map((p: any) => [p.id, p.name])), [polos]);

  const carregar = async () => {
    try {
      setLoading(true);

      const poloId = (isPoloScoped && userPoloId)
        ? userPoloId
        : (scopeMode === 'polo' ? selectedPoloId : undefined);

      const includeGeral = isPoloScoped ? true : scopeMode !== 'polo';

      const data = await EventosService.listar({
        polo_id: poloId || undefined,
        include_geral: includeGeral,
      });

      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Erro ao carregar eventos:', e);
      showFeedback('error', 'Erro', 'NÃ£o foi possÃ­vel carregar eventos.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeMode, selectedPoloId, isPoloScoped, userPoloId]);

  const resetForm = () => {
    setEditing(null);
    setForm({
      titulo: '',
      descricao: '',
      local: '',
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: '',
    });
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (evt: Evento) => {
    setEditing(evt);
    setForm({
      titulo: evt.titulo,
      descricao: evt.descricao || '',
      local: evt.local || '',
      data_inicio: evt.data_inicio,
      data_fim: evt.data_fim || '',
    });
    setShowForm(true);
  };

  const getPayloadPoloId = (): string | null => {
    if (isPoloScoped && userPoloId) return userPoloId;
    if (scopeMode === 'geral') return null;
    return selectedPoloId || null;
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      showFeedback('error', 'Erro', 'TÃ­tulo Ã© obrigatÃ³rio.');
      return;
    }

    if (!form.data_inicio) {
      showFeedback('error', 'Erro', 'Data de inÃ­cio Ã© obrigatÃ³ria.');
      return;
    }

    if (!isPoloScoped && scopeMode === 'polo' && !selectedPoloId) {
      showFeedback('error', 'Erro', 'Selecione um polo.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        titulo: form.titulo,
        descricao: form.descricao || undefined,
        local: form.local || undefined,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim || undefined,
        polo_id: getPayloadPoloId(),
        criado_por: currentUser?.adminUser?.id || null,
      };

      if (editing) {
        await EventosService.atualizar(editing.id, {
          titulo: payload.titulo,
          descricao: payload.descricao ?? null,
          local: payload.local ?? null,
          data_inicio: payload.data_inicio,
          data_fim: payload.data_fim ?? null,
          polo_id: payload.polo_id,
        });
        showFeedback('success', 'Sucesso', 'Evento atualizado com sucesso!');
      } else {
        await EventosService.criar(payload);
        showFeedback('success', 'Sucesso', 'Evento criado com sucesso!');
      }

      setShowForm(false);
      resetForm();
      await carregar();
    } catch (e) {
      console.error('Erro ao salvar evento:', e);
      showFeedback('error', 'Erro', 'NÃ£o foi possÃ­vel salvar o evento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (evt: Evento) => {
    const ok = await showConfirm({
      title: 'Excluir evento',
      message: `Deseja excluir o evento "${evt.titulo}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    try {
      await EventosService.deletar(evt.id);
      showFeedback('success', 'Sucesso', 'Evento excluÃ­do.');
      await carregar();
    } catch (e) {
      console.error('Erro ao excluir evento:', e);
      showFeedback('error', 'Erro', 'NÃ£o foi possÃ­vel excluir o evento.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Eventos</h2>
          <p className="text-sm text-gray-600">Cadastro de eventos para exibiÃ§Ã£o no painel administrativo</p>
        </div>
        <Button onClick={openCreate}>Novo Evento</Button>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escopo</label>
            {isPoloScoped ? (
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-900">
                Polo
              </div>
            ) : (
              <Select value={scopeMode} onChange={(v) => setScopeMode(v as ScopeMode)}>
                <option value="geral">Geral</option>
                <option value="polo">Por Polo</option>
              </Select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Polo</label>
            {(isPoloScoped || scopeMode !== 'polo') ? (
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-900">
                {polosById.get(isPoloScoped ? userPoloId : '') || (scopeMode === 'geral' ? '—' : 'Polo')}
              </div>
            ) : (
              <Select value={selectedPoloId} onChange={(v) => setSelectedPoloId(v)} disabled={!canChoosePolo}>
                <option value="">Selecione</option>
                {polos.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            )}
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={carregar} loading={loading}>Recarregar</Button>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">TÃ­tulo</th>
                {!isPoloScoped && <th className="px-4 py-3 text-left font-medium text-gray-700">Polo</th>}
                <th className="px-4 py-3 text-left font-medium text-gray-700">Local</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Data</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">AÃ§Ãµes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={isPoloScoped ? 4 : 5} className="px-4 py-10 text-center text-gray-500">Carregando...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={isPoloScoped ? 4 : 5} className="px-4 py-10 text-center text-gray-500">Nenhum evento encontrado</td>
                </tr>
              ) : (
                items.map((evt) => (
                  <tr key={evt.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{evt.titulo}</div>
                      {evt.descricao && <div className="text-xs text-gray-500">{evt.descricao}</div>}
                    </td>
                    {!isPoloScoped && (
                      <td className="px-4 py-3 text-gray-900">
                        {evt.polo_id ? (polosById.get(evt.polo_id) || evt.polo_id) : 'Geral'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-900">{evt.local || '—'}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(evt.data_inicio).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(evt)}>Editar</Button>
                        <Button variant="outline" size="sm" onClick={() => void handleDelete(evt)}>Excluir</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Editar Evento' : 'Novo Evento'}</h3>

            <div className="space-y-4">
              <Input
                label="TÃ­tulo"
                value={form.titulo}
                onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
              />

              <Input
                label="DescriÃ§Ã£o"
                value={form.descricao}
                onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              />

              <Input
                label="Local"
                value={form.local}
                onChange={(e) => setForm((p) => ({ ...p, local: e.target.value }))}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Data de InÃ­cio"
                  type="date"
                  value={form.data_inicio}
                  onChange={(e) => setForm((p) => ({ ...p, data_inicio: e.target.value }))}
                />
                <Input
                  label="Data de Fim"
                  type="date"
                  value={form.data_fim}
                  onChange={(e) => setForm((p) => ({ ...p, data_fim: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={() => void handleSave()} loading={saving}>
                  Salvar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
