-- Migration: Create notificacoes table
-- Description: Table to store in-app notifications for students, teachers and staff.

DROP TABLE IF EXISTS public.notificacoes CASCADE;

CREATE TABLE public.notificacoes (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    link TEXT,
    tipo TEXT NOT NULL, -- 'cobranca', 'aviso', 'sistema', 'inicio_aulas'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON public.notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);

-- RLS (Row Level Security)
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications"
    ON public.notificacoes FOR SELECT
    USING (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own notifications (mark as read)"
    ON public.notificacoes FOR UPDATE
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

-- Greet trigger for updated_at
CREATE OR REPLACE FUNCTION update_notificacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_notificacoes_updated_at
BEFORE UPDATE ON public.notificacoes
FOR EACH ROW
EXECUTE FUNCTION update_notificacoes_updated_at();
