import React, { useState, useEffect } from 'react';
import { useFeedback } from '../context/FeedbackContext';
import { useApp } from '../context/AppContext';
import { PoloService } from '../services/polo.service';
import { TurmaService } from '../services/turma.service';
import { DocumentosAPI } from '../services/documento.service';
import { AlunosAPI } from '../features/students/aluno.service';
import { PreMatriculasAPI } from '../features/enrollments/matricula.service';
import { formatCPF, formatCEP, formatPhone } from '../lib/format';
import { REQUIRED_DOCUMENTS } from '../constants/enrollment';
import { preMatriculaSchema } from '../lib/validation/enrollment.schema';
import { z } from 'zod';
import type { Polo, TipoDocumento, Nivel, Turma } from '../types/database';

export const usePreMatriculaForm = (forcedIsAdmin?: boolean) => {
  const { currentUser } = useApp();
  const isAdmin = forcedIsAdmin ?? (currentUser?.role === 'admin');
  const { showError, showSuccess } = useFeedback();
  const [loading, setLoading] = useState(false);
  const [polos, setPolos] = useState<Polo[]>([]);
  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [filteredTurmas, setFilteredTurmas] = useState<Turma[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string; tipo: TipoDocumento }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Partial<Record<TipoDocumento, File>>>({});



  // Helper para calcular idade
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
  const [selectedDocType, setSelectedDocType] = useState<TipoDocumento>('rg');
  const [turmaOccupancy, setTurmaOccupancy] = useState<{ count: number; capacity: number } | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    sexo: '' as 'M' | 'F',
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
    estado: 'TO',
    nome_responsavel: '',
    telefone_responsavel: '',
    email_responsavel: '',
    cpf_responsavel: '',
    tipo_parentesco: 'pai' as 'pai' | 'mae' | 'tutor' | 'outro',
    saude: {
      alergias: '',
      restricao_alimentar: '',
      medicacao_continua: '',
      doencas_cronicas: '',
      contato_emergencia_nome: '',
      contato_emergencia_telefone: '',
      convenio_medico: '',
      hospital_preferencia: '',
      autorizacao_medica: false,
    },
    nome_responsavel_2: '',
    cpf_responsavel_2: '',
    telefone_responsavel_2: '',
    email_responsavel_2: '',
    tipo_parentesco_2: '',
    polo_id: '',
    nivel_id: '',
    turma_id: '',
    escola_origem: '',
    ano_escolar: '',
    observacoes: '',
    aceite_termo: false,
  });

  useEffect(() => {
    const handleOccupancy = async () => {
      if (formData.turma_id) {
        try {
          const selectedTurma = turmas.find(t => t.id === formData.turma_id);
          const { count } = await TurmaService.getOccupancy(formData.turma_id);
          setTurmaOccupancy({
            count,
            capacity: selectedTurma?.capacidade || 0
          });
        } catch (error) {
          console.error('Erro ao buscar ocupação:', error);
          setTurmaOccupancy(null);
        }
      } else {
        setTurmaOccupancy(null);
      }
    };
    handleOccupancy();
  }, [formData.turma_id, turmas]);

  useEffect(() => {
    if (!isAdmin) return;
    const accessLevel = (currentUser as any)?.adminUser?.accessLevel as string | undefined;
    const poloId =
      ((currentUser as any)?.adminUser?.poloId as string | undefined) ||
      ((currentUser as any)?.adminUser?.polo_id as string | undefined) ||
      ((currentUser as any)?.poloId as string | undefined) ||
      ((currentUser as any)?.polo_id as string | undefined);

    if ((accessLevel === 'polo_especifico' || Boolean(poloId)) && poloId) {
      setFormData(prev => ({
        ...prev,
        polo_id: prev.polo_id || poloId,
      }));
    }
  }, [isAdmin, currentUser]);

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const [dadosPolos, dadosNiveis] = await Promise.all([
          PoloService.listarPolos(),
          TurmaService.listarNiveis(),
        ]);
        setPolos(dadosPolos);
        console.log('[usePreMatriculaForm] Polos carregados:', dadosPolos.length);
        setNiveis(dadosNiveis as Nivel[]);
        console.log('[usePreMatriculaForm] Níveis carregados:', dadosNiveis.map(n => `${n.nome} (${n.idade_min}-${n.idade_max} anos)`).join(', '));
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      }
    };
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    const carregarTurmas = async () => {
      if (formData.polo_id) {
        try {
          // Busca todas as turmas ativas do polo
          const params = { polo_id: formData.polo_id, status: 'ativa' };
          console.log('[usePreMatriculaForm] Buscando turmas com params:', params);

          const resp = await TurmaService.listarTurmas(params);
          const lista = Array.isArray(resp) ? resp : (resp as any)?.data || [];
          const turmasAtivas = Array.isArray(lista) ? lista : [];

          console.log(`[usePreMatriculaForm] Carregadas ${turmasAtivas.length} turmas ativas para o polo.`);
          setTurmas(turmasAtivas as Turma[]);

        } catch (error) {
          console.error('Erro ao carregar turmas:', error);
          setTurmas([]);
          showError('Erro ao carregar turmas', 'Não foi possível buscar a lista de turmas.');
        }
      } else {
        setTurmas([]);
      }
    };
    carregarTurmas();
  }, [formData.polo_id]);

  // Efeito para filtrar turmas baseado na idade
  useEffect(() => {
    if (!formData.data_nascimento) {
      setFilteredTurmas([]);
      return;
    }

    const age = calculateAge(formData.data_nascimento);
    console.log(`[usePreMatriculaForm] Data nasc: ${formData.data_nascimento} -> Idade: ${age} anos`);

    if (niveis.length > 0) {
      // 1. Filtrar Turmas (para Admin/Direct)
      if (turmas.length > 0) {
        console.log('Comparando com níveis:', niveis.map(n => ({ id: n.id, nome: n.nome, range: `${n.idade_min}-${n.idade_max}` })));

        const filtered = turmas.filter(t => {
          const nivel = niveis.find(n => n.id === t.nivel_id);
          if (!nivel) {
            console.log(`Turma ${t.nome} ignorada: sem nível vinculado ${t.nivel_id}`);
            return false;
          }
          const match = age >= nivel.idade_min && age <= nivel.idade_max;
          if (!match) console.log(`Turma ${t.nome} (Nível ${nivel.nome} ${nivel.idade_min}-${nivel.idade_max}a) INCOMPATÍVEL com idade ${age}`);
          return match;
        });
        console.log(`[usePreMatriculaForm] Turmas filtradas: ${filtered.length}`);
        setFilteredTurmas(filtered);
      } else {
        setFilteredTurmas([]);
      }

      // 2. Auto-definir Nível (para Pré-matrícula/Public)
      const nivelCompativel = niveis.find(n => age >= n.idade_min && age <= n.idade_max);
      if (nivelCompativel) {
        console.log(`[usePreMatriculaForm] Nível compatível identificado: ${nivelCompativel.nome} (${nivelCompativel.id})`);
        setFormData(prev => {
          if (prev.nivel_id !== nivelCompativel.id && !prev.turma_id) {
            return { ...prev, nivel_id: nivelCompativel.id };
          }
          return prev;
        });
      }
    } else {
      setFilteredTurmas([]);
    }
  }, [formData.data_nascimento, turmas, niveis]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'cpf' || name === 'cpf_responsavel') formattedValue = formatCPF(value);
    if (name === 'cep') formattedValue = formatCEP(value);
    if (name === 'telefone_responsavel') formattedValue = formatPhone(value);

    setFormData(prev => {
      console.log('[usePreMatriculaForm] Atualizando', name, 'para', formattedValue);
      return { ...prev, [name]: formattedValue };
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleHealthChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({
      ...prev,
      saude: { ...prev.saude, [name]: val }
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileSelected = (file: File) => {
    setSelectedFiles(prev => ({ ...prev, [selectedDocType]: file }));
    if (errors.documentos) {
      setErrors(prev => ({ ...prev, documentos: '' }));
    }
  };

  const handleUploadComplete = (url: string) => {
    setUploadedFiles(prev => [...prev, { url, name: 'Arquivo Enviado', tipo: selectedDocType }]);
  };

  const buscarCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          rua: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  const validateForm = (): boolean => {
    try {
      preMatriculaSchema.parse(formData);

      // Documentos são opcionais no cadastro direto se o admin decidir (mas vamos manter obrigatório por padrão)
      // O usuário pediu cadastro direto, mas não mencionou documentos.
      // Manterei a exigência para garantir integridade, a menos que seja solicitado o contrário.
      const missingDocs: string[] = [];
      REQUIRED_DOCUMENTS.forEach((doc) => {
        if (!selectedFiles[doc.value]) {
          missingDocs.push(doc.label);
        }
      });

      if (missingDocs.length > 0) {
        setErrors({ documentos: `Envie os documentos: ${missingDocs.join(', ')}` });
        return false;
      }

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[err.path.length - 1]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const commonData = {
      cpf: formData.cpf.replace(/\D/g, ''),
      rg: formData.rg,
      rg_orgao: formData.rg_orgao,
      rg_data_expedicao: formData.rg_data_expedicao,
      data_nascimento: formData.data_nascimento,
      sexo: formData.sexo,
      naturalidade: formData.naturalidade,
      nacionalidade: formData.nacionalidade,
      endereco: {
        cep: formData.cep,
        rua: formData.rua,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
      },
      // Health
      alergias: formData.saude.alergias,
      restricao_alimentar: formData.saude.restricao_alimentar,
      medicacao_continua: formData.saude.medicacao_continua,
      doencas_cronicas: formData.saude.doencas_cronicas,
      contato_emergencia_nome: formData.saude.contato_emergencia_nome,
      contato_emergencia_telefone: formData.saude.contato_emergencia_telefone,
      convenio_medico: formData.saude.convenio_medico,
      hospital_preferencia: formData.saude.hospital_preferencia,
      autorizacao_medica: formData.saude.autorizacao_medica,
      // Responsable 1
      nome_responsavel: formData.nome_responsavel,
      cpf_responsavel: formData.cpf_responsavel.replace(/\D/g, ''),
      email_responsavel: formData.email_responsavel,
      telefone_responsavel: formData.telefone_responsavel,
      tipo_parentesco: formData.tipo_parentesco,
      // Responsable 2
      nome_responsavel_2: formData.nome_responsavel_2,
      cpf_responsavel_2: formData.cpf_responsavel_2?.replace(/\D/g, ''),
      email_responsavel_2: formData.email_responsavel_2,
      telefone_responsavel_2: formData.telefone_responsavel_2,
      tipo_parentesco_2: formData.tipo_parentesco_2,

      polo_id: formData.polo_id,
      escola_origem: formData.escola_origem,
      ano_escolar: formData.ano_escolar,
      observacoes: formData.observacoes,
    };

    // Payload específico para Pré-matrícula (conforme CreatePreMatriculaDto)
    const preMatriculaPayload = {
      ...commonData,
      nome_completo: formData.nome, // Backend espera nome_completo
      nivel_id: formData.nivel_id, // Para PreMatricula
      // Flatten health fields for backend if they are nested in commonData during copy or just spread them
      ...formData.saude,
    };

    // Payload específico para Aluno Direto (conforme CreateAlunoDirectDto)
    const alunoDirectPayload = {
      ...commonData,
      nome: formData.nome, // Backend espera nome
      turma_id: formData.turma_id, // Obrigatório para aluno direto
      nivel_id: formData.nivel_id, // Para Aluno Direto (se suportado)
      ...formData.saude,
    };

    try {
      let createdId = '';

      // Função auxiliar para limpar campos undefined antes de enviar
      const cleanPayload = (obj: any) => {
        return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
      };

      if (isAdmin && formData.turma_id) {
        // Cadastro Direto
        const resp = await AlunosAPI.criar(cleanPayload(alunoDirectPayload) as any);
        createdId = resp.id;
        showSuccess('Cadastro Direto', 'Aluno cadastrado e ativado com sucesso!');
      } else {
        // Pré-matrícula Normal
        const resp = (await PreMatriculasAPI.criar(cleanPayload(preMatriculaPayload))) as { id: string };
        createdId = resp.id;
      }

      // Upload de documentos (sempre vinculados à pré-matrícula ou aluno)
      // No caso de aluno direto, o backend pode precisar de um endpoint específico ou 
      // podemos vincular ao aluno. Por enquanto, se for admin direto, salvamos como aluno.
      // Mas o serviço de documentos atual parece focado em pré-matrículas.
      // Se for admin direto, talvez precisemos de DocumentosAPI.uploadPorAluno.

      const selectedEntries = Object.entries(selectedFiles) as [TipoDocumento, File][];
      if (selectedEntries.length > 0) {
        for (const [tipo, file] of selectedEntries) {
          const fd = new FormData();
          fd.append('files', file);
          if (isAdmin && formData.turma_id) {
            // Fluxo de Cadastro Direto: Upload vinculado ao Aluno
            await DocumentosAPI.uploadPorAluno(createdId, fd, tipo);
          } else {
            // Fluxo de Pré-matrícula: Upload vinculado à Pré-matrícula
            await DocumentosAPI.uploadPorPreMatricula(createdId, fd, tipo);
          }
        }
      }
      setSubmitted(true);
    } catch (error) {
      console.error('Erro ao realizar cadastro:', error);
      showError('Erro no Cadastro', 'Não foi possível salvar os dados agora.');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    polos,
    niveis,
    turmas: filteredTurmas, // Return filtered turmas strictly
    allTurmas: turmas, // Expose raw list if needed debug
    errors,
    submitted,
    selectedDocType,
    setSelectedDocType,
    handleInputChange,
    handleHealthChange,
    handleCheckboxChange,
    handleFileSelected,
    handleUploadComplete,
    buscarCEP,
    handleSubmit,
    uploadedFiles,
    setFormData,
    turmaOccupancy,
  };
};
