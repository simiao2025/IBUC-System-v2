import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@/shared/ui';
import { moduleApi as ModulosAPI, lessonApi as LicoesAPI, turmaApi } from '@/entities/turma';
import type { Licao } from '@/shared/api/types/database';
import { useAuth } from '@/entities/user';
import { studentApi as AlunosAPI, StudentReportsAPI } from '@/entities/student';
import { BookOpen, Clock, CheckCircle } from 'lucide-react';

type ModuloItem = {
  id: string;
  numero: number;
  titulo: string;
  carga_horaria?: number;
  descricao?: string;
  status: 'concluido' | 'cursando' | 'aprovado';
  data_inicio?: string;
  data_conclusao?: string;
  situacao?: string;
};

const AppModulos: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [modulos, setModulos] = useState<ModuloItem[]>([]);
  const [licoesMap, setLicoesMap] = useState<Record<string, Licao[]>>({});
  const [expandedModulos, setExpandedModulos] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser || currentUser.role !== 'student' || !currentUser.studentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('[AppModulos] Carregando dados do aluno:', currentUser.studentId);

        // Buscar dados do aluno
        const alunoResponse = await AlunosAPI.getById(currentUser.studentId);
        const aluno = (alunoResponse as any)?.data || alunoResponse;

        // Buscar histórico de módulos concluídos
        const historicoResponse = await StudentReportsAPI.getHistory(currentUser.studentId);
        const historico = (historicoResponse as any)?.data || historicoResponse || [];

        console.log('[AppModulos] Histórico de módulos:', historico);
        console.log('[AppModulos] Dados do aluno:', aluno);

        const modulosLista: ModuloItem[] = [];
        const moduloIdsParaLicoes: string[] = [];

        // Adicionar módulos do histórico (concluídos/aprovados)
        if (Array.isArray(historico) && historico.length > 0) {
          for (const item of (historico as any[])) {
            if (item.modulo_info) {
              modulosLista.push({
                id: item.modulo_info.id,
                numero: item.modulo_info.numero,
                titulo: item.modulo_info.titulo,
                carga_horaria: item.modulo_info.carga_horaria,
                status: item.situacao === 'aprovado' ? 'aprovado' : 'concluido',
                data_inicio: item.data_inicio,
                data_conclusao: item.data_conclusao,
                situacao: item.situacao,
              });
              moduloIdsParaLicoes.push(item.modulo_info.id);
            }
          }
        }

        // Buscar módulo atual (da turma)
        if (aluno?.turma_id) {
          try {
            const turmaResponse: any = await turmaApi.getById(aluno.turma_id);
            const turma = turmaResponse?.data || turmaResponse;

            console.log('[AppModulos] Dados da turma:', turma);

            if (turma?.modulo_atual_id) {
              // Verificar se o módulo atual já não está no histórico
              const jaNoHistorico = modulosLista.some((m: any) => m.id === turma.modulo_atual_id);

              if (!jaNoHistorico) {
                // Buscar informações do módulo atual
                const moduloAtualResponse = await ModulosAPI.getById(turma.modulo_atual_id);
                const moduloAtual = (moduloAtualResponse as any)?.data || moduloAtualResponse;

                console.log('[AppModulos] Módulo atual:', moduloAtual);

                if (moduloAtual) {
                  modulosLista.push({
                    id: moduloAtual.id,
                    numero: moduloAtual.numero,
                    titulo: moduloAtual.titulo,
                    carga_horaria: moduloAtual.carga_horaria,
                    descricao: moduloAtual.descricao,
                    status: 'cursando',
                  });
                  moduloIdsParaLicoes.push(moduloAtual.id);
                }
              }
            }
          } catch (e) {
            console.error('[AppModulos] Erro ao buscar módulo atual:', e);
          }
        }

        // Ordenar módulos por número
        modulosLista.sort((a: any, b: any) => a.numero - b.numero);
        setModulos(modulosLista);

        console.log('[AppModulos] Lista final de módulos:', modulosLista);

        // Buscar lições para todos os módulos
        if (moduloIdsParaLicoes.length > 0) {
          const licoesPromises = moduloIdsParaLicoes.map(async (moduloId) => {
            try {
              const licoesResponse = await LicoesAPI.list({ modulo_id: moduloId });
              const licoes = (licoesResponse as any)?.data || licoesResponse || [];
              return { moduloId, licoes };
            } catch (e) {
              console.error(`[AppModulos] Erro ao carregar lições do módulo ${moduloId}:`, e);
              return { moduloId, licoes: [] };
            }
          });

          const licoesResults = await Promise.all(licoesPromises);
          const licoesData: Record<string, Licao[]> = {};
          licoesResults.forEach(({ moduloId, licoes }) => {
            licoesData[moduloId] = licoes;
          });
          setLicoesMap(licoesData);

          console.log('[AppModulos] Lições carregadas:', licoesData);
        }

      } catch (e) {
        console.error('[AppModulos] Erro ao carregar módulos:', e);
        setError('Não foi possível carregar os módulos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const toggleModulo = (moduloId: string) => {
    const newExpanded = new Set(expandedModulos);
    if (newExpanded.has(moduloId)) {
      newExpanded.delete(moduloId);
    } else {
      newExpanded.add(moduloId);
    }
    setExpandedModulos(newExpanded);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'aprovado':
      case 'concluido':
        return { className: 'bg-green-100 text-green-800', label: 'Aprovado', icon: CheckCircle };
      case 'cursando':
        return { className: 'bg-blue-100 text-blue-800', label: 'Cursando', icon: Clock };
      default:
        return { className: 'bg-gray-100 text-gray-800', label: status, icon: Clock };
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="secondary" size="sm" className="bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white">
          <Link to="/app/dashboard">Voltar</Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Módulos</h1>
      <p className="text-sm text-gray-600 mb-6">
        Histórico de módulos cursados e em andamento
      </p>

      {error && (
        <Card className="p-4 mb-4 border-l-4 border-red-500">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {loading ? (
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Carregando módulos...</p>
          </div>
        </Card>
      ) : modulos.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">Você ainda não iniciou nenhum módulo.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {modulos.map((modulo) => {
            const statusInfo = getStatusInfo(modulo.status);
            const StatusIcon = statusInfo.icon;
            const isExpanded = expandedModulos.has(modulo.id);
            const licoes = licoesMap[modulo.id] || [];
            const totalDuracao = licoes.reduce((acc, l) => acc + (l.duracao_minutos || 0), 0);

            return (
              <Card key={modulo.id} className="overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleModulo(modulo.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-teal-100 text-teal-800 rounded-full h-10 w-10 flex items-center justify-center font-bold text-sm">
                          {modulo.numero}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{modulo.titulo}</h3>
                          {modulo.descricao && (
                            <p className="text-sm text-gray-600 mt-1">{modulo.descricao}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 ml-13">
                        {modulo.carga_horaria && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{modulo.carga_horaria}h</span>
                          </div>
                        )}
                        {licoes.length > 0 && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{licoes.length} lições</span>
                          </div>
                        )}
                        {modulo.data_inicio && (
                          <span className="text-xs">
                            Início: {new Date(modulo.data_inicio).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {modulo.data_conclusao && (
                          <span className="text-xs">
                            Conclusão: {new Date(modulo.data_conclusao).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span>{statusInfo.label}</span>
                    </div>
                  </div>
                </div>

                {isExpanded && licoes.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Lições do Módulo</h4>
                    <div className="space-y-2">
                      {licoes
                        .sort((a, b) => a.ordem - b.ordem)
                        .map((licao) => (
                          <div
                            key={licao.id}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-gray-100 text-gray-600 rounded-full h-8 w-8 flex items-center justify-center font-medium text-xs">
                                {licao.ordem}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{licao.titulo}</p>
                                {licao.descricao && (
                                  <p className="text-xs text-gray-500 mt-0.5">{licao.descricao}</p>
                                )}
                              </div>
                            </div>
                            {licao.duracao_minutos && (
                              <span className="text-xs text-gray-500">
                                {licao.duracao_minutos} min
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                    {totalDuracao > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          Duração total estimada: <span className="font-semibold">{totalDuracao} minutos</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppModulos;
