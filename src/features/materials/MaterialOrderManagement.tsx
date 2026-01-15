import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import PageHeader from '../../components/ui/PageHeader';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2, ShoppingCart, Package, List } from 'lucide-react';
import { MaterialsAPI, MaterialOrdersAPI, type Material, type MaterialOrderItem, type MaterialOrder } from './materials.service';
import { ModulosAPI } from '../../services/modulos.service';
import type { Modulo } from '../../types/database';

const MaterialOrderManagement: React.FC = () => {
  const { showFeedback } = useApp();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [saving, setSaving] = useState(false);

  // New Order State
  const { currentUser } = useApp();
  const [tipoCobranca, setTipoCobranca] = useState('material_aluno');
  const [selectedModuloId, setSelectedModuloId] = useState('');
  const [orderItems, setOrderItems] = useState<Partial<MaterialOrderItem>[]>([]);
  const [orders, setOrders] = useState<MaterialOrder[]>([]);

  const carregarDados = useCallback(async () => {
    try {
      const [mats, mods, ords] = await Promise.all([
        MaterialsAPI.listar(),
        ModulosAPI.listar(),
        MaterialOrdersAPI.listar(),
      ]);
      setMaterials(Array.isArray(mats) ? mats : []);
      setModulos(Array.isArray(mods) ? mods : []);
      setOrders(Array.isArray(ords) ? ords : []);
    } catch (e) {
      console.error('Erro ao carregar dados de materiais:', e);
      showFeedback('error', 'Erro', 'Não foi possível carregar os dados.');
    }
  }, [showFeedback, setMaterials, setModulos]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const totalPedido = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + (item.valor_unitario_cents || 0) * (item.quantidade || 0), 0);
  }, [orderItems]);

  const handleAddItem = () => {
    setOrderItems([...orderItems, { material_id: '', quantidade: 1, valor_unitario_cents: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof MaterialOrderItem, value: string | number) => {
    const newItems = [...orderItems];
    let finalValue = value;
    
    if (field === 'quantidade') {
      finalValue = typeof value === 'string' ? (parseInt(value) || 0) : (value || 0);
    } else if (field === 'valor_unitario_cents') {
      // Converte de Real (input) para Centavos (estado)
      finalValue = typeof value === 'string' ? Math.round(parseFloat(value) * 100) || 0 : value;
    }
    
    newItems[index] = { ...newItems[index], [field]: finalValue };

    // Auto-preencher valor se o material for selecionado
    if (field === 'material_id') {
      const mat = materials.find(m => m.id === value);
      if (mat) {
        newItems[index].valor_unitario_cents = mat.valor_padrao_cents;
      }
    }
    setOrderItems(newItems);
  };

  const handleLancarPedido = async () => {
    if (!selectedModuloId && (tipoCobranca === 'material_aluno' || tipoCobranca === 'material_professor')) {
      showFeedback('warning', 'Atenção', 'Selecione o módulo de destino.');
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
      const payload = {
        modulo_destino_id: (tipoCobranca === 'material_aluno' || tipoCobranca === 'material_professor') ? selectedModuloId : null,
        tipo_cobranca: tipoCobranca,
        solicitante_id: currentUser?.id,
        itens: validItems.map(item => ({
          material_id: item.material_id,
          quantidade: item.quantidade || 1,
          valor_unitario_cents: item.valor_unitario_cents || 0,
        })),
      };

      const pedido = await MaterialOrdersAPI.criar(payload);
      
      // 2. Gerar Cobranças Automaticamente (se for material de aluno)
      if (tipoCobranca === 'material_aluno' && pedido.id) {
         // Define vencimento padrão para 5 dias a partir de hoje para efeito de registro,
         // mas o fluxo real dependerá do aceite do aluno conforme regra de negócio.
         const vencimentoPadrao = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
         await MaterialOrdersAPI.gerarCobrancas(pedido.id, vencimentoPadrao);
      }

      showFeedback('success', 'Sucesso', 'Pedido lançado e cobranças geradas!');
      
      // Resetar form
      setOrderItems([]);
      setSelectedModuloId('');
      setTipoCobranca('material_aluno');
      carregarDados();
    } catch (e: any) {
      showFeedback('error', 'Erro', e?.message || 'Erro ao lançar pedido.');
    } finally {
      setSaving(false);
    }
  };

  // Material Modal State
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ nome: '', valor_padrao_cents: 0 });

  const handleSaveMaterial = async () => {
    if (!newMaterial.nome) return;
    setSaving(true);
    try {
      await MaterialsAPI.criar(newMaterial);
      showFeedback('success', 'Sucesso', 'Material cadastrado.');
      setShowMaterialModal(false);
      setNewMaterial({ nome: '', valor_padrao_cents: 0 });
      await carregarDados();
    } catch (e: any) {
      showFeedback('error', 'Erro', e?.message || 'Erro ao salvar material.');
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

              {(tipoCobranca === 'material_aluno' || tipoCobranca === 'material_professor') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Módulo de Destino</label>
                  <Select value={selectedModuloId} onChange={setSelectedModuloId}>
                    <option value="">Selecione o módulo</option>
                    {modulos.map(m => (
                      <option key={m.id} value={m.id}>{m.titulo}</option>
                    ))}
                  </Select>
                  <p className="mt-1 text-xs text-gray-500">
                    {tipoCobranca === 'material_aluno' 
                      ? "O sistema gerará cobranças para TODOS os alunos ativos neste módulo." 
                      : "Pedido de material para suporte aos professores deste módulo."}
                  </p>
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
              {orderItems.map((item, index) => (
                <div key={index} className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Material</label>
                    <div className="flex gap-2">
                      <Select
                        className="flex-1"
                        value={item.material_id}
                        onChange={(val) => handleItemChange(index, 'material_id', val)}
                      >
                        <option value="">Selecione um material</option>
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>{m.nome} ({formatCurrency(m.valor_padrao_cents)})</option>
                        ))}
                      </Select>
                      <Button 
                        variant="outline" 
                        className="px-3" 
                        onClick={() => setShowMaterialModal(true)}
                        title="Cadastrar novo material"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Qtd</label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantidade || 1}
                      onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Unitário (R$)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={(item.valor_unitario_cents || 0) / 100}
                      onChange={(e) => handleItemChange(index, 'valor_unitario_cents', e.target.value)}
                    />
                  </div>
                  <div className="text-right pr-4 pb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {formatCurrency((item.valor_unitario_cents || 0) * (item.quantidade || 0))}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 p-2 h-auto"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full border-dashed border-2 py-4"
                onClick={handleAddItem}
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Item
              </Button>
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

        {/* Histórico Simplificado */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <List className="h-5 w-5 mr-2 text-gray-600" />
            Últimos Pedidos Lançados
          </h3>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum pedido registrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Solicitante</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Destino</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total/Aluno</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.solicitante?.nome || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.modulo_destino?.titulo || order.tipo_cobranca}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(order.total_cents)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                          ${order.status === 'cobrado' ? 'bg-green-100 text-green-700' : 
                            order.status === 'rascunho' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

      {/* Quick Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
              <Package className="h-5 w-5 mr-2 text-red-600" />
              Novo Material
            </h3>
            <div className="space-y-4">
              <Input
                label="Nome do Material"
                placeholder="Ex: Apostila Módulo 1"
                value={newMaterial.nome}
                onChange={e => setNewMaterial({ ...newMaterial, nome: e.target.value })}
              />
              <Input
                label="Valor Padrão (R$)"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={newMaterial.valor_padrao_cents / 100 || 0}
                onChange={e => setNewMaterial({ ...newMaterial, valor_padrao_cents: Math.round(parseFloat(e.target.value) * 100) || 0 })}
              />
              <p className="text-xs text-gray-500 italic">Ex: 40,00</p>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowMaterialModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" className="flex-1" loading={saving} onClick={handleSaveMaterial}>
                  Cadastrar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
export default MaterialOrderManagement;
