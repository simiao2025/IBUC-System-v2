import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import { useApp } from '../../context/AppContext';
import { PresencaService } from '../../features/attendance/presenca.service';
import type { Presenca } from '../../types/database';
import { TurmasAPI } from '../../features/classes/services/turma.service';
import { AlunosAPI } from '../../features/students/aluno.service';
import { DracmasAPI } from '../../features/finance/dracmas.service';

const AppFrequencia: React.FC = () => {
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(true);
  // Estados de Drácmas
  const [transacoesDracmas, setTransacoesDracmas] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  
  // Novos estados para filtro
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<{id: string, label: string}[]>([]);
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
        const [presencasData, alunoResp, , dracmasResp] = await Promise.all([
           PresencaService.porAluno(currentUser.studentId).catch(console.error),
           AlunosAPI.buscarPorId(currentUser.studentId).then(r => r.data).catch(() => null),
           AlunosAPI.buscarHistorico(currentUser.studentId).then(r => r.data).catch(() => []),
           DracmasAPI.porAluno(currentUser.studentId).catch(() => ({ transacoes: [] }))
        ]);

        // Processar Presenças
        const listaPresencas = (presencasData as any)?.registros 
          ? (presencasData as any).registros 
          : (Array.isArray(presencasData) ? presencasData : []);
        setPresencas(listaPresencas as Presenca[]);

        // Processar Drácmas
        const listaDracmas = (dracmasResp as any)?.transacoes || [];
        setTransacoesDracmas(Array.isArray(listaDracmas) ? listaDracmas : []);

        // MONTAR LISTA DE TURMAS UNIFICADA
        const turmasMap = new Map<string, string>();

        // (A) Turma Atual
        if (alunoResp && alunoResp.turma_atual_id) {
           try {
              const t = await TurmasAPI.buscarPorId(alunoResp.turma_atual_id).then(res => res.data);
              if (t) {
                 const label = t.modulos?.titulo || t.nome;
                 turmasMap.set(t.id, label);
              }
           } catch {}
        }

        // (B) IDs das Presenças
        const presencaTurmaIds = Array.from(new Set(listaPresencas.map((p: any) => p.turma_id).filter(Boolean)));
        
        // (C) IDs das Drácmas
        const dracmasTurmaIds = Array.from(new Set(listaDracmas.map((d: any) => d.turma_id).filter(Boolean)));
        
        // Buscar nomes faltantes
        const allIds = new Set([...presencaTurmaIds, ...dracmasTurmaIds]);
        const idsToFetch = Array.from(allIds).filter(id => !turmasMap.has(id as string));

        if (idsToFetch.length > 0) {
           await Promise.all(idsToFetch.map(async (id) => {
              try {
                  const t: any = await TurmasAPI.buscarPorId(id as string).then(res => (res as any).data || res);
                  const label = t.modulos?.titulo || t.nome || `Turma ${id}`;
                  turmasMap.set(id as string, label);
              } catch {
                  turmasMap.set(id as string, `Turma ${id}`);
              }
           }));
        }

        const options = Array.from(turmasMap.entries()).map(([id, label]) => ({ id, label }));
        setTurmasDisponiveis(options);

        // Auto-selecionar turma atual se existir
        if (!filtroTurmaId && alunoResp?.turma_atual_id && turmasMap.has(alunoResp.turma_atual_id)) {
            setFiltroTurmaId(alunoResp.turma_atual_id);
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

  const resumo = useMemo(() => {
    const total = dadosFiltrados.length;
    const presentes = dadosFiltrados.filter(p => p.status === 'presente').length;
    const percentual = total > 0 ? Math.round((presentes / total) * 100) : 0;
    return { total, presentes, percentual };
  }, [dadosFiltrados]);

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
          <p className="text-sm text-gray-600">Nenhum registro de presença encontrado.</p>
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
                  .sort((a, b) => String(b.data).localeCompare(String(a.data)))
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
                            .sort((a, b) => String(b.data).localeCompare(String(a.data)))
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
