-- ============================================
-- Migration: Auditoria Financeira
-- Fase 4.6 - Persistência e Logs
-- ============================================

-- 1. Criar Tabela de Auditoria
CREATE TABLE IF NOT EXISTS financial_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('BILLING', 'PAYMENT', 'CONFIG')),
    entity_id UUID NOT NULL, -- ID da cobrança ou do pagamento
    action TEXT NOT NULL, -- CREATE, PUBLISH, INITIATE, UPLOAD_PROOF, APPROVE, REJECT
    previous_state JSONB, -- Estado antes da alteração
    new_state JSONB, -- Estado depois da alteração
    actor_id UUID, -- Quem fez a ação (pode ser null se sistema)
    metadata JSONB, -- Informações extras (motivo rejeição, IP, etc)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_entity_id ON financial_audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor_id ON financial_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON financial_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON financial_audit_logs(created_at);

-- 3. Comentários
COMMENT ON TABLE financial_audit_logs IS 'Registro imutável de todas as ações financeiras';
COMMENT ON COLUMN financial_audit_logs.entity_type IS 'Tipo da entidade afetada (BILLING ou PAYMENT)';
COMMENT ON COLUMN financial_audit_logs.actor_id IS 'ID do usuário que executou a ação (Aluno ou Admin)';
