import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CheckCircle, Edit } from 'lucide-react';
import { api } from '@/shared/api/api';
import { useApp } from '@/context/AppContext';

interface TurmaRascunho {
  id: string;
  nome: string;
  polo_id: string;
  nivel_id: string;
  capacidade: number;
  ano_letivo: number;
  turno: string;
  modulo_atual_id: string;
  status: 'rascunho';
  vagas_disponiveis: number;
  alunos_matriculados: number; 
  modulos?: {
    titulo: string;
  };
}

export const DraftClassesReview: React.FC = () => {
  const [rascunhos, setRascunhos] = useState<TurmaRascunho[]>([]);
  const [loading, setLoading] = useState(true);
  const { showFeedback } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const response = await api.get<TurmaRascunho[]>('/turmas?status=rascunho');
      setRascunhos(response);
    } catch (error) {
      console.error('Erro ao carregar rascunhos', error);
      showFeedback('error', 'Erro ao carregar turmas pendentes', 'Não foi possível buscar as turmas aguardando ativação.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (turmaId: string, nomeTurma: string) => {
    if (!confirm(`Tem certeza que deseja ativar a turma "${nomeTurma}"?\nIsso irá efetivar a matrícula dos alunos migrados.`)) {
      return;
    }

    try {
      await api.post(`/turmas/${turmaId}/activate-draft`);
      showFeedback('success', 'Turma Ativada com Sucesso! 🎉', `A turma ${nomeTurma} agora está ativa e os alunos foram migrados.`);
      loadDrafts(); 
    } catch (error: any) {
      showFeedback('error', 'Erro na ativação', error.response?.data?.message || "Ocorreu um erro ao ativar a turma.");
    }
  };

  const handleEdit = (turmaId: string) => {
    navigate(`/turmas/editar/${turmaId}?draft=true`);
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando pendências...</div>;
  }

  if (rascunhos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-800">Tudo em dia!</h2>
        <p className="text-gray-600">Nenhuma turma pendente de ativação no momento.</p>
        <Button onClick={() => navigate('/admin/dashboard')}>Voltar ao Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto py-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Revisão de Turmas Pendentes</h1>
        <p className="text-gray-500 max-w-2xl">
          As turmas abaixo foram geradas automaticamente após o encerramento dos módulos anteriores.
          Revise as informações, ajuste professores/horários se necessário, e ative-as para iniciar o novo módulo.
        </p>
      </div>

      <div className="grid gap-6">
        {rascunhos.map((turma) => (
          <Card key={turma.id} className="border-l-4 border-l-orange-500">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded uppercase border border-orange-200">
                    Aguardando Ativação
                  </span>
                  <span className="text-xs text-gray-400 font-mono italic">#{turma.id.slice(0, 8)}</span>
                </div>
                <h3 className="text-xl font-bold text-blue-900">{turma.nome}</h3>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{turma.modulos?.titulo}</span> • {turma.ano_letivo} • {turma.turno.charAt(0).toUpperCase() + turma.turno.slice(1)}
                </p>
              </div>
              
              <div className="text-right min-w-[120px]">
                <div className="text-sm font-medium text-gray-500">Alunos Migrados</div>
                <div className="text-3xl font-black text-gray-900">{turma.alunos_matriculados}</div>
                <div className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded mt-1">
                  Vagas restantes: {turma.vagas_disponiveis}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleEdit(turma.id)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar Detalhes
              </Button>
              
              <Button 
                variant="secondary"
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                onClick={() => handleActivate(turma.id, turma.nome)}
              >
                <CheckCircle className="h-4 w-4" />
                Confirmar e Ativar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default DraftClassesReview;
