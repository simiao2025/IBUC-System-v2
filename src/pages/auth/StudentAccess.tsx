import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useNavigationConfirm } from '../../hooks/useNavigationConfirm';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { User, Lock, BookOpen, Calendar, Award } from 'lucide-react';
import { AlunosAPI } from '../../features/students/aluno.service';
import { DracmasAPI } from '../../features/finance/dracmas.service';

const StudentAccess: React.FC = () => {
  const { login, currentUser } = useApp();
  const navigate = useNavigate();

  const { isDialogOpen, confirmNavigation, handleConfirm, handleCancel } = useNavigationConfirm({
    title: 'Sair da área do aluno',
    message: 'Você tem certeza que deseja voltar ao início?'
  });
  const [formData, setFormData] = useState({
    cpf: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any | null>(null);
  const [studentInfoStatus, setStudentInfoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [dracmasSaldo, setDracmasSaldo] = useState<number | null>(null);
  const [dracmasLoading, setDracmasLoading] = useState(false);

  useEffect(() => {
    const carregarAluno = async () => {
      if (!currentUser || currentUser.role !== 'student' || !currentUser.studentId) {
        setStudentInfo(null);
        setStudentInfoStatus('idle');
        return;
      }

      try {
        setStudentInfoStatus('loading');
        const aluno = await AlunosAPI.buscarPorId(currentUser.studentId);
        setStudentInfo(aluno);
        setStudentInfoStatus('success');
      } catch (error) {
        console.error('Erro ao carregar dados do aluno para o painel:', error);
        setStudentInfoStatus('error');
      }
    };

    carregarAluno();
  }, [currentUser]);

  useEffect(() => {
    const carregarDracmas = async () => {
      if (!currentUser || currentUser.role !== 'student' || !currentUser.studentId) {
        setDracmasSaldo(null);
        return;
      }

      try {
        setDracmasLoading(true);
        const response = await DracmasAPI.saldoPorAluno(currentUser.studentId);
        setDracmasSaldo(response.data?.saldo ?? 0);
      } catch (error) {
        console.error('Erro ao carregar saldo de Drácmas do aluno:', error);
        setDracmasSaldo(null);
      } finally {
        setDracmasLoading(false);
      }
    };

    carregarDracmas();
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatCPF = (cpf: string) => {
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedCPF = formatCPF(value);
    setFormData(prev => ({ ...prev, [name]: formattedCPF }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    const success = await login(formData.cpf, formData.password, 'student');
    
    if (success) {
      navigate('/painel-aluno');
    } else {
      setErrors({ password: 'CPF ou senha inválidos' });
    }
    
    setLoading(false);
  };

  // If already logged in as student, show student panel
  if (currentUser?.role === 'student') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Painel do Aluno
            </h1>
            <p className="text-lg text-gray-600">
              Bem-vindo à sua área pessoal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Meus Estudos</h3>
              <p className="text-gray-600 text-sm mb-4">
                Acompanhe seu progresso nos estudos bíblicos
              </p>
              <Button variant="secondary" size="sm" className="w-full">
                Ver Progresso
              </Button>
            </Card>
            <Card>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Minhas Drácmas
              </h2>
              {dracmasLoading ? (
                <p className="text-sm text-gray-600">Carregando saldo de Drácmas...</p>
              ) : dracmasSaldo === null ? (
                <p className="text-sm text-gray-600">
                  Assim que seu cadastro estiver completo, seu saldo de Drácmas será exibido aqui.
                </p>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Saldo atual</p>
                  <p className="text-3xl font-bold text-indigo-700">{dracmasSaldo}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Drácmas são recompensas simbólicas por presença, tarefas e participação nas aulas.
                  </p>
                </div>
              )}
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Cronograma</h3>
              <p className="text-gray-600 text-sm mb-4">
                Verifique datas de aulas e atividades
              </p>
              <Button variant="secondary" size="sm" className="w-full">
                Ver Cronograma
              </Button>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <Award className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Certificados</h3>
              <p className="text-gray-600 text-sm mb-4">
                Acompanhe suas conquistas e certificações
              </p>
              <Button variant="secondary" size="sm" className="w-full">
                Ver Certificados
              </Button>
            </Card>
          </div>

          <Card>
            <h2 className="text-xl font-semibold mb-4">Informações da Matrícula</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              {studentInfoStatus === 'idle' && (
                <p className="text-sm text-gray-700">
                  Assim que sua matrícula for processada no sistema, os detalhes como <span className="font-semibold">status</span>,
                  <span className="font-semibold"> nível</span> e <span className="font-semibold">polo</span> serão exibidos aqui.
                </p>
              )}
              {studentInfoStatus === 'loading' && (
                <p className="text-sm text-blue-700 font-medium">
                  Carregando informações da matrícula...
                </p>
              )}
              {studentInfoStatus === 'error' && (
                <p className="text-sm text-red-700 font-medium">
                  Não foi possível carregar as informações da matrícula neste momento.
                </p>
              )}
              {studentInfoStatus === 'success' && studentInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nome do Aluno</p>
                    <p className="font-semibold text-gray-900">{studentInfo.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold text-gray-900">{studentInfo.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Polo</p>
                    <p className="font-semibold text-gray-900">{studentInfo.polo_id || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nível Atual</p>
                    <p className="font-semibold text-gray-900">{studentInfo.nivel_atual_id || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => {
                // logout logic would go here
                navigate('/');
              }}
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            src="https://ibuc.com.br/wp-content/uploads/2023/05/logo-site.png"
            alt="IBUC Logo"
            className="h-16 w-auto mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Área do Aluno
          </h2>
          <p className="text-gray-600">
            Acesso para alunos e pais
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <Input
                  label="CPF do Aluno"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  error={errors.cpf}
                  maxLength={14}
                  placeholder="000.000.000-00"
                  required
                  className="flex-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-gray-400" />
                <Input
                  label="Senha"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  placeholder="Digite sua senha"
                  required
                  className="flex-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Entrar
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Primeira vez aqui?
              </p>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">
                  Use o CPF cadastrado e a senha padrão: <strong>senha123</strong>
                </p>
                <Link
                  to="/cadastro-aluno"
                  className="text-sm text-red-600 hover:text-red-700 hover:underline"
                >
                  Ainda não tem cadastro? Cadastre-se aqui
                </Link>
              </div>
            </div>
          </form>
        </Card>

        <div className="text-center">
          <button
            onClick={() => confirmNavigation(() => navigate('/'))}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Voltar ao início
          </button>
        </div>

        <ConfirmDialog
          isOpen={isDialogOpen}
          title="Sair da área do aluno"
          message="Você tem certeza que deseja voltar ao início?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          confirmText="Sim"
          cancelText="Não"
        />
      </div>
    </div>
  );
};

export default StudentAccess;
