-- Adicionar o valor 'ativa' ao enum status_matricula
-- O Backend está tentando inserir 'ativa', mas o banco provavelmente só tem 'ativo' ou outros valores.
-- Este comando permitirá que o valor 'ativa' seja aceito.
ALTER TYPE status_matricula ADD VALUE IF NOT EXISTS 'ativa';
