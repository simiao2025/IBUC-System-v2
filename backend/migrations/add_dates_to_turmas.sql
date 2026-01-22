-- Migration: Refinamento do Modelo de Turma
-- Adiciona campos de data e flag de segurança para migração

ALTER TABLE turmas 
ADD COLUMN IF NOT EXISTS data_inicio DATE,
ADD COLUMN IF NOT EXISTS data_previsao_termino DATE,
ADD COLUMN IF NOT EXISTS data_conclusao DATE,
ADD COLUMN IF NOT EXISTS migracao_concluida BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN turmas.data_inicio IS 'Data oficial de início das aulas da turma';
COMMENT ON COLUMN turmas.data_previsao_termino IS 'Data prevista para o encerramento do módulo/turma';
COMMENT ON COLUMN turmas.data_conclusao IS 'Data real em que a turma foi concluída/encerrada';
COMMENT ON COLUMN turmas.migracao_concluida IS 'Flag que indica se os alunos aprovados do módulo anterior já foram migrados para esta turma';
