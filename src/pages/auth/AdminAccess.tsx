import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Shield, Mail, Lock } from 'lucide-react';

const AdminAccess: React.FC = () => {
  const { login, showFeedback, currentUser } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'E-mail é obrigatório';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const success = await login(formData.email, formData.password, 'admin');

      if (success) {
        navigate('/admin/dashboard');
      } else {
        showFeedback('error', 'Falha na Autenticação', 'E-mail ou senha incorretos. Verifique se digitou o e-mail cadastrado corretamente.');
        setErrors({ password: 'E-mail ou senha inválidos' });
      }
    } catch {
      showFeedback('error', 'Erro do Sistema', 'Erro ao realizar login. Tente novamente mais tarde.');
      setErrors({ password: 'Erro ao realizar login. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // Se já estiver logado como admin, redirecionar para o painel apenas se não estiver carregando
    // Nota: Deixamos o redirecionamento automático, mas se o usuário quiser trocar de conta, 
    // ele deve usar o botão 'Sair' no painel. 
    // Para evitar 'loop' ou confusão, se o usuário for forçado para cá por um erro, limpamos o loading.
    if (currentUser?.role === 'admin') {
      const timer = setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Logos */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-between px-4 opacity-[0.1] sm:opacity-[0.15]">
        <img
          src="/icons/3d/Logo_admprv.png"
          alt=""
          className="w-[300px] md:w-[500px] lg:w-[600px] -translate-x-1/4"
        />
        <img
          src="/icons/3d/logo-IBUC.png"
          alt=""
          className="w-[300px] md:w-[500px] lg:w-[600px] translate-x-1/4"
        />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <img
            src="https://ibuc.com.br/wp-content/uploads/2023/05/logo-site.png"
            alt="IBUC Logo"
            className="h-16 w-auto mx-auto mb-6"
          />
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-red-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              Área Administrativa
            </h2>
          </div>
          <p className="text-gray-600">
            Acesso restrito para Diretoria Geral e Equipes dos Polos
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-gray-400" />
                <Input
                  label="E-mail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder="Digite seu e-mail"
                  required
                  autoComplete="email"
                  className="flex-1"
                  autoFocus
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
                  autoComplete="current-password"
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

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
              size="lg"
            >
              Voltar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminAccess;