import React from 'react';
import Card from '../../components/ui/Card';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Política de Privacidade
          </h1>
          <p className="text-gray-600">
            Última atualização: 03 de Janeiro de 2026
          </p>
        </div>

        <div className="space-y-8">
          <Card className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              1. Coleta de Informações
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              O Instituto Bíblico Único Caminho (IBUC) coleta informações pessoais necessárias para o processo de pré-matrícula e gestão educacional, incluindo, mas não se limitando a:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Nome completo do aluno e dos responsáveis;</li>
              <li>Dados de contato (email, telefone);</li>
              <li>Documentos de identificação (CPF, RG, Certidão de Nascimento);</li>
              <li>Informações de saúde relevantes para o cuidado do aluno no polo.</li>
            </ul>
          </Card>

          <Card className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Eye className="h-5 w-5 mr-2 text-blue-600" />
              2. Uso dos Dados
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Os dados coletados são utilizados exclusivamente para fins administrativos e pedagógicos do IBUC, tais como processamento de matrículas, comunicação com os responsáveis, emissão de certificados e garantia da segurança dos alunos durante as atividades presenciais.
            </p>
          </Card>

          <Card className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Lock className="h-5 w-5 mr-2 text-blue-600" />
              3. Proteção e Segurança
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Empregamos medidas técnicas e organizativas para proteger os dados pessoais contra acessos não autorizados, perda, destruição ou alteração. O acesso às informações é restrito a funcionários autorizados da secretaria geral e diretores dos respectivos polos.
            </p>
          </Card>

          <Card className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              4. Direitos do Usuário
            </h2>
            <p className="text-gray-600 leading-relaxed">
              O responsável pelo aluno tem o direito de solicitar o acesso, correção ou exclusão de seus dados pessoais a qualquer momento, entrando em contato com a secretaria administrativa do IBUC através dos nossos canais de atendimento oficiais.
            </p>
          </Card>

          <div className="text-center text-gray-500 text-sm mt-8">
            <p>Ao utilizar nossos serviços de pré-matrícula online, você concorda com os termos desta política.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
