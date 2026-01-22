import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { Select } from '@/shared/ui';
import { useApp } from '@/app/providers/AppContext';
import { EventosAPI, type Evento } from '@/features/event-management';
import { EventForm } from './EventForm';

type ScopeMode = 'geral' | 'polo';

export const EventList: React.FC = () => {
  const { currentUser, polos, hasAccessToAllPolos, showFeedback, showConfirm } = useApp();

  const isPoloScoped = currentUser?.adminUser?.accessLevel === 'polo_especifico' && Boolean(currentUser?.adminUser?.poloId);
  const userPoloId = currentUser?.adminUser?.poloId || '';

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Evento[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Evento | null>(null);

  const canChoosePolo = hasAccessToAllPolos();

  const [scopeMode, setScopeMode] = useState<ScopeMode>('geral');
  const [selectedPoloId, setSelectedPoloId] = useState<string>('');

  useEffect(() => {
    if (isPoloScoped && userPoloId) {
      setScopeMode('polo');
      setSelectedPoloId(userPoloId);
    }
  }, [isPoloScoped, userPoloId]);

  const polosById = useMemo(() => new Map(polos.map((p: any) => [p.id, p.name])), [polos]);

  const carregar = async () => {
    try {
      setLoading(true);

      const poloId = (isPoloScoped && userPoloId)
        ? userPoloId
        : (scopeMode === 'polo' ? selectedPoloId : undefined);

      const includeGeral = isPoloScoped ? true : scopeMode !== 'polo';

      const data = await EventosAPI.listar({
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
  }, [scopeMode, selectedPoloId, isPoloScoped, userPoloId]);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (evt: Evento) => {
    setEditing(evt);
    setShowForm(true);
  };

  const handleDelete = (evt: Evento) => {
    showConfirm(
      'Excluir evento',
      `Deseja excluir o evento "${evt.titulo}"?`,
      async () => {
        try {
          await EventosAPI.deletar(evt.id);
          showFeedback('success', 'Sucesso', 'Evento excluÃ­do.');
          await carregar();
        } catch (e) {
          console.error('Erro ao excluir evento:', e);
          showFeedback('error', 'Erro', 'NÃ£o foi possÃ­vel excluir o evento.');
        }
      },
      'Excluir',
      'Cancelar'
    );
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditing(null);
    void carregar();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {/* Header content if needed inside the list */}
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
                      {new Date(evt.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR')}
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
        <EventForm
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
          editingEvent={editing}
          initialScopeMode={scopeMode}
          initialPoloId={selectedPoloId}
        />
      )}
    </div>
  );
};
