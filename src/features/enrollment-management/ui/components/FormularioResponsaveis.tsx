import React from 'react';
import { Input } from '@/shared/ui';
import { Select } from '@/shared/ui';
import { Card } from '@/shared/ui';
import { Users } from 'lucide-react';
import type { PreMatriculaFormData } from '../../model/hooks/usePreMatricula';

interface FormularioResponsaveisProps {
    formData: PreMatriculaFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    errors: Record<string, string>;
    setFormData: React.Dispatch<React.SetStateAction<PreMatriculaFormData>>;
}

export const FormularioResponsaveis: React.FC<FormularioResponsaveisProps> = ({
    formData,
    handleChange,
    errors,
    setFormData
}) => {
    const parentescoOptions = [
        { value: 'pai', label: 'Pai' },
        { value: 'mae', label: 'Mãe' },
        { value: 'tutor', label: 'Tutor' },
        { value: 'outro', label: 'Outro' },
    ];

    return (
        <Card>
            <div className="flex items-center space-x-2 mb-6 border-b pb-4">
                <Users className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900 uppercase">Dados dos Responsáveis</h2>
            </div>

            <div className="space-y-8">
                {/* Responsável Principal */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center mr-2 text-sm">1</span>
                        Responsável Principal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Input
                                label="Nome Completo *"
                                name="nome_responsavel"
                                value={formData.nome_responsavel}
                                onChange={handleChange}
                                error={errors.nome_responsavel}
                                required
                            />
                        </div>
                        <Select
                            label="Parentesco *"
                            name="tipo_parentesco"
                            value={formData.tipo_parentesco}
                            onChange={(val) => setFormData(prev => ({ ...prev, tipo_parentesco: val as any }))}
                            options={parentescoOptions}
                            required
                        />
                        <Input
                            label="CPF *"
                            name="cpf_responsavel"
                            value={formData.cpf_responsavel}
                            onChange={handleChange}
                            error={errors.cpf_responsavel}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            required
                        />
                        <Input
                            label="Telefone/WhatsApp *"
                            name="telefone_responsavel"
                            value={formData.telefone_responsavel}
                            onChange={handleChange}
                            error={errors.telefone_responsavel}
                            placeholder="(00) 00000-0000"
                            required
                        />
                        <Input
                            label="E-mail *"
                            name="email_responsavel"
                            type="email"
                            value={formData.email_responsavel}
                            onChange={handleChange}
                            error={errors.email_responsavel}
                            placeholder="email@exemplo.com"
                            required
                        />
                    </div>
                </div>

                {/* Segundo Responsável */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center mr-2 text-sm">2</span>
                        Segundo Responsável (Opcional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Input
                                label="Nome Completo"
                                name="nome_responsavel_2"
                                value={formData.nome_responsavel_2}
                                onChange={handleChange}
                            />
                        </div>
                        <Input
                            label="Parentesco"
                            name="tipo_parentesco_2"
                            value={formData.tipo_parentesco_2}
                            onChange={handleChange}
                            placeholder="Ex: Pai, Mãe, Avô"
                        />
                        <Input
                            label="CPF"
                            name="cpf_responsavel_2"
                            value={formData.cpf_responsavel_2}
                            onChange={handleChange}
                            placeholder="000.000.000-00"
                            maxLength={14}
                        />
                        <Input
                            label="Telefone"
                            name="telefone_responsavel_2"
                            value={formData.telefone_responsavel_2}
                            onChange={handleChange}
                            placeholder="(00) 00000-0000"
                        />
                        <Input
                            label="E-mail"
                            name="email_responsavel_2"
                            type="email"
                            value={formData.email_responsavel_2}
                            onChange={handleChange}
                            placeholder="email@exemplo.com"
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
};
