// ============================================
// IBUC System - Cliente Supabase Admin (Service Role)
// ⚠️ ATENÇÃO: Este cliente BYPASSA o RLS!
// Use APENAS em:
// - Edge Functions
// - Servidores backend
// - Scripts administrativos
// NUNCA use no frontend!
// ============================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// ⚠️ SERVICE_ROLE_KEY só deve estar disponível no backend
// No frontend, esta variável NÃO deve estar definida
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificar se estamos no ambiente correto
if (typeof window !== 'undefined' && serviceRoleKey) {
  console.error(
    '⚠️ ERRO CRÍTICO DE SEGURANÇA: SERVICE_ROLE_KEY não deve ser usada no frontend!'
  );
  throw new Error('SERVICE_ROLE_KEY não pode ser usada no código do cliente');
}

// Cliente admin (apenas para uso em Edge Functions/Backend)
export const supabaseAdmin = serviceRoleKey
  ? createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Helper para operações administrativas
 * ⚠️ Use apenas em Edge Functions ou backend
 */
export const getAdminClient = () => {
  if (!supabaseAdmin) {
    throw new Error(
      'SERVICE_ROLE_KEY não configurada. Este cliente só funciona no backend.'
    );
  }
  return supabaseAdmin;
};

