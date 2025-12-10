import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileUpload } from '../../components/ui/FileUpload';
import { DocumentList } from '../../components/DocumentList';
import { DocumentoService } from '../../services/documento.service';
import { MatriculaService } from '../../services/matricula.service';
import { AlunoService } from '../../services/aluno.service';
import { useApp } from '../../context/AppContext';
import Button from '../../components/ui/Button';
import type { TipoDocumento, Matricula, Aluno, Documento } from '../../types/database';

// Tipos de documentos necessários para matrícula
const REQUIRED_DOCUMENTS: { type: TipoDocumento; label: string }[] = [
  { type: 'cpf', label: 'CPF' },
  { type: 'rg', label: 'Documento de Identidade (RG)' },
  { type: 'certidao', label: 'Certidão de Nascimento' },
  { type: 'comprovante_residencia', label: 'Comprovante de Residência' },
];

export const EnrollmentManagement: React.FC = () => {
  const { currentUser, getUserAllowedPolos, hasAccessToAllPolos, polos } = useApp();
  const [matriculas, setMatriculas] = useState<Matricula[]>([]); // pendentes
  const [matriculasAtivas, setMatriculasAtivas] = useState<Matricula[]>([]);
  const [selectedMatricula, setSelectedMatricula] = useState<string | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<TipoDocumento>('cpf');
  const [validadeDocumento, setValidadeDocumento] = useState('');
  const [alunoInfo, setAlunoInfo] = useState<Aluno | null>(null);
  const [selectedPoloId, setSelectedPoloId] = useState<string>('all');

  // Carrega a lista de matrículas pendentes e ativas, respeitando o polo do usuário logado
  useEffect(() => {
    const loadMatriculas = async () => {
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

        const matriculasPendentes = await MatriculaService.listarMatriculas(poloFilter, 'pendente');
        const matriculasAtivasData = await MatriculaService.listarMatriculas(poloFilter, 'ativa');
        setMatriculas(matriculasPendentes);
        setMatriculasAtivas(matriculasAtivasData);
        
        // Seleciona a primeira matrícula se houver
        if (matriculasPendentes.length > 0) {
          setSelectedMatricula(matriculasPendentes[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar matrículas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMatriculas();
  }, [getUserAllowedPolos, hasAccessToAllPolos, selectedPoloId]);

  // Carrega os documentos quando uma matrícula é selecionada
  useEffect(() => {
    if (!selectedMatricula) return;

    const loadDocumentos = async () => {
      try {
        setIsLoading(true);
        const [documentosData, matriculaData] = await Promise.all([
          DocumentoService.listarDocumentos('aluno', selectedMatricula),
          MatriculaService.buscarMatriculaPorId(selectedMatricula)
        ]);
        
        setDocumentos(documentosData);
        
        // Carrega informações do aluno
        if (matriculaData?.aluno_id) {
          const aluno = await AlunoService.buscarAlunoPorId(matriculaData.aluno_id);
          setAlunoInfo(aluno);
        }
      } catch (error) {
        console.error('Erro ao carregar documentos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocumentos();
  }, [selectedMatricula]);

  // Manipula o upload de documentos
  const handleUploadComplete = async (fileUrl: string) => {
    if (!selectedMatricula) return;

    try {
      setIsUploading(true);
      
      // Aqui você pode adicionar lógica adicional se necessário
      console.log('Upload concluído:', fileUrl);
      
      // Atualiza a lista de documentos
      const documentosAtualizados = await DocumentoService.listarDocumentos('aluno', selectedMatricula);
      setDocumentos(documentosAtualizados);
    } catch (error) {
      console.error('Erro ao processar upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Remove um documento
  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      await DocumentoService.removerDocumento(documentId);
      
      // Atualiza a lista de documentos
      if (selectedMatricula) {
        const documentosAtualizados = await DocumentoService.listarDocumentos('aluno', selectedMatricula);
        setDocumentos(documentosAtualizados);
      }
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
    }
  };

  // Aprova uma matrícula
  const handleApproveEnrollment = async () => {
    if (!selectedMatricula || !currentUser?.id) return;

    try {
      if (window.confirm('Deseja aprovar esta matrícula?')) {
        await MatriculaService.atualizarStatusMatricula(
          selectedMatricula,
          'ativa',
          currentUser.id
        );
        
        // Atualiza a lista de matrículas (pendentes e ativas) respeitando o polo atual
        const allowedPolos = getUserAllowedPolos();
        let poloFilter: string | undefined;

        if (hasAccessToAllPolos()) {
          poloFilter = selectedPoloId === 'all' ? undefined : selectedPoloId;
        } else {
          poloFilter = allowedPolos[0] || undefined;
        }

        const matriculasPendentes = await MatriculaService.listarMatriculas(poloFilter, 'pendente');
        const matriculasAtivasData = await MatriculaService.listarMatriculas(poloFilter, 'ativa');
        setMatriculas(matriculasPendentes);
        setMatriculasAtivas(matriculasAtivasData);
        
        alert('Matrícula aprovada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao aprovar matrícula:', error);
      alert('Erro ao aprovar matrícula. Por favor, tente novamente.');
    }
  };

  // Recusa uma matrícula
  const handleRejectEnrollment = async () => {
    if (!selectedMatricula || !currentUser?.id) return;

    const motivo = window.prompt('Informe o motivo da recusa:');
    if (!motivo) return;

    try {
      await MatriculaService.atualizarStatusMatricula(
        selectedMatricula,
        'recusada',
        currentUser.id,
        motivo
      );
      
      // Atualiza a lista de matrículas (pendentes e ativas) respeitando o polo atual
      const allowedPolos = getUserAllowedPolos();
      let poloFilter: string | undefined;

      if (hasAccessToAllPolos()) {
        poloFilter = selectedPoloId === 'all' ? undefined : selectedPoloId;
      } else {
        poloFilter = allowedPolos[0] || undefined;
      }

      const matriculasPendentes = await MatriculaService.listarMatriculas(poloFilter, 'pendente');
      const matriculasAtivasData = await MatriculaService.listarMatriculas(poloFilter, 'ativa');
      setMatriculas(matriculasPendentes);
      setMatriculasAtivas(matriculasAtivasData);
      
      alert('Matrícula recusada com sucesso!');
    } catch (error) {
      console.error('Erro ao recusar matrícula:', error);
      alert('Erro ao recusar matrícula. Por favor, tente novamente.');
    }
  };

  // Verifica se um documento obrigatório está ausente
  const isDocumentMissing = (type: TipoDocumento) => {
    return !documentos.some(doc => doc.tipo_documento === type);
  };

  // Verifica se todos os documentos obrigatórios foram enviados
  const allRequiredDocumentsUploaded = REQUIRED_DOCUMENTS.every(
    doc => !isDocumentMissing(doc.type)
  );

  if (isLoading && !selectedMatricula) {
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
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Matrículas</h1>
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
        {/* Lista de matrículas pendentes e ativas */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Matrículas Pendentes</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {matriculas.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhuma matrícula pendente
                </div>
              ) : (
                matriculas.map((matricula) => (
                  <button
                    key={matricula.id}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedMatricula === matricula.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedMatricula(matricula.id)}
                  >
                    <div className="font-medium text-gray-900">
                      {matricula.aluno?.nome || 'Aluno não encontrado'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Protocolo: {matricula.protocolo}
                    </div>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pendente
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Matrículas Ativas</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {matriculasAtivas.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhuma matrícula ativa para o filtro selecionado
                </div>
              ) : (
                matriculasAtivas.map((matricula) => (
                  <div
                    key={matricula.id}
                    className="w-full text-left p-4 border-l-4 border-green-500 bg-green-50/40"
                  >
                    <div className="font-medium text-gray-900">
                      {matricula.aluno?.nome || 'Aluno não encontrado'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Protocolo: {matricula.protocolo}
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
          {selectedMatricula ? (
            <>
              {/* Informações do aluno */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Dados do Aluno
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  {alunoInfo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nome Completo</p>
                        <p className="mt-1 text-sm text-gray-900">{alunoInfo.nome}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Data de Nascimento</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(alunoInfo.data_nascimento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">CPF</p>
                        <p className="mt-1 text-sm text-gray-900">{alunoInfo.cpf || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Telefone</p>
                        <p className="mt-1 text-sm text-gray-900">{alunoInfo.telefone1 || 'Não informado'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Carregando informações do aluno...</p>
                  )}
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
                      folder={`matriculas/${selectedMatricula}`}
                      onUploadComplete={handleUploadComplete}
                      accept="image/*,.pdf,.doc,.docx"
                      maxSizeMB={10}
                      label={`Arraste e solte o arquivo do ${REQUIRED_DOCUMENTS.find(d => d.type === selectedDocumentType)?.label || 'documento'} aqui ou clique para selecionar`}
                    />
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
                    <DocumentList
                      documentos={documentos}
                      onDelete={handleDeleteDocument}
                      showValidation={true}
                    />
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Ações</h3>
                </div>
                <div className="px-4 py-5 sm:p-6 flex justify-end space-x-4">
                  <Button
                    asChild
                    variant="outline"
                    disabled={!selectedMatricula}
                  >
                    <Link to={selectedMatricula ? `/admin/enrollments/${selectedMatricula}/documentos` : '#'}>
                      Ver documentos (site)
                    </Link>
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleRejectEnrollment}
                    disabled={isUploading}
                  >
                    Recusar Matrícula
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleApproveEnrollment}
                    disabled={isUploading || !allRequiredDocumentsUploaded}
                    title={
                      !allRequiredDocumentsUploaded
                        ? 'Todos os documentos obrigatórios devem ser enviados antes de aprovar a matrícula.'
                        : ''
                    }
                  >
                    Aprovar Matrícula
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma matrícula selecionada</h3>
              <p className="mt-1 text-sm text-gray-500">
                Selecione uma matrícula da lista ao lado para visualizar e gerenciar os documentos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentManagement;
