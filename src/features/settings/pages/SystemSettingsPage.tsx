import React, { useState } from 'react';
import {
  Users,
  Settings,
  Shield,
  Database,
  Award,
  Calendar
} from 'lucide-react';
import { useApp } from '@/app/providers/AppContext';
import { useAccessControl } from '@/features/auth/ui/AccessControl';
import { Button } from '@/shared/ui';
import { Card } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { PageHeader } from '@/shared/ui';

// New Components
import { UserManagement } from '@/features/user-management';
import { SecuritySettings } from '../ui/SecuritySettings';
import { DracmasSettings } from '../ui/DracmasSettings';
import { BackupSettings } from '../ui/BackupSettings';
import { EventsSettings } from '../ui/EventsSettings';
import { systemConfigApi } from '@/entities/system';

// Interface SystemConfig
interface SystemConfig {
  schoolYear: string;
  enrollmentPeriod: {
    start: string;
    end: string;
  };
  classSchedule: {
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    whatsappEnabled: boolean;
    autoReminders: boolean;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    twoFactorRequired: boolean;
  };
  backup: {
    frequency: 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
    lastBackup?: string;
  };
}

const SystemSettingsPage: React.FC = () => {
  const { currentUser, showFeedback } = useApp();
  const { canManageUsers, canAccessModule } = useAccessControl();
  const [activeTab, setActiveTab] = useState<'users' | 'config' | 'security' | 'backup' | 'dracmas' | 'events'>('users');

  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    schoolYear: '2024',
    enrollmentPeriod: {
      start: '2024-01-01',
      end: '2024-02-29'
    },
    classSchedule: {
      startTime: '08:00',
      endTime: '11:00',
      daysOfWeek: ['sunday']
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      whatsappEnabled: true,
      autoReminders: true
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 120,
      twoFactorRequired: false
    },
    backup: {
      frequency: 'daily',
      retentionDays: 30,
      lastBackup: '2024-01-15T02:00:00'
    }
  });

  // Carregar configuraÃ§Ãµes ao montar o componente
  React.useEffect(() => {
    const loadSettings = async () => {
      const data = await systemConfigApi.getSettingsAsObject();

      setSystemConfig(prev => ({
        ...prev,
        schoolYear: data.ano_letivo || prev.schoolYear,
        enrollmentPeriod: data.periodo_matricula || prev.enrollmentPeriod,
        classSchedule: data.horario_aulas || prev.classSchedule,
        notifications: data.notificacoes || prev.notifications,
        security: data.seguranca || prev.security,
        backup: data.backup || prev.backup
      }));
    };

    void loadSettings();
  }, []);

  const saveSystemConfig = async () => {
    console.log('[DEBUG] Iniciando salvamento das configuraÃ§Ãµes...', systemConfig);
    try {
      const payload = {
        ano_letivo: systemConfig.schoolYear,
        periodo_matricula: systemConfig.enrollmentPeriod,
        horario_aulas: systemConfig.classSchedule,
        notificacoes: systemConfig.notifications,
        seguranca: systemConfig.security,
        backup: systemConfig.backup
      };

      console.log('[DEBUG] Payload enviado:', payload);

      const results = await systemConfigApi.updateBatch(payload);
      console.log('[DEBUG] Resultados do salvamento:', results);

      showFeedback('success', 'Sucesso', 'ConfiguraÃ§Ãµes salvas com sucesso!');
    } catch (error: any) {
      console.error('[DEBUG] Erro ao salvar configuraÃ§Ãµes:', error);
      showFeedback('error', 'Erro', `Falha ao salvar configuraÃ§Ãµes: ${error.message || 'Erro deconhecido'}`);
    }
  };

  const performBackup = () => {
    // Simular backup
    setSystemConfig(prev => ({
      ...prev,
      backup: {
        ...prev.backup,
        lastBackup: new Date().toISOString()
      }
    }));
    showFeedback('success', 'Sucesso', 'Backup realizado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="ConfiguraÃ§Ãµes do Sistema"
        subtitle="UsuÃ¡rios, acessos e configuraÃ§Ãµes gerais"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs Navigation */}
        <Card className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px space-x-8">
              {[
                { id: 'users', label: 'UsuÃ¡rios', icon: Users, permission: canManageUsers() || canAccessModule('manage_users') },
                { id: 'config', label: 'ParÃ¢metros', icon: Settings, permission: canAccessModule('settings') },
                { id: 'events', label: 'Eventos', icon: Calendar, permission: canAccessModule('settings') },
                { id: 'dracmas', label: 'DrÃ¡cmas', icon: Award, permission: canAccessModule('dracmas_settings') },
                { id: 'security', label: 'SeguranÃ§a', icon: Shield, permission: canAccessModule('security') },
                { id: 'backup', label: 'Backup', icon: Database, permission: canAccessModule('backup') }
              ]
                .filter(tab => tab.permission)
                .map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </button>
                ))}
            </nav>
          </div>
        </Card>

        {/* Users Tab - Interface unificada e refatorada */}
        {activeTab === 'users' && <UserManagement />}

        {/* Events Tab */}
        {activeTab === 'events' && <EventsSettings />}

        {/* Dracmas Tab */}
        {activeTab === 'dracmas' && <DracmasSettings />}

        {/* Config Tab */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">ParÃ¢metros do Sistema</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ano Letivo</h3>
                <Input
                  label="Ano"
                  value={systemConfig.schoolYear}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, schoolYear: e.target.value }))}
                />
              </Card>

              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">PerÃ­odo de MatrÃ­cula</h3>
                <div className="space-y-4">
                  <Input
                    label="Data de InÃ­cio"
                    type="date"
                    value={systemConfig.enrollmentPeriod.start}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      enrollmentPeriod: { ...prev.enrollmentPeriod, start: e.target.value }
                    }))}
                  />
                  <Input
                    label="Data de TÃ©rmino"
                    type="date"
                    value={systemConfig.enrollmentPeriod.end}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      enrollmentPeriod: { ...prev.enrollmentPeriod, end: e.target.value }
                    }))}
                  />
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">HorÃ¡rio e Dias das Aulas</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="HorÃ¡rio de InÃ­cio"
                      type="time"
                      value={systemConfig.classSchedule.startTime}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        classSchedule: { ...prev.classSchedule, startTime: e.target.value }
                      }))}
                    />
                    <Input
                      label="HorÃ¡rio de TÃ©rmino"
                      type="time"
                      value={systemConfig.classSchedule.endTime}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        classSchedule: { ...prev.classSchedule, endTime: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dias das Aulas</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'monday', label: 'Segunda' },
                        { id: 'tuesday', label: 'TerÃ§a' },
                        { id: 'wednesday', label: 'Quarta' },
                        { id: 'thursday', label: 'Quinta' },
                        { id: 'friday', label: 'Sexta' },
                        { id: 'saturday', label: 'SÃ¡bado' },
                        { id: 'sunday', label: 'Domingo' }
                      ].map(day => (
                        <label key={day.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={systemConfig.classSchedule.daysOfWeek.includes(day.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSystemConfig(prev => {
                                const days = prev.classSchedule.daysOfWeek;
                                const newDays = checked
                                  ? [...days, day.id]
                                  : days.filter(d => d !== day.id);
                                return {
                                  ...prev,
                                  classSchedule: { ...prev.classSchedule, daysOfWeek: newDays }
                                };
                              });
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{day.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">NotificaÃ§Ãµes</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemConfig.notifications.emailEnabled}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, emailEnabled: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">NotificaÃ§Ãµes por Email</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemConfig.notifications.smsEnabled}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, smsEnabled: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">NotificaÃ§Ãµes por SMS</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemConfig.notifications.whatsappEnabled}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, whatsappEnabled: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">NotificaÃ§Ãµes por WhatsApp</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemConfig.notifications.autoReminders}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, autoReminders: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Lembretes AutomÃ¡ticos</span>
                  </label>
                </div>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={saveSystemConfig}>
                Salvar ConfiguraÃ§Ãµes
              </Button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <SecuritySettings
            config={systemConfig.security}
            onUpdate={(newConfig) => setSystemConfig(prev => ({ ...prev, security: newConfig }))}
            onSave={saveSystemConfig}
          />
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <BackupSettings
            config={systemConfig.backup}
            onUpdate={(newBackup) => setSystemConfig(prev => ({ ...prev, backup: newBackup }))}
            onPerformBackup={performBackup}
          />
        )}
      </div>

    </div>
  );
};

export default SystemSettingsPage;
