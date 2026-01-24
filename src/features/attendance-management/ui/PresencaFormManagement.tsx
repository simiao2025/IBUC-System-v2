import React, { useState } from 'react';
import { Calendar, Check, X, Clock } from 'lucide-react';
import { Card } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { Select } from '@/shared/ui';
import { PresencaService } from '@/entities/attendance/api/attendance.service';

interface AlunoPresenca {
  aluno_id: string;
  nome: string;
  status: 'presente' | 'falta' | 'justificativa' | 'atraso' | null;
}

const PresencaFormManagement: React.FC = () => {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [turmaId, setTurmaId] = useState('');
  const [observacao, setObservacao] = useState('');
  const [alunos, setAlunos] = useState<AlunoPresenca[]>([
    { aluno_id: '1', nome: 'João Silva', status: null },
    { aluno_id: '2', nome: 'Maria Santos', status: null },
    { aluno_id: '3', nome: 'Pedro Oliveira', status: null },
  ]);
  const [loading, setLoading] = useState(false);

  const toggleStatus = (alunoId: string, status: AlunoPresenca['status']) => {
    setAlunos(prev =>
      prev.map(aluno =>
        aluno.aluno_id === alunoId ? { ...aluno, status } : aluno
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const presencas = alunos
        .filter(a => a.status !== null)
        .map(a => {
          let apiStatus = 'presente';
          let obs = undefined;

          if (a.status === 'falta') apiStatus = 'ausente';
          else if (a.status === 'justificativa') {
             apiStatus = 'justificado';
             obs = observacao;
          } else if (a.status === 'atraso') {
             apiStatus = 'presente'; // API pode não ter 'atraso', tratando como presente com obs
             obs = 'Atraso';
          }

          return {
            aluno_id: a.aluno_id,
            turma_id: turmaId,
            data,
            status: apiStatus as any, // Cast to match API expected string union
            observacao: obs,
          };
        });

      if (presencas.length === 0) {
        alert('Selecione pelo menos um aluno com status para registrar presença.');
        return;
      }

      await PresencaService.lancarPresencas(presencas);

      alert('Presença registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar presença:', error);
      alert('Erro ao registrar presença');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Lançamento de Presença</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data
            </label>
            <Input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Turma
            </label>
            <Select
              value={turmaId}
              onChange={(e: any) => setTurmaId(e.target?.value || e)}
              required
            >
              <option value="">Selecione a turma</option>
              <option value="1">Turma Nível I - Manhã</option>
              <option value="2">Turma Nível II - Tarde</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lista de Alunos
          </label>
          <div className="space-y-2">
            {alunos.map((aluno) => (
              <div
                key={aluno.aluno_id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{aluno.nome}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleStatus(aluno.aluno_id, 'presente')}
                    className={`p-2 rounded ${
                      aluno.status === 'presente'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                    }`}
                    title="Presente"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleStatus(aluno.aluno_id, 'falta')}
                    className={`p-2 rounded ${
                      aluno.status === 'falta'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                    }`}
                    title="Falta"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleStatus(aluno.aluno_id, 'atraso')}
                    className={`p-2 rounded ${
                      aluno.status === 'atraso'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                    }`}
                    title="Atraso"
                  >
                    <Clock className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleStatus(aluno.aluno_id, 'justificativa')}
                    className={`p-2 rounded ${
                      aluno.status === 'justificativa'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
                    }`}
                    title="Justificativa"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observação (opcional)
          </label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Salvar Presença
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PresencaFormManagement;






