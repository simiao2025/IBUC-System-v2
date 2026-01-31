import React, { useEffect, useMemo, useState } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import PageHeader from '@/shared/ui/PageHeader';
import AccessControl from '@/features/auth/ui/AccessControl';
import { useApp } from '@/app/providers/AppContext';
import {
  LicoesAPI,
  ModulosAPI,
  type LicaoCreateDto,
  type LicaoUpdateDto,
  type ModuloCreateDto,
  type ModuloUpdateDto,
} from '@/services/modulos.service';
import type { Licao, Modulo } from '@/types/database';

const textareaClassName =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors';

type SaveState = {
  savingModule: boolean;
  savingLessonId: string | null;
};

type NewLessonState = {
  ordem: string;
  titulo: string;
  descricao: string;
};

const ModulosManagementPage: React.FC = () => {
  const { showFeedback, showConfirm } = useApp();

  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [licoes, setLicoes] = useState<Licao[]>([]);

  const [selectedModuloId, setSelectedModuloId] = useState<string>('');
  const [creatingModulo, setCreatingModulo] = useState(false);
  const [loadingModulos, setLoadingModulos] = useState(true);
  const [loadingLicoes, setLoadingLicoes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [moduleForm, setModuleForm] = useState<Partial<Modulo>>({});
  const [saveState, setSaveState] = useState<SaveState>({ savingModule: false, savingLessonId: null });
  const [newLesson, setNewLesson] = useState<NewLessonState>({ ordem: '', titulo: '', descricao: '' });

  const modulosById = useMemo(() => new Map(modulos.map(m => [m.id, m])), [modulos]);
  const selectedModulo = selectedModuloId ? modulosById.get(selectedModuloId) : undefined;

  const carregarModulos = async () => {
    setLoadingModulos(true);
    setError(null);
    try {
      const data = await ModulosAPI.listar();
      setModulos(Array.isArray(data) ? data : []);

      // Se não houver seleção e não estiver criando, seleciona o primeiro
      if (!creatingModulo && !selectedModuloId && Array.isArray(data) && data.length > 0) {
        setSelectedModuloId(String(data[0].id));
      }
    } catch (e) {
      console.error('Erro ao carregar módulos:', e);
      setError('Não foi possível carregar os módulos.');
    } finally {
      setLoadingModulos(false);
    }
  };

  const carregarLicoes = async (moduloId: string) => {
    setLoadingLicoes(true);
    setError(null);
    try {
      const data = await LicoesAPI.listar({ modulo_id: moduloId });
      const list = Array.isArray(data) ? data : [];
      setLicoes(list.sort((a, b) => a.ordem - b.ordem));
    } catch (e) {
      console.error('Erro ao carregar lições:', e);
      setError('Não foi possível carregar as lições do módulo.');
    } finally {
      setLoadingLicoes(false);
    }
  };

  useEffect(() => {
    carregarModulos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedModuloId) return;
    const modulo = modulosById.get(selectedModuloId);
    if (modulo) {
      setModuleForm(modulo);
      setCreatingModulo(false);
      carregarLicoes(selectedModuloId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModuloId]);

  const onSelectModulo = (id: string) => {
    if (saveState.savingModule || saveState.savingLessonId) {
      showFeedback('info', 'Aguarde', 'Existe uma operação de salvamento em andamento.');
      return;
    }
    setSelectedModuloId(id);
  };

  const salvarModulo = async () => {
    if (!creatingModulo && !selectedModuloId) return;
    setSaveState(prev => ({ ...prev, savingModule: true }));
    try {
      if (creatingModulo) {
        if (typeof moduleForm.numero !== 'number' || !moduleForm.numero) {
          showFeedback('error', 'Dados inválidos', 'Informe o número do módulo.');
          return;
        }
        if (!moduleForm.titulo || !moduleForm.titulo.trim()) {
          showFeedback('error', 'Dados inválidos', 'Informe o título do módulo.');
          return;
        }
      }

      const payload: ModuloUpdateDto = {
        numero: typeof moduleForm.numero === 'number' ? moduleForm.numero : undefined,
        titulo: moduleForm.titulo || undefined,
        descricao: moduleForm.descricao || undefined,
        duracao_sugestiva: typeof moduleForm.duracao_sugestiva === 'number' ? moduleForm.duracao_sugestiva : undefined,
        requisitos: moduleForm.requisitos || undefined,
        objetivos: moduleForm.objetivos || undefined,
        carga_horaria: typeof moduleForm.carga_horaria === 'number' ? moduleForm.carga_horaria : undefined,
      };

      if (creatingModulo) {
        const createPayload: ModuloCreateDto = {
          numero: moduleForm.numero as number,
          titulo: (moduleForm.titulo || '').trim(),
          descricao: moduleForm.descricao || undefined,
          duracao_sugestiva: typeof moduleForm.duracao_sugestiva === 'number' ? moduleForm.duracao_sugestiva : undefined,
          requisitos: moduleForm.requisitos || undefined,
          objetivos: moduleForm.objetivos || undefined,
          carga_horaria: typeof moduleForm.carga_horaria === 'number' ? moduleForm.carga_horaria : undefined,
        };

        const created = await ModulosAPI.criar(createPayload);
        showFeedback('success', 'Salvo', 'Módulo criado com sucesso.');
        setCreatingModulo(false);
        await carregarModulos();
        if (created?.id) setSelectedModuloId(String(created.id));
      } else {
        await ModulosAPI.atualizar(selectedModuloId, payload);
        showFeedback('success', 'Salvo', 'Módulo atualizado com sucesso.');
        await carregarModulos();
      }
    } catch (e) {
      console.error('Erro ao salvar módulo:', e);
      showFeedback('error', 'Erro ao salvar', 'Não foi possível salvar o módulo.');
    } finally {
      setSaveState(prev => ({ ...prev, savingModule: false }));
    }
  };

  const novoModulo = () => {
    if (saveState.savingModule || saveState.savingLessonId) {
      showFeedback('info', 'Aguarde', 'Existe uma operação de salvamento em andamento.');
      return;
    }
    setCreatingModulo(true);
    setSelectedModuloId('');
    setLicoes([]);
    setNewLesson({ ordem: '', titulo: '', descricao: '' });
    setModuleForm({
      numero: 1,
      titulo: '',
      descricao: '',
      carga_horaria: 18,
      duracao_sugestiva: 18,
      objetivos: '',
      requisitos: '',
    });
  };

  const excluirModulo = async () => {
    if (!selectedModuloId) return;
    showConfirm('Excluir módulo', 'Tem certeza que deseja excluir este módulo? As lições serão removidas junto.', async () => {
      try {
        await ModulosAPI.deletar(selectedModuloId);
        showFeedback('success', 'Excluído', 'Módulo excluído com sucesso.');
        setSelectedModuloId('');
        setModuleForm({});
        setLicoes([]);
        await carregarModulos();
      } catch (e) {
        console.error('Erro ao excluir módulo:', e);
        showFeedback('error', 'Erro ao excluir', 'Não foi possível excluir o módulo.');
      }
    });
  };

  const adicionarLicao = async () => {
    if (!selectedModuloId) return;
    const ordem = Number(newLesson.ordem);
    if (!ordem || ordem < 1) {
      showFeedback('error', 'Dados inválidos', 'Informe a ordem da lição.');
      return;
    }
    if (!newLesson.titulo.trim()) {
      showFeedback('error', 'Dados inválidos', 'Informe o título da lição.');
      return;
    }

    setSaveState(prev => ({ ...prev, savingLessonId: '__new__' }));
    try {
      const payload: LicaoCreateDto = {
        modulo_id: selectedModuloId,
        ordem,
        titulo: newLesson.titulo.trim(),
        descricao: newLesson.descricao || undefined,
      };

      await LicoesAPI.criar(payload);
      showFeedback('success', 'Criada', 'Lição criada com sucesso.');
      setNewLesson({ ordem: '', titulo: '', descricao: '' });
      await carregarLicoes(selectedModuloId);
    } catch (e) {
      console.error('Erro ao criar lição:', e);
      showFeedback('error', 'Erro ao criar', 'Não foi possível criar a lição.');
    } finally {
      setSaveState(prev => ({ ...prev, savingLessonId: null }));
    }
  };

  const salvarLicao = async (licao: Licao) => {
    setSaveState(prev => ({ ...prev, savingLessonId: licao.id }));
    try {
      const payload: LicaoUpdateDto = {
        titulo: licao.titulo,
        descricao: licao.descricao,
        ordem: licao.ordem,
        video_url: licao.video_url,
        material_pdf_url: licao.material_pdf_url,
        liberacao_data: licao.liberacao_data,
        duracao_minutos: licao.duracao_minutos,
      };
      await LicoesAPI.atualizar(licao.id, payload);
      showFeedback('success', 'Salvo', `Lição ${licao.ordem} atualizada.`);
    } catch (e) {
      console.error('Erro ao salvar lição:', e);
      showFeedback('error', 'Erro ao salvar', `Não foi possível salvar a lição ${licao.ordem}.`);
    } finally {
      setSaveState(prev => ({ ...prev, savingLessonId: null }));
    }
  };

  const deletarLicao = async (licao: Licao) => {
    showConfirm('Excluir lição', `Tem certeza que deseja excluir a lição ${licao.ordem}?`, async () => {
      try {
        await LicoesAPI.deletar(licao.id);
        showFeedback('success', 'Excluída', 'Lição excluída com sucesso.');
        if (selectedModuloId) await carregarLicoes(selectedModuloId);
      } catch (e) {
        console.error('Erro ao excluir lição:', e);
        showFeedback('error', 'Erro ao excluir', 'Não foi possível excluir a lição.');
      }
    });
  };

  return (
    <AccessControl requiredModule="settings">
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Módulos"
          subtitle="Cadastro e edição de módulos e suas lições"
          showBackButton
          backTo="/admin/dashboard"
          actionLabel="Novo módulo"
          onAction={novoModulo}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {error && (
            <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Lista de Módulos</h2>
                <Button variant="outline" size="sm" onClick={carregarModulos} disabled={loadingModulos}>
                  Atualizar
                </Button>
              </div>

              {loadingModulos ? (
                <div className="text-sm text-gray-600">Carregando...</div>
              ) : (
                <div className="space-y-2">
                  {modulos.map(m => (
                    <button
                      key={m.id}
                      onClick={() => onSelectModulo(m.id)}
                      className={`w-full text-left px-3 py-2 rounded border transition-colors ${selectedModuloId === m.id
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <div className="text-sm font-semibold text-gray-900">{m.numero}. {m.titulo}</div>
                      <div className="text-xs text-gray-600">{m.carga_horaria ?? '-'}h</div>
                    </button>
                  ))}
                  {modulos.length === 0 && (
                    <div className="text-sm text-gray-600">Nenhum módulo encontrado.</div>
                  )}
                </div>
              )}
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Dados do Módulo</h2>
                  <div className="flex items-center gap-2">
                    {!creatingModulo && selectedModuloId && (
                      <Button variant="outline" onClick={excluirModulo} disabled={saveState.savingModule}>
                        Excluir módulo
                      </Button>
                    )}
                    <Button onClick={salvarModulo} disabled={(!selectedModulo && !creatingModulo) || saveState.savingModule}>
                      {saveState.savingModule ? 'Salvando...' : creatingModulo ? 'Criar módulo' : 'Salvar módulo'}
                    </Button>
                  </div>
                </div>

                {!selectedModulo && !creatingModulo ? (
                  <div className="text-sm text-gray-600">Selecione um módulo na lista.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Número"
                      type="number"
                      value={moduleForm.numero ?? ''}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, numero: Number((e.target as HTMLInputElement).value) }))}
                    />
                    <Input
                      label="Título"
                      value={moduleForm.titulo ?? ''}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, titulo: (e.target as HTMLInputElement).value }))}
                    />

                    <Input
                      label="Carga horária (h)"
                      type="number"
                      value={moduleForm.carga_horaria ?? ''}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, carga_horaria: Number((e.target as HTMLInputElement).value) }))}
                    />
                    <Input
                      label="Duração sugestiva (h)"
                      type="number"
                      value={moduleForm.duracao_sugestiva ?? ''}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, duracao_sugestiva: Number((e.target as HTMLInputElement).value) }))}
                    />

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        className={textareaClassName}
                        rows={3}
                        value={moduleForm.descricao ?? ''}
                        onChange={(e) => setModuleForm(prev => ({ ...prev, descricao: e.target.value }))}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Objetivos</label>
                      <textarea
                        className={textareaClassName}
                        rows={3}
                        value={moduleForm.objetivos ?? ''}
                        onChange={(e) => setModuleForm(prev => ({ ...prev, objetivos: e.target.value }))}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos</label>
                      <textarea
                        className={textareaClassName}
                        rows={2}
                        value={moduleForm.requisitos ?? ''}
                        onChange={(e) => setModuleForm(prev => ({ ...prev, requisitos: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Lições</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedModuloId && carregarLicoes(selectedModuloId)}
                    disabled={!selectedModuloId || loadingLicoes}
                  >
                    Atualizar
                  </Button>
                </div>

                {selectedModuloId && (
                  <div className="mb-4 border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-semibold text-gray-900 mb-3">Adicionar lição</div>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <div className="md:col-span-1">
                        <Input
                          label="Ordem"
                          type="number"
                          value={newLesson.ordem}
                          onChange={(e) => setNewLesson(prev => ({ ...prev, ordem: (e.target as HTMLInputElement).value }))}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Input
                          label="Título"
                          value={newLesson.titulo}
                          onChange={(e) => setNewLesson(prev => ({ ...prev, titulo: (e.target as HTMLInputElement).value }))}
                        />
                      </div>
                      <div className="md:col-span-2 flex items-end">
                        <Button
                          className="w-full"
                          onClick={adicionarLicao}
                          disabled={saveState.savingLessonId === '__new__'}
                        >
                          {saveState.savingLessonId === '__new__' ? 'Criando...' : 'Adicionar'}
                        </Button>
                      </div>
                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <textarea
                          className={textareaClassName}
                          rows={2}
                          value={newLesson.descricao}
                          onChange={(e) => setNewLesson(prev => ({ ...prev, descricao: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {loadingLicoes ? (
                  <div className="text-sm text-gray-600">Carregando lições...</div>
                ) : (
                  <div className="space-y-4">
                    {licoes.map((l) => (
                      <div key={l.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-gray-900">
                            Lição {l.ordem.toString().padStart(2, '0')}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => salvarLicao(l)}
                              disabled={saveState.savingLessonId === l.id}
                            >
                              {saveState.savingLessonId === l.id ? 'Salvando...' : 'Salvar'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deletarLicao(l)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-3">
                          <Input
                            label="Título"
                            value={l.titulo}
                            onChange={(e) => {
                              const value = (e.target as HTMLInputElement).value;
                              setLicoes(prev => prev.map(x => (x.id === l.id ? { ...x, titulo: value } : x)));
                            }}
                          />

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <textarea
                              className={textareaClassName}
                              rows={2}
                              value={l.descricao ?? ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                setLicoes(prev => prev.map(x => (x.id === l.id ? { ...x, descricao: value } : x)));
                              }}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              label="Vídeo URL"
                              value={l.video_url ?? ''}
                              onChange={(e) => {
                                const value = (e.target as HTMLInputElement).value;
                                setLicoes(prev => prev.map(x => (x.id === l.id ? { ...x, video_url: value } : x)));
                              }}
                            />
                            <Input
                              label="Material PDF URL"
                              value={l.material_pdf_url ?? ''}
                              onChange={(e) => {
                                const value = (e.target as HTMLInputElement).value;
                                setLicoes(prev => prev.map(x => (x.id === l.id ? { ...x, material_pdf_url: value } : x)));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {licoes.length === 0 && (
                      <div className="text-sm text-gray-600">Nenhuma lição encontrada para este módulo.</div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AccessControl>
  );
};

export default ModulosManagementPage;
