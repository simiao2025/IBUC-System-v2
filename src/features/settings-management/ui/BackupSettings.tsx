import React from 'react';
import { Database } from 'lucide-react';
import { Button } from '@/shared/ui';
import { Card } from '@/shared/ui';
import { Input } from '@/shared/ui';

interface BackupConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  retentionDays: number;
  lastBackup?: string;
}

interface BackupSettingsProps {
  config: BackupConfig;
  onUpdate: (newConfig: BackupConfig) => void;
  onPerformBackup: () => void;
}

export const BackupSettings: React.FC<BackupSettingsProps> = ({ config, onUpdate, onPerformBackup }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Backup e RestauraÃ§Ã£o</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">ConfiguraÃ§Ãµes de Backup</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                FrequÃªncia
              </label>
              <select
                value={config.frequency}
                onChange={(e) => onUpdate({
                  ...config,
                  frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="daily">DiÃ¡rio</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
            <Input
              label="Dias de RetenÃ§Ã£o"
              type="number"
              value={config.retentionDays}
              onChange={(e) => onUpdate({
                ...config,
                retentionDays: parseInt(e.target.value)
              })}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ãšltimo Backup</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                {config.lastBackup 
                  ? new Date(config.lastBackup).toLocaleString('pt-BR')
                  : 'Nenhum backup realizado'
                }
              </p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={onPerformBackup}>
                <Database className="h-4 w-4 mr-2" />
                Realizar Backup
              </Button>
              <Button variant="outline">
                <Database className="h-4 w-4 mr-2" />
                Restaurar Backup
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        {/* Helper text or additional actions can go here */}
      </div>
    </div>
  );
};
