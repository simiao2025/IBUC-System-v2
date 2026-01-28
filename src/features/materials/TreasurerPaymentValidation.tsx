import React, { useState, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import PageHeader from '@/shared/ui/PageHeader';
import { useApp } from '@/app/providers/AppContext';
import { FileCheck, CheckCircle2, XCircle, Eye, Loader2, Filter, AlertCircle } from 'lucide-react';
import { api } from '@/shared/api/api';

interface PedidoPendente {
  id: string;
  created_at: string;
  total_cents: number;
  tipo_cobranca: string;
  status: string;
  url_comprovante: string;
  aluno?: {
    id: string;
    nome: string;
    email: string;
  };
  polo?: {
    id: string;
    nome: string;
  };
  itens?: Array<{
    material: {
      nome: string;
    };
    quantidade: number;
  }>;
}

const TreasurerPaymentValidation: React.FC = () => {
  const { currentUser, showFeedback } = useApp();
  const [pedidos, setPedidos] = useState<PedidoPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<PedidoPendente | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [validationNotes, setValidationNotes] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('pendente_validacao');

  const carregarPedidos = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        status: filtroStatus,
      };

      // Se for tesoureiro de polo, filtrar apenas por seu polo
      if (currentUser?.adminUser?.role === 'primeiro_tesoureiro_polo' && currentUser?.adminUser?.poloId) {
        params.polo_id = currentUser.adminUser.poloId;
      }

      const queryString = new URLSearchParams(params).toString();
      const data = await api.get<PedidoPendente[]>(`/pedidos-materiais?${queryString}`);
      setPedidos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Erro ao carregar pedidos:', e);
      showFeedback('error', 'Erro', 'Não foi possível carregar os pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroStatus, currentUser?.adminUser?.poloId]);

  const handleViewReceipt = (pedido: PedidoPendente) => {
    setSelectedPedido(pedido);
    setShowModal(true);
    setRejectReason('');
    setValidationNotes('');
  };

  const handleValidate = async () => {
    if (!selectedPedido) return;

    setProcessing(true);
    try {
      await api.patch(`/pedidos-materiais/${selectedPedido.id}/validar-pagamento`, {
        observacoes: validationNotes || null,
      });

      showFeedback('success', 'Pagamento Validado', 'O comprovante foi validado com sucesso!');
      setShowModal(false);
      carregarPedidos();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao validar pagamento.';
      showFeedback('error', 'Erro', message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPedido || !rejectReason.trim()) {
      showFeedback('warning', 'Atenção', 'Por favor, informe o motivo da rejeição.');
      return;
    }

    setProcessing(true);
    try {
      await api.patch(`/pedidos-materiais/${selectedPedido.id}/rejeitar-pagamento`, {
        motivo: rejectReason,
      });

      showFeedback('success', 'Pagamento Rejeitado', 'O aluno será notificado para enviar novo comprovante.');
      setShowModal(false);
      carregarPedidos();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao rejeitar pagamento.';
      showFeedback('error', 'Erro', message);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Validação de Pagamentos - Materiais"
        subtitle={currentUser?.adminUser?.poloId ? `Polo: ${pedidos[0]?.polo?.nome || 'Seu Polo'}` : 'Todos os Polos'}
      />

      {/* Filtros */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <div className="flex gap-3">
            <button
              onClick={() => setFiltroStatus('pendente_validacao')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filtroStatus === 'pendente_validacao'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFiltroStatus('pago')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filtroStatus === 'pago'
                  ? 'bg-green-600 text-white shadow'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Validados
            </button>
            <button
              onClick={() => setFiltroStatus('pagamento_rejeitado')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filtroStatus === 'pagamento_rejeitado'
                  ? 'bg-red-600 text-white shadow'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Rejeitados
            </button>
          </div>
        </div>
      </Card>

      {/* Lista de Pedidos */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-amber-600 mb-4" />
            <p className="text-gray-500 font-medium">Carregando pedidos...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-12">
            <FileCheck className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">
              {filtroStatus === 'pendente_validacao'
                ? 'Nenhum comprovante aguardando validação'
                : `Nenhum pedido ${filtroStatus === 'pago' ? 'validado' : 'rejeitado'}`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data Upload</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aluno</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {pedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(pedido.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{pedido.aluno?.nome || '—'}</div>
                      <div className="text-xs text-gray-500">{pedido.aluno?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {pedido.itens?.map((item) => item.material.nome).join(', ') || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(pedido.total_cents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          pedido.status === 'pendente_validacao'
                            ? 'bg-amber-100 text-amber-700'
                            : pedido.status === 'pago'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {pedido.status === 'pendente_validacao'
                          ? 'PENDENTE'
                          : pedido.status === 'pago'
                          ? 'VALIDADO'
                          : 'REJEITADO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReceipt(pedido)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Visualização */}
      {showModal && selectedPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Validação de Comprovante</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Aluno: {selectedPedido.aluno?.nome} • Valor: {formatCurrency(selectedPedido.total_cents)}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Comprovante */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Comprovante de Pagamento</label>
                {selectedPedido.url_comprovante ? (
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    {selectedPedido.url_comprovante.toLowerCase().endsWith('.pdf') ? (
                      <iframe
                        src={selectedPedido.url_comprovante}
                        className="w-full h-96"
                        title="Comprovante PDF"
                      />
                    ) : (
                      <img
                        src={selectedPedido.url_comprovante}
                        alt="Comprovante"
                        className="w-full max-h-96 object-contain"
                      />
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Comprovante não disponível</p>
                  </div>
                )}
              </div>

              {/* Apenas para pedidos pendentes */}
              {selectedPedido.status === 'pendente_validacao' && (
                <>
                  {/* Notas de Validação */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações (opcional)
                    </label>
                    <textarea
                      value={validationNotes}
                      onChange={(e) => setValidationNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Adicione notas sobre a validação..."
                    />
                  </div>

                  {/* Campo de Rejeição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo da Rejeição (obrigatório para rejeitar)
                    </label>
                    <Input
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Ex: Comprovante ilegível, valor incorreto, etc."
                    />
                  </div>

                  {/* Ações */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowModal(false)}
                      disabled={processing}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleReject}
                      loading={processing}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleValidate}
                      loading={processing}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Validar Pagamento
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TreasurerPaymentValidation;
