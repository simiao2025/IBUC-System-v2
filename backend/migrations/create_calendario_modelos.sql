-- Create calendario_modelos table
CREATE TABLE IF NOT EXISTS calendario_modelos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    modulo_id UUID NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
    ano INTEGER NOT NULL,
    semestre INTEGER,
    turno VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendario_modelo_dias table
CREATE TABLE IF NOT EXISTS calendario_modelo_dias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    modelo_id UUID NOT NULL REFERENCES calendario_modelos(id) ON DELETE CASCADE,
    data_aula DATE NOT NULL,
    licao_id UUID REFERENCES licoes(id) ON DELETE SET NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_calendario_modelo_modulo ON calendario_modelos(modulo_id);
CREATE INDEX IF NOT EXISTS idx_calendario_modelo_dias_modelo ON calendario_modelo_dias(modelo_id);

-- Comments
COMMENT ON TABLE calendario_modelos IS 'Gabaritos/Modelos de calendário de aulas para serem reutilizados em turmas';
COMMENT ON TABLE calendario_modelo_dias IS 'Dias e lições definidos em um modelo de calendário';
