import React from 'react';
import Card from '../../components/ui/Card';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Users, 
  BookOpen, 
  Award, 
  Building, 
  Heart,
  Target,
  Eye,
  Star,
  Calendar,
  GraduationCap,
  Church,
  User,
  Globe,
  Shield,
  Lightbulb,
  FileText,
  Headphones
} from 'lucide-react';

const AboutIBUC: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8">
              {/* Logo IBUC - Tentativa de carregar imagem externa com fallback para SVG local */}
              <img 
                src="https://ibuc.com.br/wp-content/uploads/2023/05/logo-site.png" 
                alt="IBUC - Curso de Teologia Infanto-juvenil" 
                className="h-24 w-auto mx-auto"
                onError={(e) => {
                  console.warn('Imagem externa não carregou, usando logo SVG local');
                  // Substituir por um logo SVG personalizado
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const svgLogo = target.nextElementSibling as HTMLElement;
                  if (svgLogo) svgLogo.style.display = 'block';
                }}
                onLoad={() => console.log('Logo IBUC carregado com sucesso')}
              />
              {/* Logo SVG de fallback */}
              <div className="hidden">
                <svg 
                  width="200" 
                  height="80" 
                  viewBox="0 0 200 80" 
                  className="h-24 w-auto mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="200" height="80" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" rx="8"/>
                  <text x="100" y="30" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1f2937">IBUC</text>
                  <text x="100" y="50" textAnchor="middle" fontSize="12" fill="#6b7280">Instituto Bíblico</text>
                  <text x="100" y="65" textAnchor="middle" fontSize="12" fill="#6b7280">Único Caminho</text>
                </svg>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              IBUC
            </h1>
            <h2 className="text-2xl md:text-3xl font-light mb-4">
              Curso de Teologia Infanto-juvenil
            </h2>
            <p className="text-xl md:text-2xl font-light mb-8 max-w-4xl mx-auto">
              Projeto Cristão focado no ensino da palavra de Deus para o público Infanto-juvenil
            </p>
          </div>
        </div>
      </section>

      {/* Sobre o Instituto */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Sobre o IBUC
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            O IBUC - Instituto Bíblico Único Caminho é um projeto cristão inovador dedicado ao 
            ensino da palavra de Deus especificamente para o público infanto-juvenil. Nossa 
            instituição combina metodologia pedagógica moderna com fundamentos bíblicos sólidos, 
            proporcionando uma formação integral e transformadora para crianças e jovens.
          </p>
        </div>

        {/* Características do Projeto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-blue-800 mb-4">Projeto Cristão</h3>
            <p className="text-blue-700">
              Fundamentado nos princípios bíblicos cristãos, nosso projeto visa formar 
              uma geração comprometida com os valores do Reino de Deus.
            </p>
          </Card>

          <Card className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <Lightbulb className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-green-800 mb-4">Ensino Especializado</h3>
            <p className="text-green-700">
              Metodologia específica para o público infanto-juvenil, adaptada às 
              diferentes faixas etárias e necessidades de aprendizado.
            </p>
          </Card>

          <Card className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <BookOpen className="h-16 w-16 text-purple-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-purple-800 mb-4">Palavra de Deus</h3>
            <p className="text-purple-700">
              Ensino focado na palavra de Deus, proporcionando conhecimento bíblico 
              sólido e aplicação prática na vida cotidiana.
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-8">
            <Target className="h-16 w-16 text-red-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Missão</h3>
            <p className="text-gray-600">
              Proporcionar educação cristã de qualidade para crianças e jovens, 
              fundamentada nos valores bíblicos e formando cidadãos comprometidos 
              com os princípios do Reino de Deus.
            </p>
          </Card>

          <Card className="text-center p-8">
            <Eye className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Visão</h3>
            <p className="text-gray-600">
              Ser referência em ensino bíblico infanto-juvenil, formando uma 
              geração de jovens cristãos preparados para servir a Deus e 
              transformar a sociedade.
            </p>
          </Card>

          <Card className="text-center p-8">
            <Heart className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Valores</h3>
            <p className="text-gray-600">
              Fé, amor, integridade, excelência, compromisso social e 
              desenvolvimento integral do ser humano baseado nos ensinamentos 
              bíblicos cristãos.
            </p>
          </Card>
        </div>
      </section>

      {/* Estrutura do Curso */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Estrutura do Curso
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nosso curso é cuidadosamente estruturado para oferecer uma formação 
              completa e progressiva em teologia infanto-juvenil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                4
              </div>
              <h3 className="text-2xl font-bold text-red-800 mb-4">Níveis</h3>
              <p className="text-red-700">
                Quatro níveis de ensino organizados por faixas etárias, 
                desde 2 até 16 anos de idade.
              </p>
            </Card>

            <Card className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                10
              </div>
              <h3 className="text-2xl font-bold text-blue-800 mb-4">Módulos</h3>
              <p className="text-blue-700">
                Dez módulos cuidadosamente desenvolvidos com conteúdo 
                bíblico e atividades práticas.
              </p>
            </Card>

            <Card className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <BookOpen className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-green-800 mb-4">Material</h3>
              <p className="text-green-700">
                Manual de orientação completo e material didático 
                especializado para cada faixa etária.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Material Didático e Recursos */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Material Didático e Recursos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Oferecemos recursos completos e atualizados para apoiar o aprendizado 
              e desenvolvimento espiritual dos nossos alunos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 bg-white hover:shadow-lg transition-shadow">
              <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Plataforma Online</h3>
              <p className="text-gray-600 text-sm">
                Acesso a materiais digitais e recursos interativos através do nosso site oficial.
              </p>
            </Card>

            <Card className="text-center p-6 bg-white hover:shadow-lg transition-shadow">
              <BookOpen className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Material Impresso</h3>
              <p className="text-gray-600 text-sm">
                Apostilas e manuais especializados para cada nível de ensino.
              </p>
            </Card>

            <Card className="text-center p-6 bg-white hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Suporte Pedagógico</h3>
              <p className="text-gray-600 text-sm">
                Acompanhamento especializado e orientação para educadores e famílias.
              </p>
            </Card>

            <Card className="text-center p-6 bg-white hover:shadow-lg transition-shadow">
              <Award className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Certificação</h3>
              <p className="text-gray-600 text-sm">
                Certificados de conclusão reconhecidos para cada nível completado.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Informações Institucionais */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Informações Institucionais
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conheça mais sobre nossa estrutura organizacional e institucional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <h3 className="text-2xl font-bold text-red-800 mb-6 flex items-center">
                <Building className="h-6 w-6 text-red-600 mr-3" />
                Dados Institucionais
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-red-700">Razão Social:</p>
                  <p className="text-red-600">Instituto Bíblico Único Caminho - IBUC</p>
                </div>
                <div>
                  <p className="font-semibold text-red-700">CNPJ:</p>
                  <p className="text-red-600">35.864.425/0001-23</p>
                </div>
                <div>
                  <p className="font-semibold text-red-700">Modalidade:</p>
                  <p className="text-red-600">Curso de Teologia Infanto-juvenil</p>
                </div>
                <div>
                  <p className="font-semibold text-red-700">Natureza:</p>
                  <p className="text-red-600">Projeto Cristão Educacional</p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <h3 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
                <Church className="h-6 w-6 text-blue-600 mr-3" />
                Sede Principal
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-blue-700">Igreja:</p>
                  <p className="text-blue-600">Assembleia de Deus Missão Projeto Restaurando Vidas</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-700">Pastor Presidente:</p>
                  <p className="text-blue-600">PR. Suimar Caetano</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-700">Local das Aulas:</p>
                  <p className="text-blue-600">Templo Sede</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-700">Cidade:</p>
                  <p className="text-blue-600">Palmas - TO</p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <h3 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
                <Globe className="h-6 w-6 text-green-600 mr-3" />
                Presença Digital
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-green-700">Site Oficial:</p>
                  <p className="text-green-600">ibuc.com.br</p>
                </div>
                <div>
                  <p className="font-semibold text-green-700">Plataforma:</p>
                  <p className="text-green-600">WordPress 6.8.2</p>
                </div>
                <div>
                  <p className="font-semibold text-green-700">Idioma:</p>
                  <p className="text-green-600">Português (Brasil)</p>
                </div>
                <div>
                  <p className="font-semibold text-green-700">Recursos:</p>
                  <p className="text-green-600">Material Online, Formulários, Quiz</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Entre em Contato
            </h2>
            <p className="text-xl text-gray-600">
              Estamos sempre disponíveis para esclarecer suas dúvidas e ajudar você a conhecer melhor o IBUC
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 bg-white">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <MapPin className="h-6 w-6 text-red-600 mr-3" />
                Informações de Contato
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Building className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-700">Endereço Administrativo:</p>
                    <p className="text-gray-600">
                      Av. T9, nº647, Setor Bueno<br />
                      Primeiro andar (acima da Copyprint)<br />
                      Palmas - TO, Brasil
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Phone className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-700">Telefone/WhatsApp:</p>
                    <p className="text-gray-600">(62) 3123-6668</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Mail className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-700">E-mail:</p>
                    <p className="text-gray-600">contatoibuc@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Globe className="h-6 w-6 text-orange-600" />
                  <div>
                    <p className="font-semibold text-gray-700">Site Oficial:</p>
                    <p className="text-gray-600">
                      <a href="https://ibuc.com.br" target="_blank" rel="noopener noreferrer" 
                         className="text-orange-600 hover:text-orange-700 transition-colors">
                        ibuc.com.br
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-white">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="h-6 w-6 text-blue-600 mr-3" />
                Redes Sociais e Canais
              </h3>
              <div className="space-y-4">
                <a 
                  href="https://web.facebook.com/IBUC.com.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <div className="bg-blue-600 text-white p-2 rounded-full">
                    <span className="text-sm font-bold">f</span>
                  </div>
                  <div>
                    <p className="font-semibold">Facebook</p>
                    <p className="text-sm">IBUC - Instituto Bíblico Único Caminho</p>
                  </div>
                </a>

                <a 
                  href="https://www.instagram.com/ibuc_oficial/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors"
                >
                  <div className="bg-pink-600 text-white p-2 rounded-full">
                    <span className="text-sm font-bold">@</span>
                  </div>
                  <div>
                    <p className="font-semibold">Instagram</p>
                    <p className="text-sm">@ibuc_oficial</p>
                  </div>
                </a>

                <a 
                  href="https://www.youtube.com/@IBUConline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                >
                  <div className="bg-red-600 text-white p-2 rounded-full">
                    <span className="text-sm font-bold">▶</span>
                  </div>
                  <div>
                    <p className="font-semibold">YouTube</p>
                    <p className="text-sm">IBUConline</p>
                  </div>
                </a>

                <a 
                  href="https://wa.me/556231236668" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                >
                  <div className="bg-green-600 text-white p-2 rounded-full">
                    <span className="text-sm font-bold">W</span>
                  </div>
                  <div>
                    <p className="font-semibold">WhatsApp</p>
                    <p className="text-sm">(62) 3123-6668</p>
                  </div>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </section>



      {/* Chamada para Ação */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Transforme Vidas Através da Palavra
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              Junte-se ao IBUC e faça parte de uma missão transformadora: formar educadores cristãos 
              capacitados para ensinar a Palavra de Deus ao público infanto-juvenil. 
              Sua jornada de crescimento espiritual e profissional começa aqui!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center text-white">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ensino Especializado</h3>
              <p className="text-blue-100">Metodologia focada no público infanto-juvenil</p>
            </div>
            
            <div className="text-center text-white">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Certificação Reconhecida</h3>
              <p className="text-blue-100">Diploma com validade nacional</p>
            </div>
            
            <div className="text-center text-white">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Comunidade Ativa</h3>
              <p className="text-blue-100">Rede de educadores cristãos em todo o Brasil</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a 
              href="/pre-matricula"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-blue-600 hover:bg-gray-100 text-lg font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <GraduationCap className="mr-2 h-5 w-5" />
              Fazer pré-matrícula Agora
            </a>
            <a 
              href="/contato"
              className="inline-flex items-center justify-center px-10 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Phone className="mr-2 h-5 w-5" />
              Falar com Consultor
            </a>
          </div>

          <div className="text-center mt-8">
            <p className="text-blue-100 text-sm">
              Dúvidas? Entre em contato pelo WhatsApp: 
              <a href="https://wa.me/556231236668" className="text-white font-semibold hover:underline ml-1">
                (62) 3123-6668
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutIBUC;
