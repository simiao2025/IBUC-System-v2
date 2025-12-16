import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileUpload } from '../../components/ui/FileUpload';
import { DocumentosAPI, PreMatriculasAPI } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import Button from '../../components/ui/Button';
import type { PreMatricula, StatusPreMatricula, TipoDocumento } from '../../types/database';

// Tipos de documentos necessários para matrícula
const REQUIRED_DOCUMENTS: { type: TipoDocumento; label: string }[] = [
  { type: 'rg', label: 'Documento de Identidade (RG)' },
  { type: 'certidao', label: 'Certidão de Nascimento' },
  { type: 'comprovante_residencia', label: 'Comprovante de Residência' },
];

export const EnrollmentManagement: React.FC = () => {
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

  const STATUS_OPTIONS: Array<{ value: StatusPreMatricula; label: string }> = [
    { value: 'em_analise', label: 'Em análise' },
    { value: 'ativo', label: 'Ativo' },
    { value: 'trancado', label: 'Trancado' },
    { value: 'concluido', label: 'Concluído' },
  ];

  // Carrega a lista de pré-matrículas (em análise e ativas), respeitando o polo do usuário logado
  useEffect(() => {
    const loadPreMatriculas = async () => {
      try {
        setIsLoading(true);
        // Se o usuário tem acesso geral, pode escolher o polo (ou ver todos).
        // Caso contrário, filtra pelo(s) polo(s) permitido(s) (secretário de polo, etc.).
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
        
        // Seleciona a primeira pré-matrícula se houver
        if (emAnalise.length > 0) {
          setSelectedPreMatricula(emAnalise[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar pré-matrículas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreMatriculas();
  }, [getUserAllowedPolos, hasAccessToAllPolos, selectedPoloId]);

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
          setTurmas(
            data.map((t: any) => ({
              id: String(t.id),
              nome: String(t.nome ?? t.id),
              polo_id: String(t.polo_id),
            })),
          );
        }
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
      }
    };

    void loadTurmas();
  }, []);

  // Carrega os documentos quando uma pré-matrícula é selecionada
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

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
  };

  const handleUploadSelectedFile = async () => {
    if (!selectedPreMatricula || !selectedFile) return;

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('files', selectedFile);

      await DocumentosAPI.uploadPorPreMatricula(selectedPreMatricula, formData, selectedDocumentType);

      const response = (await DocumentosAPI.listarPorPreMatricula(selectedPreMatricula)) as {
        arquivos?: Array<{ name: string; path: string; url: string }>;
      };
      setDocumentos(response?.arquivos || []);
      setSelectedFile(null);
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      alert('Erro ao enviar documento. Por favor, tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConcluir = async () => {
    if (!selectedPreMatricula) return;
    if (!currentUser?.id) {
      alert('Usuário não identificado. Faça login novamente.');
      return;
    }
    if (!selectedTurmaId) {
      alert('Selecione uma turma para concluir a pré-matrícula.');
      return;
    }
    if (!allRequiredDocumentsUploaded) {
      alert('Todos os documentos obrigatórios devem ser enviados antes de concluir.');
      return;
    }

    try {
      setIsConcluding(true);
      await PreMatriculasAPI.concluir(selectedPreMatricula, {
        turma_id: selectedTurmaId,
        approved_by: currentUser.id,
      });

      // Recarrega listagens (inclui remover da lista de em_analise/ativo se status virar concluido)
      await handleUpdateStatus('concluido');
    } catch (error) {
      console.error('Erro ao concluir pré-matrícula:', error);
      alert('Erro ao concluir pré-matrícula. Verifique o console.');
    } finally {
      setIsConcluding(false);
    }
  };

  const handleUpdateStatus = async (status: StatusPreMatricula) => {
    if (!selectedPreMatricula) return;

    try {
      await PreMatriculasAPI.atualizarStatus(selectedPreMatricula, { status });

      // Recarrega listagem e documentos
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

      const response = (await DocumentosAPI.listarPorPreMatricula(selectedPreMatricula)) as {
        arquivos?: Array<{ name: string; path: string; url: string }>;
      };
      setDocumentos(response?.arquivos || []);
    } catch (error) {
      console.error('Erro ao atualizar status da pré-matrícula:', error);
      alert('Erro ao atualizar status. Por favor, tente novamente.');
    }
  };

  // Verifica se um documento obrigatório está ausente
  const isDocumentMissing = (type: TipoDocumento) => {
    return !documentos.some((doc) => doc.path.toLowerCase().includes(`/${type.toLowerCase()}/`));
  };

  // Verifica se todos os documentos obrigatórios foram enviados
  const allRequiredDocumentsUploaded = REQUIRED_DOCUMENTS.every(
    doc => !isDocumentMissing(doc.type)
  );

  if (isLoading && !selectedPreMatricula) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/dashboard">Voltar</Link>
          </Button>
          <div className="h-32 w-32 flex items-center justify-center bg-white rounded-xl shadow-sm p-2">
            <img
              src="/icons/3d/student.png"
              alt="Gerenciamento de Matrículas"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Pré-matrículas</h1>
        </div>

        {hasAccessToAllPolos() && polos && polos.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 font-medium">Filtrar por Polo:</span>
            <select
              className="block w-full md:w-64 pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedPoloId}
              onChange={(e) => setSelectedPoloId(e.target.value)}
            >
              <option value="all">Todos os Polos</option>
              {polos.map((polo) => (
                <option key={polo.id} value={polo.id}>
                  {polo.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Indicação da visão atual: geral x polo específico */}
      <div className="mb-4">
        {hasAccessToAllPolos() ? (
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Visão:</span>{' '}
            {selectedPoloId === 'all'
              ? 'Visão geral de todos os polos.'
              : `Visão filtrada do polo "${polos.find(p => p.id === selectedPoloId)?.name || 'Polo selecionado'}".`}
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Visão:</span>{' '}
            Visão restrita ao seu polo de atuação. As matrículas listadas abaixo pertencem apenas ao seu polo.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de pré-matrículas em análise e ativas */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Pré-matrículas em análise</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {preMatriculasEmAnalise.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhuma pré-matrícula em análise
                </div>
              ) : (
                preMatriculasEmAnalise.map((preMatricula) => (
                  <button
                    key={preMatricula.id}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedPreMatricula === preMatricula.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedPreMatricula(preMatricula.id)}
                  >
                    <div className="font-medium text-gray-900">
                      {preMatricula.nome_completo}
                    </div>
                    <div className="text-sm text-gray-500">
                      CPF: {preMatricula.cpf}
                    </div>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Em análise
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Pré-matrículas ativas</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {preMatriculasAtivas.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhuma pré-matrícula ativa para o filtro selecionado
                </div>
              ) : (
                preMatriculasAtivas.map((preMatricula) => (
                  <div
                    key={preMatricula.id}
                    className="w-full text-left p-4 border-l-4 border-green-500 bg-green-50/40"
                  >
                    <div className="font-medium text-gray-900">
                      {preMatricula.nome_completo}
                    </div>
                    <div className="text-sm text-gray-500">
                      CPF: {preMatricula.cpf}
                    </div>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ativa
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Área de documentos */}
        <div className="lg:col-span-3 space-y-6">
          {selectedPreMatricula ? (
            <>
              {/* Informações da pré-matrícula */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Dados da Pré-matrícula
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  {(() => {
                    const preMatricula =
                      preMatriculasEmAnalise.find((p) => p.id === selectedPreMatricula) ||
                      preMatriculasAtivas.find((p) => p.id === selectedPreMatricula);

                    if (!preMatricula) {
                      return <p className="text-sm text-gray-500">Carregando informações...</p>;
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Nome Completo</p>
                          <p className="mt-1 text-sm text-gray-900">{preMatricula.nome_completo}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Data de Nascimento</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(preMatricula.data_nascimento).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">CPF</p>
                          <p className="mt-1 text-sm text-gray-900">{preMatricula.cpf}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Contato do Responsável</p>
                          <p className="mt-1 text-sm text-gray-900">{preMatricula.telefone_responsavel}</p>
                          <p className="mt-1 text-sm text-gray-900">{preMatricula.email_responsavel}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Upload de documentos */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Envio de Documentos
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Documento
                      </label>
                      <select
                        id="documentType"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={selectedDocumentType}
                        onChange={(e) => setSelectedDocumentType(e.target.value as TipoDocumento)}
                      >
                        {REQUIRED_DOCUMENTS.map((doc) => (
                          <option key={doc.type} value={doc.type}>
                            {doc.label}
                          </option>
                        ))}
                        <option value="outro">Outro Documento</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="documentValidity" className="block text-sm font-medium text-gray-700 mb-1">
                        Validade do Documento (opcional)
                      </label>
                      <input
                        type="date"
                        id="documentValidity"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={validadeDocumento}
                        onChange={(e) => setValidadeDocumento(e.target.value)}
                      />
                    </div>

                    <FileUpload
                      folder={`pre-matriculas/${selectedPreMatricula}`}
                      onUploadComplete={() => undefined}
                      onFileSelected={handleFileSelected}
                      autoUpload={false}
                      accept="image/*,.pdf,.doc,.docx"
                      maxSizeMB={10}
                      label={`Arraste e solte o arquivo do ${REQUIRED_DOCUMENTS.find(d => d.type === selectedDocumentType)?.label || 'documento'} aqui ou clique para selecionar`}
                    />

                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        onClick={() => void handleUploadSelectedFile()}
                        disabled={isUploading || !selectedFile}
                      >
                        Enviar documento
                      </Button>
                    </div>
                  </div>

                  {/* Lista de documentos obrigatórios */}
                  <div className="mt-8">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Documentos Obrigatórios</h4>
                    <ul className="space-y-2">
                      {REQUIRED_DOCUMENTS.map((doc) => {
                        const isMissing = isDocumentMissing(doc.type);
                        return (
                          <li key={doc.type} className="flex items-center">
                            {isMissing ? (
                              <svg
                                className="h-5 w-5 text-red-500"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="h-5 w-5 text-green-500"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            <span
                              className={`ml-2 text-sm ${
                                isMissing ? 'text-red-600' : 'text-gray-700'
                              }`}
                            >
                              {doc.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Lista de documentos enviados */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Documentos Enviados
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  {isLoading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documentos.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Nenhum documento enviado.</div>
                      ) : (
                        documentos.map((doc) => (
                          <div key={doc.path} className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                              <div className="text-xs text-gray-500 truncate">{doc.path}</div>
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:text-indigo-900"
                            >
                              Visualizar
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Ações</h3>
                </div>
                <div className="px-4 py-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-end gap-3">
                  <div className="w-full md:w-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
                    <select
                      className="block w-full md:w-80 pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={selectedTurmaId}
                      onChange={(e) => setSelectedTurmaId(e.target.value)}
                    >
                      <option value="">Selecione uma turma...</option>
                      {(() => {
                        const preMatricula =
                          preMatriculasEmAnalise.find((p) => p.id === selectedPreMatricula) ||
                          preMatriculasAtivas.find((p) => p.id === selectedPreMatricula);

                        const poloId = preMatricula?.polo_id;
                        const turmasFiltradas = poloId
                          ? turmas.filter((t) => t.polo_id === poloId)
                          : turmas;

                        return turmasFiltradas.map((turma) => (
                          <option key={turma.id} value={turma.id}>
                            {turma.nome}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>

                  <select
                    className="block pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    defaultValue=""
                    onChange={(e) => {
                      const status = e.target.value as StatusPreMatricula;
                      if (status) {
                        void handleUpdateStatus(status);
                      }
                      e.target.value = '';
                    }}
                  >
                    <option value="" disabled>
                      Alterar status...
                    </option>
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="primary"
                    onClick={() => void handleConcluir()}
                    disabled={isUploading || isConcluding || !allRequiredDocumentsUploaded || !selectedTurmaId}
                    title={
                      !allRequiredDocumentsUploaded
                        ? 'Todos os documentos obrigatórios devem ser enviados antes de aprovar.'
                        : !selectedTurmaId
                          ? 'Selecione uma turma antes de concluir.'
                        : ''
                    }
                  >
                    Concluir matrícula
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white shadow sm:rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma pré-matrícula selecionada</h3>
              <p className="mt-1 text-sm text-gray-500">
                Selecione uma pré-matrícula da lista ao lado para visualizar e gerenciar os documentos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentManagement;
