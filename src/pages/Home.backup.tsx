import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, MapPin, Award, Calendar, ChevronDown, ChevronUp, MessageCircle, Search, Phone, Mail } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const Home: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8">
              <img
                src="https://ibuc.com.br/wp-content/uploads/2023/05/logo-site.png"
                alt="IBUC Logo"
                className="h-20 w-auto mx-auto mb-6"
              />
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                IBUC - Palmas - TO
              </h1>
              <p className="text-xl md:text-2xl font-light mb-8 max-w-3xl mx-auto">
                Instituto Bíblico Único Caminho
              </p>
            </div>
            
            <p className="text-lg md:text-xl mb-12 max-w-4xl mx-auto leading-relaxed">
              Formamos crianças e jovens nos caminhos do Senhor através do ensino bíblico de qualidade, 
              desenvolvendo valores cristãos e preparando uma nova geração para servir a Deus.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-red-600">
                <Link to="/pre-matricula">Fazer pré-matrícula</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Banner da Aula Inaugural */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-4 h-4 bg-white bg-opacity-20 rounded-full animate-bounce"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-white bg-opacity-15 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 left-20 w-5 h-5 bg-white bg-opacity-25 rounded-full animate-ping"></div>
          <div className="absolute bottom-20 right-10 w-3 h-3 bg-white bg-opacity-30 rounded-full animate-bounce delay-1000"></div>
        </div>
        
        {/* Animated Plus Signs */}
        <div className="absolute top-32 right-32 text-white text-4xl font-bold opacity-30 animate-pulse">+</div>
        <div className="absolute bottom-48 left-32 text-white text-6xl font-bold opacity-20 animate-bounce">+</div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center bg-yellow-400 text-purple-900 px-6 py-3 rounded-full font-bold text-lg mb-6 animate-bounce">
              <Calendar className="h-5 w-5 mr-2" />
              22 DE AGOSTO
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl">
              Aula Inaugural Geral!
            </h2>
            
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white border-opacity-30 max-w-2xl mx-auto">
              <p className="text-xl text-white font-semibold mb-2">
                🎺 NO TEMPLO SEDE 🎺
              </p>
              <p className="text-lg text-white font-medium">
                ASSEMBLEIA DE DEUS MISSÃO PROJETO RESTAURANDO VIDAS
              </p>
              <p className="text-md text-white opacity-90">
                PR. SUIMAR CAETANO - PRESIDENTE
              </p>
            </div>

            <div className="mb-8">
              <div className="relative max-w-sm mx-auto">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F556e107f9581454d85126749671080db%2F3494e89c43fc4681b1f2fb736cf72a4e?format=webp&width=800"
                  alt="Aula Inaugural - Instituto Bíblico IBUC"
                  className="w-full h-auto rounded-3xl shadow-2xl border-4 border-white border-opacity-30 transform hover:scale-105 transition-transform duration-500"
                />
                {/* Glowing effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-300 to-pink-300 rounded-3xl opacity-75 blur-lg animate-pulse -z-10"></div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                🌟 Não Perca Esta Oportunidade! 🌟
              </h3>
              <p className="text-lg text-white mb-6 max-w-2xl mx-auto opacity-90">
                Garante já a sua vaga para participar desta experiência única de crescimento espiritual e conhecimento bíblico!
              </p>
            </div>
            
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-green-400 to-cyan-400 hover:from-green-500 hover:to-cyan-500 text-white font-bold text-xl px-12 py-4 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300"
            >
              <Link to="/pre-matricula" className="flex items-center">
                <Users className="h-6 w-6 mr-3" />
                FAZER PRÉ-MATRÍCULA AGORA!
              </Link>
            </Button>
            
            <p className="text-white text-sm mt-4 opacity-75">
              ✨ Vagas limitadas - Garante a sua hoje mesmo! ✨
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Nossa Missão
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Proporcionar educação cristã de qualidade para crianças e jovens, fundamentada nos 
            valores bíblicos, promovendo o desenvolvimento integral do ser humano e formando 
            cidadãos comprometidos com os princípios do Reino de Deus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <Users className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ensino Personalizado</h3>
            <p className="text-gray-600 text-sm">
              Atendimento individualizado respeitando o ritmo de aprendizado de cada criança
            </p>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Currículo Bíblico</h3>
            <p className="text-gray-600 text-sm">
              Material didático desenvolvido especialmente para o ensino infanto-juvenil
            </p>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Múltiplos Polos</h3>
            <p className="text-gray-600 text-sm">
              Aulas em diversas congregações facilitando o acesso de todas as famílias
            </p>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <Award className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Certificação</h3>
            <p className="text-gray-600 text-sm">
              Formação reconhecida com certificado de conclusão ao final de cada nível
            </p>
          </Card>
        </div>
      </section>

      {/* Levels Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Níveis de Ensino
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Oferecemos ensino bíblico estruturado por faixas etárias, 
              adequado ao desenvolvimento cognitivo e espiritual de cada idade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  I
                </div>
                <h3 className="text-xl font-bold text-red-800 mb-2">NÍVEL I</h3>
                <p className="text-red-700 font-semibold mb-3">2 a 5 anos</p>
                <p className="text-red-600 text-sm">
                  Introdução aos valores cristãos através de histórias bíblicas e atividades lúdicas
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  II
                </div>
                <h3 className="text-xl font-bold text-blue-800 mb-2">NÍVEL II</h3>
                <p className="text-blue-700 font-semibold mb-3">6 a 8 anos</p>
                <p className="text-blue-600 text-sm">
                  Desenvolvimento da leitura bíblica e compreensão de princípios básicos da fé
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  III
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">NÍVEL III</h3>
                <p className="text-green-700 font-semibold mb-3">9 a 11 anos</p>
                <p className="text-green-600 text-sm">
                  Aprofundamento nos ensinamentos bíblicos e desenvolvimento do caráter cristão
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="bg-yellow-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  IV
                </div>
                <h3 className="text-xl font-bold text-yellow-800 mb-2">NÍVEL IV</h3>
                <p className="text-yellow-700 font-semibold mb-3">12 a 16 anos</p>
                <p className="text-yellow-600 text-sm">
                  Formação de líderes jovens com foco na evangelização e serviço cristão
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Módulos Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Módulos do Curso
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conheça os 10 módulos que compõem nosso currículo completo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <Card key={num} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                {num}
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Módulo {num}</h3>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button asChild variant="secondary">
            <Link to="/modulos">Ver Todos os Módulos</Link>
          </Button>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Processo simples e rápido para matricular seu filho
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Escolha o Polo</h3>
              <p className="text-gray-600 text-sm">
                Selecione o polo mais próximo da sua residência
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Preencha o Formulário</h3>
              <p className="text-gray-600 text-sm">
                Complete os dados do aluno e responsável online
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Validação</h3>
              <p className="text-gray-600 text-sm">
                A secretaria valida os documentos presencialmente
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Matrícula Efetivada</h3>
              <p className="text-gray-600 text-sm">
                Receba confirmação e comece a estudar!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            O Que Dizem Sobre Nós
          </h2>
          <p className="text-xl text-gray-600">
            Depoimentos de pais e alunos satisfeitos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              nome: 'Maria Silva',
              filho: 'João, 8 anos',
              texto: 'Meu filho adora as aulas! O ensino é de qualidade e os professores são muito dedicados.',
              cor: 'red'
            },
            {
              nome: 'Carlos Santos',
              filho: 'Ana, 10 anos',
              texto: 'Excelente estrutura e metodologia. Minha filha está aprendendo muito sobre a Bíblia.',
              cor: 'blue'
            },
            {
              nome: 'Patrícia Oliveira',
              filho: 'Pedro, 12 anos',
              texto: 'Recomendo a todos! O IBUC mudou a vida do meu filho para melhor.',
              cor: 'green'
            }
          ].map((depoimento, idx) => (
            <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className={`bg-${depoimento.cor}-100 text-${depoimento.cor}-600 w-12 h-12 rounded-full flex items-center justify-center mr-4`}>
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{depoimento.nome}</h4>
                  <p className="text-sm text-gray-600">{depoimento.filho}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"{depoimento.texto}"</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Encontre seu Polo Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Encontre seu Polo
            </h2>
            <p className="text-xl text-gray-600">
              Busque o polo mais próximo da sua localização
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Digite a cidade ou CEP"
                className="flex-1"
              />
              <Button>
                <Search className="h-5 w-5 mr-2" />
                Buscar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { nome: 'Igreja Central - Palmas', endereco: 'Av. Principal, 123', telefone: '(63) 3214-5678' },
              { nome: 'Polo Norte', endereco: 'Rua das Flores, 456', telefone: '(63) 3214-5679' },
              { nome: 'Polo Sul', endereco: 'Av. Brasil, 789', telefone: '(63) 3214-5680' }
            ].map((polo, idx) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{polo.nome}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-red-600" />
                    {polo.endereco}
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-blue-600" />
                    {polo.telefone}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  Ver no Mapa
                </Button>
              </Card>
            ))}
          </div>

          {/* Mapa placeholder */}
          <div className="mt-8 bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-500">Mapa interativo será implementado aqui</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Perguntas Frequentes
          </h2>
        </div>

        <FAQComponent />
      </section>

      {/* Access Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Acesso Rápido
          </h2>
          <p className="text-xl text-gray-600">
            Escolha a opção adequada para acessar o sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <div className="mb-6">
              <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Área do Aluno</h3>
              <p className="text-gray-600 mb-6">
                Acesso para alunos e pais acompanharem o desenvolvimento escolar
              </p>
              <Button asChild variant="secondary" size="lg" className="w-full">
                <Link to="/acesso-aluno">Acessar Área do Aluno</Link>
              </Button>
            </div>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <div className="mb-6">
              <Award className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Área Administrativa</h3>
              <p className="text-gray-600 mb-6">
                Acesso restrito para coordenadores e administradores do sistema
              </p>
              <Button asChild size="lg" className="w-full">
                <Link to="/admin">Acessar Área Admin</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

// Componente FAQ
const FAQComponent: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      pergunta: 'Qual a idade mínima para matrícula?',
      resposta: 'A idade mínima é de 2 anos completos. O curso é dividido em 4 níveis conforme a faixa etária do aluno.'
    },
    {
      pergunta: 'Como funciona a matrícula online?',
      resposta: 'Você preenche o formulário online, recebe um protocolo, e depois a secretaria do polo valida os documentos presencialmente para efetivar a matrícula.'
    },
    {
      pergunta: 'Quais documentos são necessários?',
      resposta: 'Certidão de nascimento, CPF ou RG do aluno, comprovante de residência e documento do responsável. Alguns documentos podem ser enviados online durante a pré-matrícula.'
    },
    {
      pergunta: 'Há custo para a matrícula?',
      resposta: 'Entre em contato com o polo de sua preferência para informações sobre valores e formas de pagamento.'
    },
    {
      pergunta: 'Posso transferir meu filho para outro polo?',
      resposta: 'Sim, é possível transferir entre polos. Entre em contato com a secretaria do polo atual para iniciar o processo de transferência.'
    },
    {
      pergunta: 'Como acompanhar o progresso do aluno?',
      resposta: 'Os responsáveis têm acesso à área do aluno onde podem ver presenças, notas, boletins e comunicados da turma.'
    }
  ];

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <Card key={index} className="overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900 pr-4">{faq.pergunta}</span>
            {openIndex === index ? (
              <ChevronUp className="h-5 w-5 text-red-600 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
            )}
          </button>
          {openIndex === index && (
            <div className="px-6 pb-6 text-gray-600">
              {faq.resposta}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default Home;
