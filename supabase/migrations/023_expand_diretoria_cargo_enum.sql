-- Expandir o ENUM de cargos da diretoria para incluir 1º e 2º secretários/tesoureiros
-- Isso resolve o erro ao salvar cargos específicos no polo e na diretoria geral.

ALTER TYPE tipo_cargo_diretoria ADD VALUE IF NOT EXISTS 'primeiro_secretario';
ALTER TYPE tipo_cargo_diretoria ADD VALUE IF NOT EXISTS 'segundo_secretario';
ALTER TYPE tipo_cargo_diretoria ADD VALUE IF NOT EXISTS 'primeiro_tesoureiro';
ALTER TYPE tipo_cargo_diretoria ADD VALUE IF NOT EXISTS 'segundo_tesoureiro';
