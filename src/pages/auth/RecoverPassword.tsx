import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { UsuariosAPI } from '../../services/usuario.service';

const RecoverPassword: React.FC = () => {
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaNovaConfirmacao, setSenhaNovaConfirmacao] = useState('');

  const solicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!email) {
      setError('E-mail é obrigatório');
      return;
    }

    setLoading(true);
    try {
      await UsuariosAPI.solicitarCodigoRecuperacaoSenha({ email });
      setStep('confirm');
      setMessage('Código enviado para o e-mail informado');
    } catch (err: any) {
      setError(err?.message || 'Erro ao solicitar código');
    } finally {
      setLoading(false);
    }
  };

  const confirmarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!email || !codigo || !senhaNova || !senhaNovaConfirmacao) {
      setError('Preencha todos os campos');
      return;
    }
    if (senhaNova !== senhaNovaConfirmacao) {
      setError('As senhas não conferem');
      return;
    }

    setLoading(true);
    try {
      await UsuariosAPI.confirmarCodigoRecuperacaoSenha({ email, codigo, senhaNova });
      setMessage('Senha redefinida com sucesso');
    } catch (err: any) {
      setError(err?.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Recuperar senha</h1>

          {message && <p className="text-sm text-green-700 mb-3">{message}</p>}
          {error && <p className="text-sm text-red-700 mb-3">{error}</p>}

          {step === 'request' && (
            <form onSubmit={solicitarCodigo} className="space-y-4">
              <Input
                label="E-mail"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                required
              />
              <Button type="submit" loading={loading} className="w-full">
                Enviar código
              </Button>
            </form>
          )}

          {step === 'confirm' && (
            <form onSubmit={confirmarCodigo} className="space-y-4">
              <Input
                label="E-mail"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                required
              />
              <Input
                label="Código"
                name="codigo"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Digite o código"
                required
              />
              <Input
                label="Nova senha"
                name="senhaNova"
                type="password"
                value={senhaNova}
                onChange={(e) => setSenhaNova(e.target.value)}
                placeholder="Digite a nova senha"
                required
              />
              <Input
                label="Confirmar nova senha"
                name="senhaNovaConfirmacao"
                type="password"
                value={senhaNovaConfirmacao}
                onChange={(e) => setSenhaNovaConfirmacao(e.target.value)}
                placeholder="Confirme a nova senha"
                required
              />

              <div className="flex gap-2">
                <Button type="submit" loading={loading} className="flex-1">
                  Confirmar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setStep('request');
                    setCodigo('');
                    setSenhaNova('');
                    setSenhaNovaConfirmacao('');
                    setMessage(null);
                    setError(null);
                  }}
                >
                  Voltar
                </Button>
              </div>
            </form>
          )}

          <Link className="text-sm text-gray-700 hover:text-gray-900" to="/login">
            Voltar ao login
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default RecoverPassword;
