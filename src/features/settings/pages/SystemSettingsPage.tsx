import React, { useState } from 'react';
import {
  Users,
  Settings,
  Shield,
  Database,
  Award,
  Megaphone
} from 'lucide-react';
import { useApp } from '@/app/providers/AppContext';
import { useAccessControl } from '@/features/auth/ui/AccessControl';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import Input from '@/shared/ui/Input';
import PageHeader from '@/shared/ui/PageHeader';

// New Components
import UserManagement from '../../../features/users/UserManagement';
import { SecuritySettings } from '../../../components/settings/SecuritySettings';
import { DracmasSettings } from '../../../components/settings/DracmasSettings';
import { BackupSettings } from '../../../components/settings/BackupSettings';
import { EventsSettings } from '../../../components/settings/EventsSettings';
import { ConfiguracoesService } from '../../../services/configuracoes.service';

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
  const { showFeedback } = useApp();
  const { canManageUsers, canAccessModule } = useAccessControl();

  // Define as abas disponíveis baseadas em permissões
  const availableTabs = [
    { id: 'users', permission: canManageUsers() || canAccessModule('manage_users') },
    { id: 'config', permission: canAccessModule('settings') },
    { id: 'events', permission: canAccessModule('settings_events') },
    { id: 'dracmas', permission: canAccessModule('dracmas_settings') },
    { id: 'security', permission: canAccessModule('security') },
    { id: 'backup', permission: canAccessModule('backup') }
  ].filter(tab => tab.permission);

  // Inicializa com a primeira aba disponível, ou fallback para 'users'
  const [activeTab, setActiveTab] = useState<'users' | 'config' | 'security' | 'backup' | 'dracmas' | 'events'>(
    (availableTabs[0]?.id as any) || 'users'
  );

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

  // Carregar configurações ao montar o componente
  React.useEffect(() => {
    const loadSettings = async () => {
      const data = await ConfiguracoesService.buscarTodasComoObjeto();

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
    console.log('[DEBUG] Iniciando salvamento das configurações...', systemConfig);
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

      const results = await ConfiguracoesService.salvarLote(payload);
      console.log('[DEBUG] Resultados do salvamento:', results);

      showFeedback('success', 'Sucesso', 'Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('[DEBUG] Erro ao salvar configurações:', error);
      showFeedback('error', 'Erro', `Falha ao salvar configurações: ${error.message || 'Erro deconhecido'}`);
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
        title="Configurações do Sistema"
        subtitle="Usuários, acessos e configurações gerais"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs Navigation */}
        <Card className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px space-x-8 overflow-x-auto scrollbar-hide">
              {(() => {
                return [
                  { id: 'users', label: 'Usuários', icon: Users, permission: canManageUsers() || canAccessModule('manage_users') },
                  { id: 'config', label: 'Parâmetros', icon: Settings, permission: canAccessModule('settings') },
                  { id: 'events', label: 'Divulgações', icon: Megaphone, permission: canAccessModule('settings_events') },
                  { id: 'dracmas', label: 'Drácmas', icon: Award, permission: canAccessModule('dracmas_settings') },
                  { id: 'security', label: 'Segurança', icon: Shield, permission: canAccessModule('security') },
                  { id: 'backup', label: 'Backup', icon: Database, permission: canAccessModule('backup') }
                ]
                  .filter(tab => tab.permission)
                  .map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${activeTab === id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      <Icon className="h-4 w-4 mr-2 shrink-0" />
                      {label}
                    </button>
                  ));
              })()}
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
            <h2 className="text-xl font-semibold text-gray-900">Parâmetros do Sistema</h2>

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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Período de Matrícula</h3>
                <div className="space-y-4">
                  <Input
                    label="Data de Início"
                    type="date"
                    value={systemConfig.enrollmentPeriod.start}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      enrollmentPeriod: { ...prev.enrollmentPeriod, start: e.target.value }
                    }))}
                  />
                  <Input
                    label="Data de Término"
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Horário e Dias das Aulas</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Horário de Início"
                      type="time"
                      value={systemConfig.classSchedule.startTime}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        classSchedule: { ...prev.classSchedule, startTime: e.target.value }
                      }))}
                    />
                    <Input
                      label="Horário de Término"
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
                        { id: 'tuesday', label: 'Terça' },
                        { id: 'wednesday', label: 'Quarta' },
                        { id: 'thursday', label: 'Quinta' },
                        { id: 'friday', label: 'Sexta' },
                        { id: 'saturday', label: 'Sábado' },
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notificações</h3>
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
                    <span className="text-sm font-medium text-gray-700">Notificações por Email</span>
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
                    <span className="text-sm font-medium text-gray-700">Notificações por SMS</span>
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
                    <span className="text-sm font-medium text-gray-700">Notificações por WhatsApp</span>
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
                    <span className="text-sm font-medium text-gray-700">Lembretes Automáticos</span>
                  </label>
                </div>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={saveSystemConfig}>
                Salvar Configurações
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
