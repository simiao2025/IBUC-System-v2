import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  ArrowLeft,
  Crown,
  UserCheck,
  FileText,
  Save,
  Edit2,
  Phone,
  Mail,
  User,
  Shield
} from 'lucide-react';

interface DirectoratePosition {
  id: string;
  name: string;
  phone: string;
  email: string;
  position: 'diretor_geral' | 'coordenador_geral' | 'secretario_geral';
  startDate: string;
  isActive: boolean;
}

const DirectorateManagement: React.FC = () => {
  const [directorate, setDirectorate] = useState<DirectoratePosition[]>([
    {
      id: '1',
      name: 'Dr. João Silva',
      phone: '(63) 99999-9999',
      email: 'joao.silva@ibuc.org.br',
      position: 'diretor_geral',
      startDate: '2024-01-01',
      isActive: true
    },
    {
      id: '2',
      name: 'Ana Costa',
      phone: '(63) 98888-8888',
      email: 'ana.costa@ibuc.org.br',
      position: 'coordenador_geral',
      startDate: '2024-01-01',
      isActive: true
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState<DirectoratePosition | null>(null);
  const [formData, setFormData] = useState<Partial<DirectoratePosition>>({
    name: '',
    phone: '',
    email: '',
    position: 'secretario_geral',
    startDate: new Date().toISOString().split('T')[0],
    isActive: true
  });

  const positionLabels = {
    diretor_geral: 'Diretor Geral',
    coordenador_geral: 'Coordenador Geral',
    secretario_geral: 'Secretário Geral'
  };

  const positionIcons = {
    diretor_geral: Crown,
    coordenador_geral: UserCheck,
    secretario_geral: FileText
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email || !formData.position) return;

    if (editingPosition) {
      // Update existing position
      setDirectorate(prev => prev.map(pos => 
        pos.id === editingPosition.id 
          ? { ...editingPosition, ...formData } as DirectoratePosition
          : pos
      ));
      setEditingPosition(null);
    } else {
      // Add new position
      const newPosition: DirectoratePosition = {
        id: Date.now().toString(),
        name: formData.name!,
        phone: formData.phone!,
        email: formData.email!,
        position: formData.position as DirectoratePosition['position'],
        startDate: formData.startDate!,
        isActive: true
      };
      setDirectorate(prev => [...prev, newPosition]);
    }

    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      position: 'secretario_geral',
      startDate: new Date().toISOString().split('T')[0],
      isActive: true
    });
    setShowForm(false);
  };

  const handleEdit = (position: DirectoratePosition) => {
    setEditingPosition(position);
    setFormData(position);
    setShowForm(true);
  };

  const toggleStatus = (positionId: string) => {
    setDirectorate(prev => prev.map(pos => 
      pos.id === positionId 
        ? { ...pos, isActive: !pos.isActive }
        : pos
    ));
  };

  const getPositionByType = (positionType: DirectoratePosition['position']) => {
    return directorate.find(pos => pos.position === positionType && pos.isActive);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Diretoria Geral</h1>
                <p className="text-sm text-gray-600">Cadastro e gestão da diretoria executiva do IBUC</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Crown className="h-4 w-4 mr-2" />
              Adicionar Cargo
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Organizational Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Diretor Geral */}
          <Card className="text-center bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="p-6">
              <Crown className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-red-800 mb-4">Diretor Geral</h3>
              
              {getPositionByType('diretor_geral') ? (
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {getPositionByType('diretor_geral')!.name}
                      </h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(getPositionByType('diretor_geral')!)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-2" />
                        {getPositionByType('diretor_geral')!.phone}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-2" />
                        {getPositionByType('diretor_geral')!.email}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p className="mb-4">Cargo vago</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setFormData({ ...formData, position: 'diretor_geral' });
                      setShowForm(true);
                    }}
                  >
                    Nomear Diretor
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Coordenador Geral */}
          <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="p-6">
              <UserCheck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-blue-800 mb-4">Coordenador Geral</h3>
              
              {getPositionByType('coordenador_geral') ? (
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {getPositionByType('coordenador_geral')!.name}
                      </h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(getPositionByType('coordenador_geral')!)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-2" />
                        {getPositionByType('coordenador_geral')!.phone}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-2" />
                        {getPositionByType('coordenador_geral')!.email}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p className="mb-4">Cargo vago</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setFormData({ ...formData, position: 'coordenador_geral' });
                      setShowForm(true);
                    }}
                  >
                    Nomear Coordenador
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Secretário Geral */}
          <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="p-6">
              <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-green-800 mb-4">Secretário Geral</h3>
              
              {getPositionByType('secretario_geral') ? (
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {getPositionByType('secretario_geral')!.name}
                      </h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(getPositionByType('secretario_geral')!)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-2" />
                        {getPositionByType('secretario_geral')!.phone}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-2" />
                        {getPositionByType('secretario_geral')!.email}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p className="mb-4">Cargo vago</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setFormData({ ...formData, position: 'secretario_geral' });
                      setShowForm(true);
                    }}
                  >
                    Nomear Secretário
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Historical Record */}
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Histórico da Diretoria</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Início
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {directorate.map((position) => {
                  const Icon = positionIcons[position.position];
                  return (
                    <tr key={position.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {position.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {position.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {positionLabels[position.position]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {position.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(position.startDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          position.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {position.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(position)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(position.id)}
                        >
                          {position.isActive ? 'Desativar' : 'Ativar'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingPosition ? 'Editar Cargo' : 'Novo Cargo da Diretoria'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Nome Completo"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                />
                
                <Input
                  label="Telefone"
                  name="phone"
                  type="tel"
                  placeholder="(63) 99999-9999"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  required
                />
                
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="email@ibuc.org.br"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo
                  </label>
                  <select
                    name="position"
                    value={formData.position || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    {Object.entries(positionLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                
                <Input
                  label="Data de Início"
                  name="startDate"
                  type="date"
                  value={formData.startDate || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingPosition ? 'Salvar Alterações' : 'Adicionar Cargo'}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingPosition(null);
                    setFormData({
                      name: '',
                      phone: '',
                      email: '',
                      position: 'secretario_geral',
                      startDate: new Date().toISOString().split('T')[0],
                      isActive: true
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DirectorateManagement;
