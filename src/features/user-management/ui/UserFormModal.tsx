import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Select } from '@/shared/ui';
import { AdminUser, AdminRole, AdminModuleKey } from '@/types';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { getRoleLabel } from '../utils/roleLabels';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<AdminUser> & { password?: string }) => Promise<void>;
  initialData?: AdminUser | null;
  roles: { value: string; label: string }[];
  polos: { id: string; name: string }[];
  directoratePeople: Array<{
    key: string;
    nome_completo: string;
    email?: string;
    cpf?: string;
    phone?: string;
    origem: 'geral' | 'polo';
    cargo?: string;
  }>;
  onLoadDirectoratePeople: () => void;
  directoratePeopleLoading: boolean;
  isRestrictedUser: boolean;
  allowedRoles: string[];
  roleRequiresPolo: (role: string) => boolean;
  canConfigurePermissions: (role: string) => boolean;
  isPoloAdmin?: boolean;
  currentPoloId?: string;
}

const moduleOptions: { key: AdminModuleKey; label: string }[] = [
  { key: 'directorate', label: 'Diretoria Geral' },
  { key: 'polos', label: 'Gerenciar Polos' },
  { key: 'staff', label: 'Equipe do Polo' },
  { key: 'students', label: 'Gerenciar Alunos' },
  { key: 'enrollments', label: 'Gerenciar Turmas' },
  { key: 'attendance', label: 'Frequência' },
  { key: 'dracmas', label: 'Financeiro' },
  { key: 'reports', label: 'Relatórios' },
  { key: 'pre-enrollments', label: 'Gerenciamento de Pré-matrículas' },
  { key: 'settings', label: 'Parâmetros (Geral)' },
  { key: 'manage_users', label: 'Gerenciar Usuários (Configurações)' },
];

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  roles,
  polos,
  directoratePeople,
  onLoadDirectoratePeople,
  directoratePeopleLoading,
  isRestrictedUser,
  allowedRoles,
  roleRequiresPolo,
  canConfigurePermissions,
  isPoloAdmin = false,
  currentPoloId,
}) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState<Partial<AdminUser> & { password?: string }>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    password: '',
    role: allowedRoles[0] || 'professor',
    poloId: isPoloAdmin ? currentPoloId : '',
    permissions: { mode: 'full', modules: [] },
    isActive: true,
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          password: '', // Senha vazia na edição por padrão
        });
        setSelectedTemplateId('');
      } else {
        setFormData({
          name: '',
          email: '',
          cpf: '',
          phone: '',
          password: '',
          role: allowedRoles[0] || 'professor',
          poloId: isPoloAdmin ? currentPoloId : '',
          permissions: { mode: 'full', modules: [] },
          isActive: true,
        });
        setSelectedTemplateId('');
        onLoadDirectoratePeople();
      }
    }
  }, [isOpen, initialData, allowedRoles, isPoloAdmin, currentPoloId, onLoadDirectoratePeople]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const found = directoratePeople.find((p) => p.key === templateId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        name: found.nome_completo || prev.name,
        email: found.email || prev.email,
        cpf: found.cpf || prev.cpf,
        phone: found.phone || prev.phone,
        // Se a pessoa do diretório tem um cargo mapeado, tenta aplicar
        role: (found.cargo as any) || prev.role
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      alert('Nome e Email são obrigatórios.');
      return;
    }

    if (!isEditing && !formData.password) {
      alert('A senha é obrigatória para novos usuários.');
      return;
    }

    if (isPoloAdmin && !formData.poloId && currentPoloId) {
       formData.poloId = currentPoloId;
    }

    if (!isPoloAdmin && roleRequiresPolo(formData.role as string) && !formData.poloId) {
      alert('Selecione um Polo para esta função.');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const effectiveAllowedRoles = useMemo(() => {
    const list = [...allowedRoles];
    // Se estiver editando, garante que o cargo ATUAL do usuário está na lista,
    // mesmo que o editor não tenha permissão de "criar" novos usuários com esse cargo.
    if (initialData?.role && !list.includes(initialData.role)) {
      list.unshift(initialData.role);
    }
    return Array.from(new Set(list)) as string[];
  }, [allowedRoles, initialData?.role]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Usuário' : 'Novo Usuário Administrativo'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {!isEditing && !isRestrictedUser && (
            <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100 mb-2">
              <label className="block text-sm font-bold text-blue-800 mb-1">
                Importar dados de membro existente (Opcional)
              </label>
              <Select
                value={selectedTemplateId}
                onChange={handleTemplateChange}
                className="bg-white"
              >
                <option value="">-- Selecione para preencher --</option>
                {directoratePeopleLoading ? (
                  <option disabled>Carregando...</option>
                ) : (
                  directoratePeople
                    .slice()
                    .sort((a, b) => (a.nome_completo || '').localeCompare(b.nome_completo || ''))
                    .map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.nome_completo} ({p.origem === 'geral' ? 'Geral' : 'Polo'})
                      </option>
                    ))
                )}
              </Select>
            </div>
          )}

          <Input
            label="Nome Completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isRestrictedUser}
            required
          />

          <div className="flex flex-col space-y-1">
            <Input
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isRestrictedUser && isEditing}
              required
            />
            {formData.role === 'aluno' && (
              <p className="text-[10px] text-blue-600 font-medium px-1">
                * Alunos usam o CPF para login. Este email é usado para notificações.
              </p>
            )}
          </div>

          <Input
            label="CPF"
            value={formData.cpf || ''}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            disabled={isRestrictedUser && isEditing}
          />

          <Input
            label="Telefone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={isRestrictedUser && isEditing}
          />

          <div className="md:col-span-2">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Input
                  label={isEditing ? "Alterar Senha (Opcional)" : "Senha (Obrigatório)"}
                  type={showPassword ? "text" : "password"}
                  maxLength={20}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={!isEditing && !formData.password ? "Digite uma senha..." : ""}
                  required={!isEditing}
                />
                <button
                  type="button"
                  className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  className="mb-1"
                  onClick={() => setFormData({ ...formData, password: 'senha123' })}
                  title="Usar senha padrão: senha123"
                >
                  Gerar Padrão
                </Button>
              )}
            </div>
            {!isEditing && <p className="text-xs text-gray-500 mt-1">Dica: Use "senha123" como padrão inicial.</p>}
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {isRestrictedUser ? (
              <Input
                label="Função"
                value={getRoleLabel(formData.role as string)}
                disabled={true}
                onChange={() => { }}
              />
            ) : (
              <Select
                label="Função"
                value={formData.role}
                onChange={(val) => setFormData({ ...formData, role: val as AdminRole })}
              >
                {effectiveAllowedRoles.map((role) => (
                  <option key={role} value={role}>
                    {getRoleLabel(role)}
                  </option>
                ))}
              </Select>
            )}

            {!isPoloAdmin && roleRequiresPolo(formData.role as string) && (
              <Select
                label="Polo"
                value={formData.poloId || ''}
                onChange={(val) => setFormData({ ...formData, poloId: val })}
                disabled={isRestrictedUser && isEditing}
                required
              >
                <option value="">Selecione um polo</option>
                {polos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            )}
          </div>
        </div>

        {/* Permissions */}
        {!isRestrictedUser && canConfigurePermissions(formData.role as string) && (
          <div className="border-t pt-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Permissões Específicas</h3>
            <div className="flex space-x-6 mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  className="text-blue-600"
                  checked={formData.permissions?.mode === 'full'}
                  onChange={() =>
                    setFormData({ ...formData, permissions: { mode: 'full', modules: [] } })
                  }
                />
                <span className="text-sm">Acesso Total</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  className="text-blue-600"
                  checked={formData.permissions?.mode === 'limited'}
                  onChange={() =>
                    setFormData({ ...formData, permissions: { mode: 'limited', modules: [] } })
                  }
                />
                <span className="text-sm">Acesso Limitado</span>
              </label>
            </div>
            {formData.permissions?.mode === 'limited' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50 p-4 rounded-lg">
                {moduleOptions.map((mod) => (
                  <label key={mod.key} className="flex items-center space-x-2 text-xs">
                    <input
                      type="checkbox"
                      checked={formData.permissions?.modules.includes(mod.key)}
                      onChange={(e) => {
                        const currentPerms = formData.permissions || {
                          mode: 'limited',
                          modules: [],
                        };
                        const newModules = e.target.checked
                          ? [...currentPerms.modules, mod.key]
                          : currentPerms.modules.filter((m) => m !== mod.key);
                        setFormData({
                          ...formData,
                          permissions: { ...currentPerms, modules: newModules },
                        });
                      }}
                    />
                    <span>{mod.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-4">
          <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </Card>
    </div>
  );
};
