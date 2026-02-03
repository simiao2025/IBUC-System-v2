import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import Select from '@/shared/ui/Select';
import PageHeader from '@/shared/ui/PageHeader';
import { useApp } from '@/app/providers/AppContext';
import { Plus, Trash2, ShoppingCart, Package, List, AlertCircle } from 'lucide-react';
import { formatLocalDate } from '@/shared/utils/dateUtils';
import { MaterialsAPI, MaterialOrdersAPI, type Material, type MaterialOrderItem, type MaterialOrder } from './materials.service';
import { ModulosAPI } from '@/services/modulos.service';
import { NiveisAPI } from '@/features/classes/services/turma.service';
import type { Modulo } from '@/types/database';
import { api } from '@/shared/api/api';

const MaterialOrderManagement: React.FC = () => {
  const { showFeedback } = useApp();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [niveis, setNiveis] = useState<any[]>([]); // Levels state
  const [saving, setSaving] = useState(false);

  // Filters & State
  const { currentUser } = useApp();
  const [tipoCobranca, setTipoCobranca] = useState('material_aluno');
  const [modoCobranca, setModoCobranca] = useState<'lote' | 'individual'>('lote'); // NOVO
  const [selectedModuloId, setSelectedModuloId] = useState('');
  const [selectedNiveisIds, setSelectedNiveisIds] = useState<string[]>([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState('');
  const [alunoInfo, setAlunoInfo] = useState<{ moduloId: string, nivelId: string } | null>(null); // NOVO
  const [alunosDisponiveis, setAlunosDisponiveis] = useState<any[]>([]);
  const [buscaAluno, setBuscaAluno] = useState('');
  const [orderItems, setOrderItems] = useState<Partial<MaterialOrderItem>[]>([]);
  const [showMaterialPicker, setShowMaterialPicker] = useState(false); // NOVO
  const [orders, setOrders] = useState<MaterialOrder[]>([]);
  const [polos, setPolos] = useState<any[]>([]);

  const [filtroPolo, setFiltroPolo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  const isGlobal = currentUser?.role === 'admin_geral' || currentUser?.role === 'super_admin';

  const carregarDados = useCallback(async () => {
    try {
      const [mats, mods, ords, levels, polosRes, alunosRes] = await Promise.all([
        MaterialsAPI.listar(),
        ModulosAPI.listar(),
        MaterialOrdersAPI.listar({ polo_id: filtroPolo || undefined, status: filtroStatus || undefined }),
        NiveisAPI.listar(),
        isGlobal ? api.get('/polos') : Promise.resolve([]),
        // Carregar alunos respeitando permissões de polo
        isGlobal
          ? api.get('/alunos')
          : (currentUser?.adminUser?.poloId ? api.get(`/alunos?polo_id=${currentUser.adminUser.poloId}`) : Promise.resolve({ data: [] })),
      ]);
      setMaterials(Array.isArray(mats) ? mats : []);
      setModulos(Array.isArray(mods) ? mods : []);
      setOrders(Array.isArray(ords) ? ords : []);
      setNiveis(Array.isArray(levels) ? levels : (levels as { data: any[] }).data || []);
      setPolos(Array.isArray(polosRes) ? polosRes : (polosRes as { data: any[] })?.data || []);
      setAlunosDisponiveis(Array.isArray(alunosRes) ? alunosRes : (alunosRes as { data: any[] })?.data || []); // NOVO
    } catch (e) {
      console.error('Erro ao carregar dados de materiais:', e);
      showFeedback('error', 'Erro', 'Não foi possível carregar os dados.');
    }
  }, [showFeedback, filtroPolo, filtroStatus, isGlobal, currentUser?.adminUser?.id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // NOVO: Buscar info do aluno quando selecionado
  useEffect(() => {
    const fetchAlunoInfo = async () => {
      if (!selectedAlunoId) {
        setAlunoInfo(null);
        return;
      }
      try {
        const res = await api.get<any[]>(`/matriculas?aluno_id=${selectedAlunoId}&status=ativa`);
        const matriculas = Array.isArray(res) ? res : (res as any).data || [];
        if (matriculas.length > 0) {
          const mat = matriculas[0];
          setAlunoInfo({
            moduloId: mat.turma?.modulo_id || '',
            nivelId: mat.turma?.nivel_id || ''
          });
        } else {
          setAlunoInfo(null);
        }
      } catch (e) {
        console.error('Erro ao buscar info do aluno:', e);
        setAlunoInfo(null);
      }
    };
    fetchAlunoInfo();
  }, [selectedAlunoId]);

  const totalPedido = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + (item.valor_unitario_cents || 0) * (item.quantidade || 0), 0);
  }, [orderItems]);

  // NOVO: Filtragem inteligente de materiais
  const filteredMaterials = useMemo(() => {
    if (modoCobranca === 'individual') {
      if (!selectedAlunoId) return [];

      return materials.filter(m => {
        // Genéricos (sem vínculo) aparecem para todos
        if (!m.nivel_id && !m.modulo_id) return true;

        // Regra de Módulo
        if (m.modulo_id && alunoInfo?.moduloId && m.modulo_id !== alunoInfo.moduloId) return false;

        // Regra de Nível
        if (m.nivel_id && alunoInfo?.nivelId && m.nivel_id !== alunoInfo.nivelId) return false;

        // Se o material tem restrição mas aluno não tem dados acadêmicos, esconde por segurança
        if ((m.nivel_id && !alunoInfo?.nivelId) || (m.modulo_id && !alunoInfo?.moduloId)) return false;

        return true;
      });
    }

    if (modoCobranca === 'lote' && (tipoCobranca === 'material_aluno' || tipoCobranca === 'material_professor')) {
      return materials.filter(m => {
        // Se um módulo foi selecionado no filtro do pedido, mostra apenas materiais desse módulo
        if (selectedModuloId && m.modulo_id && m.modulo_id !== selectedModuloId) return false;

        // Se níveis foram selecionados, opcionalmente filtrar materiais específicos desses níveis
        // (Geralmente kits são por módulo, mas alguns podem ser por nível)
        if (selectedNiveisIds.length > 0 && m.nivel_id && !selectedNiveisIds.includes(m.nivel_id)) return false;

        return true;
      });
    }

    return materials;
  }, [materials, modoCobranca, selectedAlunoId, alunoInfo, selectedModuloId, selectedNiveisIds, tipoCobranca]);

  const handleAddItem = (material: Material) => {
    // Evita duplicados na mesma lista de edição
    if (orderItems.find(item => item.material_id === material.id)) {
      showFeedback('warning', 'Já adicionado', 'Este item já está na lista do pedido.');
      return;
    }

    setOrderItems([...orderItems, {
      material_id: material.id,
      quantidade: 1,
      valor_unitario_cents: material.valor_padrao_cents
    }]);
    setShowMaterialPicker(false);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleLancarPedido = async () => {
    // Validação para modo lote
    if (modoCobranca === 'lote' && !selectedModuloId && (tipoCobranca === 'material_aluno' || tipoCobranca === 'material_professor')) {
      showFeedback('warning', 'Atenção', 'Selecione o módulo de destino.');
      return;
    }

    // Validação para modo individual
    if (modoCobranca === 'individual' && !selectedAlunoId) {
      showFeedback('warning', 'Atenção', 'Selecione um aluno.');
      return;
    }

    const validItems = orderItems.filter(item => item.material_id);
    if (validItems.length === 0) {
      showFeedback('warning', 'Atenção', 'Adicione pelo menos um item com material selecionado.');
      return;
    }

    setSaving(true);
    try {
      // 1. Criar o Pedido
      const payload: any = {
        tipo_cobranca: modoCobranca === 'individual' ? `${tipoCobranca} (Individual)` : tipoCobranca,
        solicitante_id: currentUser?.id,
        itens: validItems.map(item => ({
          material_id: item.material_id,
          quantidade: item.quantidade || 1,
          valor_unitario_cents: item.valor_unitario_cents || 0,
        })),
      };

      // Campos específicos para modo lote
      if (modoCobranca === 'lote') {
        payload.modulo_destino_id = (tipoCobranca === 'material_aluno' || tipoCobranca === 'material_professor') ? selectedModuloId : null;
        payload.niveis_destino_ids = (tipoCobranca === 'material_aluno') ? selectedNiveisIds : [];
      } else {
        // Campos específicos para modo individual
        payload.aluno_id = selectedAlunoId;
        const alunoSelecionado = alunosDisponiveis.find(a => a.id === selectedAlunoId);
        if (alunoSelecionado) {
          payload.polo_id = alunoSelecionado.polo_id;
        }
      }

      const pedido = await MaterialOrdersAPI.criar(payload);

      // 2. Gerar Cobranças Automaticamente (se for material de aluno em modo lote)
      if (tipoCobranca === 'material_aluno' && modoCobranca === 'lote' && pedido.id) {
        // Define vencimento padrão para 5 dias a partir de hoje para efeito de registro,
        // mas o fluxo real dependerá do aceite do aluno conforme regra de negócio.
        const vencimentoPadrao = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        await MaterialOrdersAPI.gerarCobrancas(pedido.id, vencimentoPadrao);
      }

      // Para modo individual, criar cobrança diretamente para o aluno
      if (modoCobranca === 'individual' && pedido.id) {
        const vencimentoPadrao = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        await MaterialOrdersAPI.gerarCobrancas(pedido.id, vencimentoPadrao);
      }

      showFeedback('success', 'Sucesso', 'Pedido lançado e cobranças geradas!');

      // Resetar form
      setOrderItems([]);
      setSelectedModuloId('');
      setSelectedNiveisIds([]);
      setSelectedAlunoId(''); // NOVO
      setBuscaAluno(''); // NOVO
      setTipoCobranca('material_aluno');
      carregarDados();
    } catch (e: any) {
      showFeedback('error', 'Erro', e?.message || 'Erro ao lançar pedido.');
    } finally {
      setSaving(false);
    }
  };

  const handleGerarCobrancas = async (orderId: string) => {
    // Simples confirmação
    if (!window.confirm('Deseja gerar as cobranças para este pedido agora?')) return;

    setSaving(true);
    try {
      const vencimentoPadrao = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await MaterialOrdersAPI.gerarCobrancas(orderId, vencimentoPadrao);
      showFeedback('success', 'Sucesso', 'Cobranças geradas com sucesso!');
      carregarDados();
    } catch (e: any) {
      showFeedback('error', 'Erro', e?.message || 'Erro ao gerar cobranças via retry.');
    } finally {
      setSaving(false);
    }
  };

  const handleExcluirPedido = async (orderId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido (Rascunho)?')) return;

    setSaving(true);
    try {
      await MaterialOrdersAPI.deletar(orderId);
      showFeedback('success', 'Excluído', 'Pedido excluído com sucesso.');
      carregarDados();
    } catch (e: any) {
      showFeedback('error', 'Erro', e?.message || 'Erro ao excluir pedido.');
    } finally {
      setSaving(false);
    }
  };



  const handleAprovar = async (id: string) => {
    if (!window.confirm('Deseja aprovar este pedido?')) return;
    setSaving(true);
    try {
      await MaterialOrdersAPI.aprovar(id);
      showFeedback('success', 'Sucesso', 'Pedido aprovado!');
      carregarDados();
    } catch (e: any) {
      showFeedback('error', 'Erro', 'Erro ao aprovar pedido.');
    } finally {
      setSaving(false);
    }
  };

  const handleRecusar = async (id: string) => {
    if (!window.confirm('Deseja recusar este pedido?')) return;
    setSaving(true);
    try {
      await MaterialOrdersAPI.recusar(id);
      showFeedback('success', 'Pedido Recusado', 'O pedido foi recusado.');
      carregarDados();
    } catch (e: any) {
      showFeedback('error', 'Erro', 'Erro ao recusar pedido.');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Pedido de Materiais"
        subtitle="Selecione os itens e lance a cobrança para os alunos"
        backTo="/admin/materiais"
      />

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Definições do Pedido</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pedido</label>
              <Select value={tipoCobranca} onChange={setTipoCobranca}>
                <option value="material_aluno">Material do Aluno</option>
                <option value="material_professor">Material do Professor</option>
                <option value="despesas_formatura">Despesas com Formatura</option>
              </Select>
            </div>

            {/* NOVO: Modo de Cobrança (Lote ou Individual) */}
            {tipoCobranca === 'material_aluno' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modo de Cobrança</label>
                <div className="flex gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setModoCobranca('lote')}
                    className={`flex-1 py-4 px-4 rounded-xl font-bold text-sm transition-all border-2 ${modoCobranca === 'lote'
                        ? 'bg-red-600 border-red-600 text-white shadow-lg scale-[1.02]'
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                      }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xl mb-1">📦 Por Lote</span>
                      <span className="text-[10px] font-normal opacity-80 uppercase tracking-tighter">Cobrar múltiplos alunos de um módulo</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoCobranca('individual')}
                    className={`flex-1 py-4 px-4 rounded-xl font-bold text-sm transition-all border-2 ${modoCobranca === 'individual'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-[1.02]'
                        : 'bg-white border-gray-100 text-blue-900/60 hover:border-gray-200'
                      }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xl mb-1">👤 Individual</span>
                      <span className="text-[10px] font-normal opacity-80 uppercase tracking-tighter">Cobrar um aluno específico</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Modo LOTE: Seleção de Módulo e Níveis */}
            {modoCobranca === 'lote' && (tipoCobranca === 'material_aluno' || tipoCobranca === 'material_professor') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Módulo de Destino</label>
                <Select value={selectedModuloId} onChange={setSelectedModuloId}>
                  <option value="">Selecione o módulo</option>
                  {modulos.map(m => (
                    <option key={m.id} value={m.id}>{m.titulo}</option>
                  ))}
                </Select>

                {/* Level Selection */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Níveis de Destino</label>
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {niveis.map(nivel => (
                      <label key={nivel.id} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedNiveisIds.includes(nivel.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedNiveisIds([...selectedNiveisIds, nivel.id]);
                            } else {
                              setSelectedNiveisIds(selectedNiveisIds.filter(id => id !== nivel.id));
                            }
                          }}
                          className="rounded text-green-600 focus:ring-green-500 h-4 w-4"
                        />
                        <span className="text-sm text-gray-700">{nivel.nome}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Selecione quais níveis devem receber este material (ex: Kits podem variar entre crianças e adolescentes).
                  </p>
                </div>

                <p className="mt-2 text-xs text-blue-600 font-medium bg-blue-50 p-2 rounded">
                  {tipoCobranca === 'material_aluno'
                    ? "O sistema gerará cobranças apenas para alunos ATIVOS neste Módulo DENTRO dos Níveis selecionados."
                    : "Pedido de material para suporte aos professores deste módulo."}
                </p>
              </div>
            )}

            {/* Modo INDIVIDUAL: Busca e Seleção de Aluno */}
            {modoCobranca === 'individual' && tipoCobranca === 'material_aluno' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o Aluno</label>
                <Input
                  placeholder="Digite o nome do aluno para buscar..."
                  value={buscaAluno}
                  onChange={(e) => setBuscaAluno(e.target.value)}
                  className="mb-2"
                />
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                  {alunosDisponiveis
                    .filter(aluno =>
                      !buscaAluno ||
                      aluno.nome?.toLowerCase().includes(buscaAluno.toLowerCase()) ||
                      aluno.email?.toLowerCase().includes(buscaAluno.toLowerCase())
                    )
                    .slice(0, 10)
                    .map(aluno => (
                      <button
                        key={aluno.id}
                        type="button"
                        onClick={() => {
                          setSelectedAlunoId(aluno.id);
                          setBuscaAluno(aluno.nome);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0 ${selectedAlunoId === aluno.id ? 'bg-blue-100' : ''
                          }`}
                      >
                        <div className="font-medium text-gray-900">{aluno.nome}</div>
                        <div className="text-xs text-gray-500">{aluno.email}</div>
                        {aluno.polo && (
                          <div className="text-xs text-blue-600 mt-1">📍 {aluno.polo.nome}</div>
                        )}
                      </button>
                    ))}
                  {buscaAluno && alunosDisponiveis.filter(a =>
                    a.nome?.toLowerCase().includes(buscaAluno.toLowerCase())
                  ).length === 0 && (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        Nenhum aluno encontrado
                      </div>
                    )}
                </div>
                {selectedAlunoId && (
                  <p className="mt-2 text-xs text-green-600 font-medium bg-green-50 p-2 rounded">
                    ✓ Aluno selecionado: {alunosDisponiveis.find(a => a.id === selectedAlunoId)?.nome}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-red-600" />
            Itens do Pedido
          </h3>

          <div className="space-y-4">
            {orderItems.length > 0 ? (
              <div className="space-y-3">
                {orderItems.map((item, index) => {
                  const material = materials.find(m => m.id === item.material_id);
                  return (
                    <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 animate-in slide-in-from-left duration-300">
                      <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                        {material?.url_imagem ? (
                          <img src={material.url_imagem} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{material?.nome || 'Material não encontrado'}</h4>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-500 font-medium">Qtd: {item.quantidade}</span>
                          <span className="text-xs text-blue-600 font-bold">{formatCurrency((item.valor_unitario_cents || 0))} /un</span>
                        </div>
                      </div>

                      <div className="text-right px-4">
                        <span className="text-sm font-black text-gray-900">
                          {formatCurrency((item.valor_unitario_cents || 0) * (item.quantidade || 0))}
                        </span>
                      </div>

                      <button
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setShowMaterialPicker(true)}
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-semibold hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <Plus className="h-5 w-5" /> Adicionar outro item
                </button>
              </div>
            ) : (
              <div
                onClick={() => setShowMaterialPicker(true)}
                className="group cursor-pointer py-12 border-2 border-dashed border-red-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-red-50/20 hover:bg-red-50 hover:border-red-400 transition-all active:scale-[0.99]"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-600 shadow-sm border border-red-100 group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-red-700 font-extrabold tracking-tight">Adicionar Item</span>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Subtotal Itens:</span>
              <span className="font-medium">{formatCurrency(totalPedido)}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold text-red-600">
              <span>Total Unitário:</span>
              <span>{formatCurrency(totalPedido)}</span>
            </div>
            <p className="mt-2 text-xs text-center text-gray-400">
              Valor que será cobrado de cada aluno.
            </p>

            <Button
              variant="primary"
              className="w-full py-4 mt-6 text-lg bg-green-600 hover:bg-green-700"
              loading={saving}
              onClick={handleLancarPedido}
            >
              Lançar Pedido
            </Button>
          </div>
        </Card>
      </div>

      {/* Filtros de Lista */}
      <Card className="p-4 bg-gray-50 border-blue-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <h3 className="text-sm font-semibold flex items-center text-blue-800">
              <List className="h-4 w-4 mr-2" />
              Lista de Pedidos
            </h3>
          </div>

          {isGlobal && (
            <div className="w-48">
              <Select value={filtroPolo} onChange={setFiltroPolo} size="sm">
                <option value="">Todos os Polos</option>
                {polos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </Select>
            </div>
          )}

          <div className="w-40">
            <Select value={filtroStatus} onChange={setFiltroStatus} size="sm">
              <option value="">Todos Status</option>
              <option value="rascunho">Rascunho</option>
              <option value="aprovado">Aprovado</option>
              <option value="cobrado">Cobrado</option>
              <option value="recusado">Recusado</option>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            loading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                const response = await MaterialOrdersAPI.gerarPdf({ polo_id: filtroPolo || undefined, status: filtroStatus || undefined }) as unknown as Blob;
                const url = window.URL.createObjectURL(new Blob([response]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `pedidos-materiais-${Date.now()}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
              } catch (e) {
                console.error('Erro ao gerar PDF:', e);
                showFeedback('error', 'Erro', 'Erro ao gerar PDF.');
              } finally {
                setSaving(false);
              }
            }}
          >
            <List className="h-4 w-4 mr-2" />
            Imprimir Lista
          </Button>
        </div>
      </Card>

      {/* Histórico Simplificado */}
      <Card className="p-6">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum pedido registrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Destinatário</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Polo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total/Un</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatLocalDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(order as any).aluno?.nome || order.modulo_destino?.titulo || '—'}
                      {(order as any).aluno && <span className="block text-[10px] text-blue-600 font-bold uppercase">Aluno</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {(order as any).polo?.nome || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(order.total_cents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                          ${order.status === 'cobrado' ? 'bg-green-100 text-green-700' :
                          order.status === 'rascunho' ? 'bg-amber-100 text-amber-700' :
                            order.status === 'aprovado' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'recusado' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        {isGlobal && order.status === 'rascunho' && (
                          <>
                            <Button
                              variant="primary"
                              size="xs"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleAprovar(order.id)}
                            >
                              Aprovar
                            </Button>
                            <Button
                              variant="outline"
                              size="xs"
                              className="text-red-600 border-red-200"
                              onClick={() => handleRecusar(order.id)}
                            >
                              Recusar
                            </Button>
                          </>
                        )}

                        {order.status === 'aprovado' && isGlobal && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleGerarCobrancas(order.id)}
                            title="Gerar cobranças no financeiro"
                          >
                            Gerar Cobranças
                          </Button>
                        )}

                        {order.status === 'rascunho' && !isGlobal && (
                          <Button
                            variant="outline"
                            className="text-red-600 hover:text-red-700 border-red-200"
                            size="sm"
                            onClick={() => handleExcluirPedido(order.id)}
                            title="Excluir rascunho"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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


      {/* Modal Seletor de Material (Style Marketplace) */}
      {showMaterialPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl scale-in-center">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center">
                  <Package className="h-6 w-6 mr-2 text-red-600" />
                  Catálogo de Materiais
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {modoCobranca === 'individual'
                    ? `Filtrado para o nível e módulo atual do aluno`
                    : `Selecione os itens para o pedido em lote`}
                </p>
              </div>
              <button
                onClick={() => setShowMaterialPicker(false)}
                className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
              >
                <Plus className="h-6 w-6 rotate-45 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              {filteredMaterials.length === 0 ? (
                <div className="text-center py-20">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Nenhum material compatível encontrado.</p>
                  {modoCobranca === 'individual' && !selectedAlunoId && (
                    <p className="text-xs text-red-500 mt-1">Selecione um aluno primeiro para habilitar o filtro.</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredMaterials.map(material => {
                    const isAdded = orderItems.some(item => item.material_id === material.id);
                    return (
                      <Card
                        key={material.id}
                        className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-gray-100 ${isAdded ? 'ring-2 ring-red-500' : 'hover:border-red-200'
                          }`}
                      >
                        <div className="h-32 bg-gray-100 relative overflow-hidden">
                          {material.url_imagem ? (
                            <img src={material.url_imagem} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package className="h-10 w-10" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded font-black text-xs text-red-600 shadow-sm">
                            {formatCurrency(material.valor_padrao_cents)}
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-bold text-gray-900 text-sm line-clamp-1 uppercase tracking-tight">{material.nome}</h4>
                          <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 h-6">
                            {material.descricao || 'Kit oficial IBUC para acompanhamento das aulas.'}
                          </p>
                          <Button
                            variant={isAdded ? "outline" : "primary"}
                            size="sm"
                            className={`w-full mt-3 font-black text-[10px] uppercase tracking-widest ${isAdded ? 'border-red-200 text-red-600 bg-red-50' : 'bg-red-600 hover:bg-red-700'
                              }`}
                            onClick={() => handleAddItem(material)}
                          >
                            {isAdded ? 'Já Adicionado' : 'Adicionar'}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
              <Button variant="outline" onClick={() => setShowMaterialPicker(false)}>
                Concluir Seleção
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MaterialOrderManagement;
