import { useState, useEffect, useCallback } from 'react';
import { studentApi } from '@/entities/student';
import { enrollmentApi } from '@/entities/enrollment';
import { toast } from 'sonner';
import { useAuth } from '@/entities/user';
import { usePolos } from '@/entities/polo';
import { poloApi as PoloService } from '@/entities/polo';
import { turmaApi as TurmaService } from '@/entities/turma';
// import { NiveisModulosService } from '../../../services/modulos.service';
import type { AlunoCreateDto } from '@/entities/student';

/**
 * Interface que define o formato dos dados do formulário de pré-matrícula
 */
export interface PreMatriculaFormData {
    // Aluno
    nome: string;
    data_nascimento: string;
    sexo: 'M' | 'F';
    cpf: string;
    rg: string;
    rg_orgao: string;
    rg_data_expedicao: string;
    naturalidade: string;
    nacionalidade: string;

    // Endereço
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;

    // Saúde (Aplanado)
    alergias: string;
    restricao_alimentar: string;
    medicacao_continua: string;
    doencas_cronicas: string;
    contato_emergencia_nome: string;
    contato_emergencia_telefone: string;
    convenio_medico: string;
    hospital_preferencia: string;
    autorizacao_medica: boolean;

    // Responsável
    nome_responsavel: string;
    tipo_parentesco: 'pai' | 'mae' | 'tutor' | 'outro';
    cpf_responsavel: string;
    telefone_responsavel: string;
    email_responsavel: string;

    // Responsável 2 (Opcional)
    nome_responsavel_2: string;
    tipo_parentesco_2: string;
    cpf_responsavel_2: string;
    telefone_responsavel_2: string;
    email_responsavel_2: string;

    // Matrícula
    polo_id: string;
    turma_id: string;
    nivel_id?: string;
    modulo_id?: string;
    observacoes?: string;

    // Controle
    aceite_termo: boolean;

    // Documentos (Files)
    foto?: File | null;
    doc_rg?: File | null;
    doc_cpf?: File | null;
    doc_certidao?: File | null;
    doc_comprovante?: File | null;
}

const INITIAL_FORM_DATA: PreMatriculaFormData = {
    nome: '',
    data_nascimento: '',
    sexo: 'M',
    cpf: '',
    rg: '',
    rg_orgao: '',
    rg_data_expedicao: '',
    naturalidade: '',
    nacionalidade: 'Brasileira',

    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',

    alergias: '',
    restricao_alimentar: '',
    medicacao_continua: '',
    doencas_cronicas: '',
    contato_emergencia_nome: '',
    contato_emergencia_telefone: '',
    convenio_medico: '',
    hospital_preferencia: '',
    autorizacao_medica: false,

    nome_responsavel: '',
    tipo_parentesco: 'pai',
    cpf_responsavel: '',
    telefone_responsavel: '',
    email_responsavel: '',

    nome_responsavel_2: '',
    tipo_parentesco_2: '',
    cpf_responsavel_2: '',
    telefone_responsavel_2: '',
    email_responsavel_2: '',

    polo_id: '',
    turma_id: '',

    aceite_termo: false,

    // Documentos inicialmente vazios
    foto: null,
    doc_rg: null,
    doc_cpf: null,
    doc_certidao: null,
    doc_comprovante: null,
};

export function usePreMatricula(isAdminView = false) {
    const [formData, setFormData] = useState<PreMatriculaFormData>(INITIAL_FORM_DATA);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Dados auxiliares para selects
    const [polos, setPolos] = useState<any[]>([]);
    const [turmas, setTurmas] = useState<any[]>([]);
    const [niveis, setNiveis] = useState<any[]>([]);

    const { currentUser, hasAccessToAllPolos, getUserAllowedPolos } = useAuth();
    const { polos: appPolos } = usePolos();

    useEffect(() => {
        loadAuxiliaryData();
    }, []);

    // Effect to set initial polo if user is restricted
    useEffect(() => {
        if (isAdminView && !hasAccessToAllPolos()) {
            const allowed = getUserAllowedPolos(appPolos.map(p => p.id));
            if (allowed.length > 0 && !formData.polo_id) {
                setFormData(prev => ({ ...prev, polo_id: allowed[0] }));
            }
        }
    }, [isAdminView, currentUser, appPolos, hasAccessToAllPolos, getUserAllowedPolos]);

    useEffect(() => {
        if (formData.polo_id && formData.data_nascimento) {
            loadTurmasDisponiveis(formData.polo_id, formData.data_nascimento);
        }
    }, [formData.polo_id, formData.data_nascimento, niveis]);

    const calculateAge = (birthDate: string): number => {
        if (!birthDate) return 0;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    async function loadAuxiliaryData() {
        try {
            const [polosData, niveisData] = await Promise.all([
                PoloService.list(),
                TurmaService.listNiveis()
            ]);
            setPolos(polosData);
            setNiveis(niveisData as any[]);
        } catch (error) {
            console.error('Erro ao carregar dados auxiliares:', error);
            toast.error('Erro ao carregar opções do formulário');
        }
    }

    const [vacancyStatus, setVacancyStatus] = useState<'idle' | 'available' | 'full' | 'unavailable'>('idle');
    const [totalVacancies, setTotalVacancies] = useState(0);

    const loadTurmasDisponiveis = useCallback(async (poloId: string, dataNasc: string) => {
        try {
            setVacancyStatus('idle');
            const age = calculateAge(dataNasc);
            const turmasData = await TurmaService.list({ polo_id: poloId, status: 'ativa' });
            const list = Array.isArray(turmasData) ? turmasData : [];

            // Filter turmas by age range of their levels
            const filtered = list.filter((t: any) => {
                const nivel = niveis.find(n => n.id === t.nivel_id);
                if (!nivel) return false;
                return age >= nivel.idade_min && age <= nivel.idade_max;
            });

            const total = filtered.reduce((acc: number, t: any) => acc + (t.vagas_disponiveis || 0), 0);
            setTotalVacancies(total);

            if (filtered.length === 0) {
                setVacancyStatus('unavailable');
            } else if (total <= 0) {
                setVacancyStatus('full');
            } else {
                setVacancyStatus('available');
            }

            setTurmas(filtered);

            // Auto-select level based on age
            const nivelCompativel = niveis.find(n => age >= n.idade_min && age <= n.idade_max);
            if (nivelCompativel && !formData.turma_id) {
                setFormData(prev => ({ ...prev, nivel_id: nivelCompativel.id }));
            }
        } catch (error) {
            console.error('Erro ao buscar turmas:', error);
            setVacancyStatus('unavailable');
        }
    }, [niveis, formData.turma_id]);

    const buscarCEP = async (cep: string) => {
        if (!cep || cep.length < 8) return;

        try {
            const cleanCep = cep.replace(/\D/g, '');
            if (cleanCep.length !== 8) return;

            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    rua: data.logradouro,
                    bairro: data.bairro,
                    cidade: data.localidade,
                    estado: data.uf,
                    complemento: data.complemento || prev.complemento
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleHealthChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Mapeia o formData para o DTO de Aluno
            const alunoDto: AlunoCreateDto = {
                nome: formData.nome,
                cpf: formData.cpf,
                data_nascimento: formData.data_nascimento,
                sexo: formData.sexo,
                rg: formData.rg,
                rg_orgao: formData.rg_orgao,
                rg_data_expedicao: formData.rg_data_expedicao || undefined,
                naturalidade: formData.naturalidade,
                nacionalidade: formData.nacionalidade,
                // email: formData.email_responsavel, // Email removido pois nao existe no DTO
                // telefone: formData.telefone_responsavel,
                endereco: {
                    cep: formData.cep,
                    rua: formData.rua,
                    numero: formData.numero,
                    complemento: formData.complemento,
                    bairro: formData.bairro,
                    cidade: formData.cidade,
                    estado: formData.estado,
                },
                // filiacao: {
                //     mae: formData.tipo_parentesco === 'mae' ? formData.nome_responsavel : '',
                //     pai: formData.tipo_parentesco === 'pai' ? formData.nome_responsavel : '',
                // },
                // responsaveis: [
                //     {
                //         nome: formData.nome_responsavel,
                //         cpf: formData.cpf_responsavel,
                //         telefone: formData.telefone_responsavel,
                //         email: formData.email_responsavel,
                //         parentesco: formData.tipo_parentesco
                //     }
                // ],
                alergias: formData.alergias,
                restricao_alimentar: formData.restricao_alimentar,
                medicacao_continua: formData.medicacao_continua,
                doencas_cronicas: formData.doencas_cronicas,
                contato_emergencia_nome: formData.contato_emergencia_nome,
                contato_emergencia_telefone: formData.contato_emergencia_telefone,
                convenio_medico: formData.convenio_medico,
                hospital_preferencia: formData.hospital_preferencia,
                autorizacao_medica: formData.autorizacao_medica,
                status: isAdminView && formData.turma_id ? 'ativo' : 'pendente',
                polo_id: formData.polo_id,
                nivel_atual_id: (formData.nivel_id || '') as string 
            };

            let studentOrPreMatriculaId = '';
            let isPreMatricula = false;

            if (isAdminView) {
                // --- FLUXO ADMINISTRATIVO (Secretário/Admin) ---
                // Cria aluno e matrícula diretamente (exige autenticação)
                const novoAluno = await studentApi.create(alunoDto);
                studentOrPreMatriculaId = novoAluno.id;
                isPreMatricula = false;

                if (formData.turma_id) {
                    await enrollmentApi.create({
                        aluno_id: novoAluno.id,
                        polo_id: formData.polo_id,
                        turma_id: formData.turma_id,
                        tipo: 'matricula',
                    });
                }
            } else {
                // --- FLUXO PÚBLICO (Site) ---
                // Cria apenas o registro de pré-matrícula (Endpoint @Public)
                const preMatriculaDto = {
                    nome_completo: formData.nome,
                    cpf: formData.cpf,
                    rg: formData.rg,
                    rg_orgao: formData.rg_orgao,
                    rg_data_expedicao: formData.rg_data_expedicao || undefined,
                    data_nascimento: formData.data_nascimento,
                    sexo: formData.sexo,
                    naturalidade: formData.naturalidade,
                    nacionalidade: formData.nacionalidade,
                    email_responsavel: formData.email_responsavel,
                    telefone_responsavel: formData.telefone_responsavel,
                    nome_responsavel: formData.nome_responsavel,
                    cpf_responsavel: formData.cpf_responsavel,
                    tipo_parentesco: formData.tipo_parentesco,
                    endereco: {
                        cep: formData.cep,
                        rua: formData.rua,
                        numero: formData.numero,
                        complemento: formData.complemento,
                        bairro: formData.bairro,
                        cidade: formData.cidade,
                        estado: formData.estado,
                    },
                    // Campos de saúde (achatados para a tabela pre_matriculas)
                    alergias: formData.alergias,
                    restricao_alimentar: formData.restricao_alimentar,
                    medicacao_continua: formData.medicacao_continua,
                    doencas_cronicas: formData.doencas_cronicas,
                    contato_emergencia_nome: formData.contato_emergencia_nome,
                    contato_emergencia_telefone: formData.contato_emergencia_telefone,
                    convenio_medico: formData.convenio_medico,
                    hospital_preferencia: formData.hospital_preferencia,
                    autorizacao_medica: formData.autorizacao_medica,
                    // Responsável 2
                    nome_responsavel_2: formData.nome_responsavel_2,
                    cpf_responsavel_2: formData.cpf_responsavel_2,
                    telefone_responsavel_2: formData.telefone_responsavel_2,
                    email_responsavel_2: formData.email_responsavel_2,
                    tipo_parentesco_2: formData.tipo_parentesco_2,
                    
                    polo_id: formData.polo_id,
                    nivel_id: formData.nivel_id || undefined,
                    observacoes: formData.observacoes,
                    status: 'em_analise'
                };

                const preMatriculaResponse = await enrollmentApi.createPreMatricula(preMatriculaDto);
                studentOrPreMatriculaId = preMatriculaResponse.id;
                isPreMatricula = true;
            }

            // Upload de documentos (se houver)
            const documentosParaUpload = [
                { file: formData.foto, tipo: 'foto' },
                { file: formData.doc_rg, tipo: 'rg' },
                { file: formData.doc_cpf, tipo: 'cpf' },
                { file: formData.doc_certidao, tipo: 'certidao_nascimento' },
                { file: formData.doc_comprovante, tipo: 'comprovante_residencia' },
            ].filter(doc => doc.file !== null && doc.file !== undefined);

            if (documentosParaUpload.length > 0) {
                try {
                    const { DocumentAPI } = await import('@/shared/api/DocumentService');

                    for (const { file, tipo } of documentosParaUpload) {
                        const formDataUpload = new FormData();
                        formDataUpload.append('files', file!);

                        if (isPreMatricula) {
                            await DocumentAPI.uploadByPreEnrollment(studentOrPreMatriculaId, formDataUpload, tipo);
                        } else {
                            await DocumentAPI.uploadByStudent(studentOrPreMatriculaId, formDataUpload, tipo);
                        }
                    }
                } catch (uploadError) {
                    console.error('Erro ao fazer upload de documentos:', uploadError);
                    toast.warning('Aluno cadastrado, mas houve erro ao enviar alguns documentos. Você pode enviá-los depois.');
                }
            }

            setSubmitted(true);
            toast.success(isAdminView ? 'Aluno matriculado com sucesso!' : 'Pré-matrícula realizada com sucesso!');

        } catch (error: any) {
            console.error(error);
            let errorMessage = error.message || 'Erro ao processar matrícula';
            
            if (errorMessage.includes('pre_matriculas_email_unique')) {
                errorMessage = 'Este e-mail já possui uma pré-matrícula em andamento.';
            } else if (errorMessage.includes('pre_matriculas_cpf_unique')) {
                errorMessage = 'Este CPF já possui uma pré-matrícula em andamento.';
            } else if (errorMessage.includes('Failed to fetch')) {
                errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
        if (!formData.data_nascimento) newErrors.data_nascimento = 'Data de nascimento é obrigatória';
        if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
        if (!formData.cep) newErrors.cep = 'CEP é obrigatório';
        if (!formData.rua) newErrors.rua = 'Rua é obrigatória';
        if (!formData.numero) newErrors.numero = 'Número é obrigatório';
        // ... Adicionar demais validações conforme necessário

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const availablePolos = isAdminView && !hasAccessToAllPolos()
        ? polos.filter(p => getUserAllowedPolos(polos.map(pl => pl.id)).includes(p.id))
        : polos;

    const resetForm = () => {
        setFormData(INITIAL_FORM_DATA);
        setSubmitted(false);
        setErrors({});
    };

    return {
        formData,
        setFormData,
        loading,
        submitted,
        errors,
        polos: availablePolos,
        turmas,
        niveis,
        handleInputChange,
        handleHealthChange,
        buscarCEP,
        handleSubmit,
        resetForm,
        vacancyStatus,
        totalVacancies
    };
}
