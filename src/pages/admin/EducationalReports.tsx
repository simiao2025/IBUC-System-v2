import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
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

const EducationalReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('enrollment');
  const [dateFilter, setDateFilter] = useState({
    start: '2024-01-01',
    end: '2024-12-31'
  });
  const [poloFilter, setPoloFilter] = useState<string>('all');

  const reportTypes = [
    { id: 'enrollment', label: 'Relatório de Matrículas', icon: Users },
    { id: 'attendance', label: 'Relatório de Frequência', icon: Clock },
    { id: 'performance', label: 'Desempenho por Nível', icon: TrendingUp },
    { id: 'certificates', label: 'Certificados Emitidos', icon: Award },
    { id: 'polo-stats', label: 'Estatísticas por Polo', icon: MapPin },
    { id: 'teachers', label: 'Relatório de Professores', icon: BookOpen },
    { id: 'financial', label: 'Relatório Financeiro', icon: PieChart },
    { id: 'activities', label: 'Atividades e Eventos', icon: Activity }
  ];

  const mockData = {
    enrollment: {
      total: 245,
      byLevel: [
        { level: 'NÍVEL I', count: 89, percentage: 36.3 },
        { level: 'NÍVEL II', count: 72, percentage: 29.4 },
        { level: 'NÍVEL III', count: 54, percentage: 22.0 },
        { level: 'NÍVEL IV', count: 30, percentage: 12.3 }
      ],
      byMonth: [
        { month: 'Jan', count: 45 },
        { month: 'Fev', count: 67 },
        { month: 'Mar', count: 34 },
        { month: 'Abr', count: 28 },
        { month: 'Mai', count: 71 }
      ]
    },
    attendance: {
      average: 87.5,
      byLevel: [
        { level: 'NÍVEL I', attendance: 92.1 },
        { level: 'NÍVEL II', attendance: 88.7 },
        { level: 'NÍVEL III', attendance: 85.3 },
        { level: 'NÍVEL IV', attendance: 84.2 }
      ]
    },
    poloStats: [
      { name: 'Igreja Central', students: 89, teachers: 8, attendance: 91.2 },
      { name: 'Igreja Norte', students: 67, teachers: 6, attendance: 86.8 },
      { name: 'Igreja Sul', students: 54, teachers: 5, attendance: 88.9 },
      { name: 'Igreja Oeste', students: 35, teachers: 4, attendance: 83.7 }
    ]
  };

  const generateReport = () => {
    // Simular geração de relatório
    alert(`Relatório ${reportTypes.find(r => r.id === selectedReport)?.label} gerado com sucesso!`);
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    // Simular exportação
    alert(`Relatório exportado em ${format.toUpperCase()} com sucesso!`);
  };

  const renderEnrollmentReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center bg-blue-50 border-blue-200">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-blue-900">{mockData.enrollment.total}</h3>
          <p className="text-blue-700">Total de Matrículas</p>
        </Card>
        <Card className="text-center bg-green-50 border-green-200">
          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-green-900">+23%</h3>
          <p className="text-green-700">Crescimento vs Ano Anterior</p>
        </Card>
        <Card className="text-center bg-purple-50 border-purple-200">
          <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-purple-900">71</h3>
          <p className="text-purple-700">Matrículas Maio/2024</p>
        </Card>
        <Card className="text-center bg-orange-50 border-orange-200">
          <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-orange-900">4</h3>
          <p className="text-orange-700">Polos Ativos</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Matrículas por Nível</h3>
          <div className="space-y-3">
            {mockData.enrollment.byLevel.map((level, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{level.level}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${level.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{level.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Evolução Mensal</h3>
          <div className="space-y-3">
            {mockData.enrollment.byMonth.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{month.month}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(month.count / 80) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{month.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAttendanceReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="text-center bg-green-50 border-green-200">
          <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-3xl font-bold text-green-900">{mockData.attendance.average}%</h3>
          <p className="text-green-700">Frequência Média Geral</p>
        </Card>
        <Card className="text-center bg-blue-50 border-blue-200">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-3xl font-bold text-blue-900">214</h3>
          <p className="text-blue-700">Alunos Frequentes (&gt;80%)</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Frequência por Nível</h3>
        <div className="space-y-4">
          {mockData.attendance.byLevel.map((level, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{level.level}</span>
              <div className="flex items-center space-x-3">
                <div className="w-40 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full" 
                    style={{ width: `${level.attendance}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-green-600">{level.attendance}%</span>
              </div>
            </div>
          ))}
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
              {mockData.poloStats.map((polo, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{polo.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {polo.students}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {polo.teachers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      polo.attendance >= 90 
                        ? 'bg-green-100 text-green-800'
                        : polo.attendance >= 85
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {polo.attendance}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${polo.attendance}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">Excelente</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const getCurrentReportContent = () => {
    switch (selectedReport) {
      case 'enrollment':
        return renderEnrollmentReport();
      case 'attendance':
        return renderAttendanceReport();
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
