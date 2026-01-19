import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Users, BookOpen, MapPin, Award, ChevronDown, ChevronUp, Phone, Mail } from 'lucide-react';
import { Button, Card } from '@/shared/ui';
import { poloApi } from '@/entities/polo';
import { ConfiguracoesService } from '@/entities/system';
import { ListaEsperaService } from '@/entities/enrollment';

const Home: React.FC = () => {
  const [polosAtivos, setPolosAtivos] = useState<any[]>([]);
  const [loadingPolos, setLoadingPolos] = useState(true);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(true);
  const [waitlistData, setWaitlistData] = useState({ nome: '', email: '', telefone: '', cidade: '', bairro: '' });
  const [submittingWaitlist, setSubmittingWaitlist] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.replace('#', ''));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Buscar Polos
        const polosData = await poloApi.listar();
        setPolosAtivos(polosData.filter((p: any) => p.ativo !== false));

        // Buscar Configurações de Matrícula
        const config = await ConfiguracoesService.buscarTodasComoObjeto();
        if (config.periodo_matricula) {
          const now = new Date();
          const start = new Date(config.periodo_matricula.start);
          const end = new Date(config.periodo_matricula.end);

          setIsEnrollmentOpen(now >= start && now <= end);
        }
      } catch (error) {
        console.error('Erro ao buscar dados iniciais na home:', error);
      } finally {
        setLoadingPolos(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingWaitlist(true);
    try {
      await ListaEsperaService.cadastrar(waitlistData);
      setWaitlistSuccess(true);
      setWaitlistData({ nome: '', email: '', telefone: '', cidade: '', bairro: '' });
    } catch (error: any) {
      alert(error.message || 'Erro ao cadastrar na lista de espera.');
    } finally {
      setSubmittingWaitlist(false);
    }
  };

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
              Formamos crianças e adolescentes nos caminhos do Senhor através do ensino bíblico de qualidade,
              desenvolvendo valores cristãos e preparando uma nova geração para servir a Deus.
            </p>

            {isEnrollmentOpen ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-red-600">
                  <Link to="/pre-matricula">Fazer pré-matrícula</Link>
                </Button>
              </div>
            ) : (
              <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <p className="text-lg font-medium mb-4">Matrículas encerradas no momento, deseja preencher lista de espera?</p>
                {waitlistSuccess ? (
                  <div className="bg-green-500/20 border border-green-500 text-green-100 p-3 rounded-lg">
                    ✅ Cadastro realizado! Notificaremos você assim que abrirmos novas vagas.
                  </div>
                ) : (
                  <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Seu Nome completo"
                      required
                      className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder:text-white/60 focus:bg-white/30 focus:outline-none"
                      value={waitlistData.nome}
                      onChange={e => setWaitlistData({ ...waitlistData, nome: e.target.value })}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="email"
                        placeholder="E-mail"
                        required
                        className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder:text-white/60 focus:bg-white/30 focus:outline-none"
                        value={waitlistData.email}
                        onChange={e => setWaitlistData({ ...waitlistData, email: e.target.value })}
                      />
                      <input
                        type="tel"
                        placeholder="Telefone"
                        required
                        className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder:text-white/60 focus:bg-white/30 focus:outline-none"
                        value={waitlistData.telefone}
                        onChange={e => setWaitlistData({ ...waitlistData, telefone: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Cidade"
                        required
                        className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder:text-white/60 focus:bg-white/30 focus:outline-none"
                        value={waitlistData.cidade}
                        onChange={e => setWaitlistData({ ...waitlistData, cidade: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Bairro"
                        required
                        className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder:text-white/60 focus:bg-white/30 focus:outline-none"
                        value={waitlistData.bairro}
                        onChange={e => setWaitlistData({ ...waitlistData, bairro: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-white text-red-700 hover:bg-gray-100" disabled={submittingWaitlist}>
                      {submittingWaitlist ? 'Cadastrando...' : 'Quero entrar na lista'}
                    </Button>
                  </form>
                )}
              </div>
            )}
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
            Proporcionar educação cristã de qualidade para crianças e adolescentes, fundamentada nos
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

      {/* NÃ­veis de Ensino Section */}
      <section id="niveis" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Níveis de Ensino
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nosso programa educativo é dividido em 4 níveis fundamentais, respeitando o desenvolvimento cognitivo e espiritual de cada idade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-red-600">
              <h3 className="text-xl font-bold text-red-700 mb-2">NÍVEL I - 2 a 5 anos</h3>
              <p className="text-gray-600">
                Introdução aos primeiros fundamentos bíblicos de forma lúdica, focando no amor de Deus e nos personagens principais da Bíblia.
              </p>
            </Card>
            <Card className="border-l-4 border-l-blue-600">
              <h3 className="text-xl font-bold text-blue-700 mb-2">NÍVEL II - 6 a 8 anos</h3>
              <p className="text-gray-600">
                Aprofundamento nas histórias bíblicas com o início da compreensão doutrinária e aplicação dos valores cristãos no dia a dia.
              </p>
            </Card>
            <Card className="border-l-4 border-l-green-600">
              <h3 className="text-xl font-bold text-green-700 mb-2">NÍVEL III - 9 a 11 anos</h3>
              <p className="text-gray-600">
                Preparação para a pré-adolescência, com foco em identidade cristã, ética bíblica e o papel do jovem no corpo de Cristo.
              </p>
            </Card>
            <Card className="border-l-4 border-l-yellow-600">
              <h3 className="text-xl font-bold text-yellow-700 mb-2">NÍVEL IV - 12 a 16 anos</h3>
              <p className="text-gray-600">
                Formação teológica mais robusta, abordando temas de apologética, serviço cristão e maturidade espiritual para a vida adulta.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Nossos Polos Section */}
      <section id="polos" className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Nossos Polos
            </h2>
            <p className="text-xl text-gray-600">
              Encontre o IBUC mais próximo de você. Atualizado em tempo real.
            </p>
          </div>

          {loadingPolos ? (
            <div className="text-center text-gray-500 py-12">Carregando polos...</div>
          ) : polosAtivos.length === 0 ? (
            <div className="text-center text-gray-500 py-12">Nenhum polo cadastrado no momento.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {polosAtivos.map((polo) => (
                <Card key={polo.id} className="hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-red-700 mb-2">{polo.nome}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {polo.endereco?.cidade || 'Palmas'} - TO
                    </p>
                    {polo.pastor_responsavel && (
                      <p className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        Pr. {polo.pastor_responsavel}
                      </p>
                    )}
                    {polo.telefone && (
                      <p className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {polo.telefone}
                      </p>
                    )}
                    {polo.email && (
                      <p className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {polo.email}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
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
          {isEnrollmentOpen ? (
            <Button asChild size="lg" className="bg-white !text-black hover:bg-gray-100">
              <Link to="/pre-matricula" className="flex items-center justify-center">
                <Users className="h-5 w-5 mr-2" />
                FAZER PRÉ-MATRÍCULA AGORA
              </Link>
            </Button>
          ) : (
            <div className="bg-white/10 p-6 rounded-lg border border-white/20 inline-block px-12">
              <p className="text-xl font-medium mb-4">Vagas em breve!</p>
              <p className="text-white/80">Participe da lista de espera no topo desta página.</p>
            </div>
          )}
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
      answer: "Aceitamos crianças a partir dos 2 anos de idade em nosso Nível I."
    },
    {
      question: "Quais documentos são necessários para a matrícula?",
      answer: "É necessário apresentar cópia da certidão de nascimento ou RG da criança, comprovante de residência e uma foto 3x4."
    },
    {
      question: "Qual o valor da mensalidade?",
      answer: "O IBUC não cobra mensalidade. O investimento necessário é apenas para o material didático de cada módulo."
    },
    {
      question: "Qual o horário das aulas?",
      answer: "Os horários variam conforme o polo. Entre em contato com a secretaria do polo de seu interesse para mais informações."
    },
    {
      question: "Há material didático incluso?",
      answer: "Sim, todo o material didático é especializado para cada faixa etária e o pagamento é realizado por módulo."
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
