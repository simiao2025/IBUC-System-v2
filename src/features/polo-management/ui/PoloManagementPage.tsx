import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/app/providers/AppContext';
import { Polo } from '@/types';
import { poloApi as PoloService } from '@/entities/polo';
import type { Polo as DbPolo } from '@/shared/model/database';
import { Card } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { Select } from '@/shared/ui';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';

const PoloManagementPage: React.FC = () => {
  const { polos, addPolo, updatePolo, deletePolo, showFeedback, showConfirm } = useApp();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingPolo, setEditingPolo] = useState<Polo | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: 'TO',
    cep: '',
    phone: '',
    email: '',
    pastor_responsavel: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Nome da congregação é obrigatório';
    if (!formData.street) newErrors.street = 'Rua é obrigatória';
    if (!formData.number) newErrors.number = 'Número é obrigatório';
    if (!formData.neighborhood) newErrors.neighborhood = 'Bairro é obrigatório';
    if (!formData.city) newErrors.city = 'Cidade é obrigatória';
    if (!formData.state) newErrors.state = 'Estado é obrigatório';
    if (!formData.cep) newErrors.cep = 'CEP é obrigatório';
    if (!formData.pastor_responsavel) newErrors.pastor_responsavel = 'Pastor responsável é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: 'TO',
      cep: '',
      phone: '',
      email: '',
      pastor_responsavel: ''
    });
    setErrors({});
    setEditingPolo(null);
    setShowForm(false);
  };

  const handleEdit = (polo: Polo) => {
    setFormData({
      name: polo.name,
      street: polo.address.street,
      number: polo.address.number,
      neighborhood: polo.address.neighborhood,
      city: polo.address.city,
      state: polo.address.state,
      cep: polo.address.cep,
      phone: polo.address?.phone || '',
      email: polo.address?.email || '',
      pastor_responsavel: polo.pastor || ''
    });
    setEditingPolo(polo);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    void handleSubmitAsync(e);
  };

  const handleSubmitAsync = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const buildCodigo = () => {
      const base = (formData.name || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .toUpperCase();
      const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
      return `${base || 'POLO'}-${suffix}`;
    };

    const dtoBase = {
      nome: formData.name,
      codigo: buildCodigo(),
      endereco: {
        cep: formData.cep,
        rua: formData.street,
        numero: formData.number,
        bairro: formData.neighborhood,
        cidade: formData.city,
        estado: formData.state,
      },
      telefone: formData.phone || undefined,
      email: formData.email || undefined,
      status: 'ativo' as const,
      pastor_responsavel: formData.pastor_responsavel
    };

    const mapDbPoloToUi = (polo: DbPolo): Polo => ({
      id: polo.id,
      name: polo.nome,
      address: {
        street: polo.endereco.rua,
        number: polo.endereco.numero,
        neighborhood: polo.endereco.bairro,
        city: polo.endereco.cidade,
        state: polo.endereco.estado,
        cep: polo.endereco.cep,
        phone: polo.telefone,
        email: polo.email,
      },
      pastor: polo.pastor_responsavel || '',
      coordinator: { name: '', cpf: '' },
      teachers: [],
      assistants: [],
      cafeteriaWorkers: [],
      availableLevels: [],
      isActive: polo.status === 'ativo',
      createdAt: polo.created_at,
      staff: [],
    });

    try {
      setSaving(true);

      if (editingPolo) {
        const statusAtual = editingPolo.isActive ? 'ativo' : 'inativo';
        const atualizado = await PoloService.update(editingPolo.id, {
          nome: formData.name,
          endereco: dtoBase.endereco,
          telefone: dtoBase.telefone,
          email: dtoBase.email,
          pastor_responsavel: dtoBase.pastor_responsavel,
          status: statusAtual,
        } as any);
        updatePolo(editingPolo.id, mapDbPoloToUi(atualizado as unknown as DbPolo));
        showFeedback('success', 'Sucesso', 'Polo atualizado com sucesso!');
        setEditingPolo(null);
      } else {
        const criado = await PoloService.create(dtoBase as any);
        const newPolo = mapDbPoloToUi(criado as unknown as DbPolo);
        addPolo(newPolo);
        showFeedback('success', 'Sucesso', 'Polo cadastrado com sucesso!');

        // Pergunta se deseja cadastrar a Diretoria
        showConfirm(
          'Diretoria do Polo',
          'Polo cadastrado com sucesso! Deseja cadastrar a Diretoria (Diretor, Coordenador, etc.) deste novo polo agora?',
          () => {
            navigate(`/admin/diretoria?poloId=${newPolo.id}&mode=polo`);
          }
        );
      }

      resetForm();
    } catch (error: any) {
      console.error('Erro ao salvar polo:', error);
      showFeedback('error', 'Erro', error.message || 'Erro ao salvar polo. Verifique o console.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePolo = (poloId: string) => {
    showConfirm(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este polo? Esta ação não pode ser desfeita.',
      async () => {
        try {
          await PoloService.delete(poloId);
          deletePolo(poloId);
          showFeedback('success', 'Sucesso', 'Polo deletado com sucesso!');
        } catch (error: any) {
          console.error('Erro ao deletar polo:', error);
          showFeedback('error', 'Erro', error.message || 'Erro ao deletar polo. Verifique o console.');
        }
      }
    );
  };

  const stateOptions = [
    { value: 'TO', label: 'Tocantins' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    // Add more states as needed
  ];

  const handleToggleStatus = async (polo: Polo) => {
    try {
      setSaving(true);
      const novoStatus = polo.isActive ? 'inativo' : 'ativo';
      const atualizado = await PoloService.update(polo.id, {
        status: novoStatus,
      } as any);

      const mapDbPoloToUi = (dbPolo: DbPolo): Polo => ({
        id: dbPolo.id,
        name: dbPolo.nome,
        address: {
          street: dbPolo.endereco.rua,
          number: dbPolo.endereco.numero,
          neighborhood: dbPolo.endereco.bairro,
          city: dbPolo.endereco.cidade,
          state: dbPolo.endereco.estado,
          cep: dbPolo.endereco.cep,
          phone: dbPolo.telefone,
          email: dbPolo.email,
        },
        pastor: dbPolo.pastor_responsavel || '',
        coordinator: { name: '', cpf: '' },
        teachers: [],
        assistants: [],
        cafeteriaWorkers: [],
        availableLevels: [],
        isActive: dbPolo.status === 'ativo',
        createdAt: dbPolo.created_at,
        staff: [],
      });

      updatePolo(polo.id, mapDbPoloToUi(atualizado as unknown as DbPolo));
      showFeedback('success', 'Sucesso', `Polo ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao alterar status do polo:', error);
      showFeedback('error', 'Erro', error.message || 'Erro ao alterar status do polo. Verifique o console.');
    } finally {
      setSaving(false);
    }
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {editingPolo ? 'Editar Polo' : 'Novo Polo'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {editingPolo ? 'Edite os dados do polo' : 'Cadastre um novo polo/congregação'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações Básicas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Nome da Congregação"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    required
                  />
                </div>
                
                <Input
                  label="CEP"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  error={errors.cep}
                  required
                />
                
                <Input
                  label="Rua"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  error={errors.street}
                  required
                />
                
                <Input
                  label="Número"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  error={errors.number}
                  required
                />
                
                <Input
                  label="Bairro"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  error={errors.neighborhood}
                  required
                />
                
                <Input
                  label="Cidade"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  error={errors.city}
                  required
                />
                
                <Select
                  label="Estado"
                  name="state"
                  value={formData.state}
                  onChange={(val) => setFormData(prev => ({ ...prev, state: val }))}
                  options={stateOptions}
                  error={errors.state}
                  required
                />
                
                <Input
                  label="Pastor Responsável"
                  name="pastor_responsavel"
                  value={formData.pastor_responsavel}
                  onChange={handleInputChange}
                  error={errors.pastor_responsavel}
                  required
                />
              </div>
            </Card>

            {/* Contato */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações de Contato</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Telefone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={errors.phone}
                />

                <Input
                  label="E-mail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                />
              </div>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : (editingPolo ? 'Atualizar Polo' : 'Cadastrar Polo')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link to="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Polos</h1>
                <p className="text-sm text-gray-600">Cadastre e gerencie polos/congregações</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Polo
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {polos.length === 0 ? (
          <Card className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum polo cadastrado</h3>
            <p className="text-gray-600 mb-6">Comece cadastrando o primeiro polo do IBUC</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Polo
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {polos.map((polo) => (
              <Card key={polo.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-6 w-6 text-red-600 mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{polo.name}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            polo.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {polo.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {polo.address.street}, {polo.address.number} - {polo.address.neighborhood}
                      </p>
                      <p className="text-sm text-gray-600">
                        {polo.address.city} - {polo.address.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(polo)}
                      disabled={saving}
                      title={polo.isActive ? 'Desativar polo' : 'Ativar polo'}
                    >
                      {polo.isActive ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(polo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeletePolo(polo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {(polo.address?.phone || polo.address?.email) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Contato:</p>
                    {polo.address?.phone && (
                      <p className="text-sm text-gray-600">Telefone: {polo.address.phone}</p>
                    )}
                    {polo.address?.email && (
                      <p className="text-sm text-gray-600">E-mail: {polo.address.email}</p>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PoloManagementPage;
