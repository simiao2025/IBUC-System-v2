import React, { useState, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import { useApp } from '@/app/providers/AppContext';
import { 
  ShoppingCart, 
  Package, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  ChevronLeft, 
  QrCode, 
  Copy, 
  Upload, 
  FileCheck,
  Tag
} from 'lucide-react';
import { MaterialsAPI, MaterialOrdersAPI, type Material } from './materials.service';
import { api } from '@/shared/api/api';

interface StudentMaterialOrderProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

type CheckoutStep = 'catalog' | 'review' | 'payment' | 'receipt' | 'success';

const StudentMaterialOrder: React.FC<StudentMaterialOrderProps> = ({ onClose, onSuccess }) => {
  const { currentUser, showFeedback } = useApp();
  const [step, setStep] = useState<CheckoutStep>('catalog');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  
  // Data for filtering
  const [alunoNivelId, setAlunoNivelId] = useState<string | null>(null);
  const [alunoModuloId, setAlunoModuloId] = useState<string | null>(null);
  const [orderedMaterialIds, setOrderedMaterialIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const [materialsData, matriculaRes, ordersRes] = await Promise.all([
          MaterialsAPI.listar(),
          currentUser?.studentId ? api.get<any[]>(`/matriculas?aluno_id=${currentUser.studentId}&status=ativa`) : Promise.resolve({ data: [] }),
          currentUser?.studentId ? MaterialOrdersAPI.listar({ aluno_id: currentUser.studentId }) : Promise.resolve({ data: [] })
        ]);

        setMaterials(materialsData);

        // Processar pedidos para evitar duplicados
        const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes as any).data || [];
        const orderedIds = new Set<string>();
        orders.forEach((order: any) => {
          if (order.status !== 'cancelado' && order.status !== 'recusado') {
            order.itens?.forEach((item: any) => {
              orderedIds.add(item.material_id);
            });
          }
        });
        setOrderedMaterialIds(orderedIds);

        // Processar matrícula para obter filtros
        const matriculas = Array.isArray(matriculaRes) ? matriculaRes : (matriculaRes as any).data || [];
        if (matriculas.length > 0) {
          const mat = matriculas[0]; // Pega a primeira ativa
          if (mat.turma) {
            setAlunoNivelId(mat.turma.nivel_id || null);
            setAlunoModuloId(mat.turma.modulo_id || null);
          }
        }
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.studentId) {
      load();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSelectMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setStep('review');
  };

  const handleGeneratePix = async () => {
    if (!selectedMaterial) return;
    
    setSubmitting(true);
    try {
      const payload = {
        tipo_cobranca: 'Material do Aluno (Checkout)',
        solicitante_id: currentUser?.id,
        aluno_id: currentUser?.studentId,
        itens: [{
          material_id: selectedMaterial.id,
          quantidade: 1,
          valor_unitario_cents: selectedMaterial.valor_padrao_cents
        }]
      };

      const order = await MaterialOrdersAPI.criar(payload);
      setCreatedOrderId(order.id);
      setStep('payment');
    } catch (e: any) {
      showFeedback('error', 'Erro', e?.message || 'Falha ao processar pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createdOrderId) return;

    // Simple validation
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showFeedback('error', 'Arquivo Inválido', 'Por favor, envie uma imagem (JPG/PNG) ou PDF do comprovante.');
      return;
    }

    setUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await api.upload<{ url: string }>('/upload', formData);
      setReceiptUrl(res.url);
      
      // Salvar URL do comprovante  no pedido e atualizar status
      await api.patch(`/pedidos-materiais/${createdOrderId}/comprovante`, {
        url_comprovante: res.url
      });
      
      setStep('success');
    } catch (e: any) {
      showFeedback('error', 'Erro no Upload', 'Não foi possível enviar o comprovante.');
    } finally {
      setUploadingReceipt(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-red-600 mb-4" />
        <p className="text-gray-500 font-medium">Carregando catálogo de materiais...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      {step !== 'success' && (
        <div className="flex items-center justify-between mb-6 px-2 sm:px-4">
          {[
            { id: 'catalog', label: 'Início' },
            { id: 'review', label: 'Conferir' },
            { id: 'payment', label: 'Pagar' },
            { id: 'receipt', label: 'Comprovar' }
          ].map((s, idx) => {
            const isActive = step === s.id;
            const isDone = ['catalog', 'review', 'payment', 'receipt'].indexOf(step) > idx;
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors shadow-sm ${
                    isActive ? 'bg-red-600 text-white shadow-md scale-110' : isDone ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-red-700' : 'text-gray-400'} hidden sm:block`}>{s.label}</span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-0.5 -mx-2 mb-4 sm:mb-5 ${['catalog', 'review', 'payment', 'receipt'].indexOf(step) > idx ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Step 1: Catalog */}
      {step === 'catalog' && (
        <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-red-600 pl-3">Catálogo de Materiais</h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">{materials.length} kits disponíveis</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {(() => {
              const filtered = materials.filter(m => {
                // Regra de Filtragem Inteligente
                
                // 1. Materiais sem vínculo (genéricos) aparecem para todos
                if (!m.nivel_id && !m.modulo_id) return true;

                // 2. Se tem vínculo de Nível, tem que bater com o nível do aluno
                if (m.nivel_id && alunoNivelId && m.nivel_id !== alunoNivelId) return false;

                // 3. Se tem vínculo de Módulo, tem que bater com o módulo do aluno
                if (m.modulo_id && alunoModuloId && m.modulo_id !== alunoModuloId) return false;

                // 4. Se o aluno não tem matrícula ativa (null), mostra apenas genéricos (já tratado no passo 1)
                // Se chegou aqui e tem restrição mas aluno não tem dados, esconde por segurança
                if ((m.nivel_id && !alunoNivelId) || (m.modulo_id && !alunoModuloId)) return false;

                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="col-span-1 sm:col-span-2 py-16 px-6 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Package className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Nenhum material pendente para você</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
                      No momento não há kits específicos vinculados ao seu nível ou módulo atual. 
                      Isso pode significar que você já possui o material necessário ou que ele deve ser solicitado diretamente na secretaria do polo.
                    </p>
                    <div className="mt-8">
                       <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Dúvidas?</p>
                       <p className="text-sm text-red-600 font-medium mt-1">Consulte o Atendimento do Polo</p>
                    </div>
                  </div>
                );
              }

              return filtered.map(material => {
                const isOrdered = orderedMaterialIds.has(material.id);
                return (
                  <Card key={material.id} className={`overflow-hidden group hover:shadow-xl transition-all duration-300 border-gray-100 ${isOrdered ? 'opacity-90 grayscale-[0.3]' : 'hover:border-red-200'}`}>
                    <div className="h-40 sm:h-48 bg-gray-100 relative overflow-hidden">
                      {material.url_imagem ? (
                        <img src={material.url_imagem} alt={material.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package className="h-16 w-16" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-red-600 font-bold text-sm shadow-sm">
                        {formatCurrency(material.valor_padrao_cents)}
                      </div>
                      {isOrdered && (
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-xs uppercase shadow-lg border-2 border-white animate-in zoom-in duration-300">
                            Já Solicitado
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4 space-y-2">
                      <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors uppercase text-base sm:text-lg tracking-tight leading-snug">{material.nome}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed h-10 mt-1">
                        {material.descricao || 'Kit completo de material didático para o seu módulo.'}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 gap-3 pt-2">
                        <span className="flex items-center bg-gray-100 px-2 py-1 rounded font-medium"><Tag className="h-3 w-3 mr-1" /> {material.unidade || 'Kit'}</span>
                        {isOrdered && (
                          <span className="text-blue-600 font-semibold flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Em análise
                          </span>
                        )}
                      </div>
                      <Button 
                        className={`w-full mt-4 shadow-sm ${isOrdered ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100' : 'bg-red-600 hover:bg-red-700'}`}
                        onClick={() => !isOrdered && handleSelectMaterial(material)}
                        disabled={isOrdered}
                      >
                        {isOrdered ? 'Pedido Realizado' : 'Pedir Agora'} {!isOrdered && <ArrowRight className="h-4 w-4 ml-2" />}
                      </Button>
                    </div>
                  </Card>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 'review' && selectedMaterial && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in zoom-in duration-300">
          <button onClick={() => setStep('catalog')} className="flex items-center text-sm text-gray-500 hover:text-red-600 transition-colors mb-2">
            <ChevronLeft className="h-4 w-4 mr-1" /> Voltar ao catálogo
          </button>
          
          <Card className="p-0 overflow-hidden border-gray-100 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-gray-50 flex items-center justify-center h-56 sm:h-64 md:h-auto border-r p-4">
                {selectedMaterial.url_imagem ? (
                  <img src={selectedMaterial.url_imagem} alt={selectedMaterial.nome} className="max-h-full object-contain" />
                ) : (
                  <Package className="h-24 w-24 text-gray-200" />
                )}
              </div>
              <div className="p-5 sm:p-8 space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight uppercase">{selectedMaterial.nome}</h2>
                  <p className="text-red-600 font-bold text-xl mt-2 tracking-tighter">
                    {formatCurrency(selectedMaterial.valor_padrao_cents)}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest">Descrição do Kit</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedMaterial.descricao || 'Este kit contém todo o material necessário para acompanhar as aulas do módulo atual. Inclui apostilas originais e materiais de apoio exclusivos do IBUC.'}
                  </p>
                </div>

                <div className="pt-6 border-t flex flex-col gap-3">
                  <Button 
                    className="w-full py-4 sm:py-6 text-lg bg-green-600 hover:bg-green-700 shadow-md"
                    onClick={handleGeneratePix}
                    loading={submitting}
                  >
                    Gerar PIX
                  </Button>
                  <p className="text-[10px] text-center text-gray-400 px-4">
                    Ao clicar em gerar PIX, um pedido formal será registrado em seu nome.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 'payment' && (
        <div className="space-y-6 text-center animate-in slide-in-from-bottom duration-300">
          <div className="max-w-sm mx-auto space-y-6 sm:space-y-8">
            <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase">Pagamento via PIX</h2>
                <p className="text-sm text-gray-500">Escaneie o QR Code abaixo com o app do seu banco.</p>
            </div>

            <Card className="p-4 sm:p-8 bg-gray-50 inline-block border-2 border-dashed border-red-200 w-full sm:w-auto">
              <div className="flex justify-center">
                 <QrCode className="h-40 w-40 sm:h-48 sm:w-48 text-gray-900" strokeWidth={1} />
              </div>
              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 text-xs font-mono break-all text-gray-600 relative group cursor-pointer hover:bg-gray-50" onClick={() => {
                navigator.clipboard.writeText('00020101021126580014BR.GOV.BCB.PIX0136ibuc-pagamentos@pix.com.br520400005303986540550.005802BR5912IBUC SISTEMA6006Palmas62070503***6304E2B1');
                showFeedback('info', 'Copiado!', 'Código PIX copiado para a área de transferência.');
              }}>
                00020101021126580014BR.GOV.BCB.PIX0136ibuc...
                <div className="absolute inset-0 flex items-center justify-center bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <Copy className="h-4 w-4 mr-2" /> Copiar Código
                </div>
              </div>
            </Card>

            <div className="space-y-4 pt-4">
              <Button 
                className="w-full py-4 sm:py-6 text-lg bg-red-600 hover:bg-red-700 shadow-lg"
                onClick={() => setStep('receipt')}
              >
                Já Paguei <CheckCircle2 className="h-5 w-5 ml-2" />
              </Button>
              <p className="text-xs text-amber-600 font-medium flex items-center justify-center bg-amber-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 mr-2" />
                Após o pagamento, você deverá anexar o comprovante na próxima tela.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Receipt */}
      {step === 'receipt' && (
        <div className="max-w-md mx-auto space-y-6 text-center animate-in fade-in duration-300">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase">Enviar Comprovante</h2>
            <p className="text-sm text-gray-500">Envie a imagem ou PDF do comprovante bancário.</p>
          </div>

          <div className="relative group">
            <input 
                type="file" 
                className="hidden" 
                id="receipt-upload" 
                accept="image/*,application/pdf"
                onChange={handleReceiptUpload}
                disabled={uploadingReceipt}
            />
            <label 
                htmlFor="receipt-upload"
                className={`flex flex-col items-center justify-center p-6 sm:p-12 border-4 border-dashed rounded-2xl cursor-pointer transition-all ${
                    uploadingReceipt ? 'bg-gray-50 border-gray-200' : 'bg-white border-red-100 hover:border-red-400 hover:bg-red-50'
                }`}
            >
              {uploadingReceipt ? (
                <>
                  <Loader2 className="h-10 sm:h-12 w-10 sm:w-12 animate-spin text-red-600 mb-4" />
                  <span className="text-gray-600 font-bold">Processando arquivo...</span>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
                  </div>
                  <span className="text-gray-900 font-bold text-lg mb-1">Selecionar Arquivo</span>
                  <span className="text-gray-400 text-xs text-center px-4 sm:px-8">Clique para escolher ou arraste o arquivo aqui (JPG, PNG ou PDF)</span>
                </>
              )}
            </label>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100 text-left">
            <FileCheck className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-blue-900 uppercase mb-1 tracking-wider">Por que enviar?</p>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                A validação humana é necessária para liberar o seu material imediatamente. O sistema irá conferir se o valor e a data coincidem com o pedido.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {step === 'success' && (
        <div className="py-12 text-center space-y-8 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
             <CheckCircle2 className="h-16 w-16" strokeWidth={3} />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter">Pedido Concluído!</h2>
            <p className="text-gray-500 max-w-xs mx-auto text-sm sm:text-base">
              Seu comprovante foi enviado e está em **análise prioritária**. Assim que for validado, você poderá retirar seu material no polo.
            </p>
          </div>

          <div className="pt-8">
            <Button 
                onClick={onSuccess || onClose}
                className="px-12 py-6 bg-gray-900 hover:bg-black text-white font-bold text-lg rounded-full"
            >
              Fechar Painel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMaterialOrder;
