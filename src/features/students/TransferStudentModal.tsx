import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { ArrowRightLeft, AlertCircle } from 'lucide-react';

interface TransferStudentModalProps {
  student: any;
  polos: any[];
  currentPoloId: string;
  onTransfer: (poloDestinoId: string, motivo: string, observacoes?: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const TransferStudentModal: React.FC<TransferStudentModalProps> = ({
  student,
  polos,
  currentPoloId,
  onTransfer,
  onClose,
  loading = false
}) => {
  const [poloDestinoId, setPoloDestinoId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filtrar apenas polos diferentes do atual
  const polosDisponiveis = polos.filter((p: any) => p.id !== currentPoloId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!poloDestinoId || !motivo.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      await onTransfer(poloDestinoId, motivo, observacoes);
      onClose();
    } catch (error) {
      console.error('Erro ao transferir aluno:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const poloDestinoNome = polos.find(p => p.id === poloDestinoId)?.nome || '';

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Transferir Aluno de Polo"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações do aluno */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
              {student.nome.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{student.nome}</h3>
              <p className="text-sm text-gray-600">CPF: {student.cpf}</p>
            </div>
          </div>
        </div>

        {/* Aviso */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Atenção:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>O aluno será desvinculado da turma atual</li>
              <li>Será necessário alocar em uma nova turma no polo de destino</li>
              <li>Esta ação ficará registrada no histórico de transferências</li>
            </ul>
          </div>
        </div>

        {/* Seleção de polo */}
        <div>
          <label htmlFor="polo_destino" className="block text-sm font-medium text-gray-700 mb-2">
            Polo de Destino *
          </label>
          <select
            id="polo_destino"
            required
            value={poloDestinoId}
            onChange={(e) => setPoloDestinoId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={submitting}
          >
            <option value="">Selecione o polo...</option>
            {polosDisponiveis.map((polo: any) => (
              <option key={polo.id} value={polo.id}>
                {polo.nome} ({polo.codigo})
              </option>
            ))}
          </select>
        </div>

        {/* Motivo */}
        <div>
          <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
            Motivo da Transferência *
          </label>
          <select
            id="motivo"
            required
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={submitting}
          >
            <option value="">Selecione o motivo...</option>
            <option value="Mudança de endereço">Mudança de endereço</option>
            <option value="Mudança de cidade">Mudança de cidade</option>
            <option value="Proximidade do polo">Proximidade do polo</option>
            <option value="Solicitação da família">Solicitação da família</option>
            <option value="Reorganização administrativa">Reorganização administrativa</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        {/* Observações */}
        <div>
          <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-2">
            Observações (opcional)
          </label>
          <textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            placeholder="Informações adicionais sobre a transferência..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={submitting}
          />
        </div>

        {/* Resumo */}
        {poloDestinoId && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Resumo da Transferência:</p>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium">{student.nome}</span>
              <ArrowRightLeft className="h-4 w-4" />
              <span className="font-medium text-red-600">{poloDestinoNome}</span>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 justify-end border-t pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!poloDestinoId || !motivo.trim() || submitting}
            loading={submitting}
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Confirmar Transferência
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransferStudentModal;
