import React, { useEffect, useMemo, useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useApp } from '../../context/AppContext';
import { EventosService, type Evento } from '../../services/eventos.service';

import { FileUpload } from '../ui/FileUpload';
import { Trash2, Image as ImageIcon, Video, Star } from 'lucide-react';
import { formatLocalDate } from '../../shared/utils/dateUtils';

type ScopeMode = 'geral' | 'polo';
  
function getYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

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
    status: 'agendado' as Evento['status'],
    categoria: 'geral' as Evento['categoria'],
    is_destaque: false,
    link_cta: '',
    midia: [] as Evento['midia']
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
      showFeedback('error', 'Erro', 'Não foi possível carregar eventos.');
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
      status: 'agendado',
      categoria: 'geral',
      is_destaque: false,
      link_cta: '',
      midia: []
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
      data_inicio: evt.data_inicio ? evt.data_inicio.split('T')[0] : '', // Garantir formato YYYY-MM-DD
      data_fim: evt.data_fim ? evt.data_fim.split('T')[0] : '',
      status: evt.status || 'agendado',
      categoria: evt.categoria || 'geral',
      is_destaque: evt.is_destaque || false,
      link_cta: evt.link_cta || '',
      midia: Array.isArray(evt.midia) ? evt.midia : []
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
      showFeedback('error', 'Erro', 'Título é obrigatório.');
      return;
    }

    if (!form.data_inicio) {
      showFeedback('error', 'Erro', 'Data de início é obrigatória.');
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
        status: form.status,
        categoria: form.categoria,
        is_destaque: form.is_destaque,
        link_cta: form.link_cta || undefined,
        midia: form.midia
      };

      if (editing) {
        await EventosService.atualizar(editing.id, payload);
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
      showFeedback('error', 'Erro', 'Não foi possível salvar o evento.');
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
      showFeedback('success', 'Sucesso', 'Evento excluído.');
      await carregar();
    } catch (e) {
      console.error('Erro ao excluir evento:', e);
      showFeedback('error', 'Erro', 'Não foi possível excluir o evento.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Divulgações</h2>
          <p className="text-sm text-gray-600">Cadastro de comunicados, eventos e registros para o site</p>
        </div>
        <Button onClick={openCreate}>Nova Divulgação</Button>
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
                <th className="px-4 py-3 text-left font-medium text-gray-700">Título</th>
                {!isPoloScoped && <th className="px-4 py-3 text-left font-medium text-gray-700">Polo</th>}
                <th className="px-4 py-3 text-left font-medium text-gray-700">Local</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Data</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Ações</th>
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
                      {formatLocalDate(evt.data_inicio, { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editing ? 'Editar Divulgação' : 'Nova Divulgação'}
            </h3>

            <div className="space-y-4">
              {/* Novo campo: Tipo de Divulgação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Divulgação</label>
                <Select 
                  value={form.categoria} 
                  onChange={(v) => {
                    const type = v as Evento['categoria'];
                    setForm(p => ({
                      ...p,
                      categoria: type,
                      // Lógica automática de status baseada no tipo
                      status: (type === 'publicacao' as any) ? 'realizado' : 'agendado'
                    }));
                  }}
                >
                  <option value="geral">Evento (Padrão)</option>
                  <option value="informativo">Informativo (Avisos/Matrículas)</option>
                  <option value="publicacao">Publicação (Mídias de Eventos Realizados)</option>
                  <option value="matricula">Matrícula</option>
                  <option value="formatura">Formatura</option>
                  <option value="aula">Aula</option>
                  <option value="comemorativo">Comemorativo</option>
                </Select>
              </div>

              <Input
                label="Título"
                placeholder={form.categoria === 'informativo' as any ? 'Ex: Início das Matrículas 2026' : 'Título da divulgação'}
                value={form.titulo}
                onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
              />

              <Input
                label="Descrição"
                placeholder="Breve texto sobre a divulgação"
                value={form.descricao}
                onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              />

              {/* Campos dinâmicos: Local e Link CTA não costumam ser necessários para 'Publicação' pura */}
              {form.categoria !== 'publicacao' as any && (
                <>
                  <Input
                    label="Local"
                    value={form.local}
                    onChange={(e) => setForm((p) => ({ ...p, local: e.target.value }))}
                    placeholder="Onde ocorrerá?"
                  />

                  <Input
                    label="Link CTA (Call-to-Action)"
                    value={form.link_cta}
                    onChange={(e) => setForm((p) => ({ ...p, link_cta: e.target.value }))}
                    placeholder="https://exemplo.com/inscricoes"
                  />
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={form.categoria === 'publicacao' as any ? "Data do Registro" : "Data de Início"}
                  type="date"
                  value={form.data_inicio}
                  onChange={(e) => setForm((p) => ({ ...p, data_inicio: e.target.value }))}
                />
                {/* Data de fim apenas para Eventos */}
                {form.categoria !== 'publicacao' as any && form.categoria !== 'informativo' as any && (
                  <Input
                    label="Data de Fim"
                    type="date"
                    value={form.data_fim}
                    onChange={(e) => setForm((p) => ({ ...p, data_fim: e.target.value }))}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Select 
                    value={form.status} 
                    onChange={(v) => setForm((p) => ({ ...p, status: v as Evento['status'] }))}
                  >
                    <option value="agendado">Agendado/Ativo</option>
                    <option value="realizado">Realizado/Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </Select>
                </div>

                <div className="flex items-end pb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_destaque"
                      checked={form.is_destaque}
                      onChange={(e) => setForm((p) => ({ ...p, is_destaque: e.target.checked }))}
                      className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor="is_destaque" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                      <Star className="w-4 h-4" />
                      Destaque no Banner
                    </label>
                  </div>
                </div>
              </div>

              {/* Seção de Mídia - Prioritária para 'Publicação' */}
              <div className={form.categoria === 'publicacao' as any ? "bg-red-50 p-4 rounded-xl border border-red-100" : ""}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Galeria de Mídia</label>
                
                {/* Preview de mídia existente */}
                {form.midia.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {form.midia.map((item, idx) => (
                      <div key={idx} className="relative group">
                        {item.type === 'image' ? (
                          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={item.url} 
                              alt={item.title || `Mídia ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setForm((p) => ({
                                  ...p,
                                  midia: p.midia.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center group-video">
                            {getYouTubeId(item.url) ? (
                              <img 
                                src={`https://img.youtube.com/vi/${getYouTubeId(item.url)}/hqdefault.jpg`}
                                className="w-full h-full object-cover opacity-80"
                                alt="Youtube Thumb"
                              />
                            ) : null}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Video className="w-8 h-8 text-white drop-shadow-md" />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setForm((p) => ({
                                  ...p,
                                  midia: p.midia.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {item.title && (
                          <p className="text-xs text-gray-600 mt-1 truncate">{item.title}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload de nova mídia */}
                {/* Upload de nova mídia */}
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Opção 1: Upload de Arquivo */}
                     <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Opção A: Upload de Arquivo</p>
                        <FileUpload
                          folder="eventos"
                          accept="image/*,video/*"
                          maxSizeMB={50}
                          label="Escolher arquivo"
                          onUploadComplete={(url, filename) => {
                            const fileType = filename.match(/\.(mp4|webm|ogg|avi)$/i) ? 'video' : 'image';
                            setForm((p) => ({
                              ...p,
                              midia: [...p.midia, { type: fileType, url, title: filename }]
                            }));
                            showFeedback('success', 'Sucesso', 'Mídia adicionada!');
                          }}
                        />
                     </div>

                     {/* Opção 2: Link do YouTube */}
                     <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Opção B: Vídeo do YouTube</p>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Cole o link do YouTube aqui..." 
                            id="youtube-input"
                            onChange={() => {}} // Controlled by ref or separate state if needed, but simpler to use DOM for this quick action or just generic Input without state binding if I don't want to add state
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={(e) => {
                              // Hack to get value without adding state, navigating DOM is acceptable here
                              const input = document.getElementById('youtube-input') as HTMLInputElement;
                              const url = input.value;
                              if (!url) return;
                              
                              // Basic YouTube Validation
                              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                              const match = url.match(regExp);
                              
                              if (match && match[2].length === 11) {
                                setForm((p) => ({
                                  ...p,
                                  midia: [...p.midia, { type: 'video', url, title: 'Vídeo do YouTube' }]
                                }));
                                showFeedback('success', 'Sucesso', 'Vídeo adicionado!');
                                input.value = '';
                              } else {
                                showFeedback('error', 'Inválido', 'Link do YouTube inválido.');
                              }
                            }}
                          >
                            Adicionar
                          </Button>
                        </div>
                     </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Formatos aceitos: Imagens (jpg, png), Vídeos MP4 (até 50MB) ou Links do YouTube.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
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
