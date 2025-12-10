import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LEVELS, Level, Enrollment } from '../types';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { BookOpen, MapPin, Calendar, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { MatriculaAPI } from '../lib/api';

const EnrollmentPage: React.FC = () => {
  const { currentStudent, polos, addEnrollment } = useApp();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    level: '',
    polo: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    observations: '',
    academicPeriod: '',
    moduleNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [enrollmentNumber, setEnrollmentNumber] = useState('');



  useEffect(() => {
    if (!currentStudent?.name) {
      navigate('/cadastro-aluno');
    }
  }, [currentStudent, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.level) newErrors.level = 'Nível é obrigatório';
    if (!formData.polo) newErrors.polo = 'Polo é obrigatório';
    if (!formData.enrollmentDate) newErrors.enrollmentDate = 'Data de matrícula é obrigatória';
    if (!agreementAccepted) newErrors.agreement = 'É necessário aceitar o termo de responsabilidade';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateEnrollmentNumber = () => {
    const year = new Date().getFullYear();
    const randomNumber = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `${year}${randomNumber}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !currentStudent) return;

    setLoading(true);

    try {
      const payload = {
        aluno_id: currentStudent.id!,
        polo_id: formData.polo,
        tipo: 'online' as const,
        origem: 'site',
        status: 'pendente',
        periodo_letivo: formData.academicPeriod || undefined,
        modulo_numero: formData.moduleNumber ? Number(formData.moduleNumber) : undefined,
      };

      const created = await MatriculaAPI.criar(payload) as { id?: string; protocolo?: string };
      const protocolo: string | undefined = created?.protocolo;

      const newEnrollmentNumber = protocolo || generateEnrollmentNumber();
      setEnrollmentNumber(newEnrollmentNumber);

      const enrollment: Enrollment = {
        id: created?.id || Math.random().toString(36).substr(2, 9),
        studentId: currentStudent.id!,
        studentName: currentStudent.name!,
        level: formData.level as Level,
        polo: formData.polo,
        enrollmentDate: formData.enrollmentDate,
        observations: formData.observations,
      };

      addEnrollment(enrollment);

      if (created?.id && fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files.length > 0) {
        const formData = new FormData();
        Array.from(fileInputRef.current.files).forEach((file) => {
          formData.append('files', file);
        });

        try {
          await MatriculaAPI.uploadDocumentos(created.id, formData);
        } catch (uploadError) {
          console.error('Erro ao enviar documentos da matrícula:', uploadError);
        }
      }

      setSuccess(true);
    } catch (error) {
      console.error('Erro ao criar matrícula:', error);
      alert('Erro ao processar a matrícula. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }

    // Redirect after success
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  const levelOptions = Object.entries(LEVELS).map(([key, value]) => ({
    value: key,
    label: value
  }));

  const poloOptions = polos.map(polo => ({
    value: polo.id,
    label: `${polo.name} - ${polo.address.neighborhood}, ${polo.address.city}/${polo.address.state}`
  }));

  const selectedPolo = polos.find(polo => polo.id === formData.polo);

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Matrícula Realizada com Sucesso!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              A matrícula de <strong>{currentStudent?.name}</strong> foi concluída.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="text-left space-y-2">
                <p><strong>Número da Matrícula:</strong> <span className="text-xl font-bold text-green-700">{enrollmentNumber}</span></p>
                <p><strong>Aluno:</strong> {currentStudent?.name}</p>
                <p><strong>Nível:</strong> {LEVELS[formData.level as Level]}</p>
                <p><strong>Polo:</strong> {selectedPolo?.name}</p>
                <p><strong>Data da Matrícula:</strong> {new Date(formData.enrollmentDate).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <p className="text-gray-500 mb-6">
              Você será redirecionado para a página inicial em alguns segundos...
            </p>
            <Button onClick={() => navigate('/')}>
              Voltar ao Início
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentStudent?.name) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Matrícula do Aluno
          </h1>
          <p className="text-lg text-gray-600">
            Finalize o processo de matrícula escolhendo o nível e polo de estudo
          </p>
        </div>

        {/* Student Info */}
        <Card className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Dados do Aluno</h2>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome Completo</p>
                <p className="font-semibold text-gray-900">{currentStudent.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CPF</p>
                <p className="font-semibold text-gray-900">{currentStudent.cpf}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data de Nascimento</p>
                <p className="font-semibold text-gray-900">
                  {currentStudent.birthDate ? new Date(currentStudent.birthDate).toLocaleDateString('pt-BR') : ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">E-mail</p>
                <p className="font-semibold text-gray-900">{currentStudent.email}</p>
              </div>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Enrollment Data */}
          <Card>
            <div className="flex items-center space-x-2 mb-6">
              <BookOpen className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Informações da Matrícula</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Select
                  label="Nível de Ensino"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  options={levelOptions}
                  error={errors.level}
                  required
                  helperText="Escolha o nível adequado à faixa etária do aluno"
                />
                
                <Input
                  label="Data da Matrícula"
                  name="enrollmentDate"
                  type="date"
                  value={formData.enrollmentDate}
                  onChange={handleInputChange}
                  error={errors.enrollmentDate}
                  required
                />

                <Input
                  label="Período Letivo"
                  name="academicPeriod"
                  type="text"
                  value={formData.academicPeriod}
                  onChange={handleInputChange}
                  placeholder="Ex: 2025.1, 2025.2"
                />
              </div>

              <div className="space-y-4">
                <Select
                  label="Polo (Congregação)"
                  name="polo"
                  value={formData.polo}
                  onChange={handleInputChange}
                  options={poloOptions}
                  error={errors.polo}
                  required
                  helperText="Selecione o polo mais próximo da residência"
                />

                {selectedPolo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <h4 className="text-sm font-semibold text-blue-900">Informações do Polo</h4>
                    </div>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Pastor:</strong> {selectedPolo.pastor}</p>
                      <p><strong>Coordenador:</strong> {selectedPolo.coordinator.name}</p>
                      <p><strong>Endereço:</strong> {selectedPolo.address.street}, {selectedPolo.address.number} - {selectedPolo.address.neighborhood}</p>
                      <div className="mt-2">
                        <p className="font-semibold mb-1">Níveis disponíveis:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedPolo.availableLevels.map(level => (
                            <span key={level} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {LEVELS[level]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Select
                  label="Módulo do Curso"
                  name="moduleNumber"
                  value={formData.moduleNumber}
                  onChange={handleInputChange}
                  options={Array.from({ length: 10 }, (_, i) => ({
                    value: String(i + 1),
                    label: `Módulo ${i + 1}`,
                  }))}
                  helperText="Informe em qual módulo o aluno irá ingressar (quando aplicável)"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Observações (Opcional)
              </label>
              <textarea
                name="observations"
                value={formData.observations}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Informações adicionais, necessidades especiais, etc."
              />
            </div>
          </Card>

          <Card>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="documentos">
                Documentos e Foto 3x4 do Aluno
              </label>
              <input
                id="documentos"
                name="files"
                type="file"
                multiple
                ref={fileInputRef}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Anexe os documentos necessários (RG, CPF, certidão, comprovante de endereço, etc.) e a foto 3x4 em formato digital.
              </p>
            </div>
          </Card>

          {/* Level Information */}
          {formData.level && (
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900">Sobre o Nível Selecionado</h2>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-yellow-900 mb-2">
                  {LEVELS[formData.level as Level]}
                </h3>
                <div className="text-sm text-yellow-800">
                  {formData.level === 'NIVEL_I' && (
                    <p>Introdução aos valores cristãos através de histórias bíblicas, atividades lúdicas, músicas e brincadeiras educativas. Desenvolvimento da socialização e primeiros conceitos de fé.</p>
                  )}
                  {formData.level === 'NIVEL_II' && (
                    <p>Desenvolvimento da leitura bíblica básica, compreensão de princípios fundamentais da fé cristã, memorização de versículos e histórias bíblicas interativas.</p>
                  )}
                  {formData.level === 'NIVEL_III' && (
                    <p>Aprofundamento nos ensinamentos bíblicos, desenvolvimento do caráter cristão, estudo sistemático da Bíblia e início das práticas de oração e evangelização.</p>
                  )}
                  {formData.level === 'NIVEL_IV' && (
                    <p>Formação de líderes jovens com foco na evangelização, serviço cristão, discipulado e preparação para ministérios. Estudo teológico mais avançado.</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Termo de Responsabilidade */}
          <Card>
            <div className="flex items-center space-x-2 mb-6">
              <FileText className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Termo de Responsabilidade</h2>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 max-h-64 overflow-y-auto">
              <div className="text-sm text-gray-700 space-y-4">
                <h3 className="font-bold text-gray-900 mb-3">TERMO DE RESPONSABILIDADE - ESCOLA BÍBLICA DOMINICAL INFANTIL</h3>

                <p><strong>1. COMPROMISSO DOS RESPONSÁVEIS:</strong></p>
                <p>Como responsável legal pelo menor acima identificado, comprometo-me a:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Levar e buscar a criança nos horários estabelecidos pela instituição;</li>
                  <li>Informar qualquer alteração de endereço, telefone ou dados pessoais;</li>
                  <li>Comunicar previamente sobre faltas e ausências;</li>
                  <li>Apoiar e reforçar em casa os ensinamentos ministrados na escola bíblica;</li>
                  <li>Participar das reuniões e eventos quando solicitado.</li>
                </ul>

                <p><strong>2. AUTORIZAÇÃO MÉDICA:</strong></p>
                <p>Autorizo a administração dos primeiros socorros em caso de acidentes e, se necessário, o encaminhamento para atendimento médico, responsabilizando-me pelos custos decorrentes.</p>

                <p><strong>3. AUTORIZAÇÃO DE IMAGEM:</strong></p>
                <p>Autorizo o uso da imagem da criança em atividades pedagógicas, fotografias e vídeos para fins educacionais e divulgação das atividades da igreja, sem finalidade comercial.</p>

                <p><strong>4. DISCIPLINA E CONDUTA:</strong></p>
                <p>Estou ciente das normas de conduta da instituição e comprometo-me a orientar a criança sobre a importância do respeito aos professores, colegas e patrimônio da igreja.</p>

                <p><strong>5. RESPONSABILIDADE CIVIL:</strong></p>
                <p>Responsabilizo-me por eventuais danos materiais causados pela criança às dependências ou patrimônio da instituição.</p>

                <p><strong>6. FREQUÊNCIA:</strong></p>
                <p>Comprometo-me a manter a frequência regular da criança, comunicando previamente sobre faltas previstas.</p>

                <p className="font-bold text-gray-900 mt-4">Declaro ter lido e concordo com todos os termos acima descritos.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="agreement"
                checked={agreementAccepted}
                onChange={(e) => {
                  setAgreementAccepted(e.target.checked);
                  if (errors.agreement) {
                    setErrors(prev => ({ ...prev, agreement: '' }));
                  }
                }}
                className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="agreement" className="text-sm text-gray-700">
                <span className="font-medium">Li e aceito todos os termos do termo de responsabilidade</span> descrito acima.
                Estou ciente de que este documento estabelece as condições para a matrícula e permanência da criança na Escola Bíblica Dominical Infantil da IBUC.
              </label>
            </div>

            {errors.agreement && (
              <p className="mt-2 text-sm text-red-600">{errors.agreement}</p>
            )}
          </Card>

          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              loading={loading}
              disabled={!agreementAccepted || loading}
              className={`min-w-[200px] ${!agreementAccepted ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processando Pré-Matrícula...' : 'Enviar Pré-Matrícula'}
            </Button>
          </div>
        </form>


      </div>
    </div>
  );
};

export default EnrollmentPage;
