// ============================================
// IBUC System - Tipos do Supabase Database
// Gerado automaticamente pelo Supabase CLI
// Execute: npx supabase gen types typescript --project-id <project-id> > src/lib/database.types.ts
// ============================================

// Este arquivo será gerado automaticamente pelo Supabase CLI
// Por enquanto, definimos uma estrutura básica

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      polos: {
        Row: {
          id: string;
          nome: string;
          codigo: string;
          cnpj: string | null;
          endereco: Json;
          telefone: string | null;
          whatsapp: string | null;
          email: string | null;
          site: string | null;
          horarios_funcionamento: Json | null;
          capacidade_maxima: number | null;
          logo_url: string | null;
          diretor_id: string | null;
          status: 'ativo' | 'inativo';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['polos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['polos']['Insert']>;
      };
      // Adicionar outras tabelas conforme necessário
    };
    Views: {
      vw_aluno_progresso: {
        Row: {
          aluno_id: string;
          aluno_nome: string;
          polo_id: string;
          modulo_id: string;
          modulo_numero: number;
          modulo_titulo: string;
          total_licoes: number;
          licoes_concluidas: number;
          percentual_conclusao: number;
        };
      };
      vw_resumo_financeiro_aluno: {
        Row: {
          aluno_id: string;
          aluno_nome: string;
          polo_id: string;
          total_mensalidades: number;
          mensalidades_pagas: number;
          mensalidades_pendentes: number;
          mensalidades_vencidas: number;
          total_devido_cents: number;
          total_pago_cents: number;
          total_pendente_cents: number;
        };
      };
    };
    Functions: {
      get_user_polo_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      is_super_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
  };
}

