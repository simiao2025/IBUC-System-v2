import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentosAPI } from '../services/documento.service';
import { PreMatriculasAPI } from '../services/matricula.service';
import { REQUIRED_DOCUMENTS } from '../constants/enrollment';
import type { PreMatricula, StatusPreMatricula, TipoDocumento } from '../types/database';

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
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('');

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
      
      setPreMatriculasEmAnalise(emAnalise);
      setPreMatriculasAtivas(ativas);
      
      if (!selectedPreMatricula && emAnalise.length > 0) {
        setSelectedPreMatricula(emAnalise[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar pré-matrículas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getUserAllowedPolos, hasAccessToAllPolos, selectedPoloId, selectedPreMatricula]);

  useEffect(() => {
    loadPreMatriculas();
  }, [loadPreMatriculas]);

  useEffect(() => {
    const loadTurmas = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:3000/turmas', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data)) {
          setTurmas(data.map((t: any) => ({
            id: String(t.id),
            nome: String(t.nome ?? t.id),
            polo_id: String(t.polo_id),
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

  const isDocumentMissing = (type: TipoDocumento) => {
    return !documentos.some((doc) => doc.path.toLowerCase().includes(`/${type.toLowerCase()}/`));
  };

  const allRequiredDocumentsUploaded = useMemo(() => 
    REQUIRED_DOCUMENTS.every(doc => !isDocumentMissing(doc.type)),
  [documentos]);

  const selectedData = useMemo(() => 
    preMatriculasEmAnalise.find((p) => p.id === selectedPreMatricula) ||
    preMatriculasAtivas.find((p) => p.id === selectedPreMatricula),
  [preMatriculasEmAnalise, preMatriculasAtivas, selectedPreMatricula]);

  return {
    preMatriculasEmAnalise,
    preMatriculasAtivas,
    selectedPreMatricula,
    setSelectedPreMatricula,
    documentos,
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
    polos,
    hasAccessToAllPolos,
    selectedData,
  };
};
