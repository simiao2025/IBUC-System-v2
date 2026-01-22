import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { Card } from '@/shared/ui';
import { useApp } from '@/app/providers/AppContext';
import { DocumentAPI } from '@/shared/api';
import type { Documento } from '@/shared/model/database';
import { FileText, Download, Upload, X } from 'lucide-react';

const AppDocumentos: React.FC = () => {
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(true);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocumentos();
  }, [currentUser]);

  const loadDocumentos = async () => {
    if (!currentUser || currentUser.role !== 'student' || !currentUser.studentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[AppDocumentos] Buscando documentos do aluno:', currentUser.studentId);

      const response = await DocumentAPI.listByStudent(currentUser.studentId);

      // A API retorna os dados diretamente: { aluno_id, arquivos: [] }
      // O cliente api.ts já faz o unwrap do response.json()
      const docs = response?.arquivos || [];

      console.log('[AppDocumentos] Documentos carregados:', docs.length);

      setDocumentos(Array.isArray(docs) ? docs : []);
    } catch (e) {
      console.error('[AppDocumentos] Erro ao carregar documentos:', e);
      setError('Não foi possível carregar os documentos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tiposMap: Record<string, string> = {
      rg: 'RG',
      cpf: 'CPF',
      certidao_nascimento: 'Certidão de Nascimento',
      comprovante_residencia: 'Comprovante de Residência',
      foto_3x4: 'Foto 3x4',
      historico_escolar: 'Histórico Escolar',
      outros: 'Outros',
    };
    return tiposMap[tipo] || tipo;
  };

  const handleDownload = (url: string, nomeArquivo: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!currentUser?.studentId || selectedFiles.length === 0) return;

    try {
      setUploading(true);
      setError(null);

      await DocumentAPI.uploadMultipleByStudent(currentUser.studentId, selectedFiles);

      // Recarregar lista de documentos
      await loadDocumentos();

      // Limpar seleção
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Mostrar feedback de sucesso (pode adicionar toast aqui)
    } catch (e) {
      console.error('Erro ao enviar documentos:', e);
      setError('Não foi possível enviar os documentos. Tente novamente mais tarde.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="secondary" size="sm" className="bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white">
          <Link to="/app/dashboard">Voltar</Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Documentos</h1>
      <p className="text-sm text-gray-600 mb-6">
        Lista de documentos enviados
      </p>

      {error && (
        <Card className="p-4 mb-4 border-l-4 border-red-500">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {/* Upload Section */}
      <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Upload className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Enviar novos documentos</h4>
            <p className="text-xs text-blue-700 mb-3">
              Você pode enviar documentos adicionais ou atualizados. Formatos aceitos: PDF e imagens.
            </p>

            <div className="space-y-3">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="application/pdf,image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    asChild
                  >
                    <span>Selecionar arquivos</span>
                  </Button>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700">Arquivos selecionados:</p>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {uploading ? 'Enviando...' : `Enviar ${selectedFiles.length} arquivo(s)`}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Carregando documentos...</p>
          </div>
        </Card>
      ) : documentos.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">Nenhum documento enviado ainda.</p>
            <p className="text-xs text-gray-400 mt-2">
              Use o formulário acima para enviar seus documentos.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <Card className="p-4 mb-3 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-yellow-900 mb-1">Sobre a validação de documentos</h4>
                <p className="text-xs text-yellow-700">
                  Os documentos enviados estão disponíveis para a secretaria. Em caso de pendências,
                  você será contatado para regularizar a situação.
                </p>
              </div>
            </div>
          </Card>

          {documentos
            .sort((a, b) => {
              const dateA = new Date(a.uploaded_at || 0).getTime();
              const dateB = new Date(b.uploaded_at || 0).getTime();
              return dateB - dateA;
            })
            .map((doc) => {
              return (
                <Card key={doc.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {doc.file_name}
                          </h3>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {getTipoLabel(doc.tipo_documento || 'outros')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {doc.uploaded_at && (
                            <span>
                              Enviado em {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {doc.url && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDownload(doc.url, doc.file_name)}
                          className="flex items-center gap-1.5"
                        >
                          <Download className="h-4 w-4" />
                          Baixar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default AppDocumentos;
