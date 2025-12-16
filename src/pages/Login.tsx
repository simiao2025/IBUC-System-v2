import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

type LoginMode = 'admin' | 'student';

const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<LoginMode>('admin');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.identifier) {
      next.identifier = 'E-mail é obrigatório';
    }
    if (!formData.password) {
      next.password = 'Senha é obrigatória';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const userType = await login(formData.identifier, formData.password, mode);
      if (!userType) {
        setErrors({ password: 'Credenciais inválidas' });
        return;
      }

      if (userType === 'admin') {
        navigate('/admin/dashboard');
        return;
      }

      navigate('/app/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Login</h1>
          <p className="text-sm text-gray-600">Acesso administrativo e do aluno</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('admin');
              setErrors({});
            }}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
              mode === 'admin'
                ? 'bg-white border-gray-300 font-semibold'
                : 'bg-transparent border-gray-200 text-gray-600'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('student');
              setErrors({});
            }}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
              mode === 'student'
                ? 'bg-white border-gray-300 font-semibold'
                : 'bg-transparent border-gray-200 text-gray-600'
            }`}
          >
            Aluno
          </button>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              name="identifier"
              type="email"
              value={formData.identifier}
              onChange={handleInputChange}
              error={errors.identifier}
              placeholder="Digite seu e-mail"
              required
            />

            <Input
              label="Senha"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              placeholder="Digite sua senha"
              required
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Entrar
            </Button>

            <div className="text-center">
              <Link className="text-sm text-gray-600 hover:text-gray-900" to="/recuperar-senha">
                Esqueci minha senha
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
