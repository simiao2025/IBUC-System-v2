-- Adicionar campos de endereço à lista de espera para match de Polo
ALTER TABLE lista_espera ADD COLUMN IF NOT EXISTS cidade TEXT;
ALTER TABLE lista_espera ADD COLUMN IF NOT EXISTS bairro TEXT;

-- Comentários para documentação
COMMENT ON COLUMN lista_espera.cidade IS 'Cidade do interessado para sugestão de Polo';
COMMENT ON COLUMN lista_espera.bairro IS 'Bairro do interessado para sugestão de Polo';
