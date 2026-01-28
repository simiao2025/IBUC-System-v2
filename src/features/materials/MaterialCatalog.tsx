import React, { useState, useEffect, useCallback } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import Select from '@/shared/ui/Select';
import { useApp } from '@/app/providers/AppContext';
import { Package, Plus, Trash2, Edit, Upload } from 'lucide-react';
import { MaterialsAPI, type Material } from './materials.service';
import { ModulosAPI } from '@/services/modulos.service';
import { NiveisAPI } from '@/features/classes/services/turma.service';
import { api } from '@/shared/api/api';
import type { Modulo } from '@/types/database';

const MaterialCatalog: React.FC = () => {
  const { showFeedback } = useApp();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [niveis, setNiveis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<Partial<Material>>({
    nome: '',
    descricao: '',
    valor_padrao_cents: 0,
    unidade: 'Unidade',
    modulo_id: '',
    nivel_id: '',
    url_imagem: ''
  });

  // Filters
  const [filtroModulo, setFiltroModulo] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [buscaNome, setBuscaNome] = useState('');

  const carregarDados = useCallback(async () => {
    try {
      const [mats, mods, levels] = await Promise.all([
        MaterialsAPI.listar(),
        ModulosAPI.listar(),
        NiveisAPI.listar()
      ]);
      setMaterials(Array.isArray(mats) ? mats : []);
      setModulos(Array.isArray(mods) ? mods : []);
      setNiveis(Array.isArray(levels) ? levels : (levels as any).data || []);
    } catch (e) {
      console.error('Erro ao carregar materiais:', e);
      showFeedback('error', 'Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [showFeedback]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleOpenModal = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        nome: material.nome,
        descricao: material.descricao || '',
        valor_padrao_cents: material.valor_padrao_cents,
        unidade: material.unidade || 'Unidade',
        modulo_id: material.modulo_id || '',
        nivel_id: material.nivel_id || '',
        url_imagem: material.url_imagem || ''
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        nome: '',
        descricao: '',
        valor_padrao_cents: 0,
        unidade: 'Unidade',
        modulo_id: '',
        nivel_id: '',
        url_imagem: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMaterial(null);
    setFormData({
      nome: '',
      descricao: '',
      valor_padrao_cents: 0,
      unidade: 'Unidade',
      modulo_id: '',
      nivel_id: '',
      url_imagem: ''
    });
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      const res = await api.upload<{ url: string }>('/upload', formDataUpload);
      setFormData(prev => ({ ...prev, url_imagem: res.url }));
      showFeedback('success', 'Upload Concluído', 'Imagem do material carregada com sucesso.');
    } catch (e: any) {
      console.error('Erro no upload:', e);
      showFeedback('error', 'Erro no Upload', e?.message || 'Falha ao enviar imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nome) {
      showFeedback('warning', 'Atenção', 'O nome do material é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      if (editingMaterial) {
        // Update
        await MaterialsAPI.atualizar(editingMaterial.id, formData);
        showFeedback('success', 'Sucesso', 'Material atualizado com sucesso.');
      } else {
        // Create
        await MaterialsAPI.criar(formData);
        showFeedback('success', 'Sucesso', 'Material cadastrado com sucesso.');
      }
      handleCloseModal();
      await carregarDados();
    } catch (e: any) {
      showFeedback('error', 'Erro', e?.message || 'Erro ao salvar material.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este material?')) return;

    setSaving(true);
    try {
      await MaterialsAPI.deletar(id);
      showFeedback('success', 'Excluído', 'Material excluído com sucesso.');
      await carregarDados();
    } catch (e: any) {
      showFeedback('error', 'Erro', e?.message || 'Erro ao excluir material.');
    } finally {
      setSaving(false);
    }
  };

  // Filter materials
  const filteredMaterials = materials.filter(m => {
    if (filtroModulo && m.modulo_id !== filtroModulo) return false;
    if (filtroNivel && m.nivel_id !== filtroNivel) return false;
    if (buscaNome && !m.nome.toLowerCase().includes(buscaNome.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catálogo de Materiais</h2>
          <p className="text-sm text-gray-600">Gerencie os materiais didáticos disponíveis</p>
        </div>
        <Button
          variant="primary"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => handleOpenModal()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Material
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Buscar por nome..."
            value={buscaNome}
            onChange={(e) => setBuscaNome(e.target.value)}
          />
          <Select value={filtroModulo} onChange={setFiltroModulo}>
            <option value="">Todos os módulos</option>
            {modulos.map(m => (
              <option key={m.id} value={m.id}>{m.titulo}</option>
            ))}
          </Select>
          <Select value={filtroNivel} onChange={setFiltroNivel}>
            <option value="">Todos os níveis</option>
            {niveis.map(n => (
              <option key={n.id} value={n.id}>{n.nome}</option>
            ))}
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setBuscaNome('');
              setFiltroModulo('');
              setFiltroNivel('');
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      </Card>

      {/* Materials Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando materiais...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Nenhum material encontrado</p>
          <p className="text-sm text-gray-400 mt-2">
            {materials.length === 0 ? 'Cadastre o primeiro material clicando em "Novo Material"' : 'Tente ajustar os filtros'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMaterials.map(material => (
            <Card key={material.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                {material.url_imagem ? (
                  <img 
                    src={material.url_imagem} 
                    alt={material.nome} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-red-600 font-bold text-sm shadow-sm">
                  {formatCurrency(material.valor_padrao_cents)}
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors text-lg uppercase tracking-tight leading-snug">
                    {material.nome}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mt-2 h-10">
                    {material.descricao || 'Sem descrição'}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="px-2.5 py-1 bg-gray-100 rounded font-medium">{material.unidade || 'Unidade'}</span>
                  {material.modulo_id && (
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded font-medium">
                      {modulos.find(m => m.id === material.modulo_id)?.titulo || 'Módulo'}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => handleOpenModal(material)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 px-3"
                    onClick={() => handleDelete(material.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
              <Package className="h-5 w-5 mr-2 text-red-600" />
              {editingMaterial ? 'Editar Material' : 'Novo Material'}
            </h3>
            
            <div className="space-y-4">
              <Input
                label="Nome do Material"
                placeholder="Ex: Kit Apostila + Uniforme - Módulo 1"
                value={formData.nome}
                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Valor Padrão (R$)"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor_padrao_cents ? formData.valor_padrao_cents / 100 : 0}
                  onChange={e => setFormData({ ...formData, valor_padrao_cents: Math.round(parseFloat(e.target.value) * 100) || 0 })}
                />
                <Input
                  label="Unidade"
                  placeholder="Ex: Kit, Un, Par"
                  value={formData.unidade}
                  onChange={e => setFormData({ ...formData, unidade: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Módulo Sugerido</label>
                  <Select value={formData.modulo_id} onChange={val => setFormData({ ...formData, modulo_id: val })}>
                    <option value="">Selecione...</option>
                    {modulos.map(m => <option key={m.id} value={m.id}>{m.titulo}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nível Sugerido</label>
                  <Select value={formData.nivel_id} onChange={val => setFormData({ ...formData, nivel_id: val })}>
                    <option value="">Selecione...</option>
                    {niveis.map(n => <option key={n.id} value={n.id}>{n.nome}</option>)}
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  placeholder="Detalhes do que compõe este material/kit..."
                  value={formData.descricao}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Produto</label>
                {formData.url_imagem && (
                  <div className="mb-2 relative w-32 h-32 border rounded-lg overflow-hidden bg-gray-100">
                    <img src={formData.url_imagem} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setFormData(p => ({ ...p, url_imagem: '' }))}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    className="hidden"
                    id="material-image-upload"
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="material-image-upload"
                    className={`flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      uploadingImage ? 'bg-gray-50 border-gray-300' : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
                    }`}
                  >
                    {uploadingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2 text-gray-600" />
                        <span className="text-sm text-gray-600">
                          {formData.url_imagem ? 'Alterar Imagem' : 'Selecionar Imagem'}
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCloseModal}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleSave}
                loading={saving}
              >
                {editingMaterial ? 'Salvar Alterações' : 'Cadastrar Material'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MaterialCatalog;
