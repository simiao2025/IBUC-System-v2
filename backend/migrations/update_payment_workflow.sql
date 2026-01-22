-- 1. Adicionar status 'aguardando_validacao' ao enum status_mensalidade
-- O PostgreSQL não permite IF NOT EXISTS em ALTER TYPE ADD VALUE em blocos de transação simples, 
-- então usamos uma função anônima para verificar.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'status_mensalidade' AND e.enumlabel = 'aguardando_validacao') THEN
        ALTER TYPE status_mensalidade ADD VALUE 'aguardando_validacao';
    END IF;
END $$;

-- 2. Atualizar a função da trigger para o novo fluxo
CREATE OR REPLACE FUNCTION update_mensalidade_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o pagamento for confirmado (sucesso), baixa a mensalidade
  IF NEW.status_gateway = 'success' THEN
    UPDATE mensalidades
    SET status = 'pago',
        pago_em = NEW.data_recebimento,
        comprovante_url = COALESCE(NEW.comprovante_url, comprovante_url)
    WHERE id = NEW.mensalidade_id;
  
  -- Se o pagamento estiver pendente mas tiver comprovante, coloca em validação
  ELSIF NEW.status_gateway = 'pending' AND NEW.comprovante_url IS NOT NULL THEN
    UPDATE mensalidades
    SET status = 'aguardando_validacao',
        comprovante_url = NEW.comprovante_url
    WHERE id = NEW.mensalidade_id;
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Garantir que a trigger existe (ela já foi definida no initial_schema, mas vamos reafirmar)
DROP TRIGGER IF EXISTS update_mensalidade_status ON pagamentos;
CREATE TRIGGER update_mensalidade_status AFTER INSERT OR UPDATE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION update_mensalidade_on_payment();
