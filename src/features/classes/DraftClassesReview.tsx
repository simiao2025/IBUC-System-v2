import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle, Edit, ArrowRight } from 'lucide-react';
import { api } from '@/shared/api/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/app/providers/AuthContext';

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
  alunos_matriculados: number; // Neste caso, são os pré-vinculados
  modulos?: {
    titulo: string;
  };
}

export const DraftClassesReview: React.FC = () => {
  const [rascunhos, setRascunhos] = useState<TurmaRascunho[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth(); // Para filtrar por polo se necessário no front, mas o back já deve filtrar

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      // Busca turmas com status 'rascunho'
      // Assumindo que o endpoint de listagem suporta filtro por status
      const response = await api.get('/turmas', { 
        params: { status: 'rascunho' } // Filtro status
      });
      setRascunhos(response.data);
    } catch (error) {
      console.error('Erro ao carregar rascunhos', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar turmas pendentes",
        description: "Não foi possível buscar as turmas aguardando ativação."
      });
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
      toast({
        variant: "default",
        className: "bg-green-600 text-white border-none",
        title: "Turma Ativada com Sucesso! 🎉",
        description: `A turma ${nomeTurma} agora está ativa e os alunos foram migrados.`
      });
      loadDrafts(); // Recarrega lista
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na ativação",
        description: error.response?.data?.message || "Ocorreu um erro ao ativar a turma."
      });
    }
  };

  const handleEdit = (turmaId: string) => {
    // Redireciona para tela de edição de turma existente (reaproveitando)
    // Assumindo rota /turmas/editar/:id
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
        <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto py-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Revisão de Turmas Pendentes</h1>
        <p className="text-gray-500">
          As turmas abaixo foram geradas automaticamente após o encerramento dos módulos anteriores.
          Revise as informações, ajuste professores/horários se necessário, e ative-as para iniciar o novo módulo.
        </p>
      </div>

      <div className="grid gap-6">
        {rascunhos.map((turma) => (
          <Card key={turma.id} className="border-l-4 border-l-orange-500 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Aguardando Ativação
                    </Badge>
                    <span className="text-xs text-gray-400 font-mono">{turma.id.slice(0, 8)}</span>
                  </div>
                  <CardTitle className="text-xl text-blue-900">{turma.nome}</CardTitle>
                  <CardDescription>
                     {turma.modulos?.titulo} • {turma.ano_letivo} • {turma.turno.charAt(0).toUpperCase() + turma.turno.slice(1)}
                  </CardDescription>
                </div>
                <div className="text-right">
                   <div className="text-sm font-medium text-gray-500">Alunos Migrados</div>
                   <div className="text-2xl font-bold text-gray-900">{turma.alunos_matriculados}</div>
                   <div className="text-xs text-gray-400">Vagas restantes: {turma.vagas_disponiveis}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 border-t bg-gray-50/50 flex justify-end gap-3">
               <Button 
                variant="outline" 
                onClick={() => handleEdit(turma.id)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar Detalhes
              </Button>
              
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm"
                onClick={() => handleActivate(turma.id, turma.nome)}
              >
                <CheckCircle className="h-4 w-4" />
                Confirmar e Ativar Turma
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
