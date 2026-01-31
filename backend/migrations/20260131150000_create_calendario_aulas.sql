-- Create calendario_aulas table
CREATE TABLE IF NOT EXISTS calendario_aulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    modulo_id UUID REFERENCES modulos(id) ON DELETE SET NULL,
    licao_id UUID REFERENCES licoes(id) ON DELETE CASCADE,
    data_aula DATE NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendario_turma ON calendario_aulas(turma_id);
CREATE INDEX IF NOT EXISTS idx_calendario_data ON calendario_aulas(data_aula);
CREATE INDEX IF NOT EXISTS idx_calendario_turma_data ON calendario_aulas(turma_id, data_aula);

-- Add comments
COMMENT ON TABLE calendario_aulas IS 'Agendamento de aulas/lições específicas para turmas';
COMMENT ON COLUMN calendario_aulas.data_aula IS 'Data em que a aula será ministrada';
