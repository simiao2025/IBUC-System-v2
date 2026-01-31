import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Upload, Check, Copy, ExternalLink, X, AlertCircle, ShoppingCart } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useApp } from '../../context/AppContext';
import { FinanceiroService } from '../../features/finance/financeiro.service';
import type { Mensalidade } from '../../types/database';
import StudentMaterialOrder from '../../features/materials/StudentMaterialOrder';
import { API_BASE_URL } from '@/shared/api/api';

const AppFinanceiro: React.FC = () => {
  const { currentUser, showFeedback } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cobrancas, setCobrancas] = useState<Mensalidade[]>([]);
  const [config, setConfig] = useState<{ chave_pix: string; tipo_chave: string; nome_beneficiario?: string } | null>(null);

  // Modal State
  const [selectedCobranca, setSelectedCobranca] = useState<Mensalidade | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Allow any role to see, but functionality limited to studentId
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [data, financeConfig] = await Promise.all([
          FinanceiroService.listarCobrancas({ aluno_id: currentUser.studentId }),
          FinanceiroService.buscarConfiguracao()
        ]);
        setCobrancas(Array.isArray(data) ? data : []);
        setConfig(financeConfig);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Erro ao carregar dados financeiros.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser]);

  const resumo = useMemo(() => {
    const pendentes = cobrancas.filter(c => c.status === 'pendente').length;
    const pagos = cobrancas.filter(c => c.status === 'pago').length;
    const vencidos = cobrancas.filter(c => c.status === 'vencido').length;
    const totalDevidoCents = cobrancas
      .filter(c => c.status !== 'pago')
      .reduce((acc, c) => acc + (c.valor_cents || 0) + (c.juros_cents || 0) - (c.desconto_cents || 0), 0);
    return { pendentes, pagos, vencidos, totalDevidoCents };
  }, [cobrancas]);

  const formatMoney = (cents: number) => {
    const val = (cents || 0) / 100;
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showFeedback('success', 'Copiado', 'Chave PIX copiada para a área de transferência.');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedCobranca) return;

    setUploading(true);
    try {
      const file = e.target.files[0];

      // 1. Upload do Arquivo para o Backend
      const formData = new FormData();
      formData.append('file', file);

      // Usando fetch nativo ou axios para o endpoint /upload do backend
      // Considerando que o backend roda localmente ou na mesma origem da API
      const API_URL = API_BASE_URL;

      const uploadResponse = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
        // Headers são automáticos para FormData
      });

      if (!uploadResponse.ok) {
        throw new Error('Falha no upload do arquivo.');
      }

      const uploadResult = await uploadResponse.json();
      const fileUrl = `${API_URL}${uploadResult.url}`; // URL Completa para salvar no banco

      // 2. Comunicar o serviço de finanças
      await FinanceiroService.confirmarPagamento(selectedCobranca.id, fileUrl);

      showFeedback('success', 'Sucesso', 'Comprovante enviado com sucesso! O pagamento será validado pela diretoria.');
      setShowUploadModal(false);
      // Recarregar lista
      const data = await FinanceiroService.listarCobrancas({ aluno_id: currentUser?.studentId });
      setCobrancas(data as Mensalidade[]);
    } catch (err: unknown) {
      console.error(err);
      showFeedback('error', 'Erro', 'Falha ao enviar comprovante. Verifique o tamanho do arquivo (Max 5MB).');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pb-10">
      <div className="mb-4">
        <Button asChild variant="secondary" size="sm" className="bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white">
          <Link to="/app/dashboard">Voltar</Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-sm text-gray-600">Acompanhe suas mensalidades e materiais didáticos.</p>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowOrderModal(true)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Solicitar Material
        </Button>
      </div>

      {error && (
        <Card className="p-4 mb-4 bg-red-50 border-red-100">
          <div className="flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p className="text-sm">{error}</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-l-4 border-yellow-400">
          <p className="text-xs text-gray-500 uppercase font-bold">Pendentes</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : resumo.pendentes}</p>
        </Card>
        <Card className="p-4 border-l-4 border-green-500">
          <p className="text-xs text-gray-500 uppercase font-bold">Pagas</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : resumo.pagos}</p>
        </Card>
        <Card className="p-4 border-l-4 border-red-500">
          <p className="text-xs text-gray-500 uppercase font-bold">Vencidas</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : resumo.vencidos}</p>
        </Card>
        <Card className="p-4 border-l-4 border-blue-500">
          <p className="text-xs text-gray-500 uppercase font-bold">Total Aberto</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : formatMoney(resumo.totalDevidoCents)}</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden shadow-md">
        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
          <h2 className="font-bold text-gray-700">Faturas</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Carregando mensalidades...</p>
          </div>
        ) : cobrancas.length === 0 ? (
          <div className="p-12 text-center">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-20" />
            <p className="text-gray-500">Nenhuma mensalidade encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Vencimento</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-4 text-right font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {cobrancas
                  .slice()
                  .sort((a, b) => String(b.vencimento).localeCompare(String(a.vencimento)))
                  .map((c) => {
                    const venc = c.vencimento ? new Date(c.vencimento).toLocaleDateString('pt-BR') : '—';
                    const isVencida = c.status === 'pendente' && new Date(c.vencimento) < new Date();
                    const statusLabel = isVencida ? 'vencida' : c.status;

                    const badge =
                      c.status === 'pago'
                        ? 'bg-green-100 text-green-800'
                        : isVencida
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800';

                    const totalCents = (c.valor_cents || 0) + (c.juros_cents || 0) - (c.desconto_cents || 0);

                    return (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{c.titulo}</td>
                        <td className="px-6 py-4 text-gray-600">{venc}</td>
                        <td className="px-6 py-4 text-gray-600">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${badge} uppercase`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">{formatMoney(totalCents)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {c.status === 'pendente' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => {
                                    setSelectedCobranca(c);
                                    setShowPixModal(true);
                                  }}
                                >
                                  <QrCode className="h-4 w-4 md:mr-1" />
                                  <span className="hidden md:inline">Pagar PIX</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedCobranca(c);
                                    setShowUploadModal(true);
                                  }}
                                >
                                  <Upload className="h-4 w-4 md:mr-1" />
                                  <span className="hidden md:inline">Comprovante</span>
                                </Button>
                              </>
                            )}
                            {c.status === 'pago' && c.comprovante_url && (
                              <a
                                href={c.comprovante_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" /> Ver Recibo
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* PIX Modal */}
      {showPixModal && config && selectedCobranca && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md p-6 bg-white shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center text-gray-800">
                <QrCode className="h-6 w-6 mr-2 text-green-600" />
                Pagamento via PIX
              </h3>
              <button onClick={() => setShowPixModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-1">{selectedCobranca.titulo}</p>
              <p className="text-2xl font-black text-gray-900">{formatMoney(selectedCobranca.valor_cents)}</p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl mb-6 border border-dashed border-gray-300">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(config.chave_pix)}&size=200x200&bgcolor=f9fafb`}
                alt="QR Code PIX"
                className="w-48 h-48 mb-4 shadow-sm rounded-lg"
              />
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Escaneie o código acima</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Chave PIX ({config.tipo_chave})</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-100 p-3 rounded-lg text-sm font-mono truncate border border-gray-200">
                    {config.chave_pix}
                  </div>
                  <Button variant="outline" onClick={() => copyToClipboard(config.chave_pix)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Beneficiário</label>
                <p className="text-sm font-semibold text-gray-700">{config.nome_beneficiario || 'Instituto Bíblico de Palmas'}</p>
              </div>
            </div>

            <div className="mt-8">
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setShowPixModal(false)}>
                Entendi, já paguei!
              </Button>
              <p className="text-[11px] text-gray-500 text-center mt-3">
                Após o pagamento, não esqueça de anexar o comprovante na tela anterior.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedCobranca && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md p-6 bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center text-gray-800">
                <Upload className="h-6 w-6 mr-2 text-blue-600" />
                Enviar Comprovante
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Selecione o arquivo do comprovante para a fatura: <br />
              <span className="font-bold text-gray-800">{selectedCobranca.titulo}</span>
            </p>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors bg-gray-50">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={handleUpload}
                  disabled={uploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">Clique para selecionar</p>
                  <p className="text-xs text-gray-500">Imagem ou PDF até 5MB</p>
                </label>
              </div>

              {uploading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">Enviando comprovante...</p>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={() => setShowUploadModal(false)}>
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}
      {/* Material Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-4xl p-4 sm:p-6 bg-white overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4 sm:mb-6 border-b pb-4">
              <h3 className="text-lg sm:text-xl font-bold flex items-center text-gray-800">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" />
                Solicitação de Material Didático
              </h3>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600 p-2">
                <X className="h-6 w-6" />
              </button>
            </div>
            <StudentMaterialOrder 
              onClose={() => setShowOrderModal(false)} 
              onSuccess={() => {
                // Refresh list if needed (though it will be pending approval)
              }}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default AppFinanceiro;
