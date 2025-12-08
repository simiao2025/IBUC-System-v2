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
import { RelatoriosAPI } from '../../lib/api';

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
  const [historyAlunoId, setHistoryAlunoId] = useState<string>('');
  const [historyStatus, setHistoryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [historyErrorMessage, setHistoryErrorMessage] = useState<string>('');
  const [historyResult, setHistoryResult] = useState<unknown | null>(null);

  const reportTypes = [
    { id: 'boletim', label: 'Boletim do Aluno', icon: FileText },
    { id: 'enrollment', label: 'Relatório de Matrículas', icon: Users },
    { id: 'attendance', label: 'Relatório de Frequência', icon: Clock },
    { id: 'history', label: 'Histórico do Aluno', icon: FileText },
    { id: 'performance', label: 'Desempenho por Nível', icon: TrendingUp },
    { id: 'certificates', label: 'Certificados Emitidos', icon: Award },
    { id: 'polo-stats', label: 'Estatísticas por Polo', icon: MapPin },
    { id: 'teachers', label: 'Relatório de Professores', icon: BookOpen },
    { id: 'financial', label: 'Relatório Financeiro', icon: PieChart },
    { id: 'activities', label: 'Atividades e Eventos', icon: Activity }
  ];

  const generateReport = async () => {
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
        const response = await RelatoriosAPI.gerarBoletim(boletimAlunoId, periodo);

        if (response && (response as any).status === 'processing') {
          setBoletimStatus('processing');
        } else {
          setBoletimStatus('idle');
        }
      } catch (error: any) {
        console.error('Erro ao gerar boletim:', error);
        setBoletimStatus('error');
        setBoletimErrorMessage(error?.message || 'Erro ao gerar boletim.');
      }

      return;
    }

    // Frequência: usa endpoint de presença (exportarPresenca)
    if (selectedReport === 'attendance') {
      if (!attendanceTurmaId || !attendanceDate) {
        alert('Informe a Turma e a Data para gerar o relatório de frequência.');
        return;
      }

      try {
        setAttendanceStatus('loading');
        setAttendanceErrorMessage('');

        await RelatoriosAPI.exportarPresenca(attendanceTurmaId, attendanceDate);

        // Aqui assumimos que o backend pode gerar um arquivo ou registro de presença;
        // como não há especificação, apenas sinalizamos sucesso na UI.
        setAttendanceStatus('success');
      } catch (error: any) {
        console.error('Erro ao gerar relatório de frequência:', error);
        setAttendanceStatus('error');
        setAttendanceErrorMessage(error?.message || 'Erro ao gerar relatório de frequência.');
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

        setHistoryResult(response as unknown);
        setHistoryStatus('success');
      } catch (error: any) {
        console.error('Erro ao carregar histórico do aluno:', error);
        setHistoryStatus('error');
        setHistoryErrorMessage(error?.message || 'Erro ao carregar histórico do aluno.');
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center bg-blue-50 border-blue-200">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-blue-900">--</h3>
          <p className="text-blue-700">Total de Matrículas (aguardando dados reais)</p>
        </Card>
        <Card className="text-center bg-green-50 border-green-200">
          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-green-900">--</h3>
          <p className="text-green-700">Crescimento vs Ano Anterior (em desenvolvimento)</p>
        </Card>
        <Card className="text-center bg-purple-50 border-purple-200">
          <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-purple-900">--</h3>
          <p className="text-purple-700">Matrículas no período selecionado</p>
        </Card>
        <Card className="text-center bg-orange-50 border-orange-200">
          <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-orange-900">--</h3>
          <p className="text-orange-700">Polos Ativos (integração pendente)</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Matrículas por Nível</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>Os gráficos de matrículas por nível serão exibidos aqui assim que a integração com os dados reais de matrículas for concluída.</p>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Evolução Mensal</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>A evolução mensal de matrículas será apresentada aqui após a conexão com o módulo de matrículas.</p>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderHistoryReport = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Histórico do Aluno</h3>
        <div className="space-y-4 text-sm text-gray-700">
          <p>
            Este relatório apresentará o histórico acadêmico do aluno ao longo dos períodos (notas, situação final e, opcionalmente, frequência agregada).
          </p>
          <p>
            Por enquanto, o endpoint retorna apenas a estrutura básica. À medida que os dados forem sendo agregados no backend, o histórico detalhado será exibido aqui.
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
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <p className="text-xs text-gray-500 mb-2">Resposta atual da API (estrutura bruta):</p>
                <pre className="text-xs text-gray-800 overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(historyResult, null, 2)}
                </pre>
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

  const renderAttendanceReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="text-center bg-green-50 border-green-200">
          <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-3xl font-bold text-green-900">--%</h3>
          <p className="text-green-700">Frequência Média Geral (em desenvolvimento)</p>
        </Card>
        <Card className="text-center bg-blue-50 border-blue-200">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-3xl font-bold text-blue-900">--</h3>
          <p className="text-blue-700">Alunos Frequentes (&gt;80%)</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Frequência por Nível</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <p>Os indicadores de frequência por nível serão carregados aqui quando o módulo de presença estiver integrado.</p>

          <div className="mt-4">
            {attendanceStatus === 'idle' && (
              <p className="text-gray-600">
                Aguardando parâmetros para gerar o relatório de frequência.
              </p>
            )}
            {attendanceStatus === 'loading' && (
              <p className="text-blue-600 font-medium">
                Enviando solicitação de geração de relatório de frequência...
              </p>
            )}
            {attendanceStatus === 'success' && (
              <p className="text-green-700 font-medium">
                Relatório de frequência gerado com sucesso. Verifique os registros ou arquivos gerados pelo backend.
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
      case 'history':
        return renderHistoryReport();
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
