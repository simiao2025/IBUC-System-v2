-- Migration 025: Unificação de Campos Planos de Alunos (Integridade Acadêmica) - REVISADA
-- Esta migration migra dados de 'endereco' (JSONB) para colunas planas dedicadas,
-- e garante que os campos de saúde estejam presentes e populados.

DO $$ 
BEGIN
    -- 1. Garantir que todas as colunas planas de SAÚDE existam (Alunos já costuma ter, mas garantimos paridade)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'alergias') THEN
        ALTER TABLE public.alunos ADD COLUMN alergias TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'restricao_alimentar') THEN
        ALTER TABLE public.alunos ADD COLUMN restricao_alimentar TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'medicacao_continua') THEN
        ALTER TABLE public.alunos ADD COLUMN medicacao_continua TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'doencas_cronicas') THEN
        ALTER TABLE public.alunos ADD COLUMN doencas_cronicas TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'contato_emergencia_nome') THEN
        ALTER TABLE public.alunos ADD COLUMN contato_emergencia_nome TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'contato_emergencia_telefone') THEN
        ALTER TABLE public.alunos ADD COLUMN contato_emergencia_telefone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'convenio_medico') THEN
        ALTER TABLE public.alunos ADD COLUMN convenio_medico TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'hospital_preferencia') THEN
        ALTER TABLE public.alunos ADD COLUMN hospital_preferencia TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'autorizacao_medica') THEN
        ALTER TABLE public.alunos ADD COLUMN autorizacao_medica BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'observacoes_medicas') THEN
        ALTER TABLE public.alunos ADD COLUMN observacoes_medicas TEXT;
    END IF;

    -- 2. Garantir que colunas de ENDEREÇO planas existam
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'cep') THEN
        ALTER TABLE public.alunos ADD COLUMN cep TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'rua') THEN
        ALTER TABLE public.alunos ADD COLUMN rua TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'numero') THEN
        ALTER TABLE public.alunos ADD COLUMN numero TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'complemento') THEN
        ALTER TABLE public.alunos ADD COLUMN complemento TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'bairro') THEN
        ALTER TABLE public.alunos ADD COLUMN bairro TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'cidade') THEN
        ALTER TABLE public.alunos ADD COLUMN cidade TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'estado') THEN
        ALTER TABLE public.alunos ADD COLUMN estado TEXT;
    END IF;

    -- 3. Migrar dados da coluna 'saude' (JSONB) SE ELA EXISTIR
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'saude') THEN
        EXECUTE 'UPDATE public.alunos SET 
          alergias = COALESCE(alergias, saude->>''alergias''),
          restricao_alimentar = COALESCE(restricao_alimentar, saude->>''restricao_alimentar''),
          medicacao_continua = COALESCE(medicacao_continua, saude->>''medicacao_continua''),
          doencas_cronicas = COALESCE(doencas_cronicas, saude->>''doencas_cronicas''),
          contato_emergencia_nome = COALESCE(contato_emergencia_nome, saude->>''contato_emergencia_nome''),
          contato_emergencia_telefone = COALESCE(contato_emergencia_telefone, saude->>''contato_emergencia_telefone''),
          convenio_medico = COALESCE(convenio_medico, saude->>''convenio_medico''),
          hospital_preferencia = COALESCE(hospital_preferencia, saude->>''hospital_preferencia''),
          autorizacao_medica = COALESCE(autorizacao_medica, (saude->>''autorizacao_medica'')::BOOLEAN, FALSE)
        WHERE saude IS NOT NULL';
        
        -- Remover coluna JSONB legada
        ALTER TABLE public.alunos DROP COLUMN saude;
    END IF;

    -- 4. Migrar dados da coluna 'endereco' (JSONB) SE ELA EXISTIR
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'endereco' AND data_type = 'jsonb') THEN
        EXECUTE 'UPDATE public.alunos SET 
          cep = COALESCE(cep, endereco->>''cep''),
          rua = COALESCE(rua, endereco->>''rua''),
          numero = COALESCE(numero, endereco->>''numero''),
          complemento = COALESCE(complemento, endereco->>''complemento''),
          bairro = COALESCE(bairro, endereco->>''bairro''),
          cidade = COALESCE(cidade, endereco->>''cidade''),
          estado = COALESCE(estado, endereco->>''estado'')
        WHERE endereco IS NOT NULL';

        -- Remover coluna JSONB legada
        ALTER TABLE public.alunos DROP COLUMN endereco;
    END IF;

END $$;

-- 5. Adicionar comentários explicativos
COMMENT ON TABLE public.alunos IS 'Tabela de alunos com schema unificado e flat para alta performance e integridade.';
