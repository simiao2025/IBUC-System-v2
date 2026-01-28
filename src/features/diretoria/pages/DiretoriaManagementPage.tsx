import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { DiretoriaService } from '../../../services/diretoria.service';
import { UserServiceV2 } from '../../../services/userService.v2';
import { useApp } from '../../../context/AppContext';
import type { AdminUser, AdminRole } from '../../../types';
import {
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
import PageHeader from '../../../components/ui/PageHeader';

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

const cargoOptions = [
  { value: 'diretor_geral', label: 'Diretor Geral' },
  { value: 'vice_diretor_geral', label: 'Vice-Diretor Geral' },
  { value: 'coordenador_geral', label: '1º Coordenador Geral' },
  { value: 'vice_coordenador_geral', label: '2º Coordenador Geral' },
  { value: 'primeiro_secretario_geral', label: '1º Secretário Geral' },
  { value: 'segundo_secretario_geral', label: '2º Secretário Geral' },
  { value: 'primeiro_tesoureiro_geral', label: '1º Tesoureiro Geral' },
  { value: 'segundo_tesoureiro_geral', label: '2º Tesoureiro Geral' },
  { value: 'diretor_polo', label: 'Diretor do Polo' },
  { value: 'vice_diretor_polo', label: 'Vice-Diretor do Polo' },
  { value: 'coordenador_polo', label: '1º Coordenador do Polo' },
  { value: 'vice_coordenador_polo', label: '2º Coordenador do Polo' },
  { value: 'primeiro_secretario_polo', label: '1º Secretário do Polo' },
  { value: 'segundo_secretario_polo', label: '2º Secretário do Polo' },
  { value: 'primeiro_tesoureiro_polo', label: '1º Tesoureiro do Polo' },
  { value: 'segundo_tesoureiro_polo', label: '2º Tesoureiro do Polo' },
] as const;

// Mapeamento de cargos do frontend para o backend
const cargoMapping: Record<string, 'diretor' | 'vice_diretor' | 'coordenador' | 'vice_coordenador' | 'primeiro_secretario' | 'segundo_secretario' | 'primeiro_tesoureiro' | 'segundo_tesoureiro'> = {
  diretor_geral: 'diretor',
  vice_diretor_geral: 'vice_diretor',
  coordenador_geral: 'coordenador',
  vice_coordenador_geral: 'vice_coordenador',
  primeiro_secretario_geral: 'primeiro_secretario',
  segundo_secretario_geral: 'segundo_secretario',
  primeiro_tesoureiro_geral: 'primeiro_tesoureiro',
  segundo_tesoureiro_geral: 'segundo_tesoureiro',
  diretor_polo: 'diretor',
  vice_diretor_polo: 'vice_diretor',
  coordenador_polo: 'coordenador',
  vice_coordenador_polo: 'vice_coordenador',
  primeiro_secretario_polo: 'primeiro_secretario',
  segundo_secretario_polo: 'segundo_secretario',
  primeiro_tesoureiro_polo: 'primeiro_tesoureiro',
  segundo_tesoureiro_polo: 'segundo_tesoureiro',

  // Backward compatibility mappings
  secretario_geral: 'primeiro_secretario',
  tesoureiro_geral: 'primeiro_tesoureiro',
  diretor: 'diretor',
  vice_diretor: 'vice_diretor',
  coordenador: 'coordenador',
  vice_coordenador: 'vice_coordenador',
  secretario: 'primeiro_secretario',
  tesoureiro: 'primeiro_tesoureiro',
};

const reverseCargoMapping: Record<string, string> = {
  diretor: 'diretor_geral',
  coordenador: 'coordenador_geral',
  secretario: 'secretario_geral',
  tesoureiro: 'tesoureiro_geral',
};

const DiretoriaManagementPage: React.FC = () => {
  const { polos, currentUser } = useApp();
  const [searchParams] = useSearchParams();
  const [directorate, setDirectorate] = useState<DirectoratePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState<DirectoratePosition | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [directorateMode, setDirectorateMode] = useState<'geral' | 'polo'>('geral');
  const [selectedPoloId, setSelectedPoloId] = useState<string>('');
  const [formData, setFormData] = useState({
    nome_completo: '',
    telefone: '',
    email: '',
    cpf: '',
    cargo: 'secretario_geral' as string,
    data_inicio: new Date().toISOString().split('T')[0],
    usuario_id: '',
  });

  // Carregar diretorias ao montar o componente
  useEffect(() => {
    void carregarDiretorias();
  }, []);

  useEffect(() => {
    void carregarDiretorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directorateMode, selectedPoloId]);

  const adminRole = currentUser?.adminUser?.role as AdminRole | undefined;
  const canManagePoloDirectorate = adminRole ? (['diretor_geral', 'super_admin', 'admin_geral'] as AdminRole[]).includes(adminRole) : false;

  const isPoloScoped = currentUser?.adminUser?.accessLevel === 'polo_especifico' && Boolean(currentUser?.adminUser?.poloId);
  const userPoloId = currentUser?.adminUser?.poloId || '';

  useEffect(() => {
    if (!isPoloScoped || !userPoloId) return;
    if (directorateMode !== 'polo') setDirectorateMode('polo');
    if (selectedPoloId !== userPoloId) setSelectedPoloId(userPoloId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPoloScoped, userPoloId]);

  // Capturar poloId da URL (redirecionamento do cadastro de polo)
  useEffect(() => {
    const urlPoloId = searchParams.get('poloId');

    if (urlPoloId) {
      setSelectedPoloId(urlPoloId);
      if (!isPoloScoped) {
        setDirectorateMode('polo');
      }
    }
  }, [searchParams, isPoloScoped]);

  useEffect(() => {
    const carregarUsuariosDoPolo = async () => {
      if (!showForm) return;
      if (directorateMode !== 'polo') return;
      if (!selectedPoloId) return;

      try {
        setUsersLoading(true);
        const users = await UserServiceV2.listUsers({ polo_id: selectedPoloId, ativo: true });
        const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name));
        setAvailableUsers(sorted);
      } catch (error: unknown) {
        console.error('Erro ao carregar usuários do polo:', error);
        setAvailableUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };

    void carregarUsuariosDoPolo();
  }, [directorateMode, selectedPoloId, showForm]);

  const carregarDiretorias = async () => {
    try {
      setLoading(true);

      if (directorateMode === 'polo') {
        if (!selectedPoloId) {
          setDirectorate([]);
          return;
        }
        const data = await DiretoriaService.listarDiretoriaPolo(selectedPoloId, true);
        const formattedData = (data as any[]).map((item) => ({
          id: item.id,
          nome_completo: item.usuario?.nome_completo || item.nome_completo || 'N/A',
          telefone: (item.usuario?.telefone || item.telefone) || undefined,
          email: item.usuario?.email || item.email || 'N/A',
          cargo: item.cargo as DirectoratePosition['cargo'],
          data_inicio: item.data_inicio,
          data_fim: item.data_fim || undefined,
          status: (item.status as DirectoratePosition['status']) || 'inativa',
          usuario_id: item.usuario_id,
          polo_id: item.polo_id,
          polo_nome: item.polo?.nome || undefined,
        }));
        setDirectorate(formattedData as DirectoratePosition[]);
        return;
      }

      const data = await DiretoriaService.listarDiretoriaGeral(true);
      const formattedData = (data as any[]).map((item) => ({
        id: item.id,
        nome_completo: item.usuario?.nome_completo || item.nome_completo || 'N/A',
        telefone: item.usuario?.telefone || item.telefone,
        email: item.usuario?.email || item.email || 'N/A',
        cargo: item.cargo as DirectoratePosition['cargo'],
        data_inicio: item.data_inicio,
        data_fim: item.data_fim,
        status: (item.status as DirectoratePosition['status']) || 'inativa',
        usuario_id: item.usuario_id
      }));
      setDirectorate(formattedData as DirectoratePosition[]);
    } catch (error: unknown) {
      console.error('Erro ao carregar diretorias:', error);
      alert('Erro ao carregar diretorias. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const positionLabels: Record<string, string> = {
    diretor_geral: 'Diretor Geral',
    vice_diretor_geral: 'Vice-Diretor Geral',
    coordenador_geral: '1º Coordenador Geral',
    vice_coordenador_geral: '2º Coordenador Geral',
    primeiro_secretario_geral: '1º Secretário Geral',
    segundo_secretario_geral: '2º Secretário Geral',
    primeiro_tesoureiro_geral: '1º Tesoureiro Geral',
    segundo_tesoureiro_geral: '2º Tesoureiro Geral',
    diretor_polo: 'Diretor do Polo',
    vice_diretor_polo: 'Vice-Diretor do Polo',
    coordenador_polo: '1º Coordenador do Polo',
    vice_coordenador_polo: '2º Coordenador do Polo',
    primeiro_secretario_polo: '1º Secretário do Polo',
    segundo_secretario_polo: '2º Secretário do Polo',
    primeiro_tesoureiro_polo: '1º Tesoureiro do Polo',
    segundo_tesoureiro_polo: '2º Tesoureiro do Polo',

    // Compatibilidade
    diretor: 'Diretor',
    coordenador: 'Coordenador',
    secretario: 'Secretário',
    tesoureiro: 'Tesoureiro',
    secretario_geral: 'Secretário Geral',
    tesoureiro_geral: 'Tesoureiro Geral',
  };

  const positionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    diretor_geral: Crown,
    vice_diretor_geral: Crown,
    coordenador_geral: UserCheck,
    vice_coordenador_geral: UserCheck,
    primeiro_secretario_geral: FileText,
    segundo_secretario_geral: FileText,
    primeiro_tesoureiro_geral: Shield,
    segundo_tesoureiro_geral: Shield,
    diretor_polo: Crown,
    vice_diretor_polo: Crown,
    coordenador_polo: UserCheck,
    vice_coordenador_polo: UserCheck,
    primeiro_secretario_polo: FileText,
    segundo_secretario_polo: FileText,
    primeiro_tesoureiro_polo: Shield,
    segundo_tesoureiro_polo: Shield,

    // Compatibilidade
    diretor: Crown,
    coordenador: UserCheck,
    secretario: FileText,
    tesoureiro: Shield,
    secretario_geral: FileText,
    tesoureiro_geral: Shield,
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

    if (directorateMode === 'polo' && !canManagePoloDirectorate) {
      alert('Apenas Diretor Geral / Admin Geral pode cadastrar/alterar Diretor e Coordenador dos polos.');
      return;
    }

    try {
      setSaving(true);

      let finalUsuarioId = formData.usuario_id || undefined;

      // Se for novo usuário (ou diretoria geral sem usuário selecionado), criar primeiro
      if ((isNewUser || directorateMode === 'geral') && !editingPosition && !finalUsuarioId) {
        if (!formData.cpf) {
          alert('CPF é obrigatório para criar um novo usuário (usado para gerar a senha inicial).');
          return;
        }

        // Mapear cargo da diretoria para role do usuário
        const roleMapping: Record<string, AdminRole> = {
          diretor_geral: 'diretor_geral',
          vice_diretor_geral: 'vice_diretor_geral',
          coordenador_geral: 'coordenador_geral',
          vice_coordenador_geral: 'vice_coordenador_geral',
          primeiro_secretario_geral: 'primeiro_secretario_geral',
          segundo_secretario_geral: 'segundo_secretario_geral',
          primeiro_tesoureiro_geral: 'primeiro_tesoureiro_geral',
          segundo_tesoureiro_geral: 'segundo_tesoureiro_geral',
          diretor_polo: 'diretor_polo',
          vice_diretor_polo: 'vice_diretor_polo',
          coordenador_polo: 'coordenador_polo',
          vice_coordenador_polo: 'vice_coordenador_polo',
          primeiro_secretario_polo: 'primeiro_secretario_polo',
          segundo_secretario_polo: 'segundo_secretario_polo',
          primeiro_tesoureiro_polo: 'primeiro_tesoureiro_polo',
          segundo_tesoureiro_polo: 'segundo_tesoureiro_polo',

          // Compatibilidade
          diretor: 'diretor_polo',
          coordenador: 'coordenador_polo',
          secretario: 'primeiro_secretario_polo',
          tesoureiro: 'primeiro_tesoureiro_polo',
          secretario_geral: 'primeiro_secretario_geral',
          tesoureiro_geral: 'primeiro_tesoureiro_geral',
        };

        const targetRole = roleMapping[formData.cargo] || 'auxiliar' as AdminRole;

        // Senha inicial: 'senha123'
        const password = 'senha123';

        try {
          const userRes = await UserServiceV2.createUser({
            name: formData.nome_completo,
            email: formData.email,
            cpf: formData.cpf,
            phone: formData.telefone,
            role: targetRole,
            poloId: selectedPoloId || undefined,
            password: password,
            accessLevel: directorateMode === 'polo' ? 'polo_especifico' : 'geral'
          });
          finalUsuarioId = userRes.id;
        } catch (err: any) {
          console.error('Erro ao criar usuário:', err);
          throw new Error(`Falha ao criar usuário: ${err.message}`);
        }
      }

      // Mapear cargo do frontend para o backend
      const cargoBackend = cargoMapping[formData.cargo] || formData.cargo;

      if (editingPosition) {
        if (directorateMode === 'polo') {
          await DiretoriaService.atualizarDiretoriaPolo(editingPosition.id, {
            nome_completo: formData.nome_completo,
            telefone: formData.telefone,
            email: formData.email,
            cpf: formData.cpf,
            cargo: cargoBackend,
            data_inicio: formData.data_inicio,
            usuario_id: finalUsuarioId,
          });
        } else {
          await DiretoriaService.atualizarDiretoriaGeral(editingPosition.id, {
            nome_completo: formData.nome_completo,
            telefone: formData.telefone,
            email: formData.email,
            cpf: formData.cpf,
            cargo: cargoBackend,
            data_inicio: formData.data_inicio,
            usuario_id: finalUsuarioId,
          });
        }

        alert(`Diretoria atualizada com sucesso!${isNewUser ? ' Um novo usuário foi criado para este membro.' : ''}`);
      } else {
        if (directorateMode === 'polo') {
          await DiretoriaService.criarDiretoriaPolo({
            polo_id: selectedPoloId,
            usuario_id: finalUsuarioId,
            cargo: cargoBackend,
            nome_completo: formData.nome_completo,
            cpf: formData.cpf,
            telefone: formData.telefone,
            email: formData.email,
            data_inicio: formData.data_inicio,
          });
        } else {
          await DiretoriaService.criarDiretoriaGeral({
            usuario_id: finalUsuarioId,
            cargo: cargoBackend,
            nome_completo: formData.nome_completo,
            cpf: formData.cpf,
            telefone: formData.telefone,
            email: formData.email,
            data_inicio: formData.data_inicio,
          });
        }
        alert(`Diretoria criada com sucesso!${isNewUser ? ' Uma conta de usuário com senha (6 primeiros dígitos do CPF) também foi criada.' : ''}`);
      }

      // Recarregar lista
      await carregarDiretorias();

      // Reset form
      setFormData({
        nome_completo: '',
        telefone: '',
        email: '',
        cpf: '',
        cargo: directorateMode === 'polo' ? 'diretor_polo' : 'diretor_geral',
        data_inicio: new Date().toISOString().split('T')[0],
        usuario_id: '',
      });
      setShowForm(false);
      setIsNewUser(false);
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
    if (directorateMode === 'polo' && !canManagePoloDirectorate) {
      alert('Apenas Diretor Geral / Admin Geral pode editar cargos da diretoria do polo.');
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
      cpf: '', 
    });
    // Always treat as "new user" regarding form fields (show all inputs)
    setIsNewUser(true); 
    setShowForm(true);
  };

  const toggleStatus = async (positionId: string) => {
    try {
      const position = directorate.find(p => p.id === positionId);
      if (!position) return;

      if (directorateMode === 'polo' && !canManagePoloDirectorate) {
        alert('Apenas Diretor Geral / Admin Geral pode ativar/desativar cargos da diretoria do polo.');
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

  const renderLeadershipCard = (roleKey: string, label: string, Icon: any, color: 'red' | 'blue' | 'green' | 'yellow') => {
    const position = getPositionByType(roleKey);
    const colorClasses = {
      red: 'from-red-50 to-red-100 border-red-200 text-red-600 text-red-800',
      blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600 text-blue-800',
      green: 'from-green-50 to-green-100 border-green-200 text-green-600 text-green-800',
      yellow: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-600 text-yellow-800'
    };

    const colors = colorClasses[color].split(' ');
    const bg = colors[0];
    const border = colors[1];
    const iconColor = colors[2];
    const titleColor = colors[3];

    return (
      <Card className={`text-center bg-gradient-to-br ${bg} ${border}`}>
        <div className="p-6">
          <Icon className={`h-12 w-12 ${iconColor} mx-auto mb-4`} />
          <h3 className={`text-lg font-bold ${titleColor} mb-4`}>{label}</h3>

          {position ? (
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {position.nome_completo}
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(position)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  {position.telefone && (
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-2" />
                      {position.telefone}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 mr-2" />
                    {position.email}
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
                  setFormData({ ...formData, cargo: roleKey });
                  setIsNewUser(true);
                  setShowForm(true);
                }}
              >
                Nomear {label.split(' ')[0]}
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const currentCargoOptions = directorateMode === 'polo'
    ? [
      { value: 'diretor_polo', label: 'Diretor do Polo' },
      { value: 'vice_diretor_polo', label: 'Vice-Diretor do Polo' },
      { value: 'coordenador_polo', label: '1º Coordenador do Polo' },
      { value: 'vice_coordenador_polo', label: '2º Coordenador do Polo' },
      { value: 'primeiro_secretario_polo', label: '1º Secretário do Polo' },
      { value: 'segundo_secretario_polo', label: '2º Secretário do Polo' },
      { value: 'primeiro_tesoureiro_polo', label: '1º Tesoureiro do Polo' },
      { value: 'segundo_tesoureiro_polo', label: '2º Tesoureiro do Polo' },
    ]
    : [
      { value: 'diretor_geral', label: 'Diretor Geral' },
      { value: 'vice_diretor_geral', label: 'Vice-Diretor Geral' },
      { value: 'coordenador_geral', label: '1º Coordenador Geral' },
      { value: 'vice_coordenador_geral', label: '2º Coordenador Geral' },
      { value: 'primeiro_secretario_geral', label: '1º Secretário Geral' },
      { value: 'segundo_secretario_geral', label: '2º Secretário Geral' },
      { value: 'primeiro_tesoureiro_geral', label: '1º Tesoureiro Geral' },
      { value: 'segundo_tesoureiro_geral', label: '2º Tesoureiro Geral' },
    ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={directorateMode === 'polo' ? 'Diretoria do Polo' : 'Diretoria Geral'}
        subtitle={directorateMode === 'polo'
          ? 'Cadastro e gestão da liderança dos polos (Diretor/Coordenador)'
          : 'Cadastro e gestão da diretoria executiva do IBUC'}
        actionLabel="Adicionar Cargo"
        actionIcon={<Crown className="h-4 w-4" />}
        onAction={() => {
          if (directorateMode === 'polo' && !canManagePoloDirectorate) {
            alert('Apenas Diretor Geral / Admin Geral pode adicionar cargos na diretoria do polo.');
            return;
          }
          // Always force IS NEW USER logic to show inputs
          setIsNewUser(true);
          setShowForm(true);
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Visão:</span>
            {isPoloScoped ? (
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-900">
                Diretoria do Polo
              </div>
            ) : (
              <select
                value={directorateMode}
                onChange={(e) => {
                  const value = e.target.value as 'geral' | 'polo';
                  setDirectorateMode(value);
                  setEditingPosition(null);
                  setShowForm(false);
                  if (value === 'polo') {
                    setFormData(prev => ({ ...prev, cargo: 'diretor_polo' }));
                  } else {
                    setFormData(prev => ({ ...prev, cargo: 'diretor_geral' }));
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="geral">Diretoria Geral</option>
                <option value="polo">Diretoria do Polo</option>
              </select>
            )}
          </div>

          {directorateMode === 'polo' && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Polo:</span>
              {isPoloScoped ? (
                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-900">
                  {polos.find(p => p.id === userPoloId)?.name || 'Polo'}
                </div>
              ) : (
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
            </div>
          )}
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
                {renderLeadershipCard('diretor_geral', 'Diretor Geral', Crown, 'red')}

                {/* Vice-Diretor Geral */}
                {renderLeadershipCard('vice_diretor_geral', 'Vice-Diretor Geral', Crown, 'red')}

                {/* Coordenador Geral */}
                {renderLeadershipCard('coordenador_geral', 'Coordenador Geral', UserCheck, 'blue')}

                {/* Vice-Coordenador Geral */}
                {renderLeadershipCard('vice_coordenador_geral', 'Vice-Coordenador Geral', UserCheck, 'blue')}

                {/* Secretários */}
                {renderLeadershipCard('primeiro_secretario_geral', '1º Secretário Geral', FileText, 'green')}
                {renderLeadershipCard('segundo_secretario_geral', '2º Secretário Geral', FileText, 'green')}

                {/* Tesoureiros */}
                {renderLeadershipCard('primeiro_tesoureiro_geral', '1º Tesoureiro Geral', Shield, 'yellow')}
                {renderLeadershipCard('segundo_tesoureiro_geral', '2º Tesoureiro Geral', Shield, 'yellow')}
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
                      {directorateMode === 'polo' && !isPoloScoped && (
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
                          {directorateMode === 'polo' && !isPoloScoped && (
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
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${position.status === 'ativa'
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
                              disabled={directorateMode === 'polo' && !canManagePoloDirectorate}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleStatus(position.id)}
                              disabled={directorateMode === 'polo' && !canManagePoloDirectorate}
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
                  label="CPF"
                  name="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf || ''}
                  onChange={handleInputChange}
                  required={!editingPosition} // Required for new users
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
                      cpf: '',
                      cargo: directorateMode === 'polo' ? 'diretor_polo' : 'secretario_geral',
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

export default DiretoriaManagementPage;
