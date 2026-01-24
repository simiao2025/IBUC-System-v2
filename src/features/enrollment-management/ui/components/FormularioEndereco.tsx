import React from 'react';
import { Input } from '@/shared/ui';
import { Select } from '@/shared/ui';
import { Card } from '@/shared/ui';
import { MapPin } from 'lucide-react';
import type { PreMatriculaFormData } from '../../model/hooks/usePreMatricula';

interface FormularioEnderecoProps {
    formData: PreMatriculaFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleBlurCep: (cep: string) => void;
    errors: Record<string, string>;
    setFormData: React.Dispatch<React.SetStateAction<PreMatriculaFormData>>;
}

export const FormularioEndereco: React.FC<FormularioEnderecoProps> = ({
    formData,
    handleChange,
    handleBlurCep,
    errors,
    setFormData
}) => {
    const estados = [
        { value: 'TO', label: 'Tocantins' },
        { value: 'SP', label: 'São Paulo' },
        { value: 'RJ', label: 'Rio de Janeiro' },
        // ... Adicionar outros estados se necessário, ou usar um hook de estados
    ];

    return (
        <Card>
            <div className="flex items-center space-x-2 mb-6 border-b pb-4">
                <MapPin className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900 uppercase">Endereço</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input
                    label="CEP *"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    onBlur={(e) => handleBlurCep(e.target.value)}
                    error={errors.cep}
                    placeholder="00000-000"
                    maxLength={9}
                    required
                />

                <div className="md:col-span-2">
                    <Input
                        label="Rua *"
                        name="rua"
                        value={formData.rua}
                        onChange={handleChange}
                        error={errors.rua}
                        required
                    />
                </div>

                <Input
                    label="Número *"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    error={errors.numero}
                    required
                />

                <Input
                    label="Complemento"
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleChange}
                />

                <Input
                    label="Bairro *"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    error={errors.bairro}
                    required
                />

                <Input
                    label="Cidade *"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    error={errors.cidade}
                    required
                />

                <Select
                    label="Estado *"
                    name="estado"
                    value={formData.estado}
                    onChange={(val) => setFormData(prev => ({ ...prev, estado: val }))}
                    options={estados}
                    error={errors.estado}
                    required
                />
            </div>
        </Card>
    );
};
