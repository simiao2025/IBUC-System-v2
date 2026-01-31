import React, { useState } from 'react';
import PageHeader from '@/shared/ui/PageHeader';
import Card from '@/shared/ui/Card';
import BoletimView from '@/components/reports/BoletimView';
import HistoricoView from '@/components/reports/HistoricoView';

import DracmasReportView from '@/components/reports/DracmasReportView';
import ListaAlunosView from '@/components/reports/ListaAlunosView';


import InadimplenciaReportView from '@/components/reports/InadimplenciaReportView';
import CertificadoView from '@/components/reports/CertificadoView';
import { 
  FileText, 
  GraduationCap, 
  BarChart2, 
  ClipboardCheck, 
  Users, 
  Award, 
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { useAccessControl } from '@/features/auth/ui/AccessControl';

type ReportTab = 
  | 'boletim' 
  | 'historico' 
  | 'lista_alunos' 
  | 'dracmas' 
  | 'financeiro' 
  | 'certificado';

const EducationalReportManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('boletim');
  const { canAccessModule } = useAccessControl();

  const reportModules = [
    { id: 'boletim', label: 'Boletim Escolar', icon: FileText, color: 'text-blue-600' },
    { id: 'historico', label: 'Histórico Escolar', icon: GraduationCap, color: 'text-indigo-600' },
    { id: 'lista_alunos', label: 'Lista de Alunos', icon: Users, color: 'text-green-600' },
    { id: 'dracmas', label: 'Relatório de Drácmas', icon: Award, color: 'text-yellow-600' },
    { 
      id: 'financeiro', 
      label: 'Relatório Financeiro', 
      icon: DollarSign, 
      color: 'text-red-600',
      permission: canAccessModule('financeiro')
    },
    { id: 'certificado', label: 'Certificado do Aluno', icon: Award, color: 'text-red-600' },
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

            {activeTab === 'financeiro' && <InadimplenciaReportView />}
            {activeTab === 'certificado' && <CertificadoView />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationalReportManagementPage;
