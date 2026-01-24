import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Upload, Check, Copy, ExternalLink, X, AlertCircle, FileText, Info, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui';
import { Card } from '@/shared/ui';
import { useAuth } from '@/entities/user';
import { useUI } from '@/shared/lib/providers/UIProvider';
import { billingApi } from '@/shared/api/billing.api';
import { paymentsApi } from '@/shared/api/payments.api';
import { uploadApi } from '@/shared/api';
import { generatePixPayload } from '@/shared/utils/pix';
import { 
  Billing, 
  BillingStatus, 
  PaymentIntent, 
  getStatusLabel, 
  formatCurrency 
} from '@/entities/finance/model/types';

// ==========================================
// Sub-components (State Driven)
// ==========================================

const BillingStatusBadge: React.FC<{ status: BillingStatus }> = ({ status }) => {
  const styles: Record<string, string> = {
    'pendente': 'bg-yellow-100 text-yellow-800',
    'pago': 'bg-green-100 text-green-800',
    'vencido': 'bg-red-100 text-red-800',
    'cancelada': 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${styles[status] || styles['pendente']}`}>
      {getStatusLabel(status)}
    </span>
  );
};

// ==========================================
// Main Component
// ==========================================

const AppFinanceiro: React.FC = () => {
  const { currentUser } = useAuth();
  const { showFeedback } = useUI();
  
  // Data State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billings, setBillings] = useState<Billing[]>([]);
  const [config, setConfig] = useState<{ chave_pix: string; nome_beneficiario: string; cidade: string } | null>(null);

  // Action State
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null); // Current active intent
  
  // Modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadData = async () => {
    if (!currentUser || currentUser.role !== 'student' || !currentUser.studentId) return;

    setLoading(true);
    setError(null);
    try {
      const [billingData, configData] = await Promise.all([
        billingApi.getBilling({ student_id: currentUser.studentId }),
        billingApi.getConfig()
      ]);
      setBillings(billingData || []);
      setConfig(configData);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Statistics
  const stats = useMemo(() => {
    return {
      pending: billings.filter(b => b.status === 'pendente').length,
      overdue: billings.filter(b => b.status === 'vencido').length,
      paid: billings.filter(b => b.status === 'pago').length,
      totalOpen: billings
        .filter(b => ['pendente', 'vencido'].includes(b.status))
        .reduce((acc, b) => acc + (b.valor_cents || 0), 0)
    };
  }, [billings]);

  // Actions
  const handleInitiatePayment = async (billing: Billing) => {
    setSelectedBilling(billing);
    setShowPayModal(true);
    // Ideally, we might check if there is arguably an existing open payment intent here?
    // For now, we generate a new "Intent" locally via PIX payload, calling backend initiate only confirms intent.
    // Let's call initiate immediately to track the attempt? 
    // Backend Implementation of `initiatePayment` checks if already paid. 
    // We defer calling the API until the user confirms "I want to pay" or "I paid" to avoid spamming intents?
    // Actually, Plan says: Initiate -> Modal. 
    // Let's call initiate when opening modal to ensure it's valid.
    
    try {
        const intent = await paymentsApi.initiate({
            mensalidade_id: billing.id,
            metodo: 'pix'
        });
        setPaymentIntent(intent);
    } catch (e: any) {
        showFeedback('error', 'Erro ao iniciar', e.message);
        setShowPayModal(false);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedFile || !selectedBilling || !paymentIntent) return;

    setUploading(true);
    try {
      const { publicUrl } = await uploadApi.uploadFile({
        folder: 'comprovantes',
        file: selectedFile
      });

      await paymentsApi.uploadProof(paymentIntent.id, {
        comprovante_url: publicUrl
      });

      showFeedback('success', 'Enviado', 'Comprovante enviado para análise.');
      setShowUploadModal(false);
      setShowPayModal(false);
      setPaymentIntent(null);
      setSelectedFile(null);
      loadData(); // Refresh list to see status change if backend updates it, or mapped state
    } catch (e: any) {
      showFeedback('error', 'Erro', e.message);
    } finally {
      setUploading(false);
    }
  };

  const copyPix = (text: string) => {
    navigator.clipboard.writeText(text);
    showFeedback('success', 'Copiado', 'Código PIX copiado.');
  };

  // Render PIX Payload
  const renderPixModal = () => {
    if (!selectedBilling || !config) return null;
    
    // Check if we use the backend intent ID or billing ID for transaction
    const transactionId = selectedBilling.id.substring(0, 25);
    
    let pixPayload = '';
    try {
        pixPayload = generatePixPayload({
            key: config.chave_pix,
            receiverName: config.nome_beneficiario,
            receiverCity: config.cidade,
            amount: selectedBilling.valor_cents / 100,
            transactionId
        });
    } catch (e) {
        return <div className="p-4 text-red-500">Erro na configuração do PIX. Contate a secretaria.</div>;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md p-6 bg-white shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center text-gray-800">
                        <QrCode className="h-6 w-6 mr-2 text-green-600" />
                        Pagar via PIX
                    </h3>
                    <button onClick={() => setShowPayModal(false)} className="text-gray-400">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="text-center mb-6">
                    <p className="text-sm text-gray-600 mb-1">{selectedBilling.titulo}</p>
                    <p className="text-2xl font-black text-gray-900">{formatCurrency(selectedBilling.valor_cents)}</p>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl mb-4 border border-dashed border-gray-300">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(pixPayload)}&size=300x300&bgcolor=f9fafb`}
                        alt="QR Code"
                        className="w-48 h-48 mb-4 shadow-sm rounded-lg"
                    />
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Escaneie o QR Code</p>
                </div>

                <div className="mb-6">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Pix Copia e Cola</label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-gray-100 p-3 rounded-lg text-xs font-mono truncate border border-gray-200">
                            {pixPayload}
                        </div>
                        <Button variant="outline" onClick={() => copyPix(pixPayload)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                        onClick={() => {
                            setShowPayModal(false);
                            setShowUploadModal(true);
                        }}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Já paguei, enviar comprovante
                    </Button>
                    <Button variant="ghost" onClick={() => setShowPayModal(false)}>
                        Fechar
                    </Button>
                </div>
            </Card>
        </div>
    );
  };

  return (
    <div className="pb-10">
      {/* Header */}
        <div className="mb-4">
            <Button asChild variant="secondary" size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            <Link to="/app/dashboard">Voltar</Link>
            </Button>
        </div>
      
        <div className="flex justify-between items-center mb-6">
            <div>
            <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
            <p className="text-sm text-gray-600">Gestão de mensalidades e pagamentos.</p>
            </div>
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
            </Button>
        </div>

        {error && (
            <Card className="p-4 mb-4 bg-red-50 border-red-100 text-red-700 flex items-center">
                <AlertCircle className="h-5 w-5 mr-3" />
                {error}
            </Card>
        )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-l-4 border-yellow-400">
            <p className="text-xs text-gray-500 uppercase font-bold">Pendentes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </Card>
        <Card className="p-4 border-l-4 border-red-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Vencidas</p>
            <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
        </Card>
        <Card className="p-4 border-l-4 border-green-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Pagas</p>
            <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
        </Card>
        <Card className="p-4 border-l-4 border-blue-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Total Aberto</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalOpen)}</p>
        </Card>
      </div>

      {/* List */}
      <Card className="p-0 overflow-hidden shadow-md">
        <div className="bg-gray-50 px-4 py-3 border-b">
            <h2 className="font-bold text-gray-700">Faturas</h2>
        </div>
        
        {loading && billings.length === 0 ? (
           <div className="p-8 text-center text-gray-500">Carregando...</div> 
        ) : billings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">Nenhuma fatura encontrada.</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-white">
                        <tr>
                            <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase">Título</th>
                            <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase">Vencimento</th>
                            <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase">Valor</th>
                            <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-right font-bold text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {billings.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-semibold text-gray-900">{item.titulo}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    {new Date(item.vencimento).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    {formatCurrency(item.valor_cents)}
                                </td>
                                <td className="px-6 py-4">
                                    <BillingStatusBadge status={item.status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {/* Action Buttons based on State */}
                                    <div className="flex justify-end gap-2">
                                        {(item.status === 'pendente' || item.status === 'vencido') && (
                                            <Button 
                                                size="sm" 
                                                variant="primary" 
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => handleInitiatePayment(item)}
                                            >
                                                Pagar
                                            </Button>
                                        )}
                                        {/* Pending Analysis Badge? Backend billing status is usually 'pendente' until approved. 
                                            We need to know if there is a pending intent check. 
                                            Ideally 'billing.status' should be 'em_analise' or we check a related intent status. 
                                            For now, relying on 'pendente' and user re-upload capability if needed. */}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </Card>

      {/* Modals */}
      {showPayModal && renderPixModal()}

      {showUploadModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md p-6 bg-white">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center text-gray-800">
                        <Upload className="h-6 w-6 mr-2 text-blue-600" />
                        Enviar Comprovante
                    </h3>
                    <button onClick={() => setShowUploadModal(false)} className="text-gray-400">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    
                    <Button 
                        disabled={!selectedFile || uploading} 
                        className="w-full bg-blue-600 text-white"
                        onClick={handleUploadProof}
                    >
                        {uploading ? 'Enviando...' : 'Confirmar Envio'}
                    </Button>
                </div>
            </Card>
         </div>
      )}

    </div>
  );
};

export default AppFinanceiro;
