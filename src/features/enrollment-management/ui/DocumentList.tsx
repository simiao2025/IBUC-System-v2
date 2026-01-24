import React from 'react';
import { Documento, TipoDocumento } from '@/shared/model/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/shared/ui';

const getDocumentTypeLabel = (type: TipoDocumento): string => {
  const types: Record<TipoDocumento, string> = {
    certidao: 'CertidÃ£o de Nascimento',
    rg: 'Documento de Identidade (RG)',
    cpf: 'CPF',
    comprovante_residencia: 'Comprovante de ResidÃªncia',
    laudo: 'Laudo MÃ©dico',
    outro: 'Outro Documento',
  };
  return types[type] || type;
};

type DocumentListProps = {
  documentos: Documento[];
  onDelete?: (id: string) => void;
  onValidate?: (id: string, validado: boolean) => void;
  showActions?: boolean;
  showValidation?: boolean;
};

export const DocumentList: React.FC<DocumentListProps> = ({
  documentos,
  onDelete,
  onValidate,
  showActions = true,
  showValidation = false,
}) => {
  if (documentos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum documento cadastrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome do Arquivo
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data de Upload
            </th>
            {showValidation && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            )}
            {showActions && (
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                AÃ§Ãµes
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documentos.map((documento) => (
            <tr key={documento.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {getDocumentTypeLabel(documento.tipo_documento)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{documento.file_name}</div>
                <div className="text-xs text-gray-500 truncate max-w-xs">
                  {documento.url}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(documento.uploaded_at), "dd/MM/yyyy 'Ã s' HH:mm", { locale: ptBR })}
              </td>
              {showValidation && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${documento.validado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {documento.validado ? 'Validado' : 'Pendente'}
                  </span>
                </td>
              )}
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <a
                      href={documento.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Visualizar
                    </a>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(documento.id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        Excluir
                      </button>
                    )}
                    {showValidation && onValidate && (
                      <button
                        onClick={() => onValidate(documento.id, !documento.validado)}
                        className={`ml-4 ${documento.validado ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {documento.validado ? 'Invalidar' : 'Validar'}
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
