import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useApp } from '../../../context/AppContext';
import { EventosService, type Evento } from '../../../services/eventos.service';

interface EventFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editingEvent: Evento | null;
  initialScopeMode: 'geral' | 'polo';
  initialPoloId: string;
}

export const EventForm: React.FC<EventFormProps> = ({
  onClose,
  onSuccess,
  editingEvent,
  initialScopeMode,
  initialPoloId
}) => {
  const { currentUser, showFeedback } = useApp();
  const [saving, setSaving] = useState(false);
  const isPoloScoped = currentUser?.adminUser?.accessLevel === 'polo_especifico' && Boolean(currentUser?.adminUser?.poloId);
  const userPoloId = currentUser?.adminUser?.poloId || '';

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    local: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
  });

  useEffect(() => {
    if (editingEvent) {
      setForm({
        titulo: editingEvent.titulo,
        descricao: editingEvent.descricao || '',
        local: editingEvent.local || '',
        data_inicio: editingEvent.data_inicio.split('T')[0],
        data_fim: editingEvent.data_fim || '',
      });
    }
  }, [editingEvent]);

  const getPayloadPoloId = (): string | null => {
    if (isPoloScoped && userPoloId) return userPoloId;
    if (initialScopeMode === 'geral') return null;
    return initialPoloId || null;
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      showFeedback('error', 'Erro', 'Título é obrigatório.');
      return;
    }

    if (!form.data_inicio) {
      showFeedback('error', 'Erro', 'Data de início é obrigatória.');
      return;
    }

    if (!isPoloScoped && initialScopeMode === 'polo' && !initialPoloId) {
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

      if (editingEvent) {
        await EventosService.atualizar(editingEvent.id, {
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

      onSuccess();
    } catch (e) {
      console.error('Erro ao salvar evento:', e);
      showFeedback('error', 'Erro', 'Não foi possível salvar o evento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {editingEvent ? 'Editar Evento' : 'Novo Evento'}
        </h3>

        <div className="space-y-4">
          <Input
            label="Título"
            value={form.titulo}
            onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
          />

          <Input
            label="Descrição"
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
              label="Data de Início"
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
              onClick={onClose}
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
  );
};
