import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/entities/user';
import { useNavigationConfirm } from '@/shared/lib/hooks/useNavigationConfirm';
import { Input } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { Card } from '@/shared/ui';
import { ConfirmDialog } from '@/shared/ui';
import { User, Lock } from 'lucide-react';

const StudentAccess: React.FC = () => {
  const { login, currentUser, authLoading } = useAuth();
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
    
    const cleanCpf = formData.cpf.replace(/\D/g, '');
    const success = await login(cleanCpf, formData.password, 'student');
    
    if (success) {
      navigate('/acesso-aluno');
    } else {
      setErrors({ password: 'CPF ou senha inválidos' });
    }
    
    setLoading(false);
  };

  // Show loading while checking session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  // Se já estiver autenticado como aluno, não deve exibir tela de login
  if (currentUser?.role === 'student') {
    return <Navigate to="/app/dashboard" replace />;
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
