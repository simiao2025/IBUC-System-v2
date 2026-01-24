-- Migration 026: RPC de Lançamento Atômico de Frequência e Drácmas
-- Esta função realiza o lançamento de presenças e recompensas em um único bloco transacional,
-- garantindo que não existam estados intermediários (ex: presença sem drácma).

CREATE OR REPLACE FUNCTION public.lancar_frequencia_completa(
    p_turma_id UUID,
    p_data DATE,
    p_licao_id UUID,
    p_registrado_por UUID,
    p_presencas JSONB, -- Formato: [{aluno_id, status, observacao}]
    p_dracmas JSONB    -- Formato: [{aluno_id, quantidade, tipo, descricao}]
) RETURNS JSONB AS $$
DECLARE
    v_presenca RECORD;
    v_dracma RECORD;
    v_total_presencas INTEGER := 0;
    v_total_dracmas INTEGER := 0;
BEGIN
    -- 1. Limpeza de registros anteriores (Garantir Idempotência)
    -- Remove presenças anteriores para a mesma lição/dia
    DELETE FROM public.presencas 
    WHERE turma_id = p_turma_id 
      AND data = p_data 
      AND (licao_id = p_licao_id OR (p_licao_id IS NULL AND licao_id IS NULL));

    -- Remove drácmas anteriores do tipo 'presenca' para a mesma lição/dia
    DELETE FROM public.dracmas_transacoes
    WHERE turma_id = p_turma_id 
      AND data = p_data 
      AND tipo IN ('presenca', 'assiduidade');

    -- 2. Inserção de Presenças em Lote
    FOR v_presenca IN SELECT * FROM jsonb_to_recordset(p_presencas) AS x(aluno_id UUID, status TEXT, observacao TEXT)
    LOOP
        INSERT INTO public.presencas (aluno_id, turma_id, licao_id, data, status, observacao)
        VALUES (v_presenca.aluno_id, p_turma_id, p_licao_id, p_data, v_presenca.status, v_presenca.observacao);
        v_total_presencas := v_total_presencas + 1;
    END LOOP;

    -- 3. Inserção de Drácmas em Lote
    FOR v_dracma IN SELECT * FROM jsonb_to_recordset(p_dracmas) AS x(aluno_id UUID, quantidade INTEGER, tipo TEXT, descricao TEXT)
    LOOP
        INSERT INTO public.dracmas_transacoes (aluno_id, turma_id, data, quantidade, tipo, descricao, registrado_por)
        VALUES (v_dracma.aluno_id, p_turma_id, p_data, v_dracma.quantidade, v_dracma.tipo, v_dracma.descricao, p_registrado_por);
        v_total_dracmas := v_total_dracmas + 1;
    END LOOP;

    -- 4. Retorno de Sucesso
    RETURN jsonb_build_object(
        'success', true,
        'presencas_contagem', v_total_presencas,
        'dracmas_contagem', v_total_dracmas,
        'data_processamento', now()
    );

EXCEPTION WHEN OTHERS THEN
    -- O PostgreSQL faz rollback automático em funções, mas capturamos para retornar erro amigável
    RAISE EXCEPTION 'Erro ao lançar frequência atômica: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.lancar_frequencia_completa IS 'Orquestra o lançamento atômico de frequências e recompensas em drácmas em uma única transação SQL.';
