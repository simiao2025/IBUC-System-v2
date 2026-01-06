
-- Tabela de Certificados
CREATE TABLE IF NOT EXISTS certificados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID REFERENCES alunos(id) NOT NULL,
  modulo_id UUID REFERENCES modulos(id), -- Opcional: nulo se for certificado de curso completo
  turma_id UUID REFERENCES turmas(id),
  tipo VARCHAR(20) CHECK (tipo IN ('modulo', 'curso_completo', 'participacao')) NOT NULL,
  data_emissao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  codigo_validacao VARCHAR(50) UNIQUE DEFAULT encode(gen_random_bytes(10), 'hex'),
  url_arquivo TEXT,
  emitido_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_certificados_aluno ON certificados(aluno_id);
CREATE INDEX IF NOT EXISTS idx_certificados_modulo ON certificados(modulo_id);
CREATE INDEX IF NOT EXISTS idx_certificados_codigo ON certificados(codigo_validacao);

-- RLS (Row Level Security)
ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Admins podem ver todos os certificados" 
  ON certificados FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.role::text IN ('super_admin', 'admin_geral', 'diretor_geral', 'coordenador_geral', 'secretario_geral')
    )
  );

CREATE POLICY "Alunos podem ver seus próprios certificados" 
  ON certificados FOR SELECT 
  USING (
    aluno_id IN (
      SELECT id FROM alunos WHERE usuario_id = auth.uid()
    )
  );

-- Apenas admins podem criar certificados (por enquanto, via API/Sistema)
CREATE POLICY "Admins podem criar certificados" 
  ON certificados FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.role::text IN ('super_admin', 'admin_geral', 'secretario_geral')
    )
  );
