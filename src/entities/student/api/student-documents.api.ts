import { api } from '@/shared/api';

export type StudentDocument = {
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

export type StudentDocumentsResponse = {
    aluno_id: string;
    arquivos: StudentDocument[];
};

export const studentDocumentsApi = {
    listarPorAluno: (alunoId: string) => api.get<StudentDocumentsResponse>(`/documentos/alunos/${alunoId}`),

    uploadDocumentos: (alunoId: string, files: File[], tipo?: string) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        const url = tipo
            ? `/documentos/alunos/${alunoId}?tipo=${encodeURIComponent(tipo)}`
            : `/documentos/alunos/${alunoId}`;

        return api.upload(url, formData);
    },
    listarPorPreMatricula: (preMatriculaId: string) => api.get<StudentDocumentsResponse>(`/documentos/pre-matriculas/${preMatriculaId}`),

    listarPorMatricula: (matriculaId: string) => api.get<StudentDocumentsResponse>(`/documentos/matriculas/${matriculaId}`),

    uploadPorPreMatricula: (preMatriculaId: string, formData: FormData, tipo?: string) => {
        const url = tipo
            ? `/documentos/pre-matriculas/${preMatriculaId}?tipo=${encodeURIComponent(tipo)}`
            : `/documentos/pre-matriculas/${preMatriculaId}`;
        return api.upload(url, formData);
    },
};
