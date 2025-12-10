import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  ArrowLeft,
  BarChart3,
  Download,
  Calendar,
  Users,
  TrendingUp,
  Award,
  Clock,
  MapPin,
  BookOpen,
  FileText,
  PieChart,
  Activity
} from 'lucide-react';
import { RelatoriosAPI, PresencasAPI, DracmasAPI, MatriculaAPI } from '../../lib/api';

const EducationalReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('enrollment');
  const [dateFilter, setDateFilter] = useState({
    start: '2024-01-01',
    end: '2024-12-31'
  });
  const [poloFilter, setPoloFilter] = useState<string>('all');
  const [boletimAlunoId, setBoletimAlunoId] = useState<string>('');
  const [boletimStatus, setBoletimStatus] = useState<'idle' | 'loading' | 'processing' | 'error'>('idle');
  const [boletimErrorMessage, setBoletimErrorMessage] = useState<string>('');
  const [attendanceTurmaId, setAttendanceTurmaId] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState<string>('2024-01-01');
  const [attendanceStatus, setAttendanceStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [attendanceErrorMessage, setAttendanceErrorMessage] = useState<string>('');
  const [attendanceSummary, setAttendanceSummary] = useState<{
    totalAlunos: number;
    presentes: number;
    faltantes: number;
    frequenciaMedia: number; // 0-100
    alunosAltaFrequencia: number;
  } | null>(null);
  const [certTurmaId, setCertTurmaId] = useState<string>('');
  const [certStatus, setCertStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [certErrorMessage, setCertErrorMessage] = useState<string>('');
  const [certResumoPorAluno, setCertResumoPorAluno] = useState<{
    alunoId: string;
    totalAulas: number;
    presencas: number;
    faltas: number;
    frequenciaPercentual: number;
    aptoCertificacao: boolean;
  }[]>([]);
  const [historyAlunoId, setHistoryAlunoId] = useState<string>('');
  const [historyStatus, setHistoryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [historyErrorMessage, setHistoryErrorMessage] = useState<string>('');
  const [historyResult, setHistoryResult] = useState<unknown | null>(null);

  const [dracmasAlunoId, setDracmasAlunoId] = useState<string>('');
  const [dracmasStatus, setDracmasStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [dracmasErrorMessage, setDracmasErrorMessage] = useState<string>('');
  const [dracmasResumo, setDracmasResumo] = useState<{
    saldoAtual: number;
    totalGanhoPeriodo: number;
    totalTransacoes: number;
  } | null>(null);
  const [dracmasTransacoes, setDracmasTransacoes] = useState<{
    id: string;
    data: string;
    tipo: string;
    descricao?: string;
    quantidade: number;
  }[]>([]);

  const [enrollmentStatus, setEnrollmentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [enrollmentErrorMessage, setEnrollmentErrorMessage] = useState<string>('');
  const [enrollmentSummary, setEnrollmentSummary] = useState<{
    totalMatriculas: number;
    matriculasNoPeriodo: number;
    porStatus: Record<string, number>;
    porNivel: Record<string, number>;
  } | null>(null);

  type BoletimResponse = {
    status?: string;
    [key: string]: unknown;
  };

  type HistoricoAlunoPeriodo = {
    periodo?: string;
    turma?: string;
    situacao?: string;
    observacoes?: string;
  };

  type HistoricoAlunoResponse = {
    aluno?: {
      id?: string;
      nome?: string;
    } | null;
    periodos?: HistoricoAlunoPeriodo[];
    [key: string]: unknown;
  };

  type DracmaTransacaoApi = {
    id?: string | number;
    data?: string;
    created_at?: string;
    tipo?: string;
    descricao?: string;
    quantidade?: number;
  };

  type MatriculaApiItem = {
    id?: string | number;
    created_at?: string;
    status?: string;
    nivel?: string;
    nivel_id?: string | number;
    [key: string]: unknown;
  };

  const reportTypes = [
    { id: 'boletim', label: 'Boletim do Aluno', icon: FileText },
    { id: 'enrollment', label: 'Relatório de Matrículas', icon: Users },
    { id: 'attendance', label: 'Relatório de Frequência', icon: Clock },
    { id: 'certification', label: 'Certificação por Turma', icon: Award },
    { id: 'history', label: 'Histórico do Aluno', icon: FileText },
    { id: 'dracmas', label: 'Relatório de Drácmas', icon: Award },
    { id: 'performance', label: 'Desempenho por Nível', icon: TrendingUp },
    { id: 'certificates', label: 'Certificados Emitidos', icon: Award },
    { id: 'polo-stats', label: 'Estatísticas por Polo', icon: MapPin },
    { id: 'teachers', label: 'Relatório de Professores', icon: BookOpen },
    { id: 'financial', label: 'Relatório Financeiro', icon: PieChart },
    { id: 'activities', label: 'Atividades e Eventos', icon: Activity }
  ];

  const generateReport = async () => {
    // Matrículas: usa lista de matrículas com filtro de polo e período
    if (selectedReport === 'enrollment') {
      try {
        setEnrollmentStatus('loading');
        setEnrollmentErrorMessage('');
        setEnrollmentSummary(null);

        const params: { polo_id?: string } = {};
        if (poloFilter !== 'all') {
          params.polo_id = poloFilter;
        }

        const matriculas = await MatriculaAPI.listar(params) as MatriculaApiItem[];

        const totalMatriculas = Array.isArray(matriculas) ? matriculas.length : 0;

        const inicio = dateFilter.start ? new Date(dateFilter.start) : null;
        const fim = dateFilter.end ? new Date(dateFilter.end) : null;

        const dentroDoPeriodo = (m: MatriculaApiItem) => {
          if (!m.created_at || !inicio || !fim) return true;
          const data = new Date(m.created_at);
          return data >= inicio && data <= fim;
        };

        const matriculasNoPeriodoLista = (Array.isArray(matriculas) ? matriculas : []).filter(dentroDoPeriodo);
        const matriculasNoPeriodo = matriculasNoPeriodoLista.length;

        const porStatus: Record<string, number> = {};
        const porNivel: Record<string, number> = {};

        matriculasNoPeriodoLista.forEach((m) => {
          const status = (m.status || 'desconhecido').toString();
          porStatus[status] = (porStatus[status] || 0) + 1;

          const nivelLabel =
            (typeof m.nivel === 'string' && m.nivel) ||
            (m.nivel_id !== undefined ? `Nível ${m.nivel_id}` : 'Nível não informado');
          porNivel[nivelLabel] = (porNivel[nivelLabel] || 0) + 1;
        });

        setEnrollmentSummary({
          totalMatriculas,
          matriculasNoPeriodo,
          porStatus,
          porNivel,
        });

        setEnrollmentStatus('success');
      } catch (error: unknown) {
        console.error('Erro ao carregar relatório de matrículas:', error);
        setEnrollmentStatus('error');
        const message = error instanceof Error ? error.message : 'Erro ao carregar relatório de matrículas.';
        setEnrollmentErrorMessage(message);
      }

      return;
    }

    // Certificação por turma: usa presenças agregadas por aluno e calcula regra de 75%
    if (selectedReport === 'certification') {
      if (!certTurmaId) {
        alert('Informe o ID da turma para consultar a certificação.');
        return;
      }

      try {
        setCertStatus('loading');
        setCertErrorMessage('');
        setCertResumoPorAluno([]);

        const inicio = dateFilter.start || undefined;
        const fim = dateFilter.end || undefined;
        const response = await PresencasAPI.porTurma(certTurmaId, inicio, fim) as any;

        const resumoPorAluno = Array.isArray(response?.data?.resumoPorAluno)
          ? response.data.resumoPorAluno
          : [];

        const mapped = resumoPorAluno.map((item: any) => {
          const total = item.total || 0;
          const presentes = item.presentes || 0;
          const faltas = item.faltas || Math.max(total - presentes, 0);
          const frequenciaPercentual = total > 0 ? (presentes / total) * 100 : 0;
          const aptoCertificacao = frequenciaPercentual >= 75;

          return {
            alunoId: String(item.aluno_id ?? ''),
            totalAulas: total,
            presencas: presentes,
            faltas,
            frequenciaPercentual,
            aptoCertificacao,
          };
        });

        setCertResumoPorAluno(mapped);
        setCertStatus('success');
      } catch (error: unknown) {
        console.error('Erro ao carregar relatório de certificação:', error);
        setCertStatus('error');
        const message = error instanceof Error ? error.message : 'Erro ao carregar relatório de certificação.';
        setCertErrorMessage(message);
      }

      return;
    }

    // Boletim: usa endpoint real de geração
    if (selectedReport === 'boletim') {
      if (!boletimAlunoId) {
        alert('Informe o ID do aluno para gerar o boletim.');
        return;
      }

      try {
        setBoletimStatus('loading');
        setBoletimErrorMessage('');

        // Período pode ser representado como intervalo de datas "inicio|fim"
        const periodo = `${dateFilter.start}|${dateFilter.end}`;
        const response = await RelatoriosAPI.gerarBoletim(boletimAlunoId, periodo) as BoletimResponse;

        if (response && response.status === 'processing') {
          setBoletimStatus('processing');
        } else {
          setBoletimStatus('idle');
        }
      } catch (error: unknown) {
        console.error('Erro ao gerar boletim:', error);
        setBoletimStatus('error');
        const message = error instanceof Error ? error.message : 'Erro ao gerar boletim.';
        setBoletimErrorMessage(message);
      }

      return;
    }

    // Drácmas: saldo e transações por aluno no período
    if (selectedReport === 'dracmas') {
      if (!dracmasAlunoId) {
        alert('Informe o ID do aluno para consultar os Drácmas.');
        return;
      }

      try {
        setDracmasStatus('loading');
        setDracmasErrorMessage('');
        setDracmasResumo(null);
        setDracmasTransacoes([]);

        // Saldo atual
        const saldoResponse = await DracmasAPI.saldoPorAluno(dracmasAlunoId) as { saldo: number };

        // Transações no período
        const periodoInicio = dateFilter.start;
        const periodoFim = dateFilter.end;
        const transacoesResponse = await DracmasAPI.porAluno(dracmasAlunoId, periodoInicio, periodoFim) as DracmaTransacaoApi[];

        const totalGanhoPeriodo = transacoesResponse.reduce((acc, t) => acc + (t.quantidade || 0), 0);

        const transacoesMapeadas = transacoesResponse.map((t) => ({
          id: String(t.id ?? ''),
          data: t.data || t.created_at || '',
          tipo: t.tipo || '',
          descricao: t.descricao,
          quantidade: t.quantidade ?? 0,
        }));

        setDracmasResumo({
          saldoAtual: saldoResponse?.saldo ?? 0,
          totalGanhoPeriodo,
          totalTransacoes: transacoesMapeadas.length,
        });
        setDracmasTransacoes(transacoesMapeadas);
        setDracmasStatus('success');
      } catch (error: unknown) {
        console.error('Erro ao carregar relatório de Drácmas:', error);
        setDracmasStatus('error');
        const message = error instanceof Error ? error.message : 'Erro ao carregar relatório de Drácmas.';
        setDracmasErrorMessage(message);
      }

      return;
    }

    // Frequência: usa dados reais de presença por turma
    if (selectedReport === 'attendance') {
      if (!attendanceTurmaId || !attendanceDate) {
        alert('Informe a Turma e a Data para gerar o relatório de frequência.');
        return;
      }

      try {
        setAttendanceStatus('loading');
        setAttendanceErrorMessage('');
        setAttendanceSummary(null);

        // Usa a mesma data como início/fim para obter as presenças daquele dia
        const presencas = await PresencasAPI.porTurma(attendanceTurmaId, attendanceDate, attendanceDate) as any[];

        const totalAlunos = presencas.length;
        const presentes = presencas.filter((p) => p.status === 'presente').length;
        const faltantes = totalAlunos - presentes;
        const frequenciaMedia = totalAlunos > 0 ? (presentes / totalAlunos) * 100 : 0;
        const alunosAltaFrequencia = presentes; // no contexto de um único dia, presentes = alta frequência

        setAttendanceSummary({
          totalAlunos,
          presentes,
          faltantes,
          frequenciaMedia,
          alunosAltaFrequencia,
        });

        setAttendanceStatus('success');
      } catch (error: unknown) {
        console.error('Erro ao gerar relatório de frequência:', error);
        setAttendanceStatus('error');
        const message = error instanceof Error ? error.message : 'Erro ao gerar relatório de frequência.';
        setAttendanceErrorMessage(message);
      }

      return;
    }

    // Histórico: usa endpoint de histórico (ainda sem agregação avançada)
    if (selectedReport === 'history') {
      if (!historyAlunoId) {
        alert('Informe o ID do aluno para consultar o histórico.');
        return;
      }

      try {
        setHistoryStatus('loading');
        setHistoryErrorMessage('');
        setHistoryResult(null);

        const periodo = `${dateFilter.start}|${dateFilter.end}`;
        const response = await RelatoriosAPI.historicoAluno(historyAlunoId, periodo);

        setHistoryResult(response as HistoricoAlunoResponse);
        setHistoryStatus('success');
      } catch (error: unknown) {
        console.error('Erro ao carregar histórico do aluno:', error);
        setHistoryStatus('error');
        const message = error instanceof Error ? error.message : 'Erro ao carregar histórico do aluno.';
        setHistoryErrorMessage(message);
      }

      return;
    }

    // Demais relatórios ainda são placeholders
    alert('Geração de relatórios ainda não está integrada a dados reais para este tipo.');
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    // Placeholder até integração com backend de relatórios
    alert(`Exportação em ${format.toUpperCase()} será habilitada após integração com os relatórios reais.`);
  };

  const renderEnrollmentReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center bg-blue-50 border-blue-200">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-blue-900">
            {enrollmentSummary ? enrollmentSummary.totalMatriculas : '--'}
          </h3>
          <p className="text-blue-700">Total de Matrículas (filtro de polo aplicado)</p>
        </Card>
        <Card className="text-center bg-purple-50 border-purple-200">
          <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-purple-900">
            {enrollmentSummary ? enrollmentSummary.matriculasNoPeriodo : '--'}
          </h3>
          <p className="text-purple-700">Matrículas no período selecionado</p>
        </Card>
        <Card className="text-center bg-green-50 border-green-200">
          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-green-900">
            {enrollmentSummary && enrollmentSummary.totalMatriculas > 0
              ? `${((enrollmentSummary.matriculasNoPeriodo / enrollmentSummary.totalMatriculas) * 100).toFixed(1)}%`
              : '--'}
          </h3>
          <p className="text-green-700">Percentual de matrículas no período</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Matrículas por Status (no período)</h3>
          <div className="space-y-3 text-sm text-gray-600">
            {enrollmentStatus === 'idle' && (
              <p className="text-gray-600">Aguardando geração do relatório de matrículas.</p>
            )}
            {enrollmentStatus === 'loading' && (
              <p className="text-blue-600 font-medium">Carregando dados de matrículas...</p>
            )}
            {enrollmentStatus === 'success' && enrollmentSummary && (
              <ul className="space-y-1">
                {Object.entries(enrollmentSummary.porStatus).map(([status, quantidade]) => (
                  <li key={status} className="flex justify-between">
                    <span className="capitalize text-gray-700">{status.toLowerCase()}</span>
                    <span className="font-semibold text-gray-900">{quantidade}</span>
                  </li>
                ))}
                {Object.keys(enrollmentSummary.porStatus).length === 0 && (
                  <p className="text-gray-600">Nenhuma matrícula encontrada no período informado.</p>
                )}
              </ul>
            )}
            {enrollmentStatus === 'error' && (
              <p className="text-red-600 font-medium">
                Ocorreu um erro ao carregar o relatório de matrículas: {enrollmentErrorMessage}
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Matrículas por Nível (no período)</h3>
          <div className="space-y-3 text-sm text-gray-600">
            {enrollmentStatus === 'idle' && (
              <p className="text-gray-600">Aguardando geração do relatório de matrículas.</p>
            )}
            {enrollmentStatus === 'loading' && (
              <p className="text-blue-600 font-medium">Carregando dados de matrículas...</p>
            )}
            {enrollmentStatus === 'success' && enrollmentSummary && (
              <ul className="space-y-1">
                {Object.entries(enrollmentSummary.porNivel).map(([nivel, quantidade]) => (
                  <li key={nivel} className="flex justify-between">
                    <span className="text-gray-700">{nivel}</span>
                    <span className="font-semibold text-gray-900">{quantidade}</span>
                  </li>
                ))}
                {Object.keys(enrollmentSummary.porNivel).length === 0 && (
                  <p className="text-gray-600">Nenhuma matrícula encontrada no período informado.</p>
                )}
              </ul>
            )}
            {enrollmentStatus === 'error' && (
              <p className="text-red-600 font-medium">
                Ocorreu um erro ao carregar o relatório de matrículas: {enrollmentErrorMessage}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderCertificationReport = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Certificação por Turma</h3>
        <p className="text-sm text-gray-700 mb-4">
          Este relatório mostra, para a turma e período selecionados, a frequência de cada aluno e se ele está
          <span className="font-semibold"> apto à certificação</span> com base na frequência mínima de 75%.
        </p>

        <div className="space-y-3 text-sm text-gray-700">
          {certStatus === 'idle' && (
            <p className="text-gray-600">Aguardando parâmetros para gerar o relatório de certificação.</p>
          )}
          {certStatus === 'loading' && (
            <p className="text-blue-600 font-medium">Carregando dados de certificação da turma...</p>
          )}
          {certStatus === 'success' && certResumoPorAluno.length === 0 && (
            <p className="text-gray-600">Nenhum registro encontrado para o período informado.</p>
          )}
          {certStatus === 'success' && certResumoPorAluno.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Total Aulas</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Presenças</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Faltas</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Frequência</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Certificação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {certResumoPorAluno.map((item) => (
                    <tr key={item.alunoId}>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-800">{item.alunoId}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-800">{item.totalAulas}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-green-700">{item.presencas}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-red-700">{item.faltas}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                        {item.totalAulas > 0 ? `${item.frequenciaPercentual.toFixed(1)}%` : '—'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                        {item.aptoCertificacao ? 'Apto (>= 75%)' : 'Não apto (< 75%)'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {certStatus === 'error' && (
            <p className="text-red-600 font-medium">
              Ocorreu um erro ao carregar o relatório de certificação: {certErrorMessage}
            </p>
          )}
        </div>
      </Card>
    </div>
  );

  const renderHistoryReport = () => {
    const typed = (historyResult || {}) as HistoricoAlunoResponse;
    const periodos = Array.isArray(typed.periodos) ? typed.periodos : [];

    return (
      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Histórico do Aluno</h3>
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              Este relatório apresenta um resumo dos períodos cursados pelo aluno, incluindo turma, situação final e observações.
            </p>
            <p>
              Utilize o filtro de <span className="font-semibold">ID do Aluno</span> e o período desejado para definir o escopo do histórico.
            </p>

            <div className="mt-4">
              {historyStatus === 'idle' && (
                <p className="text-gray-600">
                  Aguardando parâmetros para carregar o histórico.
                </p>
              )}
              {historyStatus === 'loading' && (
                <p className="text-blue-600 font-medium">
                  Carregando histórico do aluno...
                </p>
              )}
              {historyStatus === 'success' && (
                <div className="space-y-4">
                  {/* Cabeçalho do aluno, se disponível */}
                  {typed.aluno && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">Aluno:</span> {typed.aluno.nome || typed.aluno.id}
                      </p>
                      {typed.aluno.id && (
                        <p className="text-xs text-gray-500">ID: {typed.aluno.id}</p>
                      )}
                    </div>
                  )}

                  {/* Tabela de períodos */}
                  {periodos.length > 0 ? (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                              Período
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                              Turma
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                              Situação
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                              Observações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {periodos.map((p, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                                {p.periodo || '-'}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                                {p.turma || '-'}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                                {p.situacao || '-'}
                              </td>
                              <td className="px-3 py-2 text-gray-800">
                                {p.observacoes || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      Nenhum período encontrado para o filtro informado.
                    </p>
                  )}

                  {/* Detalhes técnicos (JSON bruto) */}
                  <details className="mt-4">
                    <summary className="text-xs text-gray-500 cursor-pointer select-none">
                      Ver detalhes técnicos (JSON bruto)
                    </summary>
                    <div className="mt-2 bg-gray-50 border border-gray-200 rounded-md p-3">
                      <pre className="text-xs text-gray-800 overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(historyResult, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              )}
              {historyStatus === 'error' && (
                <p className="text-red-600 font-medium">
                  Ocorreu um erro ao carregar o histórico: {historyErrorMessage}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderBoletimReport = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Boletim do Aluno</h3>
        <div className="space-y-4 text-sm text-gray-700">
          <p>
            Este relatório gera o boletim oficial do aluno para o período selecionado. O processamento é feito
            pelo backend e pode envolver geração de PDF e registros adicionais.
          </p>
          <p>
            Preencha o <span className="font-semibold">ID do Aluno</span> e o período desejado na barra lateral, depois clique em
            <span className="font-semibold"> "Gerar Relatório"</span>.
          </p>

          <div className="mt-4">
            {boletimStatus === 'idle' && (
              <p className="text-gray-600">
                Aguardando parâmetros para gerar o boletim.
              </p>
            )}
            {boletimStatus === 'loading' && (
              <p className="text-blue-600 font-medium">
                Enviando solicitação de geração de boletim...
              </p>
            )}
            {boletimStatus === 'processing' && (
              <p className="text-green-700 font-medium">
                Boletim em processamento. Assim que estiver pronto, ele estará disponível no módulo de relatórios ou na área do aluno.
              </p>
            )}
            {boletimStatus === 'error' && (
              <p className="text-red-600 font-medium">
                Ocorreu um erro ao gerar o boletim: {boletimErrorMessage}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDracmasReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center bg-yellow-50 border-yellow-200">
          <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-yellow-900">
            {dracmasResumo ? dracmasResumo.saldoAtual : '--'}
          </h3>
          <p className="text-yellow-700">Saldo Atual de Drácmas</p>
        </Card>
        <Card className="text-center bg-green-50 border-green-200">
          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-green-900">
            {dracmasResumo ? dracmasResumo.totalGanhoPeriodo : '--'}
          </h3>
          <p className="text-green-700">Total Ganho no Período</p>
        </Card>
        <Card className="text-center bg-blue-50 border-blue-200">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-blue-900">
            {dracmasResumo ? dracmasResumo.totalTransacoes : '--'}
          </h3>
          <p className="text-blue-700">Transações Registradas</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Transações de Drácmas</h3>
        <div className="space-y-4 text-sm text-gray-600">
          {dracmasStatus === 'idle' && (
            <p className="text-gray-600">
              Aguardando parâmetros para carregar o relatório de Drácmas.
            </p>
          )}
          {dracmasStatus === 'loading' && (
            <p className="text-blue-600 font-medium">
              Carregando transações de Drácmas do aluno...
            </p>
          )}
          {dracmasStatus === 'success' && dracmasTransacoes.length === 0 && (
            <p className="text-gray-600">
              Nenhuma transação encontrada para o período informado.
            </p>
          )}
          {dracmasStatus === 'success' && dracmasTransacoes.length > 0 && (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {dracmasTransacoes.map((t) => (
                    <tr key={t.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                        {t.data ? new Date(t.data).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                        {t.tipo || '-'}
                      </td>
                      <td className="px-3 py-2 text-gray-800">
                        {t.descricao || '-'}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-800">
                        {t.quantidade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {dracmasStatus === 'error' && (
            <p className="text-red-600 font-medium">
              Ocorreu um erro ao carregar o relatório de Drácmas: {dracmasErrorMessage}
            </p>
          )}
        </div>
      </Card>
    </div>
  );

  const renderAttendanceReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="text-center bg-green-50 border-green-200">
          <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-3xl font-bold text-green-900">
            {attendanceSummary ? `${attendanceSummary.frequenciaMedia.toFixed(1)}%` : '--%'}
          </h3>
          <p className="text-green-700">Frequência Média da Turma na Data Selecionada</p>
        </Card>
        <Card className="text-center bg-blue-50 border-blue-200">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-3xl font-bold text-blue-900">
            {attendanceSummary ? attendanceSummary.alunosAltaFrequencia : '--'}
          </h3>
          <p className="text-blue-700">Alunos Presentes (considerados com alta frequência neste dia)</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Detalhes da Frequência</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="mt-2">
            {attendanceStatus === 'idle' && (
              <p className="text-gray-600">
                Aguardando parâmetros para gerar o relatório de frequência.
              </p>
            )}
            {attendanceStatus === 'loading' && (
              <p className="text-blue-600 font-medium">
                Carregando dados de frequência da turma...
              </p>
            )}
            {attendanceStatus === 'success' && attendanceSummary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                  <p className="text-xs text-gray-500">Total de Alunos</p>
                  <p className="text-lg font-semibold text-gray-900">{attendanceSummary.totalAlunos}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                  <p className="text-xs text-gray-500">Presentes</p>
                  <p className="text-lg font-semibold text-green-700">{attendanceSummary.presentes}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                  <p className="text-xs text-gray-500">Faltantes</p>
                  <p className="text-lg font-semibold text-red-700">{attendanceSummary.faltantes}</p>
                </div>
              </div>
            )}
            {attendanceStatus === 'success' && !attendanceSummary && (
              <p className="text-gray-600">
                Nenhuma presença encontrada para a turma e data informadas.
              </p>
            )}
            {attendanceStatus === 'error' && (
              <p className="text-red-600 font-medium">
                Ocorreu um erro ao gerar o relatório de frequência: {attendanceErrorMessage}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPoloStatsReport = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Estatísticas por Polo</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Polo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Alunos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Professores
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Frequência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td colSpan={5} className="px-6 py-8 whitespace-nowrap text-center text-sm text-gray-600">
                  As estatísticas por polo serão exibidas aqui assim que forem integradas às informações reais de polos, turmas e presença.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const getCurrentReportContent = () => {
    switch (selectedReport) {
      case 'boletim':
        return renderBoletimReport();
      case 'enrollment':
        return renderEnrollmentReport();
      case 'attendance':
        return renderAttendanceReport();
      case 'certification':
        return renderCertificationReport();
      case 'history':
        return renderHistoryReport();
      case 'dracmas':
        return renderDracmasReport();
      case 'polo-stats':
        return renderPoloStatsReport();
      default:
        return (
          <Card className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Relatório em Desenvolvimento</h3>
            <p className="text-gray-600">Este tipo de relatório será implementado em breve.</p>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Relatórios Educacionais</h1>
                <p className="text-sm text-gray-600">Análises e estatísticas do Instituto Bíblico</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => exportReport('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button onClick={() => exportReport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Report Types */}
          <div className="lg:col-span-1">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Tipos de Relatório</h3>
              <div className="space-y-2">
                {reportTypes.map((report) => {
                  const Icon = report.icon;
                  return (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedReport === report.id
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{report.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Filters */}
            <Card className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Filtros</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={dateFilter.start}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                    />
                    <Input
                      type="date"
                      value={dateFilter.end}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                </div>

                {selectedReport === 'boletim' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID do Aluno
                    </label>
                    <Input
                      type="text"
                      value={boletimAlunoId}
                      onChange={(e) => setBoletimAlunoId(e.target.value)}
                      placeholder="Informe o ID do aluno para gerar o boletim"
                    />
                  </div>
                )}

                {selectedReport === 'attendance' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Turma ID
                      </label>
                      <Input
                        type="text"
                        value={attendanceTurmaId}
                        onChange={(e) => setAttendanceTurmaId(e.target.value)}
                        placeholder="Informe o ID da turma para gerar a frequência"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data da Aula
                      </label>
                      <Input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {selectedReport === 'certification' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Turma ID
                    </label>
                    <Input
                      type="text"
                      value={certTurmaId}
                      onChange={(e) => setCertTurmaId(e.target.value)}
                      placeholder="Informe o ID da turma para verificar certificação"
                    />
                  </div>
                )}

                {selectedReport === 'history' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID do Aluno
                    </label>
                    <Input
                      type="text"
                      value={historyAlunoId}
                      onChange={(e) => setHistoryAlunoId(e.target.value)}
                      placeholder="Informe o ID do aluno para consultar o histórico"
                    />
                  </div>
                )}

                {selectedReport === 'dracmas' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID do Aluno
                    </label>
                    <Input
                      type="text"
                      value={dracmasAlunoId}
                      onChange={(e) => setDracmasAlunoId(e.target.value)}
                      placeholder="Informe o ID do aluno para consultar os Drácmas"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Polo
                  </label>
                  <select
                    value={poloFilter}
                    onChange={(e) => setPoloFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos os Polos</option>
                    <option value="central">Igreja Central</option>
                    <option value="norte">Igreja Norte</option>
                    <option value="sul">Igreja Sul</option>
                    <option value="oeste">Igreja Oeste</option>
                  </select>
                </div>

                <Button onClick={generateReport} className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {reportTypes.find(r => r.id === selectedReport)?.label}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Período: {new Date(dateFilter.start).toLocaleDateString('pt-BR')} até {new Date(dateFilter.end).toLocaleDateString('pt-BR')}
              </p>
            </div>

            {getCurrentReportContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationalReports;
