import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { Card } from '@/shared/ui';
import { Select } from '@/shared/ui';
import { useApp } from '@/app/providers/AppContext';
import { attendanceApi as PresencaService } from '@/entities/attendance';
import type { Presenca } from '@/shared/model/database';
import { turmaApi as TurmasAPI } from '@/entities/turma';
import { AlunosAPI } from '@/features/student-management';
import { DracmasAPI } from '@/features/finance-management';

const AppFrequencia: React.FC = () => {
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(true);
  // Estados de Drácmas
  const [transacoesDracmas, setTransacoesDracmas] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);

  // Novos estados para filtro
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<{ id: string, label: string }[]>([]);
  const [filtroTurmaId, setFiltroTurmaId] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      if (!currentUser || currentUser.role !== 'student' || !currentUser.studentId) {
        setPresencas([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Carrega (1) Presenças, (2) Dados Aluno (turma atual), (3) Histórico, (4) Drácmas
        const [presencasData, alunoResp, historicoResp, dracmasResp] = await Promise.all([
          PresencaService.porAluno(currentUser.studentId).catch(console.error),
          AlunosAPI.buscarPorId(currentUser.studentId).catch(() => null),
          AlunosAPI.buscarHistorico(currentUser.studentId).catch(() => []),
          DracmasAPI.porAluno(currentUser.studentId).catch(() => ({ transacoes: [] }))
        ]);

        // 1. Processar Presenças
        const listaPresencas = (presencasData as any)?.registros
          ? (presencasData as any).registros
          : (Array.isArray(presencasData) ? presencasData : []);
        setPresencas(listaPresencas as Presenca[]);
        setHistorico(Array.isArray(historicoResp) ? historicoResp : []);

        // 2. Processar Drácmas (Transações + Resgates)
        const listaDracmas = (dracmasResp as any)?.transacoes || [];
        setTransacoesDracmas(Array.isArray(listaDracmas) ? listaDracmas : []);

        // 3. Identificar TODOS os IDs de turmas relevantes
        const relevantTurmaIds = new Set<string>();

        // (A) Turma Atual (Prioridade)
        let currentTurmaId = '';
        if (alunoResp && alunoResp.turma_id) {
          currentTurmaId = alunoResp.turma_id;
          relevantTurmaIds.add(currentTurmaId);
        }

        // (B) Turmas das Presenças
        listaPresencas.forEach((p: any) => {
          if (p.turma_id) relevantTurmaIds.add(p.turma_id);
        });

        // (C) Turmas das Drácmas (Ativas e Resgatadas)
        listaDracmas.forEach((d: any) => {
          if (d.turma_id) relevantTurmaIds.add(d.turma_id);
        });

        // 4. Buscar detalhes de TODAS as turmas identificadas para obter o Título do Módulo
        const turmasMap = new Map<string, string>();

        await Promise.all(
          Array.from(relevantTurmaIds).map(async (turmaId) => {
            try {
              // Busca a turma (agora o backend traz 'modulos')
              const t: any = await TurmasAPI.buscarPorId(turmaId);

              let label = t.nome; // Fallback: Nome da Turma

              // Se tiver módulo vinculado, usa o título do módulo
              if (t.modulos && t.modulos.titulo) {
                label = t.modulos.titulo;
              } else if (t.modulo_atual_id) {
                // Caso a relação não venha expandida por algum motivo, mas tem o ID
                label = `Módulo ${t.modulo_atual_id} (Verificar)`;
              }

              turmasMap.set(turmaId, label);
            } catch (err) {
              console.error(`Erro ao buscar turma ${turmaId}`, err);
              turmasMap.set(turmaId, `Turma Arquivada/Removida (${turmaId.slice(0, 8)})`);
            }
          })
        );

        // 5. Histórico sem ID de Turma (Fallback para módulos antigos migrados sem vínculo de turma)
        // Se houver histórico com 'modulo_info' que NÃO corresponde a nenhuma turma mapeada (pelo nome/numero?), adicionamos como opção virtual?
        // Por simplificação e segurança, vamos focar apenas nas turmas com ID real por enquanto, 
        // pois o filtro e drácmas dependem do ID. 
        // Se o usuário reclama de "módulo já cursado", provavelmente ele tem ID nas dracmas_resgate.

        const options = Array.from(turmasMap.entries())
          .map(([id, label]) => ({ id, label }))
          .sort((a, b) => a.label.localeCompare(b.label)); // Ordenar alfabeticamente ou por lógica de data se possível

        setTurmasDisponiveis(options);

        // Auto-selecionar
        if (!filtroTurmaId) {
          if (alunoResp?.turma_id && turmasMap.has(alunoResp.turma_id)) {
            setFiltroTurmaId(alunoResp.turma_id);
          } else if (options.length > 0) {
            setFiltroTurmaId(options[0].id);
          }
        }

      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Não foi possível carregar os dados.';
        setError(message);
        setPresencas([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser]);

  const dadosFiltrados = useMemo(() => {
    if (!filtroTurmaId) return presencas;
    return presencas.filter(p => p.turma_id === filtroTurmaId);
  }, [presencas, filtroTurmaId]);

  const dracmasFiltradas = useMemo(() => {
    if (!filtroTurmaId) return transacoesDracmas;
    return transacoesDracmas.filter(d => d.turma_id === filtroTurmaId);
  }, [transacoesDracmas, filtroTurmaId]);

  const registroHistoricoAtual = useMemo(() => {
    if (!filtroTurmaId) return null;
    return historico.find(h => h.turma_id === filtroTurmaId);
  }, [historico, filtroTurmaId]);

  const resumo = useMemo(() => {
    const total = dadosFiltrados.length;
    // Se temos registros detalhados (presencas), usamos eles
    if (total > 0) {
      const presentes = dadosFiltrados.filter(p => p.status === 'presente').length;
      const percentual = total > 0 ? Math.round((presentes / total) * 100) : 0;
      return { total, presentes, percentual };
    }

    // Fallback: Se não tem registros mas tem histórico (módulo passado), usa o resumo do histórico
    if (registroHistoricoAtual) {
      return {
        total: registroHistoricoAtual.total_aulas || 0,
        presentes: registroHistoricoAtual.total_presencas || 0,
        percentual: registroHistoricoAtual.frequencia || 0
      };
    }

    return { total: 0, presentes: 0, percentual: 0 };
  }, [dadosFiltrados, registroHistoricoAtual]);

  const saldoDracmasModulo = useMemo(() => {
    return dracmasFiltradas.reduce((acc, curr) => acc + (curr.quantidade || 0), 0);
  }, [dracmasFiltradas]);


  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="secondary" size="sm" className="bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white">
          <Link to="/app/dashboard">Voltar</Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Frequência</h1>
      <p className="text-sm text-gray-600 mb-6">Histórico de presença (somente leitura).</p>

      {error && (
        <Card className="p-4 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {/* Seletor de Módulo */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Módulo</label>
        <Select
          value={filtroTurmaId}
          onChange={(val) => setFiltroTurmaId(val)}
          className="max-w-md"
        >
          <option value="">Todos os Módulos (Geral)</option>
          {turmasDisponiveis.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Aulas registradas</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : resumo.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Presenças</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : resumo.presentes}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Percentual</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : `${resumo.percentual}%`}</p>
        </Card>
      </div>

      <Card className="p-4 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Histórico de Presença</h3>
        {loading ? (
          <p className="text-sm text-gray-600">Carregando frequência...</p>
        ) : dadosFiltrados.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-2">
              {registroHistoricoAtual
                ? "Detalhes diários arquivados. Visualize o resumo acima."
                : "Nenhum registro de presença encontrado."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Data</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Lição</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Observação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dadosFiltrados
                  .slice()
                  .sort((a, b) => String(a.data).localeCompare(String(b.data)))
                  .map((p) => {
                    const dataFmt = p.data ? new Date(p.data).toLocaleDateString('pt-BR') : '—';
                    const badge =
                      p.status === 'presente'
                        ? 'bg-green-100 text-green-800'
                        : p.status === 'falta'
                          ? 'bg-red-100 text-red-800'
                          : p.status === 'atraso'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800';

                    return (
                      <tr key={p.id}>
                        <td className="px-4 py-2">{dataFmt}</td>
                        <td className="px-4 py-2 text-gray-700">{(p as any).licoes?.titulo || '—'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${badge}`}>{p.status}</span>
                        </td>
                        <td className="px-4 py-2 text-gray-700">{p.observacao || '—'}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-4 border-l-4 border-yellow-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Extrato de Drácmas {filtroTurmaId ? '(Módulo Selecionado)' : '(Total)'}</h3>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-bold">Saldo</p>
            <p className="text-2xl font-black text-yellow-600">{saldoDracmasModulo}</p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-600">Carregando drácmas...</p>
        ) : dracmasFiltradas.length === 0 ? (
          <p className="text-sm text-gray-600">Nenhuma drácma registrada neste período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Data</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Descrição</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Qtd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dracmasFiltradas
                  .slice()
                  .sort((a, b) => String(a.data).localeCompare(String(b.data)))
                  .map((d, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2">{d.data ? new Date(d.data).toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="px-4 py-2 text-gray-700">{d.descricao || d.tipo}</td>
                      <td className="px-4 py-2 text-right font-bold text-yellow-700">+{d.quantidade}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AppFrequencia;
