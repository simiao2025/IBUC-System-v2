import React, { useEffect, useState } from 'react';
import { Check, X, Eye, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { Button, Card, Modal } from '@/shared/ui';
import { useUI } from '@/shared/lib/providers/UIProvider';
import { paymentsApi } from '@/shared/api/payments.api';
import { PaymentIntent, getPaymentStatusLabel, formatCurrency } from '@/entities/finance/model/types';
import { useAuth } from '@/entities/user';

export const PaymentVerification: React.FC = () => {
    const { currentUser } = useAuth();
    const { showFeedback } = useUI();
    
    const [loading, setLoading] = useState(true);
    const [pending, setPending] = useState<PaymentIntent[]>([]);
    
    // Action State
    const [selectedIntent, setSelectedIntent] = useState<PaymentIntent | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [rejectionNote, setRejectionNote] = useState('');
    const [processing, setProcessing] = useState(false);

    const loadPending = async () => {
        setLoading(true);
        try {
            const data = await paymentsApi.getPending();
            setPending(data);
        } catch (e: any) {
            showFeedback('error', 'Erro', 'Falha ao carregar pagamentos pendentes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPending();
    }, []);

    const handleAction = async () => {
        if (!selectedIntent || !actionType || !currentUser) return;
        
        setProcessing(true);
        try {
            if (actionType === 'approve') {
                await paymentsApi.approve(selectedIntent.id, {
                    diretor_id: currentUser.id
                });
                showFeedback('success', 'Aprovado', 'Pagamento aprovado com sucesso.');
            } else {
                if (!rejectionNote.trim()) {
                    showFeedback('warning', 'Atenção', 'Informe o motivo da rejeição.');
                    setProcessing(false);
                    return;
                }
                await paymentsApi.reject(selectedIntent.id, {
                    rejection_note: rejectionNote,
                    diretor_id: currentUser.id
                });
                showFeedback('success', 'Rejeitado', 'Pagamento rejeitado.');
            }
            
            closeModal();
            loadPending();
        } catch (e: any) {
            showFeedback('error', 'Erro', e.message || 'Falha ao processar ação.');
        } finally {
            setProcessing(false);
        }
    };

    const closeModal = () => {
        setSelectedIntent(null);
        setActionType(null);
        setRejectionNote('');
    };

    const openModal = (intent: PaymentIntent, type: 'approve' | 'reject') => {
        setSelectedIntent(intent);
        setActionType(type);
        setRejectionNote('');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                   <h2 className="text-lg font-bold text-gray-800">Verificação de Pagamentos</h2>
                   <p className="text-sm text-gray-500">Valide os comprovantes enviados pelos alunos.</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadPending} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </div>

            {loading && pending.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Carregando...</div>
            ) : pending.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <Check className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhum pagamento pendente de análise.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pending.map((item: any) => (
                        <Card key={item.id} className="flex flex-col md:flex-row justify-between items-center p-4 gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full uppercase">
                                        {getPaymentStatusLabel(item.status_gateway)}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(item.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-800">{item.mensalidade?.titulo || 'Cobrança'}</h3>
                                <div className="text-sm text-gray-600">
                                    Aluno: <span className="font-semibold">{item.mensalidade?.aluno?.nome || 'Desconhecido'}</span>
                                </div>
                                <div className="text-lg font-black text-gray-900 mt-1">
                                    {formatCurrency(item.valor_cents)}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                {item.comprovante_url ? (
                                    <a 
                                        href={item.comprovante_url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="btn btn-outline flex items-center justify-center px-4 py-2 border rounded-md hover:bg-gray-50 text-sm"
                                    >
                                        <FileText className="h-4 w-4 mr-2 text-blue-600" />
                                        Ver Comprovante
                                    </a>
                                ) : (
                                    <span className="text-xs text-gray-400 italic px-4">Sem comprovante</span>
                                )}

                                <Button 
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => openModal(item, 'approve')}
                                >
                                    <Check className="h-4 w-4 mr-2" /> Aprovar
                                </Button>
                                
                                <Button 
                                    variant="destructive"
                                    onClick={() => openModal(item, 'reject')}
                                >
                                    <X className="h-4 w-4 mr-2" /> Rejeitar
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Action Modal */}
            {selectedIntent && actionType && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-md p-6 bg-white">
                        <h3 className={`text-xl font-bold mb-4 flex items-center ${actionType === 'approve' ? 'text-green-700' : 'text-red-700'}`}>
                            {actionType === 'approve' ? <Check className="mr-2" /> : <AlertCircle className="mr-2" />}
                            {actionType === 'approve' ? 'Confirmar Aprovação' : 'Rejeitar Pagamento'}
                        </h3>

                        {actionType === 'approve' ? (
                            <p className="text-gray-600 mb-6">
                                Confirma recebimento do valor de <b>{formatCurrency(selectedIntent.valor_cents)}</b> referente à cobrança <b>{selectedIntent.mensalidade?.titulo}</b>?
                                <br/><br/>
                                <span className="text-xs text-gray-500 block">Esta ação baixará a cobrança automaticamente.</span>
                            </p>
                        ) : (
                            <div className="mb-6">
                                <p className="text-gray-600 mb-2">Informe o motivo da rejeição para o aluno:</p>
                                <textarea 
                                    className="w-full border rounded-md p-2 text-sm"
                                    rows={3}
                                    placeholder="Ex: Comprovante ilegível, valor incorreto..."
                                    value={rejectionNote}
                                    onChange={(e) => setRejectionNote(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" onClick={closeModal} disabled={processing}>Cancelar</Button>
                            <Button 
                                className={`text-white ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                onClick={handleAction}
                                disabled={processing}
                            >
                                {processing ? 'Processando...' : (actionType === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição')}
                            </Button>
                        </div>
                    </Card>
                 </div>
            )}
        </div>
    );
};
