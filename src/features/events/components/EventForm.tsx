import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import Select from '../../../shared/ui/Select';
import Card from '../../../shared/ui/Card';
import Button from '../../../shared/ui/Button';
import Input from '../../../shared/ui/Input';
import { useApp } from '../../../context/AppContext';
import { EventosService, type Evento } from '../../../services/eventos.service';
import FileUpload from '../../../shared/ui/FileUpload';
import { parseISOToLocal } from '../../../shared/utils/dateUtils';

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
    status: 'agendado' as Evento['status'],
    categoria: 'geral' as Evento['categoria'],
    is_destaque: false,
    link_cta: '',
    midia: [] as Evento['midia'],
  });

  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    if (editingEvent) {
      setForm({
        titulo: editingEvent.titulo,
        descricao: editingEvent.descricao || '',
        local: editingEvent.local || '',
        data_inicio: editingEvent.data_inicio.split('T')[0],
        data_fim: editingEvent.data_fim || '',
        status: editingEvent.status || 'agendado',
        categoria: editingEvent.categoria || 'geral',
        is_destaque: editingEvent.is_destaque || false,
        link_cta: editingEvent.link_cta || '',
        midia: editingEvent.midia || [],
      });
    }
  }, [editingEvent]);

  const addVideo = () => {
    if (!videoUrl.trim()) return;
    setForm(p => ({
      ...p,
      midia: [...p.midia, { type: 'video', url: videoUrl, title: 'Vídeo do Evento' }]
    }));
    setVideoUrl('');
  };

  const addPhoto = (url: string) => {
    setForm(p => ({
      ...p,
      midia: [...p.midia, { type: 'image', url }]
    }));
  };

  const removeMidia = (index: number) => {
    setForm(p => ({
      ...p,
      midia: p.midia.filter((_, i) => i !== index)
    }));
  };

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
          status: form.status,
          categoria: form.categoria,
          is_destaque: form.is_destaque,
          link_cta: form.link_cta || null,
          midia: form.midia,
        });
        showFeedback('success', 'Sucesso', 'Evento atualizado com sucesso!');
      } else {
        await EventosService.criar({
          ...payload,
          status: form.status,
          categoria: form.categoria,
          is_destaque: form.is_destaque,
          link_cta: form.link_cta || undefined,
          midia: form.midia,
        });
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

  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card ref={modalRef} className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {editingEvent ? 'Editar Divulgação' : 'Nova Divulgação'}
        </h3>

        <div className="space-y-4">
          {/* Tipo de Divulgação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Divulgação</label>
            <Select
              value={form.categoria}
              onChange={(v) => {
                const type = v as Evento['categoria'];
                setForm(p => ({
                  ...p,
                  categoria: type,
                  status: type === 'publicacao' ? 'realizado' : 'agendado'
                }));
              }}
              options={[
                { value: 'geral', label: 'Evento (Padrão)' },
                { value: 'informativo', label: 'Informativo (Avisos/Matrículas)' },
                { value: 'publicacao', label: 'Publicação (Mídias de Eventos Realizados)' },
                { value: 'matricula', label: 'Matrícula' },
                { value: 'formatura', label: 'Formatura' },
                { value: 'aula', label: 'Aula' },
                { value: 'comemorativo', label: 'Comemorativo' },
              ]}
            />
          </div>

          <Input
            label="Título"
            placeholder={form.categoria === 'informativo' ? 'Ex: Início das Matrículas 2026' : 'Título da divulgação'}
            value={form.titulo}
            onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
          />

          <Input
            label="Descrição"
            placeholder="Breve texto sobre a divulgação"
            value={form.descricao}
            onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
          />

          {form.categoria !== 'publicacao' && (
            <>
              <Input
                label="Local"
                value={form.local}
                onChange={(e) => setForm((p) => ({ ...p, local: e.target.value }))}
                placeholder="Onde ocorrerá?"
              />
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={form.categoria === 'publicacao' ? "Data do Registro" : "Data de Início"}
              type="date"
              value={form.data_inicio}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, data_inicio: e.target.value }))}
            />
            {form.categoria !== 'publicacao' && form.categoria !== 'informativo' && (
              <Input
                label="Data de Fim"
                type="date"
                value={form.data_fim}
                onChange={(e) => setForm((p) => ({ ...p, data_fim: e.target.value }))}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={form.status}
              onChange={(v) => setForm((p) => ({ ...p, status: v as Evento['status'] }))}
              options={[
                { value: 'agendado', label: 'Agendado/Ativo' },
                { value: 'realizado', label: 'Realizado/Concluído' },
                { value: 'cancelado', label: 'Cancelado' },
              ]}
            />
            <div className="flex items-end pb-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_destaque"
                  checked={form.is_destaque}
                  onChange={(e) => setForm((p) => ({ ...p, is_destaque: e.target.checked }))}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="is_destaque" className="text-sm font-medium text-gray-700">
                  Destaque no Banner
                </label>
              </div>
            </div>
          </div>

          {form.categoria !== 'publicacao' && (
            <Input
              label="Link de Ação (CTA)"
              placeholder="https://exemplo.com/inscricoes"
              value={form.link_cta}
              onChange={(e) => setForm((p) => ({ ...p, link_cta: e.target.value }))}
            />
          )}

          <div className={`border-t pt-4 mt-4 ${form.categoria === 'publicacao' ? 'bg-red-50 -mx-4 px-4 pb-4 rounded-b-lg' : ''}`}>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-red-600" />
              Galeria de Mídias
            </h4>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  placeholder="Link do YouTube ou Vimeo"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                <Button variant="outline" type="button" onClick={addVideo}>
                  <Plus className="h-4 w-4 mr-1" /> Vídeo
                </Button>
              </div>

              <FileUpload
                folder="eventos"
                label="Upload de Fotos para a Galeria"
                onUploadComplete={(url) => addPhoto(url)}
                accept="image/*"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                {form.midia.map((m, idx) => (
                  <div key={idx} className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                    {m.type === 'image' ? (
                      <img src={m.url} alt="Midia" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-xs text-gray-500">
                        <VideoIcon className="h-6 w-6 mb-1 text-red-500" />
                        Vídeo
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMidia(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
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
