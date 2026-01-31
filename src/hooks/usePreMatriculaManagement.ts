import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentosAPI } from '../services/documento.service';
import { PreMatriculasAPI } from '../features/enrollments/matricula.service';
import { TurmaService } from '../services/turma.service';
import { REQUIRED_DOCUMENTS } from '../constants/enrollment';
import type { PreMatricula, StatusPreMatricula, TipoDocumento, Nivel } from '../types/database';
import { API_BASE_URL } from '@/shared/api/api';

export const usePreMatriculaManagement = () => {
  const { getUserAllowedPolos, hasAccessToAllPolos, polos, currentUser } = useApp();
  const [preMatriculasEmAnalise, setPreMatriculasEmAnalise] = useState<PreMatricula[]>([]);
  const [preMatriculasAtivas, setPreMatriculasAtivas] = useState<PreMatricula[]>([]);
  const [selectedPreMatricula, setSelectedPreMatricula] = useState<string | null>(null);
  const [documentos, setDocumentos] = useState<Array<{ name: string; path: string; url: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isConcluding, setIsConcluding] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<TipoDocumento>('rg');
  const [validadeDocumento, setValidadeDocumento] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPoloId, setSelectedPoloId] = useState<string>('all');
  const [turmas, setTurmas] = useState<Array<{ id: string; nome: string; polo_id: string }>>([]);
  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<PreMatricula>>({});

  const normalizePreMatriculaData = useCallback((data: PreMatricula): PreMatricula => {
    if (!data) return data;
    const normalized = { ...data };

    // Fallback para Saúde (se as colunas individuais estiverem vazias)
    if (data.saude && typeof data.saude === 'object') {
      normalized.alergias = normalized.alergias || data.saude.alergias;
      normalized.restricao_alimentar = normalized.restricao_alimentar || data.saude.restricao_alimentar;
      normalized.medicacao_continua = normalized.medicacao_continua || data.saude.medicacao_continua;
      normalized.doencas_cronicas = normalized.doencas_cronicas || data.saude.doencas_cronicas;
      normalized.contato_emergencia_nome = normalized.contato_emergencia_nome || data.saude.contato_emergencia_nome;
      normalized.contato_emergencia_telefone = normalized.contato_emergencia_telefone || data.saude.contato_emergencia_telefone;
      normalized.convenio_medico = normalized.convenio_medico || data.saude.convenio_medico;
      normalized.hospital_preferencia = normalized.hospital_preferencia || data.saude.hospital_preferencia;
      if (normalized.autorizacao_medica === undefined || normalized.autorizacao_medica === null) {
        normalized.autorizacao_medica = data.saude.autorizacao_medica;
      }
    }

    // Fallback para Responsáveis (se as colunas principais estiverem vazias)
    if (!normalized.nome_responsavel && data.responsaveis && Array.isArray(data.responsaveis) && data.responsaveis.length > 0) {
      const main = data.responsaveis[0];
      normalized.nome_responsavel = main.nome || main.nome_completo;
      normalized.cpf_responsavel = main.cpf;
      normalized.email_responsavel = main.email;
      normalized.telefone_responsavel = main.telefone1 || main.telefone || main.telefone_whatsapp;
      normalized.tipo_parentesco = main.tipo_parentesco;
      
      if (!normalized.nome_responsavel_2 && data.responsaveis.length > 1) {
        const sec = data.responsaveis[1];
        normalized.nome_responsavel_2 = sec.nome || sec.nome_completo;
        normalized.cpf_responsavel_2 = sec.cpf;
        normalized.email_responsavel_2 = sec.email;
        normalized.telefone_responsavel_2 = sec.telefone1 || sec.telefone || sec.telefone_whatsapp;
        normalized.tipo_parentesco_2 = sec.tipo_parentesco;
      }
    }

    // Fallback para Endereço (se for retornado como objeto mas chaves internas estiverem em outro lugar)
    if (!normalized.endereco || Object.keys(normalized.endereco).length === 0) {
      const legacyEnd = data.metadata?.endereco || data.metadata?.address;
      if (legacyEnd) {
        normalized.endereco = {
          cep: legacyEnd.cep || legacyEnd.zip,
          rua: legacyEnd.rua || legacyEnd.street || legacyEnd.logradouro,
          numero: legacyEnd.numero || legacyEnd.number,
          complemento: legacyEnd.complemento,
          bairro: legacyEnd.bairro || legacyEnd.district,
          cidade: legacyEnd.cidade || legacyEnd.city,
          estado: legacyEnd.estado || legacyEnd.state || legacyEnd.uf,
        };
      }
    }

    if (!normalized.endereco) {
      normalized.endereco = {} as any;
    }

    // Fallback de Metadados Gerais
    const metadata = data.metadata;
    if (metadata && typeof metadata === 'object') {
      normalized.naturalidade = normalized.naturalidade || (metadata as Record<string, any>).naturalidade;
      normalized.nacionalidade = normalized.nacionalidade || (metadata as Record<string, any>).nacionalidade;
      normalized.escola_origem = normalized.escola_origem || (metadata as Record<string, any>).escola_origem || (metadata as Record<string, any>).escola;
      normalized.ano_escolar = normalized.ano_escolar || (metadata as Record<string, any>).ano_escolar || (metadata as Record<string, any>).serie;
      normalized.rg = normalized.rg || (metadata as Record<string, any>).rg;
      normalized.rg_orgao = normalized.rg_orgao || (metadata as Record<string, any>).rg_orgao || (metadata as Record<string, any>).orgao_emissor;
      normalized.rg_data_expedicao = normalized.rg_data_expedicao || (metadata as Record<string, any>).rg_data_expedicao || (metadata as Record<string, any>).data_expedicao;
    }

    return normalized;
  }, []);

  const loadPreMatriculas = useCallback(async () => {
    try {
      setIsLoading(true);
      const allowedPolos = getUserAllowedPolos();
      let poloFilter: string | undefined;

      if (hasAccessToAllPolos()) {
        poloFilter = selectedPoloId === 'all' ? undefined : selectedPoloId;
      } else {
        poloFilter = allowedPolos[0] || undefined;
      }

      const emAnalise = (await PreMatriculasAPI.listar({
        polo_id: poloFilter,
        status: 'em_analise',
      })) as PreMatricula[];
      const ativas = (await PreMatriculasAPI.listar({
        polo_id: poloFilter,
        status: 'ativo',
      })) as PreMatricula[];
      
      setPreMatriculasEmAnalise(emAnalise.map(normalizePreMatriculaData));
      setPreMatriculasAtivas(ativas.map(normalizePreMatriculaData));
      
      // Carregar níveis se ainda não foram carregados
      if (niveis.length === 0) {
        const dadosNiveis = await TurmaService.listarNiveis();
        setNiveis(dadosNiveis as Nivel[]);
      }
      
      if (!selectedPreMatricula && emAnalise.length > 0) {
        setSelectedPreMatricula(emAnalise[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar pré-matrículas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getUserAllowedPolos, hasAccessToAllPolos, selectedPoloId, selectedPreMatricula, niveis.length, normalizePreMatriculaData]);

  useEffect(() => {
    loadPreMatriculas();
  }, [loadPreMatriculas]);

  useEffect(() => {
    const loadTurmas = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        // Usar API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/turmas`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data)) {
          setTurmas(data.map((t: any) => ({
            id: String(t.id),
            nome: String(t.nome ?? t.id),
            polo_id: String(t.polo_id),
            nivel_id: String(t.nivel_id),
            modulo_atual_id: t.modulo_atual_id,
            modulo_titulo: t.modulo?.titulo,
          })));
        }
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
      }
    };
    loadTurmas();
  }, []);

  useEffect(() => {
    if (!selectedPreMatricula) return;
    const loadDocumentos = async () => {
      try {
        setIsLoading(true);
        const response = (await DocumentosAPI.listarPorPreMatricula(selectedPreMatricula)) as {
          arquivos?: Array<{ name: string; path: string; url: string }>;
        };
        setDocumentos(response?.arquivos || []);
      } catch (error) {
        console.error('Erro ao carregar documentos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDocumentos();
  }, [selectedPreMatricula]);

  const handleFileSelected = (file: File) => setSelectedFile(file);

  const handleUploadSelectedFile = async () => {
    if (!selectedPreMatricula || !selectedFile) return;
    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append('files', selectedFile);
      await DocumentosAPI.uploadPorPreMatricula(selectedPreMatricula, fd, selectedDocumentType);
      const response = (await DocumentosAPI.listarPorPreMatricula(selectedPreMatricula)) as {
        arquivos?: Array<{ name: string; path: string; url: string }>;
      };
      setDocumentos(response?.arquivos || []);
      setSelectedFile(null);
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      alert('Erro ao enviar documento.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateStatus = async (status: StatusPreMatricula) => {
    if (!selectedPreMatricula) return;
    try {
      await PreMatriculasAPI.atualizarStatus(selectedPreMatricula, { status });
      await loadPreMatriculas();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status.');
    }
  };

  const selectedData = useMemo(() => 
    preMatriculasEmAnalise.find((p) => p.id === selectedPreMatricula) ||
    preMatriculasAtivas.find((p) => p.id === selectedPreMatricula),
  [preMatriculasEmAnalise, preMatriculasAtivas, selectedPreMatricula]);

  const handleEditToggle = () => {
    if (!isEditing && selectedData) {
      setEditFormData(selectedData);
    }
    setIsEditing(!isEditing);
  };

  const handleEditChange = (path: string, value: any) => {
    setEditFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) current[key] = {};
        current[key] = { ...current[key] };
        current = current[key];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleUpdateData = async () => {
    if (!selectedPreMatricula) return;
    try {
      setIsLoading(true);
      await PreMatriculasAPI.atualizar(selectedPreMatricula, editFormData);
      await loadPreMatriculas();
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      alert('Erro ao atualizar dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConcluir = async () => {
    if (!selectedPreMatricula || !selectedTurmaId) return;
    if (!currentUser?.id) {
      alert('Usuário não identificado.');
      return;
    }
    try {
      setIsConcluding(true);
      await PreMatriculasAPI.concluir(selectedPreMatricula, {
        turma_id: selectedTurmaId,
        approved_by: currentUser.id,
      });
      await handleUpdateStatus('concluido');
    } catch (error) {
      console.error('Erro ao concluir pré-matrícula:', error);
      alert('Erro ao concluir pré-matrícula.');
    } finally {
      setIsConcluding(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPreMatricula) return;
    if (!confirm('Tem certeza que deseja cancelar esta pré-matrícula permanentemente? Esta ação não pode ser desfeita.')) return;
    
    try {
      setIsLoading(true);
      await PreMatriculasAPI.deletar(selectedPreMatricula);
      setSelectedPreMatricula(null);
      await loadPreMatriculas();
    } catch (error) {
      console.error('Erro ao deletar pré-matrícula:', error);
      alert('Erro ao tentar excluir a pré-matrícula.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDocumentMissing = useCallback((type: TipoDocumento) => {
    const typeLower = type.toLowerCase();
    return !documentos.some((doc) => {
      const segments = doc.path?.toLowerCase().split('/');
      return segments?.includes(typeLower);
    });
  }, [documentos]);

  const allRequiredDocumentsUploaded = useMemo(() => 
    REQUIRED_DOCUMENTS.every(doc => !isDocumentMissing(doc.value)),
  [isDocumentMissing]);

  const photoUrl = useMemo(() => {
    const photoDoc = documentos.find(doc => {
      const segments = doc.path?.toLowerCase().split('/');
      return segments?.includes('foto');
    });
    return photoDoc ? photoDoc.url : null;
  }, [documentos]);

  return {
    preMatriculasEmAnalise,
    preMatriculasAtivas,
    selectedPreMatricula,
    setSelectedPreMatricula,
    documentos,
    photoUrl,
    isLoading,
    isUploading,
    isConcluding,
    selectedDocumentType,
    setSelectedDocumentType,
    validadeDocumento,
    setValidadeDocumento,
    selectedFile,
    selectedPoloId,
    setSelectedPoloId,
    turmas,
    selectedTurmaId,
    setSelectedTurmaId,
    handleFileSelected,
    handleUploadSelectedFile,
    handleConcluir,
    handleUpdateStatus,
    allRequiredDocumentsUploaded,
    isDocumentMissing,
    polos,
    niveis,
    hasAccessToAllPolos,
    selectedData,
    isEditing,
    editFormData,
    handleEditToggle,
    handleEditChange,
    handleUpdateData,
    handleDelete,
  };
};
