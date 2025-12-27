import React, { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import BoletimView from '../../components/reports/BoletimView';
import HistoricoView from '../../components/reports/HistoricoView';
import EstatisticasView from '../../components/reports/EstatisticasView';
import { FileText, GraduationCap, BarChart2 } from 'lucide-react';

type ReportTab = 'boletim' | 'historico' | 'estatisticas';

const EducationalReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('boletim');

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <PageHeader
        title="Relatórios Educacionais"
        subtitle="Gerar boletins, históricos e analisar estatísticas"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <Card className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px space-x-8">
              <button
                onClick={() => setActiveTab('boletim')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'boletim'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Boletim Escolar
              </button>
              <button
                onClick={() => setActiveTab('historico')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'historico'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Histórico Escolar
              </button>
              <button
                onClick={() => setActiveTab('estatisticas')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'estatisticas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Estatísticas
              </button>
            </nav>
          </div>
        </Card>

        {activeTab === 'boletim' && <BoletimView />}
        {activeTab === 'historico' && <HistoricoView />}
        {activeTab === 'estatisticas' && <EstatisticasView />}
      </div>
    </div>
  );
};

export default EducationalReports;
