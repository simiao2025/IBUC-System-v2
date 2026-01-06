import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Shield, Mail, Lock } from 'lucide-react';

const AdminAccess: React.FC = () => {
  const { login } = useApp();
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = login(formData.email, formData.password, 'admin');
    
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setErrors({ password: 'E-mail ou senha inválidos' });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
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
            Acesso restrito para coordenadores
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
                  placeholder="admin@ibuc.com.br"
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
                Credenciais de demonstração:
              </p>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  <strong>E-mail:</strong> admin@ibuc.com.br
                </p>
                <p className="text-xs text-gray-500">
                  <strong>Senha:</strong> admin123
                </p>
              </div>
            </div>
          </form>
        </Card>

        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminAccess;