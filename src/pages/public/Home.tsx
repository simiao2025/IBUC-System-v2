import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, MapPin, Award, Calendar, ChevronDown, ChevronUp, MessageCircle, Search, Phone, Mail } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

const Home: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-red-700 text-white overflow-hidden">
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
            <h3 className="text-lg font-semibold mb-2">Base Bíblica Sólida</h3>
            <p className="text-gray-600 text-sm">
              Ensino fundamentado nos princípios e valores da Palavra de Deus
            </p>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Multiplicidade de Polos</h3>
            <p className="text-gray-600 text-sm">
              Atendimento em diversos locais para melhor atender a comunidade
            </p>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <Award className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Certificação</h3>
            <p className="text-gray-600 text-sm">
              Certificado de conclusão ao final de cada módulo do curso
            </p>
          </Card>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600">
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

      {/* CTA Section */}
      <section className="bg-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para fazer parte do IBUC?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Garanta já a vaga do seu filho e proporcione a ele uma educação cristã de qualidade.
          </p>
          <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
            <Link to="/pre-matricula" className="flex items-center justify-center">
              <Users className="h-5 w-5 mr-2" />
              FAZER PRÉ-MATRÍCULA AGORA
            </Link>
          </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-gray-600">
            Tire suas dúvidas sobre o IBUC
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <FAQComponent />
        </div>
      </section>
    </div>
  );
};

// Componente FAQ
const FAQComponent = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Qual a idade mínima para matrícula?",
      answer: "Aceitamos crianças a partir dos 6 anos de idade no curso básico."
    },
    {
      question: "Quais documentos são necessários para a matrícula?",
      answer: "É necessário apresentar cópia da certidão de nascimento ou RG da criança, comprovante de residência e uma foto 3x4."
    },
    {
      question: "Qual o valor da mensalidade?",
      answer: "Entre em contato com a secretaria do polo mais próximo para informações sobre valores e formas de pagamento."
    },
    {
      question: "Qual o horário das aulas?",
      answer: "Os horários variam conforme o polo. Entre em contato com a secretaria do polo de seu interesse para mais informações."
    },
    {
      question: "Há material didático incluso?",
      answer: "Sim, todo o material didático é fornecido pelo IBUC e está incluso no valor da mensalidade."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <Card key={index} className="overflow-hidden">
          <button
            className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
            onClick={() => toggleFAQ(index)}
          >
            <span className="font-medium text-gray-900">{faq.question}</span>
            {openIndex === index ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {openIndex === index && (
            <div className="px-6 pb-4 pt-0">
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default Home;
