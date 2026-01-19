import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { TurmaService } from './services/turma.service';
import { Check, AlertTriangle, Users, DollarSign, ArrowRight, Loader2 } from 'lucide-react';

interface ModuleTransitionWizardProps {
  turmaId: string;
  turmaNome: string;
  onClose: () => void;
  onSuccess: () => void;
}

type TransitionPreview = {
  aluno_id: string;
  nome: string;
  frequencia: number;
  total_aulas: number;
  presencas: number;
  aprovado_frequencia: boolean;
};

export const ModuleTransitionWizard: React.FC<ModuleTransitionWizardProps> = ({
  turmaId,
  turmaNome,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<TransitionPreview[]>([]);
  const [moduleInfo, setModuleInfo] = useState<{ total_licoes: number; aulas_dadas: number; modulo_titulo: string } | null>(null);
  const [selectedAlunos, setSelectedAlunos] = useState<string[]>([]);
  const [valorCents, setValorCents] = useState(5000); // R$ 50,00 padrão

  useEffect(() => {
    carregarPreview();
  }, [turmaId]);

  const carregarPreview = async () => {
    try {
      setLoading(true);
      const data: any = await TurmaService.previewTransicao(turmaId);

      const alunos = data.alunos || [];
      const info = {
        total_licoes: data.total_licoes || 0,
        aulas_dadas: data.aulas_dadas || 0,
        modulo_titulo: data.modulo_titulo || 'Módulo'
      };

      setPreview(alunos);
      setModuleInfo(info);

      // Seleciona automaticamente quem está aprovado por frequência
      setSelectedAlunos(alunos.filter((a: any) => a.aprovado_frequencia).map((a: any) => a.aluno_id));
    } catch (err) {
      console.error('Erro ao carregar preview de transição:', err);
      setError('Não foi possível carregar o resumo de frequência da turma.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAluno = (id: string) => {
    setSelectedAlunos(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    try {
      setExecuting(true);
      setError(null);
      await TurmaService.encerrarModulo(turmaId, {
        alunos_confirmados: selectedAlunos,
        valor_cents: valorCents,
      });
      onSuccess();
    } catch (err: any) {
      console.error('Erro ao encerrar módulo:', err);
      setError(err.message || 'Ocorreu um erro ao processar o encerramento.');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 text-red-600 animate-spin mb-4" />
        <p className="text-gray-600">Calculando frequências e preparando transição...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Encerrar Módulo: {turmaNome}</h2>
          <p className="text-sm text-gray-500">Passo {step} de 3</p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose} disabled={executing}>
          Cancelar
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Step 1: Lista de Alunos */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
            <Users className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Verificação de Frequência</p>
              <p className="text-xs text-blue-700">
                Alunos com pelo menos 75% de presença são sugeridos para aprovação.
                Você pode ajustar a seleção manualmente.
              </p>
            </div>
          </div>

          {moduleInfo && moduleInfo.aulas_dadas < moduleInfo.total_licoes && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">Módulo Incompleto</p>
                <p className="text-xs text-amber-700">
                  Foram ministradas <strong>{moduleInfo.aulas_dadas} aulas</strong> de um total de <strong>{moduleInfo.total_licoes} lições</strong> previstas.
                  Deseja prosseguir com o encerramento mesmo assim?
                </p>
              </div>
            </div>
          )}

          <div className="max-h-[400px] overflow-y-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aprovar</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Presenças</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Freq. %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((aluno) => (
                  <tr key={aluno.aluno_id} className={aluno.aprovado_frequencia ? 'bg-green-50/30' : 'bg-red-50/30'}>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedAlunos.includes(aluno.aluno_id)}
                        onChange={() => toggleAluno(aluno.aluno_id)}
                        className="h-4 w-4 text-red-600 rounded focus:ring-red-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{aluno.nome}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {aluno.presencas} / {aluno.total_aulas}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-bold ${aluno.aprovado_frequencia ? 'text-green-600' : 'text-red-600'}`}>
                        {(aluno.frequencia || 0).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setStep(2)}
              disabled={selectedAlunos.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Próximo Passo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Passo 2: Configuração Financeira */}
      {step === 2 && (
        <div className="space-y-6 py-4">
          <div className="bg-yellow-50 p-4 rounded-lg flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Gatilho Financeiro (PIX)</p>
              <p className="text-xs text-yellow-700">
                Defina o valor da taxa de material didático para o próximo módulo.
                Uma cobrança será gerada para cada aluno selecionado.
              </p>
            </div>
          </div>

          <div className="max-w-xs mx-auto text-center space-y-4">
            <label className="block text-sm font-medium text-gray-700">Valor em Reais (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400 font-bold">R$</span>
              <Input
                type="number"
                step="0.01"
                className="pl-10 text-xl font-bold text-center"
                value={(valorCents / 100).toFixed(2)}
                onChange={(e) => setValorCents(Math.round(parseFloat(e.target.value) * 100))}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Valor definido pela Diretoria Geral. <br />
              Modo de pagamento sugerido: **PIX**.
            </p>
          </div>

          <div className="flex justify-between pt-8 border-t">
            <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
            <Button
              onClick={() => setStep(3)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Revisar e Finalizar <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Passo 3: Confirmação Final */}
      {step === 3 && (
        <div className="space-y-6 text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-red-600" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">Pronto para Encerrar?</h3>
            <p className="text-gray-600">
              Ao confirmar, os seguintes processos serão executados:
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg text-left space-y-3 max-w-md mx-auto">
            <div className="flex items-center text-sm text-gray-700">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Gravação de {selectedAlunos.length} históricos de conclusão.</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Geração de cobranças PIX no valor de {(valorCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Avanço automático da turma para o próximo módulo.</span>
            </div>
          </div>

          <div className="flex justify-between pt-8 border-t">
            <Button variant="outline" onClick={() => setStep(2)} disabled={executing}>Voltar</Button>
            <Button
              onClick={handleFinish}
              loading={executing}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 shadow-lg"
            >
              Confirmar e Executar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
