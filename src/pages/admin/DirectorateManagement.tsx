import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { DiretoriaService } from '../../services/diretoria.service';
import { useApp } from '../../context/AppContext';
import type { Database } from '../../types/database';
import {
  ArrowLeft,
  Crown,
  UserCheck,
  FileText,
  Save,
  Edit2,
  Phone,
  Mail,
  Shield,
  Loader2
} from 'lucide-react';

interface DirectoratePosition {
  id: string;
  nome_completo: string;
  telefone?: string;
  email: string;
  cargo: 'diretor' | 'vice_diretor' | 'coordenador' | 'vice_coordenador' | 'secretario' | 'tesoureiro';
  data_inicio: string;
  data_fim?: string;
  status: 'ativa' | 'inativa' | 'suspensa';
  usuario_id?: string;
  polo_id?: string;
  polo_nome?: string;
}

type DiretoriaGeralRow = Database['public']['Tables']['diretoria_geral']['Row'];
type DiretoriaPoloRow = Database['public']['Tables']['diretoria_polo']['Row'];

type DiretoriaPoloApiRow = DiretoriaPoloRow & {
  polo?: { id: string; nome: string; codigo?: string } | null;
  usuario?: { id: string; nome_completo: string; email: string; role: string } | null;
};

const cargoOptions = [
  { value: 'diretor_geral', label: 'Diretor Geral' },
  { value: 'coordenador_geral', label: 'Coordenador Geral' },
  { value: 'secretario_geral', label: 'Secretário Geral' },
  { value: 'tesoureiro_geral', label: 'Tesoureiro Geral' },
] as const;

type CargoFrontend = (typeof cargoOptions)[number]['value'];

// Mapeamento de cargos do frontend para o backend
const cargoMapping: Record<string, 'diretor' | 'coordenador' | 'secretario' | 'tesoureiro'> = {
  diretor_geral: 'diretor',
  coordenador_geral: 'coordenador',
  secretario_geral: 'secretario',
  tesoureiro_geral: 'tesoureiro',
};

const reverseCargoMapping: Record<string, string> = {
  diretor: 'diretor_geral',
  coordenador: 'coordenador_geral',
  secretario: 'secretario_geral',
  tesoureiro: 'tesoureiro_geral',
};

const DirectorateManagement: React.FC = () => {
  const { polos, currentUser } = useApp();
  const [directorate, setDirectorate] = useState<DirectoratePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState<DirectoratePosition | null>(null);
  const [directorateMode, setDirectorateMode] = useState<'geral' | 'polo'>('geral');
  const [selectedPoloId, setSelectedPoloId] = useState<string>('');
  const [formData, setFormData] = useState({
    nome_completo: '',
    telefone: '',
    email: '',
    cargo: 'secretario_geral' as string,
    data_inicio: new Date().toISOString().split('T')[0],
    usuario_id: '', // Será preenchido ao buscar/criar usuário
  });

  // Carregar diretorias ao montar o componente
  useEffect(() => {
    void carregarDiretorias();
  }, []);

  useEffect(() => {
    void carregarDiretorias();
  }, [directorateMode, selectedPoloId]);

  const isDiretorGeral = currentUser?.adminUser?.role === 'diretor_geral';

  const carregarDiretorias = async () => {
    try {
      setLoading(true);

      if (directorateMode === 'polo') {
        if (!selectedPoloId) {
          setDirectorate([]);
          return;
        }
        const data = await DiretoriaService.listarDiretoriaPolo(selectedPoloId, true);
        const formattedData = (data as DiretoriaPoloApiRow[]).map((item) => ({
          id: item.id,
          nome_completo: item.nome_completo,
          telefone: item.telefone || undefined,
          email: item.email,
          cargo: item.cargo,
          data_inicio: item.data_inicio,
          data_fim: item.data_fim || undefined,
          status: item.status,
          usuario_id: item.usuario_id,
          polo_id: item.polo_id,
          polo_nome: item.polo?.nome || undefined,
        }));
        setDirectorate(formattedData);
        return;
      }

      const data = await DiretoriaService.listarDiretoriaGeral(true);
      const formattedData = (data as DiretoriaGeralRow[]).map((item) => ({
        id: item.id,
        nome_completo: item.nome_completo,
        telefone: item.telefone,
        email: item.email,
        cargo: item.cargo,
        data_inicio: item.data_inicio,
        data_fim: item.data_fim,
        status: item.status,
        usuario_id: item.usuario_id
      }));
      setDirectorate(formattedData);
    } catch (error: unknown) {
      console.error('Erro ao carregar diretorias:', error);
      alert('Erro ao carregar diretorias. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const positionLabels: Record<string, string> = {
    diretor_geral: 'Diretor Geral',
    coordenador_geral: 'Coordenador Geral',
    secretario_geral: 'Secretário Geral',
    tesoureiro_geral: 'Tesoureiro Geral',
    diretor: 'Diretor Geral',
    coordenador: 'Coordenador Geral',
    secretario: 'Secretário Geral',
    tesoureiro: 'Tesoureiro Geral',
  };

  const positionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    diretor_geral: Crown,
    coordenador_geral: UserCheck,
    secretario_geral: FileText,
    tesoureiro_geral: Shield,
    diretor: Crown,
    coordenador: UserCheck,
    secretario: FileText,
    tesoureiro: Shield,
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_completo || !formData.email || !formData.cargo) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (directorateMode === 'polo' && !selectedPoloId) {
      alert('Selecione um polo para cadastrar a diretoria do polo.');
      return;
    }

    if (directorateMode === 'polo' && !isDiretorGeral) {
      alert('Apenas o Diretor Geral pode cadastrar/alterar Diretor e Coordenador dos polos.');
      return;
    }

    try {
      setSaving(true);

      // Mapear cargo do frontend para o backend
      const cargoBackend = cargoMapping[formData.cargo] || formData.cargo;

      if (editingPosition) {
        if (directorateMode === 'polo') {
          await DiretoriaService.atualizarDiretoriaPolo(editingPosition.id, {
            nome_completo: formData.nome_completo,
            telefone: formData.telefone,
            email: formData.email,
            cargo: cargoBackend,
            data_inicio: formData.data_inicio,
          });
        } else {
          await DiretoriaService.atualizarDiretoriaGeral(editingPosition.id, {
            nome_completo: formData.nome_completo,
            telefone: formData.telefone,
            email: formData.email,
            cargo: cargoBackend,
            data_inicio: formData.data_inicio,
          });
        }

        alert('Diretoria atualizada com sucesso!');
      } else {
        if (directorateMode === 'polo') {
          await DiretoriaService.criarDiretoriaPolo({
            polo_id: selectedPoloId,
            usuario_id: formData.usuario_id || undefined,
            cargo: cargoBackend,
            nome_completo: formData.nome_completo,
            telefone: formData.telefone,
            email: formData.email,
            data_inicio: formData.data_inicio,
          });
        } else {
          await DiretoriaService.criarDiretoriaGeral({
            usuario_id: formData.usuario_id || undefined,
            cargo: cargoBackend,
            nome_completo: formData.nome_completo,
            telefone: formData.telefone,
            email: formData.email,
            data_inicio: formData.data_inicio,
          });
        }
        alert('Diretoria criada com sucesso!');
      }

      // Recarregar lista
      await carregarDiretorias();

      // Reset form
      setFormData({
        nome_completo: '',
        telefone: '',
        email: '',
        cargo: directorateMode === 'polo' ? 'diretor' : 'secretario_geral',
        data_inicio: new Date().toISOString().split('T')[0],
        usuario_id: '',
      });
      setShowForm(false);
      setEditingPosition(null);
    } catch (error: unknown) {
      console.error('Erro ao salvar diretoria:', error);
      const message = error instanceof Error ? error.message : 'Erro ao salvar diretoria. Verifique o console.';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (position: DirectoratePosition) => {
    if (directorateMode === 'polo' && !isDiretorGeral) {
      alert('Apenas o Diretor Geral pode editar cargos da diretoria do polo.');
      return;
    }
    setEditingPosition(position);
    // Mapear cargo do backend para o frontend
    const cargoFrontend = (reverseCargoMapping[position.cargo] || position.cargo) as string;
    setFormData({
      nome_completo: position.nome_completo,
      telefone: position.telefone || '',
      email: position.email,
      cargo: cargoFrontend,
      data_inicio: position.data_inicio,
      usuario_id: position.usuario_id || '',
    });
    setShowForm(true);
  };

  const toggleStatus = async (positionId: string) => {
    try {
      const position = directorate.find(p => p.id === positionId);
      if (!position) return;

      if (directorateMode === 'polo' && !isDiretorGeral) {
        alert('Apenas o Diretor Geral pode ativar/desativar cargos da diretoria do polo.');
        return;
      }

      const newStatus = position.status === 'ativa' ? 'inativa' : 'ativa';

      if (directorateMode === 'polo') {
        await DiretoriaService.atualizarDiretoriaPolo(positionId, { status: newStatus });
      } else {
        await DiretoriaService.atualizarDiretoriaGeral(positionId, { status: newStatus });
      }
      alert(`Diretoria ${newStatus === 'ativa' ? 'ativada' : 'desativada'} com sucesso!`);
      await carregarDiretorias();
    } catch (error: unknown) {
      console.error('Erro ao alterar status:', error);
      const message = error instanceof Error ? error.message : 'Erro ao alterar status. Verifique o console.';
      alert(message);
    }
  };

  const getPositionByType = (positionType: string) => {
    // Mapear do frontend para o backend
    const cargoBackend = cargoMapping[positionType] || positionType;
    return directorate.find(pos => pos.cargo === cargoBackend && pos.status === 'ativa');
  };

  const currentCargoOptions = directorateMode === 'polo'
    ? [
        { value: 'diretor', label: 'Diretor do Polo' },
        { value: 'coordenador', label: 'Coordenador do Polo' },
      ]
    : cargoOptions;

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
                <h1 className="text-2xl font-bold text-gray-900">
                  {directorateMode === 'polo' ? 'Diretoria do Polo' : 'Diretoria Geral'}
                </h1>
                <p className="text-sm text-gray-600">
                  {directorateMode === 'polo'
                    ? 'Cadastro e gestão da liderança dos polos (Diretor/Coordenador)'
                    : 'Cadastro e gestão da diretoria executiva do IBUC'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={directorateMode}
                onChange={(e) => {
                  const value = e.target.value as 'geral' | 'polo';
                  setDirectorateMode(value);
                  setEditingPosition(null);
                  setShowForm(false);
                  if (value === 'polo') {
                    setFormData(prev => ({ ...prev, cargo: 'diretor' }));
                  } else {
                    setFormData(prev => ({ ...prev, cargo: 'secretario_geral' }));
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="geral">Diretoria Geral</option>
                <option value="polo">Diretoria do Polo</option>
              </select>

              {directorateMode === 'polo' && (
                <select
                  value={selectedPoloId}
                  onChange={(e) => setSelectedPoloId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Selecione um polo</option>
                  {polos.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}

              <Button
                onClick={() => {
                  if (directorateMode === 'polo' && !isDiretorGeral) {
                    alert('Apenas o Diretor Geral pode adicionar cargos na diretoria do polo.');
                    return;
                  }
                  setShowForm(true);
                }}
                disabled={directorateMode === 'polo' && !selectedPoloId}
              >
                <Crown className="h-4 w-4 mr-2" />
                Adicionar Cargo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <span className="ml-2 text-gray-600">Carregando diretorias...</span>
          </div>
        ) : (
          <>
        {/* Organizational Chart */}
        {directorateMode === 'geral' && (
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
                        {getPositionByType('diretor_geral')!.nome_completo}
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
                      {getPositionByType('diretor_geral')!.telefone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-2" />
                          {getPositionByType('diretor_geral')!.telefone}
                        </div>
                      )}
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
                      setFormData({ ...formData, cargo: 'diretor_geral' });
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
                        {getPositionByType('coordenador_geral')!.nome_completo}
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
                      {getPositionByType('coordenador_geral')!.telefone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-2" />
                          {getPositionByType('coordenador_geral')!.telefone}
                        </div>
                      )}
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
                      setFormData({ ...formData, cargo: 'coordenador_geral' });
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
                        {getPositionByType('secretario_geral')!.nome_completo}
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
                      {getPositionByType('secretario_geral')!.telefone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-2" />
                          {getPositionByType('secretario_geral')!.telefone}
                        </div>
                      )}
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
                      setFormData({ ...formData, cargo: 'secretario_geral' });
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

        )}

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
                  {directorateMode === 'polo' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Polo
                    </th>
                  )}
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
                  const cargoKey = directorateMode === 'polo'
                    ? position.cargo
                    : (reverseCargoMapping[position.cargo] || position.cargo);
                  const Icon = positionIcons[cargoKey] || FileText;
                  return (
                    <tr key={position.id}>
                      {directorateMode === 'polo' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {position.polo_nome || '-'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {position.nome_completo}
                            </div>
                            <div className="text-sm text-gray-500">
                              {position.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {positionLabels[cargoKey] || positionLabels[position.cargo]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {position.telefone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(position.data_inicio).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          position.status === 'ativa'
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {position.status === 'ativa' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(position)}
                          disabled={directorateMode === 'polo' && !isDiretorGeral}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(position.id)}
                          disabled={directorateMode === 'polo' && !isDiretorGeral}
                        >
                          {position.status === 'ativa' ? 'Desativar' : 'Ativar'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
          </>
        )}
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
                  name="nome_completo"
                  value={formData.nome_completo || ''}
                  onChange={handleInputChange}
                  required
                />
                
                <Input
                  label="Telefone"
                  name="telefone"
                  type="tel"
                  placeholder="(63) 99999-9999"
                  value={formData.telefone || ''}
                  onChange={handleInputChange}
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
                    name="cargo"
                    value={formData.cargo || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    {currentCargoOptions.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <Input
                  label="Data de Início"
                  name="data_inicio"
                  type="date"
                  value={formData.data_inicio || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingPosition ? 'Salvar Alterações' : 'Adicionar Cargo'}
                    </>
                  )}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingPosition(null);
                    setFormData({
                      nome_completo: '',
                      telefone: '',
                      email: '',
                      cargo: directorateMode === 'polo' ? 'diretor' : 'secretario_geral',
                      data_inicio: new Date().toISOString().split('T')[0],
                      usuario_id: '',
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
