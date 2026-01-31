import React from 'react';
import Card from '../../components/ui/Card';
import { useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { Icon3D } from '../../components/ui/Icon3D';

const AboutIBUC: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-white text-gray-900 border-b border-gray-100">
        <div className="absolute inset-0 bg-gray-50/50"></div>
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
          <Card className="text-center p-8 bg-white border-gray-100 shadow-sm">
            <Icon3D name="projeto_cristao" fallbackIcon={BookOpen} size="lg" className="mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Projeto Cristão</h3>
            <p className="text-gray-600">
              Fundamentado nos princípios bíblicos cristãos, nosso projeto visa formar 
              uma geração comprometida com os valores do Reino de Deus.
            </p>
          </Card>

          <Card className="text-center p-8 bg-white border-gray-100 shadow-sm">
            <Icon3D name="ensino" fallbackIcon={BookOpen} size="lg" className="mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ensino Especializado</h3>
            <p className="text-gray-600">
              Metodologia específica para o público infanto-juvenil, adaptada às 
              diferentes faixas etárias e necessidades de aprendizado.
            </p>
          </Card>

          <Card className="text-center p-8 bg-white border-gray-100 shadow-sm">
            <Icon3D name="palavra_de_deus" fallbackIcon={BookOpen} size="lg" className="mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Palavra de Deus</h3>
            <p className="text-gray-600">
              Ensino focado na palavra de Deus, proporcionando conhecimento bíblico 
              sólido e aplicação prática na vida cotidiana.
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-8 bg-white border-gray-100 shadow-sm">
            <Icon3D name="missao" fallbackIcon={BookOpen} size="lg" className="mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Missão</h3>
            <p className="text-gray-600">
              Proporcionar educação cristã de qualidade para crianças e jovens, 
              fundamentada nos valores bíblicos e formando cidadãos comprometidos 
              com os princípios do Reino de Deus.
            </p>
          </Card>

          <Card className="text-center p-8 bg-white border-gray-100 shadow-sm">
            <Icon3D name="visao" fallbackIcon={BookOpen} size="lg" className="mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Visão</h3>
            <p className="text-gray-600">
              Ser referência em ensino bíblico infanto-juvenil, formando uma 
              geração de jovens cristãos preparados para servir a Deus e 
              transformar a sociedade.
            </p>
          </Card>

          <Card className="text-center p-8 bg-white border-gray-100 shadow-sm">
            <Icon3D name="valores" fallbackIcon={BookOpen} size="lg" className="mx-auto mb-6" />
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
            <Card className="text-center p-8 bg-white border-gray-100 shadow-sm">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                4
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Níveis</h3>
              <p className="text-gray-600">
                Quatro níveis de ensino organizados por faixas etárias, 
                desde 2 até 16 anos de idade.
              </p>
            </Card>

            <Card className="text-center p-8 bg-white border-gray-100 shadow-sm">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                10
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Módulos</h3>
              <p className="text-gray-600">
                Dez módulos cuidadosamente desenvolvidos com conteúdo 
                bíblico e atividades práticas.
              </p>
            </Card>

            <Card className="text-center p-8 bg-white border-gray-100 shadow-sm">
              <Icon3D name="material" fallbackIcon={BookOpen} size="lg" className="mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Material</h3>
              <p className="text-gray-600">
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
              <Icon3D name="plataforma" fallbackIcon={BookOpen} size="md" className="mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Plataforma Online</h3>
              <p className="text-gray-600 text-sm">
                Acesso a materiais digitais e recursos interativos através do nosso site oficial.
              </p>
            </Card>

            <Card className="text-center p-6 bg-white hover:shadow-lg transition-shadow">
              <Icon3D name="material_impresso" fallbackIcon={BookOpen} size="md" className="mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Material Impresso</h3>
              <p className="text-gray-600 text-sm">
                Apostilas e manuais especializados para cada nível de ensino.
              </p>
            </Card>

            <Card className="text-center p-6 bg-white hover:shadow-lg transition-shadow">
              <Icon3D name="equipes_polos" fallbackIcon={BookOpen} size="md" className="mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Suporte Pedagógico</h3>
              <p className="text-gray-600 text-sm">
                Acompanhamento especializado e orientação para educadores e famílias.
              </p>
            </Card>

            <Card className="text-center p-6 bg-white hover:shadow-lg transition-shadow">
              <Icon3D name="certificado" fallbackIcon={BookOpen} size="md" className="mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Certificação</h3>
              <p className="text-gray-600 text-sm">
                Certificados de conclusão reconhecidos para cada nível completado.
              </p>
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
                <Icon3D name="ensino" size="sm" fallbackIcon={BookOpen} className="filter brightness-0 invert" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ensino Especializado</h3>
              <p className="text-blue-100">Metodologia focada no público infanto-juvenil</p>
            </div>
            
            <div className="text-center text-white">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Icon3D name="certificado" size="sm" fallbackIcon={BookOpen} className="filter brightness-0 invert" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Certificação Reconhecida</h3>
              <p className="text-blue-100">Diploma com validade nacional</p>
            </div>
            
            <div className="text-center text-white">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Icon3D name="equipes_polos" size="sm" fallbackIcon={BookOpen} className="filter brightness-0 invert" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Comunidade Ativa</h3>
              <p className="text-blue-100">Rede de educadores cristãos em todo o Brasil</p>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <Link 
              to="/pre-matricula"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-blue-600 hover:bg-gray-100 text-lg font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <GraduationCap className="mr-2 h-5 w-5" />
              Fazer pré-matrícula Agora
            </Link>
          </div>

          <div className="text-center mt-8">
            <p className="text-blue-100 text-sm">
              Dúvidas? Entre em contato pelo WhatsApp: 
              <a href="https://wa.me/5563985112006" target="_blank" rel="noopener noreferrer" className="text-white font-semibold hover:underline ml-1">
                (63) 98511-2006
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutIBUC;
