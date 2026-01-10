import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePreMatricula } from '../../features/enrollments/hooks/usePreMatricula';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Check, Save } from 'lucide-react';

// Subcomponents
import { FormularioDadosPessoais } from '../../features/enrollments/components/FormularioDadosPessoais';
import { FormularioEndereco } from '../../features/enrollments/components/FormularioEndereco';
import { FormularioSaude } from '../../features/enrollments/components/FormularioSaude';
import { FormularioResponsaveis } from '../../features/enrollments/components/FormularioResponsaveis';

import Select from '../../components/ui/Select';
import PhotoUpload from '../../components/ui/PhotoUpload';
import DocumentUpload from '../../components/ui/DocumentUpload';


interface NovaMatriculaPageProps {
    isAdminView?: boolean;
}

const NovaMatriculaPage: React.FC<NovaMatriculaPageProps> = ({ isAdminView }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        formData,
        loading,
        polos,
        turmas,
        errors,
        submitted,
        handleInputChange,
        handleHealthChange,
        handleSubmit,
        buscarCEP,
        setFormData,
        resetForm
    } = usePreMatricula(isAdminView);

    // Efeito para resetar o formulário automaticamente se for Admin (Matrícula Sequencial)
    React.useEffect(() => {
        if (submitted && isAdminView) {
            // O hook já exibe o toast de sucesso.
            // Aqui apenas limpamos o formulário para permitir nova matrícula imediata.
            resetForm();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [submitted, isAdminView, resetForm]);

    if (submitted && !isAdminView) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-2xl mx-auto px-4">
                    <Card className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Pré-matrícula Realizada!
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Sua pré-matrícula foi enviada e está em análise. Em breve entraremos em contato.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button onClick={() => navigate('/')} className="w-full sm:w-auto">
                                Voltar ao Início
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Logic for cancel button navigation
    const handleCancel = () => {
        if (isAdminView) {
            navigate(location.state?.from || '/admin/alunos');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {isAdminView ? 'Nova Matrícula' : 'Pré-Matrícula Online'}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {isAdminView
                            ? 'Área da Secretaria: Cadastro direto de aluno.'
                            : 'Bem-vindo ao portal de pré-matrícula.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Sessão 1: Dados Pessoais */}
                    <FormularioDadosPessoais
                        formData={formData}
                        handleChange={handleInputChange}
                        errors={errors}
                        setFormData={setFormData}
                    />

                    {/* Sessão 2: Endereço */}
                    <FormularioEndereco
                        formData={formData}
                        handleChange={handleInputChange}
                        handleBlurCep={buscarCEP}
                        errors={errors}
                        setFormData={setFormData}
                    />

                    {/* Sessão 3: Saúde */}
                    <FormularioSaude
                        formData={formData}
                        handleHealthChange={handleHealthChange}
                        errors={errors}
                    />

                    {/* Sessão 4: Responsáveis */}
                    <FormularioResponsaveis
                        formData={formData}
                        handleChange={handleInputChange}
                        errors={errors}
                        setFormData={setFormData}
                    />

                    {/* Sessão 5: Institucional (Polos/Turmas) */}
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 uppercase mb-4">Informações Institucionais</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Polo Selection */}
                            {!isAdminView || polos.length > 1 ? (
                                <Select
                                    label="Polo de Estudo *"
                                    name="polo_id"
                                    value={formData.polo_id}
                                    onChange={(val) => setFormData(prev => ({ ...prev, polo_id: val, turma_id: '' }))}
                                    options={polos.map(p => ({ value: p.id, label: p.nome }))}
                                    error={errors.polo_id}
                                    required
                                />
                            ) : (
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Polo de Estudo</label>
                                    <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-medium">
                                        {polos[0]?.nome || 'Polo Selecionado'}
                                    </div>
                                    <p className="text-xs text-gray-500">Cadastro restrito ao seu polo.</p>
                                </div>
                            )}

                            {/* Turma Selection */}
                            {isAdminView && (
                                <Select
                                    label="Turma (Obrigatório para Matrícula Direta) *"
                                    name="turma_id"
                                    value={formData.turma_id}
                                    onChange={(val) => setFormData(prev => ({ ...prev, turma_id: val }))}
                                    options={turmas.map((t: any) => {
                                        const vagasText = t.vagas_disponiveis !== undefined
                                            ? t.vagas_disponiveis > 0
                                                ? ` (${t.vagas_disponiveis} ${t.vagas_disponiveis === 1 ? 'vaga disponível' : 'vagas disponíveis'})`
                                                : ' (LOTADA)'
                                            : '';
                                        return {
                                            value: t.id,
                                            label: `${t.nome}${vagasText}`,
                                            disabled: t.vagas_disponiveis === 0
                                        };
                                    })}
                                    error={errors.turma_id}
                                    disabled={!formData.data_nascimento || !formData.polo_id}
                                    required
                                    helperText={
                                        !formData.data_nascimento
                                            ? "Informe a Data de Nascimento para ver turmas compatíveis."
                                            : turmas.length === 0
                                                ? "Nenhuma turma disponível para esta idade neste polo."
                                                : "Turmas filtradas automaticamente pela idade."
                                    }
                                />
                            )}</div>
                    </Card>

                    {/* Sessão: Documentos */}
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 uppercase mb-6">Documentos do Aluno</h2>

                        <div className="space-y-6">
                            {/* Foto 3x4 */}
                            <PhotoUpload
                                value={formData.foto}
                                onChange={(file) => setFormData(prev => ({ ...prev, foto: file }))}
                                error={errors.foto}
                            />

                            <div className="border-t pt-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">Documentos Complementares</h3>
                                <p className="text-xs text-gray-500 mb-4">
                                    {isAdminView
                                        ? 'Você pode enviar os documentos agora ou posteriormente através da ficha do aluno.'
                                        : 'Envie os documentos agora para agilizar o processo de matrícula.'}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DocumentUpload
                                        label="RG"
                                        tipo="rg"
                                        value={formData.doc_rg}
                                        onChange={(file) => setFormData(prev => ({ ...prev, doc_rg: file }))}
                                    />

                                    <DocumentUpload
                                        label="CPF"
                                        tipo="cpf"
                                        value={formData.doc_cpf}
                                        onChange={(file) => setFormData(prev => ({ ...prev, doc_cpf: file }))}
                                    />

                                    <DocumentUpload
                                        label="Certidão de Nascimento"
                                        tipo="certidao_nascimento"
                                        value={formData.doc_certidao}
                                        onChange={(file) => setFormData(prev => ({ ...prev, doc_certidao: file }))}
                                    />

                                    <DocumentUpload
                                        label="Comprovante de Residência"
                                        tipo="comprovante_residencia"
                                        value={formData.doc_comprovante}
                                        onChange={(file) => setFormData(prev => ({ ...prev, doc_comprovante: file }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Sessão 6: Termos */}
                    <Card>
                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                id="aceite_termo"
                                name="aceite_termo"
                                checked={formData.aceite_termo}
                                onChange={(e) => setFormData(prev => ({ ...prev, aceite_termo: e.target.checked }))}
                                className="mt-1 mr-3 h-4 w-4 text-red-600 rounded"
                            />
                            <label htmlFor="aceite_termo" className="text-sm text-gray-700">
                                Li e aceito os termos de responsabilidade e autorizo o cadastro. *
                            </label>
                        </div>
                    </Card>

                    <div className="flex justify-center pt-8">
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                disabled={loading}
                                className="min-w-[250px] py-4 text-xl"
                                onClick={handleCancel}
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                size="lg"
                                loading={loading}
                                disabled={!formData.aceite_termo}
                                className="min-w-[250px] bg-red-600 hover:bg-red-700 text-white py-4 text-xl shadow-lg"
                            >
                                <Save className="h-5 w-5 mr-2" />
                                {isAdminView ? 'Salvar Cadastro' : 'Enviar Pré-matrícula'}
                            </Button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default NovaMatriculaPage;
