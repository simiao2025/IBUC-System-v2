import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Settings } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import { FinanceiroService } from '../../services/financeiro.service';
import { TurmasAPI } from '../../services/turma.service';

type ActiveTab = 'controle' | 'gerar' | 'config';

const AdminFinanceiro: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('controle');
  const [cobrancas, setCobrancas] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros Controle de Caixa
  const [filtroTurma, setFiltroTurma] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  // Form Gerar Cobranças
  const [formTurma, setFormTurma] = useState('');
  const [formTitulo, setFormTitulo] = useState('');
  const [formValor, setFormValor] = useState('');
  const [formVencimento, setFormVencimento] = useState('');

  useEffect(() => {
    carregarTurmas();
    carregarCobrancas();
  }, []);

  useEffect(() => {
    carregarCobrancas();
  }, [filtroTurma, filtroStatus]);

  const carregarTurmas = async () => {
    try {
      const data = await TurmasAPI.listar();
      setTurmas(data);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const carregarCobrancas = async () => {
    try {
      setLoading(true);
      const data = await FinanceiroService.listarCobrancas({
        turma_id: filtroTurma || undefined,
        status: filtroStatus || undefined,
      });
      setCobrancas(data);
    } catch (error) {
      console.error('Erro ao carregar cobranças:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGerarCobrancas = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const valorCents = Math.round(parseFloat(formValor) * 100);
      
      const result = await FinanceiroService.gerarCobrancasLote({
        turma_id: formTurma,
        titulo: formTitulo,
        valor_cents: valorCents,
        vencimento: formVencimento,
      });

      alert(`✓ ${result.total_gerado} cobranças geradas com sucesso!`);
      
      // Limpar form
      setFormTurma('');
      setFormTitulo('');
      setFormValor('');
      setFormVencimento('');
      
      // Recarregar lista
      await carregarCobrancas();
      setActiveTab('controle');
    } catch (error: any) {
      alert('Erro ao gerar cobranças: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarPagamento = async (id: string) => {
    if (!confirm('Confirmar o pagamento desta cobrança?')) return;
    
    try {
      setLoading(true);
      await FinanceiroService.confirmarPagamento(id);
      alert('✓ Pagamento confirmado!');
      await carregarCobrancas();
    } catch (error: any) {
      alert('Erro ao confirmar pagamento: ' + (error.message || 'Erro desconhecido'));
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
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Financeiro"
        subtitle="Gestão de cobranças e pagamentos"
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
                onClick={() => setActiveTab('gerar')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'gerar'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DollarSign className="inline w-4 h-4 mr-2" />
                Gerar Cobranças
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
                          {cobranca.status === 'pendente' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleConfirmarPagamento(cobranca.id)}
                            >
                              Confirmar Pagamento
                            </Button>
                          )}
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

        {activeTab === 'gerar' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Gerar Cobranças em Lote</h2>
            
            <form onSubmit={handleGerarCobrancas} className="space-y-4 max-w-2xl">
              <Select
                label="Turma"
                value={formTurma}
                onChange={val => setFormTurma(val)}
                required
              >
                <option value="">Selecione a turma</option>
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </Select>

              <Input
                label="Título da Cobrança"
                placeholder="Ex: Módulo 1, Taxa de Matrícula"
                value={formTitulo}
                onChange={e => setFormTitulo(e.target.value)}
                required
              />

              <Input
                label="Valor (R$)"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="50.00"
                value={formValor}
                onChange={e => setFormValor(e.target.value)}
                required
              />

              <Input
                label="Data de Vencimento"
                type="date"
                value={formVencimento}
                onChange={e => setFormVencimento(e.target.value)}
                required
              />

              <div className="pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Gerando...' : 'Gerar para Toda a Turma'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Configuração Financeira</h2>
            <p className="text-sm text-gray-600 mb-4">
              As configurações de chave PIX devem ser gerenciadas diretamente no banco de dados por enquanto.
            </p>
            <p className="text-sm text-gray-500">
              Em breve: Interface para gerenciar chave PIX, nome do beneficiário e outras configurações.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFinanceiro;
