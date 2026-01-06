import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import { 
  BookOpen, 
  ArrowRight, 
  Download, 
  ExternalLink,
  GraduationCap,
  Users,
  Clock,
  Star,
  Award,
  Heart,
  Target,
  Eye
} from 'lucide-react';

const Materials: React.FC = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 1,
      title: "Módulo 01",
      subtitle: "Antigo Testamento I",
      description: "Estudo dos primeiros livros do Antigo Testamento, desde Gênesis até os livros históricos.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
      url: "/modulo-01"
    },
    {
      id: 2,
      title: "Módulo 02",
      subtitle: "Antigo Testamento II",
      description: "Continuação do estudo do Antigo Testamento, incluindo livros poéticos e proféticos.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-800",
      borderColor: "border-green-200",
      url: "/modulo-02"
    },
    {
      id: 3,
      title: "Módulo 03",
      subtitle: "Novo Testamento I",
      description: "Introdução ao Novo Testamento, vida de Jesus e os Evangelhos.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-800",
      borderColor: "border-purple-200",
      url: "/modulo-03"
    },
    {
      id: 4,
      title: "Módulo 04",
      subtitle: "Novo Testamento II",
      description: "Atos dos Apóstolos e as cartas paulinas, história da igreja primitiva.",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-800",
      borderColor: "border-red-200",
      url: "/modulo-04"
    },
    {
      id: 5,
      title: "Módulo 05",
      subtitle: "Novo Testamento III",
      description: "Cartas gerais, Hebreus e Apocalipse - completando o estudo do Novo Testamento.",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-200",
      url: "/modulo-05"
    },
    {
      id: 6,
      title: "Módulo 06",
      subtitle: "Pedagogia Cristã",
      description: "Métodos e técnicas de ensino cristão adaptados para o público infanto-juvenil.",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-800",
      borderColor: "border-indigo-200",
      url: "/modulo-06"
    },
    {
      id: 7,
      title: "Módulo 07",
      subtitle: "Psicologia Infantil",
      description: "Compreensão do desenvolvimento psicológico e emocional de crianças e adolescentes.",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      textColor: "text-pink-800",
      borderColor: "border-pink-200",
      url: "/modulo-07"
    },
    {
      id: 8,
      title: "Módulo 08",
      subtitle: "Liderança Cristã",
      description: "Desenvolvimento de habilidades de liderança cristã para jovens e adolescentes.",
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-800",
      borderColor: "border-teal-200",
      url: "/modulo-08"
    },
    {
      id: 9,
      title: "Módulo 09",
      subtitle: "Família Cristã",
      description: "Princípios bíblicos para a vida familiar e relacionamentos cristãos saudáveis.",
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-800",
      borderColor: "border-cyan-200",
      url: "/modulo-09"
    },
    {
      id: 10,
      title: "Módulo 10",
      subtitle: "Projeto Final",
      description: "Desenvolvimento e apresentação de projeto final integrando todos os conhecimentos adquiridos.",
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-50",
      textColor: "text-violet-800",
      borderColor: "border-violet-200",
      url: "/modulo-10"
    }
  ];

  const handleModuleClick = (moduleUrl: string) => {
    navigate(moduleUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8">
              <BookOpen className="h-20 w-20 mx-auto text-white mb-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Materiais IBUC
            </h1>
            <h2 className="text-2xl md:text-3xl font-light mb-4">
              Curso Completo de Teologia Infanto-juvenil
            </h2>
            <p className="text-xl md:text-2xl font-light mb-8 max-w-4xl mx-auto">
              10 Módulos especialmente desenvolvidos para o ensino da Palavra de Deus ao público infanto-juvenil
            </p>
          </div>
        </div>
      </section>

      {/* Informações do Curso */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Estrutura do Curso
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Nosso curso é cuidadosamente estruturado em 10 módulos progressivos, 
            cada um focado em aspectos específicos da teologia cristã, adaptados 
            especialmente para o público infanto-juvenil.
          </p>
        </div>

        {/* Características do Curso */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              10
            </div>
            <h3 className="text-lg font-bold text-blue-800 mb-2">Módulos</h3>
            <p className="text-blue-700 text-sm">
              Conteúdo completo e progressivo
            </p>
          </Card>

          <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-green-800 mb-2">Faixas Etárias</h3>
            <p className="text-green-700 text-sm">
              Adaptado para diferentes idades
            </p>
          </Card>

          <Card className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <GraduationCap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-purple-800 mb-2">Certificação</h3>
            <p className="text-purple-700 text-sm">
              Certificado de conclusão oficial
            </p>
          </Card>

          <Card className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <Award className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-800 mb-2">Qualidade</h3>
            <p className="text-red-700 text-sm">
              Material didático especializado
            </p>
          </Card>
        </div>
      </section>

      {/* Grid de Módulos */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Módulos do Curso
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Clique em qualquer módulo para conhecer seu conteúdo detalhado e recursos disponíveis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module) => (
              <Card 
                key={module.id}
                className={`${module.bgColor} ${module.borderColor} hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
                onClick={() => handleModuleClick(module.url)}
              >
                <div className={`h-32 bg-gradient-to-br ${module.color} flex items-center justify-center rounded-t-lg`}>
                  <div className="text-center text-white">
                    <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold">{module.id.toString().padStart(2, '0')}</span>
                    </div>
                    <h3 className="text-lg font-bold">{module.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className={`text-xl font-bold ${module.textColor} mb-3`}>
                    {module.subtitle}
                  </h4>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {module.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${module.textColor}`}>
                      Ver Conteúdo
                    </span>
                    <ArrowRight className={`h-5 w-5 ${module.textColor.replace('text-', 'text-').replace('-800', '-600')}`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recursos Adicionais */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Recursos Adicionais
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Além dos módulos principais, oferecemos recursos complementares para enriquecer o aprendizado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 bg-white hover:shadow-lg transition-shadow">
              <Download className="h-16 w-16 text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Downloads</h3>
              <p className="text-gray-600 mb-6">
                Materiais de apoio, fichas de inscrição, modelos de certificados e recursos pedagógicos.
              </p>
              <a 
                href="https://ibuc.com.br/downloads/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <ExternalLink className="h-5 w-5" />
                Acessar Downloads
              </a>
            </Card>

            <Card className="text-center p-8 bg-white hover:shadow-lg transition-shadow">
              <Users className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Suporte Pedagógico</h3>
              <p className="text-gray-600 mb-6">
                Orientação especializada para educadores, pastores e coordenadores do curso.
              </p>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Solicitar Suporte
              </button>
            </Card>

            <Card className="text-center p-8 bg-white hover:shadow-lg transition-shadow">
              <GraduationCap className="h-16 w-16 text-purple-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Formatura</h3>
              <p className="text-gray-600 mb-6">
                Cerimônias especiais de formatura e certificação para os alunos concluintes.
              </p>
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Saber Mais
              </button>
            </Card>
          </div>
        </div>
      </section>

      {/* Chamada para Ação */}
      <section className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Comece Sua Jornada Hoje
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              Transforme a vida de crianças e jovens através do ensino da Palavra de Deus. 
              Nosso material didático especializado está pronto para ser implementado em sua igreja.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/matricula')}
                className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Fazer Matrícula
              </button>
              <a 
                href="https://ibuc.com.br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-800 transition-colors inline-flex items-center gap-2"
              >
                <ExternalLink className="h-6 w-6" />
                Site Oficial
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Materials;