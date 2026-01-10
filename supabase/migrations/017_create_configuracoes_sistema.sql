-- ============================================
-- Migração 017: Criar Tabela de Configurações do Sistema
-- ============================================

CREATE TABLE IF NOT EXISTS public.configuracoes_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT UNIQUE NOT NULL,
  valor JSONB NOT NULL,
  descricao TEXT,
  publica BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial data matching the frontend's default state in SystemSettings.tsx
INSERT INTO public.configuracoes_sistema (chave, valor, descricao, publica)
VALUES 
  ('ano_letivo', '"2024"', 'Ano letivo corrente', true),
  ('periodo_matricula', '{"start": "2024-01-01", "end": "2024-02-29"}', 'Período oficial de matrículas', true),
  ('horario_aulas', '{"startTime": "08:00", "endTime": "11:00", "daysOfWeek": ["sunday"]}', 'Horário padrão das aulas', true),
  ('notificacoes', '{"emailEnabled": true, "smsEnabled": false, "whatsappEnabled": true, "autoReminders": true}', 'Configurações de notificações', false),
  ('seguranca', '{"passwordMinLength": 8, "sessionTimeout": 120, "twoFactorRequired": false}', 'Parâmetros de segurança', false),
  ('backup', '{"frequency": "daily", "retention_days": 30, "last_backup": null}', 'Configurações de backup', false)
ON CONFLICT (chave) DO NOTHING;

-- Enable RLS
ALTER TABLE public.configuracoes_sistema ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Qualquer um pode ver configurações públicas" ON public.configuracoes_sistema;
CREATE POLICY "Qualquer um pode ver configurações públicas"
  ON public.configuracoes_sistema FOR SELECT
  USING (publica = true OR EXISTS (
    SELECT 1 FROM usuarios WHERE id = auth.uid()::UUID AND role IN ('admin_geral', 'diretor_geral', 'super_admin')
  ));

DROP POLICY IF EXISTS "Apenas admins podem atualizar configurações" ON public.configuracoes_sistema;
CREATE POLICY "Apenas admins podem atualizar configurações"
  ON public.configuracoes_sistema FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM usuarios WHERE id = auth.uid()::UUID AND role IN ('admin_geral', 'diretor_geral', 'super_admin')
  ));
