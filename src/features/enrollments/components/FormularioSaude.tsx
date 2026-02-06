import React from 'react';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import { Shield } from 'lucide-react';
import type { PreMatriculaFormData } from '../hooks/usePreMatricula';

interface FormularioSaudeProps {
    formData: PreMatriculaFormData;
    handleHealthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errors: Record<string, string>;
}

export const FormularioSaude: React.FC<FormularioSaudeProps> = ({
    formData,
    handleHealthChange,
    errors
}) => {
    return (
        <Card>
            <div className="flex items-center space-x-2 mb-6 border-b pb-4">
                <Shield className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900 uppercase">Saúde e Segurança</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <Input
                        label="Alergias *"
                        name="alergias"
                        value={formData.saude.alergias}
                        onChange={handleHealthChange}
                        error={errors.alergias}
                        placeholder="Liste as alergias ou escreva 'Nenhuma'"
                        required
                    />
                </div>

                <Input
                    label="Restrição Alimentar"
                    name="restricao_alimentar"
                    value={formData.saude.restricao_alimentar}
                    onChange={handleHealthChange}
                    placeholder="Ex: Lactose, Glúten"
                />

                <Input
                    label="Medicação Contínua *"
                    name="medicacao_continua"
                    value={formData.saude.medicacao_continua}
                    onChange={handleHealthChange}
                    error={errors.medicacao_continua}
                    placeholder="Ex: Escreva 'Nenhuma' se não houver"
                    required
                />

                <Input
                    label="Doenças Crônicas"
                    name="doencas_cronicas"
                    value={formData.saude.doencas_cronicas}
                    onChange={handleHealthChange}
                    placeholder="Ex: Asma, Diabetes"
                />

                <Input
                    label="Contato de Emergência (Nome) *"
                    name="contato_emergencia_nome"
                    value={formData.saude.contato_emergencia_nome}
                    onChange={handleHealthChange}
                    error={errors.contato_emergencia_nome}
                    required
                />

                <Input
                    label="Contato de Emergência (Telefone) *"
                    name="contato_emergencia_telefone"
                    value={formData.saude.contato_emergencia_telefone}
                    onChange={handleHealthChange}
                    error={errors.contato_emergencia_telefone}
                    placeholder="(00) 00000-0000"
                    required
                />

                <Input
                    label="Convênio Médico"
                    name="convenio_medico"
                    value={formData.saude.convenio_medico}
                    onChange={handleHealthChange}
                />

                <Input
                    label="Hospital de Preferência"
                    name="hospital_preferencia"
                    value={formData.saude.hospital_preferencia}
                    onChange={handleHealthChange}
                />

                <div className="md:col-span-2 flex items-start mt-2">
                    <input
                        type="checkbox"
                        id="autorizacao_medica"
                        name="autorizacao_medica"
                        checked={formData.saude.autorizacao_medica}
                        onChange={handleHealthChange}
                        className="mt-1 mr-3 h-4 w-4 text-red-600 rounded"
                    />
                    <label htmlFor="autorizacao_medica" className="text-sm text-gray-700">
                        Autorizo o IBUC a prestar primeiros socorros e encaminhar ao hospital em caso de emergência médica.
                    </label>
                </div>

            </div>
        </Card>
    );
};
