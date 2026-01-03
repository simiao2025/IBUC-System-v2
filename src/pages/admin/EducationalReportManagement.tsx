import React, { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import BoletimView from '../../components/reports/BoletimView';
import HistoricoView from '../../components/reports/HistoricoView';
import EstatisticasView from '../../components/reports/EstatisticasView';
import DracmasReportView from '../../components/reports/DracmasReportView';
import ListaAlunosView from '../../components/reports/ListaAlunosView';
import AtestadoMatriculaView from '../../components/reports/AtestadoMatriculaView';
import ListaChamadaView from '../../components/reports/ListaChamadaView';
import ConsolidadoFrequenciaView from '../../components/reports/ConsolidadoFrequenciaView';
import InadimplenciaReportView from '../../components/reports/InadimplenciaReportView';
import { 
  FileText, 
  GraduationCap, 
  BarChart2, 
  ClipboardCheck, 
  Users, 
  Award, 
  DollarSign,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import { useAccessControl } from '../../components/AccessControl';

type ReportTab = 
  | 'boletim' 
  | 'historico' 
  | 'atestado' 
  | 'chamada' 
  | 'lista_alunos' 
  | 'frequencia_consolidada' 
  | 'dracmas' 
  | 'financeiro' 
  | 'estatisticas';

const EducationalReportManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('boletim');
  const { canAccessModule } = useAccessControl();

  const reportModules = [
    { id: 'boletim', label: 'Boletim Escolar', icon: FileText, color: 'text-blue-600' },
    { id: 'historico', label: 'Histórico Escolar', icon: GraduationCap, color: 'text-indigo-600' },
    { id: 'atestado', label: 'Atestado de Matrícula', icon: FileCheck2, color: 'text-teal-600' },
    { id: 'chamada', label: 'Lista de Chamada', icon: ClipboardCheck, color: 'text-orange-600' },
    { id: 'lista_alunos', label: 'Lista de Alunos', icon: Users, color: 'text-green-600' },
    { id: 'frequencia_consolidada', label: 'Consolidado Frequência', icon: BarChart2, color: 'text-pink-600' },
    { id: 'dracmas', label: 'Relatório de Drácmas', icon: Award, color: 'text-yellow-600' },
    { 
      id: 'financeiro', 
      label: 'Relatório Financeiro', 
      icon: DollarSign, 
      color: 'text-red-600',
      permission: canAccessModule('dracmas')
    },
    { id: 'estatisticas', label: 'Estatísticas Gerais', icon: BarChart2, color: 'text-purple-600' },
  ];

  const filteredModules = reportModules.filter(m => m.permission === undefined || m.permission);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <PageHeader
        title="Central de Relatórios"
        subtitle="Emita documentos, listas e analise o desempenho acadêmico e financeiro"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-2 space-y-1">
              {filteredModules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveTab(module.id as ReportTab)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === module.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <module.icon className={`h-5 w-5 mr-3 ${module.color}`} />
                    {module.label}
                  </div>
                  {activeTab === module.id && <ChevronRight className="h-4 w-4" />}
                </button>
              ))}
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'boletim' && <BoletimView />}
            {activeTab === 'historico' && <HistoricoView />}
            {activeTab === 'dracmas' && <DracmasReportView />}
            {activeTab === 'lista_alunos' && <ListaAlunosView />}
            {activeTab === 'atestado' && <AtestadoMatriculaView />}
            {activeTab === 'chamada' && <ListaChamadaView />}
            {activeTab === 'frequencia_consolidada' && <ConsolidadoFrequenciaView />}
            {activeTab === 'financeiro' && <InadimplenciaReportView />}
            {activeTab === 'estatisticas' && <EstatisticasView />}
            
            {/* Placeholder logic removed as all modules are implemented or not selected */}
            {activeTab === ('placeholder' as any) && (
              <Card className="p-12 text-center">
                <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                  {React.createElement(reportModules.find(m => m.id === activeTab)?.icon || FileText, { className: "h-8 w-8 text-gray-400" })}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Relatório em Desenvolvimento
                </h3>
                <p className="text-gray-600">
                  O relatório de <strong>{reportModules.find(m => m.id === activeTab)?.label}</strong> está sendo implementado e estará disponível em breve.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationalReportManagement;
