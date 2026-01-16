import { api } from '../lib/api';

export type Documento = {
    id?: string;
    aluno_id?: string;
    tipo?: string;
    name: string;
    path: string;
    url: string;
    size?: number;
    created_at?: string;
    updated_at?: string;
    status_validacao?: 'pendente' | 'aprovado' | 'reprovado';
    observacoes?: string;
};

export type DocumentosResponse = {
    aluno_id: string;
    arquivos: Documento[];
};

export const DocumentosAPI = {
    listarPorAluno: (alunoId: string) => api.get<DocumentosResponse>(`/documentos/alunos/${alunoId}`),

    uploadDocumentos: (alunoId: string, files: File[], tipo?: string) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        const url = tipo
            ? `/documentos/alunos/${alunoId}?tipo=${encodeURIComponent(tipo)}`
            : `/documentos/alunos/${alunoId}`;

        return api.upload(url, formData);
    },
};
