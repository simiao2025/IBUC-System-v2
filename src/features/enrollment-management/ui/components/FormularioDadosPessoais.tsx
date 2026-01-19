import React from 'react';
import { Input } from '@/shared/ui';
import { Select } from '@/shared/ui';
import { Card } from '@/shared/ui';
import { User } from 'lucide-react';
import type { PreMatriculaFormData } from '../hooks/usePreMatricula';

interface FormularioDadosPessoaisProps {
    formData: PreMatriculaFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    errors: Record<string, string>;
    setFormData: React.Dispatch<React.SetStateAction<PreMatriculaFormData>>;
}

export const FormularioDadosPessoais: React.FC<FormularioDadosPessoaisProps> = ({
    formData,
    handleChange,
    errors,
    setFormData
}) => {
    const sexoOptions = [
        { value: 'M', label: 'Masculino' },
        { value: 'F', label: 'Feminino' },
    ];

    return (
        <Card>
            <div className="flex items-center space-x-2 mb-6 border-b pb-4">
                <User className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900 uppercase">Dados do Aluno</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <Input
                        label="Nome Completo *"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        error={errors.nome}
                        placeholder="Nome completo do aluno"
                        required
                    />
                </div>

                <Input
                    label="Data de Nascimento *"
                    name="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={handleChange}
                    error={errors.data_nascimento}
                    required
                />

                <Select
                    label="Sexo *"
                    name="sexo"
                    value={formData.sexo}
                    onChange={(val) => setFormData(prev => ({ ...prev, sexo: val as 'M' | 'F' }))}
                    options={sexoOptions}
                    error={errors.sexo}
                    required
                />

                <Input
                    label="CPF *"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    error={errors.cpf}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                />

                <Input
                    label="RG"
                    name="rg"
                    value={formData.rg}
                    onChange={handleChange}
                />

                <Input
                    label="Naturalidade"
                    name="naturalidade"
                    value={formData.naturalidade}
                    onChange={handleChange}
                    placeholder="Ex: Palmas/TO"
                />

                <Input
                    label="Nacionalidade"
                    name="nacionalidade"
                    value={formData.nacionalidade}
                    onChange={handleChange}
                />
            </div>
        </Card>
    );
};
