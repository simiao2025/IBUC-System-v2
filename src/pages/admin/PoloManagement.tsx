import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Polo, Level, LEVELS } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  User,
  Users,
  CheckCircle
} from 'lucide-react';

const PoloManagement: React.FC = () => {
  const { polos, addPolo, updatePolo, deletePolo } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingPolo, setEditingPolo] = useState<Polo | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: 'TO',
    cep: '',
    pastor: '',
    coordinatorName: '',
    coordinatorCpf: '',
    teachers: '',
    assistants: '',
    cafeteriaWorkers: '',
    availableLevels: [] as Level[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLevelChange = (level: Level) => {
    setFormData(prev => ({
      ...prev,
      availableLevels: prev.availableLevels.includes(level)
        ? prev.availableLevels.filter(l => l !== level)
        : [...prev.availableLevels, level]
    }));
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
    if (!formData.pastor) newErrors.pastor = 'Nome do pastor é obrigatório';
    if (!formData.coordinatorName) newErrors.coordinatorName = 'Nome do coordenador é obrigatório';
    if (!formData.coordinatorCpf) newErrors.coordinatorCpf = 'CPF do coordenador é obrigatório';
    if (!formData.teachers) newErrors.teachers = 'Pelo menos um professor é obrigatório';
    if (formData.availableLevels.length === 0) newErrors.availableLevels = 'Pelo menos um nível deve ser selecionado';

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
      pastor: '',
      coordinatorName: '',
      coordinatorCpf: '',
      teachers: '',
      assistants: '',
      cafeteriaWorkers: '',
      availableLevels: []
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
      pastor: polo.pastor,
      coordinatorName: polo.coordinator.name,
      coordinatorCpf: polo.coordinator.cpf,
      teachers: polo.teachers.join(', '),
      assistants: polo.assistants?.join(', ') || '',
      cafeteriaWorkers: polo.cafeteriaWorkers?.join(', ') || '',
      availableLevels: polo.availableLevels
    });
    setEditingPolo(polo);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const poloData: Polo = {
      id: editingPolo?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name,
      address: {
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        cep: formData.cep,
      },
      pastor: formData.pastor,
      coordinator: {
        name: formData.coordinatorName,
        cpf: formData.coordinatorCpf,
      },
      teachers: formData.teachers.split(',').map(t => t.trim()).filter(t => t),
      assistants: formData.assistants ? formData.assistants.split(',').map(t => t.trim()).filter(t => t) : undefined,
      cafeteriaWorkers: formData.cafeteriaWorkers ? formData.cafeteriaWorkers.split(',').map(t => t.trim()).filter(t => t) : undefined,
      availableLevels: formData.availableLevels,
    };

    if (editingPolo) {
      updatePolo(editingPolo.id, poloData);
    } else {
      addPolo(poloData);
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este polo?')) {
      deletePolo(id);
    }
  };

  const stateOptions = [
    { value: 'TO', label: 'Tocantins' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    // Add more states as needed
  ];

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
                  onChange={handleInputChange}
                  options={stateOptions}
                  error={errors.state}
                  required
                />
              </div>
            </Card>

            {/* Staff */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Equipe</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Pastor Responsável"
                  name="pastor"
                  value={formData.pastor}
                  onChange={handleInputChange}
                  error={errors.pastor}
                  required
                />
                
                <Input
                  label="Nome do Coordenador"
                  name="coordinatorName"
                  value={formData.coordinatorName}
                  onChange={handleInputChange}
                  error={errors.coordinatorName}
                  required
                />
                
                <Input
                  label="CPF do Coordenador"
                  name="coordinatorCpf"
                  value={formData.coordinatorCpf}
                  onChange={handleInputChange}
                  error={errors.coordinatorCpf}
                  required
                />
                
                <Input
                  label="Professores"
                  name="teachers"
                  value={formData.teachers}
                  onChange={handleInputChange}
                  error={errors.teachers}
                  helperText="Separar nomes por vírgula"
                  required
                />
                
                <Input
                  label="Auxiliares"
                  name="assistants"
                  value={formData.assistants}
                  onChange={handleInputChange}
                  error={errors.assistants}
                  helperText="Separar nomes por vírgula (opcional)"
                />
                
                <Input
                  label="Merendeiras"
                  name="cafeteriaWorkers"
                  value={formData.cafeteriaWorkers}
                  onChange={handleInputChange}
                  error={errors.cafeteriaWorkers}
                  helperText="Separar nomes por vírgula (opcional)"
                />
              </div>
            </Card>

            {/* Available Levels */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Níveis Disponíveis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.entries(LEVELS) as [Level, string][]).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.availableLevels.includes(key)}
                      onChange={() => handleLevelChange(key)}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{value}</p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.availableLevels && (
                <p className="mt-2 text-sm text-red-600">{errors.availableLevels}</p>
              )}
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingPolo ? 'Atualizar Polo' : 'Cadastrar Polo'}
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
                      <h3 className="text-lg font-semibold text-gray-900">{polo.name}</h3>
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
                      onClick={() => handleEdit(polo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(polo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Pastor: {polo.pastor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Coordenador: {polo.coordinator.name}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Professores:</p>
                      <p className="text-sm text-gray-900">{polo.teachers.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Níveis disponíveis:</p>
                  <div className="flex flex-wrap gap-1">
                    {polo.availableLevels.map(level => (
                      <span key={level} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {LEVELS[level]}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PoloManagement;