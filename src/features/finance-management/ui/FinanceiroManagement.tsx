import React, { useState, useEffect } from 'react';
import { FileText, Settings, Package, CheckCircle, ExternalLink, Clock } from 'lucide-react';
import { PageHeader } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { Select } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { FinanceiroService } from '../api/finance.service';
import { TurmasAPI } from '@/features/turma-management';
import { useApp } from '@/app/providers/AppContext';
import AccessControl from '@/features/auth/ui/AccessControl';
import { MaterialOrderManagement } from '@/features/material-management';

type ActiveTab = 'controle' | 'aprovacao' | 'materiais' | 'config';

const AdminFinanceiro: React.FC = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('controle');
  const [cobrancas, setCobrancas] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagamentosPendentes, setPagamentosPendentes] = useState<any[]>([]);
  const [loadingPagamentos, setLoadingPagamentos] = useState(false);

  const isPoloScoped = currentUser?.adminUser?.accessLevel === 'polo_especifico' && Boolean(currentUser?.adminUser?.poloId);
  const userPoloId = currentUser?.adminUser?.poloId || '';

  // Filtros Controle de Caixa
  const [filtroTurma, setFiltroTurma] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');


  useEffect(() => {
    carregarTurmas();
    carregarCobrancas();
    carregarPagamentosPendentes();

    // Polling de 5 minutos (300.000 ms)
    const interval = setInterval(() => {
      carregarPagamentosPendentes();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    carregarCobrancas();
  }, [filtroTurma, filtroStatus]);

  const carregarTurmas = async () => {
    try {
      const data = await TurmasAPI.listar(isPoloScoped && userPoloId ? { polo_id: userPoloId } : undefined);
      setTurmas(data);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  useEffect(() => {
    if (!isPoloScoped) return;
    if (!filtroTurma) return;
    const exists = turmas.some((t) => t.id === filtroTurma);
    if (!exists) setFiltroTurma('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPoloScoped, turmas]);

  const carregarPagamentosPendentes = async () => {
    try {
      setLoadingPagamentos(true);
      const data = await FinanceiroService.listarPagamentosPendentes();
      setPagamentosPendentes(data);
    } catch (error) {
      console.error('Erro ao carregar pagamentos pendentes:', error);
    } finally {
      setLoadingPagamentos(false);
    }
  };

  const handleAprovarPagamento = async (pagamentoId: string) => {
    if (!currentUser) return;
    if (!confirm('Deseja realmente aprovar este pagamento? Esta ação dará baixa na mensalidade correspondente.')) return;

    try {
      setLoading(true);
      await FinanceiroService.aprovarPagamento(pagamentoId, currentUser.id);
      alert('✓ Pagamento aprovado com sucesso!');
      await Promise.all([carregarPagamentosPendentes(), carregarCobrancas()]);
    } catch (error: any) {
      alert('Erro ao aprovar pagamento: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const [configData, setConfigData] = useState({
    chave_pix: '',
    beneficiario_nome: '',
    beneficiario_cidade: ''
  });

  useEffect(() => {
    if (activeTab === 'config') {
      carregarConfiguracao();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const carregarConfiguracao = async () => {
    try {
      setLoading(true);
      const data = await FinanceiroService.buscarConfiguracao();
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
      await FinanceiroService.atualizarConfiguracao(configData);
      alert('Configurações salvas com sucesso!');
    } catch (error: any) {
      alert('Erro ao salvar: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const carregarCobrancas = async () => {
    try {
      setLoading(true);
      const data = await FinanceiroService.listarCobrancas({
        turma_id: filtroTurma || undefined,
        polo_id: isPoloScoped && userPoloId ? userPoloId : undefined,
        status: filtroStatus || undefined,
      });
      setCobrancas(data);
    } catch (error) {
      console.error('Erro ao carregar cobranças:', error);
    } finally {
      setLoading(false);
    }
  };




  const formatarValor = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

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
                {pagamentosPendentes.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    {pagamentosPendentes.length}
                  </span>
                )}
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Validar Comprovantes</h2>
                <p className="text-sm text-gray-500">Confira o comprovante enviado pelo aluno antes de dar baixa.</p>
              </div>
              <div className="flex items-center text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border">
                <Clock className="w-3 h-3 mr-1" />
                Atualiza a cada 5 min
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aluno</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fatura</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Envio</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Comprovante</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ação</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingPagamentos ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Carregando pagamentos...</td></tr>
                  ) : pagamentosPendentes.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">Nenhum comprovante aguardando validação :)</td></tr>
                  ) : (
                    pagamentosPendentes.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {p.mensalidade?.aluno?.nome || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {p.mensalidade?.titulo || 'Sem título'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {formatarValor(p.valor_cents)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatarData(p.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {p.comprovante_url && (
                            <a 
                              href={p.comprovante_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center text-red-600 hover:text-red-800 text-xs font-bold bg-red-50 px-2 py-1 rounded border border-red-100"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" /> Ver Arquivo
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button 
                            size="sm" 
                            variant="primary" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAprovarPagamento(p.id)}
                          >
                            Baixar Fatura
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
                          {formatarValor(cobranca.valor_cents)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatarData(cobranca.vencimento)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            cobranca.status === 'pago' 
                              ? 'bg-green-100 text-green-800'
                              : cobranca.status === 'vencido'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {cobranca.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">

                          {cobranca.status === 'pago' && cobranca.pago_em && (
                            <span className="text-xs text-gray-500">
                              Pago em {formatarData(cobranca.pago_em)}
                            </span>
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
