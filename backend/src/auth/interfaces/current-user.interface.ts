export interface CurrentUser {
    id: string;
    email: string;
    role: string;
    polo_id?: string | null;
    nome_completo: string;
    ativo: boolean;
}
