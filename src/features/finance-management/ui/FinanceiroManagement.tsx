import React, { useState, useEffect } from 'react';
import { FileText, Settings, Package, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/shared/ui';
import { Select } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { billingApi } from '@/shared/api/billing.api';
import { turmaApi } from '@/entities/turma';
import { useAuth } from '@/entities/user';
import AccessControl from '@/features/auth/ui/AccessControl';
import { MaterialOrderManagement } from '@/features/material-management';
import { PaymentVerification } from './PaymentVerification';
import { BillingStatus, getStatusLabel, formatCurrency } from '@/entities/finance/model/types';

type ActiveTab = 'controle' | 'aprovacao' | 'materiais' | 'config';

const AdminFinanceiro: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('controle');
  
  // Data State
  const [cobrancas, setCobrancas] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isPoloScoped = currentUser?.adminUser?.accessLevel === 'polo_especifico' && Boolean(currentUser?.adminUser?.poloId);
  const userPoloId = currentUser?.adminUser?.poloId || '';

  // Filtros Controle de Caixa
  const [filtroTurma, setFiltroTurma] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  // Config State
  const [configData, setConfigData] = useState({
    chave_pix: '',
    beneficiario_nome: '',
    beneficiario_cidade: ''
  });

  useEffect(() => {
    carregarTurmas();
    if (activeTab === 'controle') carregarCobrancas();
    if (activeTab === 'config') carregarConfiguracao();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'controle') carregarCobrancas();
  }, [filtroTurma, filtroStatus]);

  const carregarTurmas = async () => {
    try {
      const data = await turmaApi.list(isPoloScoped && userPoloId ? { polo_id: userPoloId } : undefined);
      setTurmas(data);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const carregarCobrancas = async () => {
    try {
      setLoading(true);
      const data = await billingApi.getBilling({
        turma_id: filtroTurma || undefined,
        polo_id: isPoloScoped && userPoloId ? userPoloId : undefined,
        status: filtroStatus as BillingStatus || undefined,
      });
      setCobrancas(data || []);
    } catch (error) {
      console.error('Erro ao carregar cobranças:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarConfiguracao = async () => {
    try {
      setLoading(true);
      const data = await billingApi.getConfig();
      if (data) {
        setConfigData({
          chave_pix: data.chave_pix || '',
          beneficiario_nome: data.beneficiario_nome || '',
          beneficiario_cidade: data.beneficiario_cidade || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarConfiguracao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await billingApi.updateConfig(configData);
      alert('Configurações salvas com sucesso!');
    } catch (error: any) {
      alert('Erro ao salvar: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
      try {
          if (!confirm('Deseja notificar o aluno sobre essa cobrança?')) return;
          await billingApi.publish(id);
          alert('Notificação enviada!');
      } catch (e: any) {
          alert('Erro ao publicar: ' + e.message);
      }
  }

  return (
    <AccessControl allowedRoles={['super_admin', 'admin_geral', 'diretor_geral', 'coordenador_geral', 'secretario_geral', 'tesoureiro_geral']}>
      <div className="min-h-screen bg-gray-50">
        <PageHeader
            title={isPoloScoped ? 'Financeiro do Polo' : 'Financeiro'}
            subtitle={isPoloScoped ? 'Gestão de cobranças e pagamentos do polo' : 'Gestão de cobranças e pagamentos'}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('controle')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 ${
                            activeTab === 'controle'
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <FileText className="inline w-4 h-4 mr-2" />
                            Controle de Caixa
                        </button>
                        <button
                            onClick={() => setActiveTab('aprovacao')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center ${
                            activeTab === 'aprovacao'
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <CheckCircle className="inline w-4 h-4 mr-2" />
                            Aprovação
                        </button>
                        <button
                            onClick={() => setActiveTab('materiais')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 ${
                            activeTab === 'materiais'
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Package className="inline w-4 h-4 mr-2" />
                            Pedido de Material
                        </button>
                        <button
                            onClick={() => setActiveTab('config')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 ${
                            activeTab === 'config'
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Settings className="inline w-4 h-4 mr-2" />
                            Configuração
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'aprovacao' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <PaymentVerification />
                </div>
            )}

            {activeTab === 'controle' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Controle de Caixa</h2>
                    
                    {/* Filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Select
                            label="Turma"
                            value={filtroTurma}
                            onChange={val => setFiltroTurma(val)}
                        >
                            <option value="">Todas as turmas</option>
                            {turmas.map(t => (
                            <option key={t.id} value={t.id}>{t.nome}</option>
                            ))}
                        </Select>
                        
                        <Select
                            label="Status"
                            value={filtroStatus}
                            onChange={val => setFiltroStatus(val)}
                        >
                            <option value="">Todos</option>
                            <option value="pendente">Pendente</option>
                            <option value="pago">Pago</option>
                            <option value="vencido">Vencido</option>
                        </Select>
                    </div>

                    {/* Tabela */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aluno</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                    Carregando...
                                </td>
                                </tr>
                            ) : cobrancas.length === 0 ? (
                                <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                    Nenhuma cobrança encontrada
                                </td>
                                </tr>
                            ) : (
                                cobrancas.map(cobranca => (
                                <tr key={cobranca.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {cobranca.aluno?.nome || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {cobranca.titulo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatCurrency(cobranca.valor_cents)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(cobranca.vencimento).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full uppercase ${
                                            cobranca.status === 'pago' ? 'bg-green-100 text-green-800' :
                                            cobranca.status === 'vencido' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {getStatusLabel(cobranca.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {cobranca.status === 'pendente' && (
                                            <Button variant="ghost" size="sm" onClick={() => handlePublish(cobranca.id)}>
                                                Notificar
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'materiais' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <MaterialOrderManagement />
                </div>
            )}

            {activeTab === 'config' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-6">Configuração Financeira</h2>
                    
                    <form onSubmit={handleSalvarConfiguracao} className="max-w-xl">
                        <div className="space-y-4">
                            <Input
                                label="Chave PIX"
                                value={configData.chave_pix}
                                onChange={(e) => setConfigData({ ...configData, chave_pix: e.target.value })}
                                placeholder="CPF, CNPJ, Email ou Telefone"
                                required
                            />
                            
                            <Input
                                label="Nome do Beneficiário"
                                value={configData.beneficiario_nome}
                                onChange={(e) => setConfigData({ ...configData, beneficiario_nome: e.target.value })}
                                placeholder="Nome que aparecerá no comprovante"
                                required
                            />

                            <Input
                                label="Cidade do Beneficiário"
                                value={configData.beneficiario_cidade}
                                onChange={(e) => setConfigData({ ...configData, beneficiario_cidade: e.target.value })}
                                placeholder="Cidade de origem do PIX"
                                required
                            />

                            <div className="pt-4">
                                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                                    {loading ? 'Salvando...' : 'Salvar Configurações'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
      </div>
    </AccessControl>
  );
};

export default AdminFinanceiro;
