import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Level, LEVELS } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  User,
  Users,
  Phone,
  Mail,
  Home,
  School,
  UserCheck,
  FileText,
  Calendar,
  CheckCircle,
  X
} from 'lucide-react';

interface EnhancedPolo {
  id: string;
  name: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  phone: string;
  pastor: string;
  director: {
    name: string;
    phone: string;
    email: string;
  } | null;
  coordinator: {
    name: string;
    phone: string;
    email: string;
  };
  professors: Array<{
    id: string;
    name: string;
    phone: string;
    email: string;
    levels: Level[];
  }>;
  assistants: Array<{
    id: string;
    name: string;
    phone: string;
    email: string;
    levels: Level[];
  }>;
  availableLevels: Level[];
  isActive: boolean;
  createdAt: string;
}

const EnhancedPoloManagement: React.FC = () => {
  const [polos, setPolos] = useState<EnhancedPolo[]>([
    {
      id: '1',
      name: 'Igreja Central - Palmas',
      address: {
        street: 'Rua das Flores',
        number: '100',
        neighborhood: 'Centro',
        city: 'Palmas',
        state: 'TO',
        cep: '77000-000'
      },
      phone: '(63) 3215-9999',
      pastor: 'Pastor João Silva',
      director: {
        name: 'Ana Costa',
        phone: '(63) 99999-1111',
        email: 'ana.costa@ibuc.org.br'
      },
      coordinator: {
        name: 'Maria Santos',
        phone: '(63) 99999-2222',
        email: 'maria.santos@ibuc.org.br'
      },
      professors: [
        {
          id: 'p1',
          name: 'Pedro Lima',
          phone: '(63) 99999-3333',
          email: 'pedro.lima@ibuc.org.br',
          levels: ['NIVEL_I', 'NIVEL_II']
        }
      ],
      assistants: [
        {
          id: 'a1',
          name: 'Carlos Oliveira',
          phone: '(63) 99999-4444',
          email: 'carlos.oliveira@ibuc.org.br',
          levels: ['NIVEL_I']
        }
      ],
      availableLevels: ['NIVEL_I', 'NIVEL_II', 'NIVEL_III', 'NIVEL_IV'],
      isActive: true,
      createdAt: '2024-01-01'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingPolo, setEditingPolo] = useState<EnhancedPolo | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<Partial<EnhancedPolo>>({
    name: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: 'TO',
      cep: ''
    },
    phone: '',
    pastor: '',
    director: null,
    coordinator: {
      name: '',
      phone: '',
      email: ''
    },
    professors: [],
    assistants: [],
    availableLevels: [],
    isActive: true,
    createdAt: new Date().toISOString().split('T')[0]
  });

  const [newProfessor, setNewProfessor] = useState({
    name: '',
    phone: '',
    email: '',
    levels: [] as Level[]
  });

  const [newAssistant, setNewAssistant] = useState({
    name: '',
    phone: '',
    email: '',
    levels: [] as Level[]
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: 'TO',
        cep: ''
      },
      phone: '',
      pastor: '',
      director: null,
      coordinator: {
        name: '',
        phone: '',
        email: ''
      },
      professors: [],
      assistants: [],
      availableLevels: [],
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    });
    setCurrentStep(1);
    setEditingPolo(null);
    setShowForm(false);
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleLevelToggle = (level: Level, type: 'available' | 'professor' | 'assistant') => {
    if (type === 'available') {
      const currentLevels = formData.availableLevels || [];
      const newLevels = currentLevels.includes(level)
        ? currentLevels.filter(l => l !== level)
        : [...currentLevels, level];
      setFormData(prev => ({ ...prev, availableLevels: newLevels }));
    } else if (type === 'professor') {
      const currentLevels = newProfessor.levels;
      const newLevels = currentLevels.includes(level)
        ? currentLevels.filter(l => l !== level)
        : [...currentLevels, level];
      setNewProfessor(prev => ({ ...prev, levels: newLevels }));
    } else if (type === 'assistant') {
      const currentLevels = newAssistant.levels;
      const newLevels = currentLevels.includes(level)
        ? currentLevels.filter(l => l !== level)
        : [...currentLevels, level];
      setNewAssistant(prev => ({ ...prev, levels: newLevels }));
    }
  };

  const addProfessor = () => {
    if (newProfessor.name && newProfessor.phone && newProfessor.email) {
      const professor = {
        id: Date.now().toString(),
        ...newProfessor
      };
      setFormData(prev => ({
        ...prev,
        professors: [...(prev.professors || []), professor]
      }));
      setNewProfessor({ name: '', phone: '', email: '', levels: [] });
    }
  };

  const addAssistant = () => {
    if (newAssistant.name && newAssistant.phone && newAssistant.email) {
      const assistant = {
        id: Date.now().toString(),
        ...newAssistant
      };
      setFormData(prev => ({
        ...prev,
        assistants: [...(prev.assistants || []), assistant]
      }));
      setNewAssistant({ name: '', phone: '', email: '', levels: [] });
    }
  };

  const removeProfessor = (id: string) => {
    setFormData(prev => ({
      ...prev,
      professors: (prev.professors || []).filter(p => p.id !== id)
    }));
  };

  const removeAssistant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      assistants: (prev.assistants || []).filter(a => a.id !== id)
    }));
  };

  const handleSubmit = () => {
    if (editingPolo) {
      setPolos(prev => prev.map(polo => 
        polo.id === editingPolo.id ? { ...editingPolo, ...formData } as EnhancedPolo : polo
      ));
    } else {
      const newPolo: EnhancedPolo = {
        id: Date.now().toString(),
        ...formData
      } as EnhancedPolo;
      setPolos(prev => [...prev, newPolo]);
    }
    resetForm();
  };

  const handleEdit = (polo: EnhancedPolo) => {
    setEditingPolo(polo);
    setFormData(polo);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este polo?')) {
      setPolos(prev => prev.filter(polo => polo.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setPolos(prev => prev.map(polo => 
      polo.id === id ? { ...polo, isActive: !polo.isActive } : polo
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Polos</h1>
              <p className="text-sm text-gray-600">Cadastro e gestão completa dos polos/congregações</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Polo
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Polos List */}
        <div className="grid gap-6">
          {polos.map((polo) => (
            <Card key={polo.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-4">
                    <Home className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900">{polo.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      polo.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {polo.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Basic Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                        Informações Básicas
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Endereço:</strong> {polo.address.street}, {polo.address.number}</p>
                        <p>{polo.address.neighborhood} - {polo.address.city}/{polo.address.state}</p>
                        <p><strong>CEP:</strong> {polo.address.cep}</p>
                        <p><strong>Telefone:</strong> {polo.phone}</p>
                        <p><strong>Pastor:</strong> {polo.pastor}</p>
                      </div>
                    </div>

                    {/* Leadership */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-green-600" />
                        Liderança
                      </h4>
                      <div className="space-y-2 text-sm">
                        {polo.director && (
                          <div className="bg-red-50 p-2 rounded">
                            <p className="font-medium text-red-800">Diretor:</p>
                            <p className="text-red-700">{polo.director.name}</p>
                            <p className="text-red-600 text-xs">{polo.director.phone} | {polo.director.email}</p>
                          </div>
                        )}
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="font-medium text-blue-800">Coordenador:</p>
                          <p className="text-blue-700">{polo.coordinator.name}</p>
                          <p className="text-blue-600 text-xs">{polo.coordinator.phone} | {polo.coordinator.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Team */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <School className="h-4 w-4 mr-2 text-purple-600" />
                        Equipe Pedagógica
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Professores ({polo.professors.length}):</p>
                          {polo.professors.map(prof => (
                            <div key={prof.id} className="bg-green-50 p-2 rounded mb-1">
                              <p className="text-green-800">{prof.name}</p>
                              <p className="text-green-600 text-xs">
                                Níveis: {prof.levels.map(l => LEVELS[l]).join(', ')}
                              </p>
                            </div>
                          ))}
                        </div>
                        
                        {polo.assistants.length > 0 && (
                          <div>
                            <p className="font-medium text-gray-700">Auxiliares ({polo.assistants.length}):</p>
                            {polo.assistants.map(assist => (
                              <div key={assist.id} className="bg-yellow-50 p-2 rounded mb-1">
                                <p className="text-yellow-800">{assist.name}</p>
                                <p className="text-yellow-600 text-xs">
                                  Níveis: {assist.levels.map(l => LEVELS[l]).join(', ')}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Níveis Disponíveis:</strong>
                      <span className="ml-2">
                        {polo.availableLevels.map(level => (
                          <span key={level} className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full mr-1">
                            {LEVELS[level]}
                          </span>
                        ))}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatus(polo.id)}
                  >
                    {polo.isActive ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(polo)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(polo.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPolo ? 'Editar Polo' : 'Novo Polo'}
              </h2>
              <Button variant="outline" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep >= step 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <div className="mb-4 text-center">
              <span className="text-sm text-gray-600">
                {currentStep === 1 && 'Informações Básicas'}
                {currentStep === 2 && 'Liderança'}
                {currentStep === 3 && 'Equipe Pedagógica'}
                {currentStep === 4 && 'Revisão e Finalização'}
              </span>
            </div>

            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Nome do Polo/Congregação"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <Input
                    label="Rua"
                    value={formData.address?.street || ''}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    required
                  />
                  
                  <Input
                    label="Número"
                    value={formData.address?.number || ''}
                    onChange={(e) => handleInputChange('address.number', e.target.value)}
                    required
                  />
                  
                  <Input
                    label="Bairro"
                    value={formData.address?.neighborhood || ''}
                    onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                    required
                  />
                  
                  <Input
                    label="Cidade"
                    value={formData.address?.city || ''}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    required
                  />
                  
                  <Input
                    label="Estado"
                    value={formData.address?.state || ''}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    required
                  />
                  
                  <Input
                    label="CEP"
                    value={formData.address?.cep || ''}
                    onChange={(e) => handleInputChange('address.cep', e.target.value)}
                    required
                  />
                  
                  <Input
                    label="Telefone"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                  
                  <div className="md:col-span-2">
                    <Input
                      label="Pastor Responsável"
                      value={formData.pastor || ''}
                      onChange={(e) => handleInputChange('pastor', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Leadership */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Coordenador (Obrigatório)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Nome"
                      value={formData.coordinator?.name || ''}
                      onChange={(e) => handleInputChange('coordinator.name', e.target.value)}
                      required
                    />
                    <Input
                      label="Telefone"
                      value={formData.coordinator?.phone || ''}
                      onChange={(e) => handleInputChange('coordinator.phone', e.target.value)}
                      required
                    />
                    <Input
                      label="Email"
                      value={formData.coordinator?.email || ''}
                      onChange={(e) => handleInputChange('coordinator.email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Diretor (Opcional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Nome"
                      value={formData.director?.name || ''}
                      onChange={(e) => handleInputChange('director.name', e.target.value)}
                    />
                    <Input
                      label="Telefone"
                      value={formData.director?.phone || ''}
                      onChange={(e) => handleInputChange('director.phone', e.target.value)}
                    />
                    <Input
                      label="Email"
                      value={formData.director?.email || ''}
                      onChange={(e) => handleInputChange('director.email', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Teaching Staff */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Available Levels */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Níveis Disponíveis neste Polo</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(LEVELS).map(([key, label]) => (
                      <label key={key} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(formData.availableLevels || []).includes(key as Level)}
                          onChange={() => handleLevelToggle(key as Level, 'available')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Professors */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Professores</h3>
                  
                  {/* Add Professor Form */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-3">Adicionar Professor</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <Input
                        label="Nome"
                        value={newProfessor.name}
                        onChange={(e) => setNewProfessor(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <Input
                        label="Telefone"
                        value={newProfessor.phone}
                        onChange={(e) => setNewProfessor(prev => ({ ...prev, phone: e.target.value }))}
                      />
                      <Input
                        label="Email"
                        value={newProfessor.email}
                        onChange={(e) => setNewProfessor(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Níveis que leciona:
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(LEVELS).map(([key, label]) => (
                          <label key={key} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newProfessor.levels.includes(key as Level)}
                              onChange={() => handleLevelToggle(key as Level, 'professor')}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <Button size="sm" onClick={addProfessor}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Professor
                    </Button>
                  </div>

                  {/* Professors List */}
                  <div className="space-y-2">
                    {(formData.professors || []).map((professor) => (
                      <div key={professor.id} className="flex items-center justify-between bg-green-50 p-3 rounded">
                        <div>
                          <p className="font-medium">{professor.name}</p>
                          <p className="text-sm text-gray-600">{professor.phone} | {professor.email}</p>
                          <p className="text-sm text-green-600">
                            Níveis: {professor.levels.map(l => LEVELS[l]).join(', ')}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeProfessor(professor.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assistants */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Auxiliares</h3>
                  
                  {/* Add Assistant Form */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-3">Adicionar Auxiliar</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <Input
                        label="Nome"
                        value={newAssistant.name}
                        onChange={(e) => setNewAssistant(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <Input
                        label="Telefone"
                        value={newAssistant.phone}
                        onChange={(e) => setNewAssistant(prev => ({ ...prev, phone: e.target.value }))}
                      />
                      <Input
                        label="Email"
                        value={newAssistant.email}
                        onChange={(e) => setNewAssistant(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Níveis que auxilia:
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(LEVELS).map(([key, label]) => (
                          <label key={key} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newAssistant.levels.includes(key as Level)}
                              onChange={() => handleLevelToggle(key as Level, 'assistant')}
                              className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                            />
                            <span className="text-sm">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <Button size="sm" onClick={addAssistant}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Auxiliar
                    </Button>
                  </div>

                  {/* Assistants List */}
                  <div className="space-y-2">
                    {(formData.assistants || []).map((assistant) => (
                      <div key={assistant.id} className="flex items-center justify-between bg-yellow-50 p-3 rounded">
                        <div>
                          <p className="font-medium">{assistant.name}</p>
                          <p className="text-sm text-gray-600">{assistant.phone} | {assistant.email}</p>
                          <p className="text-sm text-yellow-600">
                            Níveis: {assistant.levels.map(l => LEVELS[l]).join(', ')}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeAssistant(assistant.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Revisão dos Dados</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Informações Básicas</h4>
                  <p><strong>Nome:</strong> {formData.name}</p>
                  <p><strong>Endereço:</strong> {formData.address?.street}, {formData.address?.number} - {formData.address?.neighborhood}</p>
                  <p><strong>Cidade:</strong> {formData.address?.city}/{formData.address?.state} - {formData.address?.cep}</p>
                  <p><strong>Telefone:</strong> {formData.phone}</p>
                  <p><strong>Pastor:</strong> {formData.pastor}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Liderança</h4>
                  <p><strong>Coordenador:</strong> {formData.coordinator?.name} - {formData.coordinator?.phone}</p>
                  {formData.director?.name && (
                    <p><strong>Diretor:</strong> {formData.director.name} - {formData.director.phone}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Equipe Pedagógica</h4>
                  <p><strong>Professores:</strong> {(formData.professors || []).length}</p>
                  <p><strong>Auxiliares:</strong> {(formData.assistants || []).length}</p>
                  <p><strong>Níveis Disponíveis:</strong> {(formData.availableLevels || []).map(l => LEVELS[l]).join(', ')}</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                >
                  Próximo
                </Button>
              ) : (
                <Button onClick={handleSubmit}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {editingPolo ? 'Salvar Alterações' : 'Criar Polo'}
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedPoloManagement;
