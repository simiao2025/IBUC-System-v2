-- ============================================
-- Migration: Adicionar campos de estado explícito
-- Fase 4.3 - Modelagem de Domínio Financeiro
-- ============================================
-- IMPORTANTE: Esta migration é ADITIVA, não destrutiva.
-- Preserva todos os dados existentes.
-- ============================================

-- 1. Adicionar campo 'titulo' se não existir (retrocompatibilidade)
ALTER TABLE mensalidades 
ADD COLUMN IF NOT EXISTS titulo TEXT DEFAULT 'Cobrança' NOT NULL;

-- 2. Adicionar campo 'updated_at' para auditoria
ALTER TABLE mensalidades 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Adicionar campo 'rejection_note' para motivos de rejeição de pagamentos
ALTER TABLE pagamentos 
ADD COLUMN IF NOT EXISTS rejection_note TEXT;

-- 4. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_mensalidade_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar trigger de atualização (se não existir)
DROP TRIGGER IF EXISTS trg_mensalidades_updated_at ON mensalidades;
CREATE TRIGGER trg_mensalidades_updated_at
  BEFORE UPDATE ON mensalidades
  FOR EACH ROW
  EXECUTE FUNCTION update_mensalidade_updated_at();

-- 6. Criar índices para queries frequentes
CREATE INDEX IF NOT EXISTS idx_mensalidades_status ON mensalidades(status);
CREATE INDEX IF NOT EXISTS idx_mensalidades_vencimento ON mensalidades(vencimento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status_gateway ON pagamentos(status_gateway);

-- 7. Comentários descritivos para documentação do schema
COMMENT ON COLUMN mensalidades.status IS 'Estado: pendente (aguardando), pago (confirmado), vencido (atraso)';
COMMENT ON COLUMN pagamentos.status_gateway IS 'Estado: pending (enviado), success (aprovado), failed (rejeitado)';
COMMENT ON COLUMN pagamentos.rejection_note IS 'Motivo da rejeição (preenchido pela diretoria)';

-- 8. Garantir que status default está correto
ALTER TABLE mensalidades 
ALTER COLUMN status SET DEFAULT 'pendente';

-- ============================================
-- Fim da Migration
-- ============================================
