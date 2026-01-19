import React from 'react';
import { Shield } from 'lucide-react';
import { Card } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { Button } from '@/shared/ui';

interface SecurityConfig {
  passwordMinLength: number;
  sessionTimeout: number;
  twoFactorRequired: boolean;
}

interface SecuritySettingsProps {
  config: SecurityConfig;
  onUpdate: (newConfig: SecurityConfig) => void;
  onSave: () => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ config, onUpdate, onSave }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">ConfiguraÃ§Ãµes de SeguranÃ§a</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">PolÃ­tica de Senhas</h3>
          <div className="space-y-4">
            <Input
              label="Comprimento MÃ­nimo"
              type="number"
              value={config.passwordMinLength}
              onChange={(e) => onUpdate({
                ...config,
                passwordMinLength: parseInt(e.target.value)
              })}
            />
            <Input
              label="Timeout de SessÃ£o (minutos)"
              type="number"
              value={config.sessionTimeout}
              onChange={(e) => onUpdate({
                ...config,
                sessionTimeout: parseInt(e.target.value)
              })}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">AutenticaÃ§Ã£o</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.twoFactorRequired}
                onChange={(e) => onUpdate({
                  ...config,
                  twoFactorRequired: e.target.checked
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Exigir AutenticaÃ§Ã£o em Dois Fatores (2FA)</span>
            </label>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    A autenticaÃ§Ã£o em dois fatores aumenta significativamente a seguranÃ§a do sistema.
                    Certifique-se de que todos os usuÃ¡rios tenham e-mail ou telefone cadastrados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave}>
          Salvar ConfiguraÃ§Ãµes
        </Button>
      </div>
    </div>
  );
};
