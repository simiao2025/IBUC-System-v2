import React, { useState, useEffect } from 'react';
import { useFeedback } from '../context/FeedbackContext';
import { PoloService } from '../services/polo.service';
import { DocumentosAPI } from '../services/documento.service';
import { PreMatriculasAPI } from '../services/matricula.service';
import { formatCPF, formatCEP, formatPhone } from '../lib/format';
import { REQUIRED_DOCUMENTS } from '../constants/enrollment';
import { preMatriculaSchema } from '../lib/validation/enrollment.schema';
import { z } from 'zod';
import type { Polo, TipoDocumento } from '../types/database';

export const usePreMatriculaForm = () => {
  const { showError } = useFeedback();
  const [loading, setLoading] = useState(false);
  const [polos, setPolos] = useState<Polo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string; tipo: TipoDocumento }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Partial<Record<TipoDocumento, File>>>({});
  const [selectedDocType, setSelectedDocType] = useState<TipoDocumento>('rg');

  const [formData, setFormData] = useState({
    nome: '',
    nome_social: '',
    data_nascimento: '',
    sexo: '' as 'masculino' | 'feminino' | 'outro',
    cpf: '',
    rg: '',
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
      medicamentos: '',
      plano_saude: '',
      hospital_preferencia: '',
      autorizacao_medica: false,
    },
    polo_id: '',
    nivel_id: '',
    escola_origem: '',
    ano_escolar: '',
    observacoes: '',
    aceite_termo: false,
  });

  useEffect(() => {
    const carregarPolos = async () => {
      try {
        const data = await PoloService.listarPolos();
        setPolos(data);
      } catch (error) {
        console.error('Erro ao carregar polos:', error);
      }
    };
    carregarPolos();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'cpf' || name === 'cpf_responsavel') formattedValue = formatCPF(value);
    if (name === 'cep') formattedValue = formatCEP(value);
    if (name === 'telefone_responsavel') formattedValue = formatPhone(value);

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
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
      
      const missingDocs: string[] = [];
      REQUIRED_DOCUMENTS.forEach((doc) => {
        if (!selectedFiles[doc.type]) {
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
    try {
      const resp = (await PreMatriculasAPI.criar({
        nome_completo: formData.nome,
        nome_social: formData.nome_social,
        cpf: formData.cpf,
        rg: formData.rg,
        data_nascimento: formData.data_nascimento,
        sexo: formData.sexo,
        naturalidade: formData.naturalidade,
        nacionalidade: formData.nacionalidade,
        email_responsavel: formData.email_responsavel,
        telefone_responsavel: formData.telefone_responsavel,
        endereco: {
          cep: formData.cep,
          rua: formData.rua,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
        },
        saude: formData.saude,
        responsaveis: [{
          nome: formData.nome_responsavel,
          cpf: formData.cpf_responsavel,
          telefone: formData.telefone_responsavel,
          email: formData.email_responsavel,
          tipo_parentesco: formData.tipo_parentesco,
        }],
        polo_id: formData.polo_id,
        nivel_id: formData.nivel_id || null,
        escola_origem: formData.escola_origem,
        ano_escolar: formData.ano_escolar,
        observacoes: formData.observacoes,
      })) as { id: string };

      const selectedEntries = Object.entries(selectedFiles) as [TipoDocumento, File][];
      if (selectedEntries.length > 0) {
        for (const [tipo, file] of selectedEntries) {
          const fd = new FormData();
          fd.append('files', file);
          await DocumentosAPI.uploadPorPreMatricula(resp.id, fd, tipo);
        }
      }
      setSubmitted(true);
    } catch (error) {
      console.error('Erro ao realizar pré-matrícula:', error);
      showError('Erro na Pré-matrícula', 'Não foi possível enviar seus dados agora.');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    polos,
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
  };
};
