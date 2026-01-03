import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ArrowLeft, FileText } from 'lucide-react';
import { MatriculaAPI as DocumentosAPI } from './matricula.service';

interface DocumentoMatricula {
  name: string;
  path: string;
  url?: string;
  size?: number;
  created_at?: string;
  updated_at?: string;
}

interface ListaDocumentosResponse {
  matricula_id: string;
  arquivos: DocumentoMatricula[];
}

const MatriculaDocumentManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ListaDocumentosResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const resp: ListaDocumentosResponse = await DocumentosAPI.listarPorMatricula(id);
        setData(resp);
      } catch (err: any) {
        console.error('Erro ao carregar documentos da matrícula:', err);
        setError(err.message || 'Erro ao carregar documentos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatSize = (size?: number) => {
    if (!size) return '-';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-6 w-6 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Documentos da Matrícula</h1>
          </div>

          {loading && <p className="text-sm text-gray-500">Carregando documentos...</p>}
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          {!loading && !error && (
            <>
              {(!data || data.arquivos.length === 0) && (
                <p className="text-sm text-gray-500">Nenhum documento encontrado para esta matrícula.</p>
              )}

              {data && data.arquivos.length > 0 && (
                <div className="mt-4 space-y-2">
                  {data.arquivos.map((doc) => (
                    <a
                      key={doc.path}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.path}</p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>{formatSize(doc.size)}</p>
                        {doc.created_at && (
                          <p>{new Date(doc.created_at).toLocaleString('pt-BR')}</p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MatriculaDocumentManagement;
