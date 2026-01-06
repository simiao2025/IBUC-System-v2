// ============================================
// IBUC System - Cliente Supabase (Frontend)
// Este cliente usa ANON_KEY e respeita o RLS
// ============================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Variáveis de ambiente (configurar no .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase URL ou Anon Key não configurados.\n' +
    'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local'
  );
}

// Cliente Supabase para uso no frontend
// Usa ANON_KEY que respeita o RLS (Row Level Security)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper para obter o usuário autenticado
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper para fazer logout
export const logout = async () => {
  await supabase.auth.signOut();
};

// Helper para definir o contexto do polo no RLS
export const setPoloContext = async (poloId: string) => {
  const { data, error } = await supabase.rpc('set_polo_context', { polo_id: poloId });
  if (error) {
    console.error('Erro ao definir contexto do polo:', error);
  }
  return { data, error };
};

