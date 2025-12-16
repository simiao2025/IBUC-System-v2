# FASE 4 — Pré-matrícula Pública (Design)

## 1. Campos do Formulário de Pré-matrícula

### Dados do Aluno
- **nome_completo**: Texto (obrigatório, min 3 caracteres)
- **data_nascimento**: Date (obrigatório, deve ser >= 5 anos)
- **cpf**: Texto (obrigatório, 11 dígitos, validação formato)
- **rg**: Texto (obrigatório)
- **orgao_expedidor**: Texto (obrigatório)
- **data_expedicao**: Date (obrigatório)
- **sexo**: Enum ['M', 'F'] (obrigatório)
- **telefone**: Texto (obrigatório, formato celular)
- **email**: Texto (obrigatório, validação email)
- **naturalidade**: Texto (obrigatório)
- **nacionalidade**: Texto (obrigatório, default: "Brasileira")

### Endereço
- **cep**: Texto (obrigatório, 8 dígitos)
- **logradouro**: Texto (obrigatório)
- **numero**: Texto (obrigatório)
- **complemento**: Texto (opcional)
- **bairro**: Texto (obrigatório)
- **municipio**: Texto (obrigatório)
- **estado**: Texto (obrigatório, 2 caracteres UF)

### Dados Escolares
- **nivel_desejado**: Enum ['Nivel I'] (obrigatório, para crianças de 2 a 5 anos)
- **ano_letivo**: Integer (obrigatório, default: ano atual)
- **escola_origem**: Texto (opcional)
- **possui_deficiencia**: Boolean (obrigatório)
- **tipo_deficiencia**: Texto (opcional, se possuir_deficiencia = true)
- **necessidade_atendimento_especial**: Boolean (opcional)

### Informações Adicionais
- **como_conheceu_ibuc**: Texto (opcional)
- **observacoes**: Texto (opcional, max 500 caracteres)

## 2. Documentos Exigidos para Upload

### Documentos Obrigatórios
- **cpf_aluno**: PDF/Imagem (frente e verso)
- **rg_aluno**: PDF/Imagem (frente e verso)
- **certidao_nascimento**: PDF/Imagem
- **comprovante_residencia**: PDF (conta de luz/água/telefone, máximo 90 dias)
- **foto_aluno**: Imagem (3x4, fundo branco)

### Documentos do Responsável (se menor de 18)
- **cpf_responsavel**: PDF/Imagem (frente e verso)
- **rg_responsavel**: PDF/Imagem (frente e verso)
- **comprovante_renda**: PDF (opcional, para análise de bolsa)

### Documentos Adicionais (se aplicável)
- **laudo_medico**: PDF (se possuir deficiência/necessidade especial)
- **declaracao_escolar_anterior**: PDF (histórico escolar)
- **certificado_vacina**: PDF (carteira de vacinação)

## 3. Estados do Processo

### Fluxo de Pré-matrícula
1. **rascunho**: Formulário iniciado, não enviado
2. **enviado**: Formulário completo e documentos anexados
3. **em_analise**: Documentação em verificação pela secretaria
4. **aprovado**: Pré-matrícula aprovada, aguardando vaga
5. **rejeitado**: Documentação incompleta ou irregular
6. **cancelado**: Solicitação cancelada pelo responsável
7. **convertido**: Convertido em matrícula formal

### Sub-estados de Análise
- **aguardando_documento**: Documento específico solicitado
- **analise_documental**: Verificação de autenticidade
- **analise_pedagogica**: Avaliação de vaga/série
- **lista_espera**: Sem vaga disponível, em fila de espera

## 4. Ações Administrativas Possíveis

### Por Secretário(a)
- **visualizar**: Ver todos os dados e documentos
- **solicitar_documento**: Enviar notificação para documento faltante
- **aprovar**: Aprovar pré-matrícula
- **rejeitar**: Rejeitar com justificativa
- **converter**: Gerar matrícula formal a partir da pré-matrícula
- **adicionar_lista_espera**: Colocar em fila de espera
- **adicionar_observacao**: Anotações internas

### Por Diretor(a)
- **supervisionar**: Visualizar todas as pré-matrículas
- **priorizar**: Marcar como prioridade (casos especiais)
- **autorizar_vaga_extra**: Aprovar vagas além do limite
- **relatorios**: Gerar relatórios estatísticos

### Por Coordenador(a)
- **validar_pedagogico**: Verificar adequação série/idade
- **sugerir_turma**: Indicar turma específica
- **avaliar_necessidades**: Analisar necessidades especiais

## 5. Regras de Validação

### Validações de Formulário
- **idade mínima**: 2 anos completos na data da matrícula (Nível I - crianças de 2 a 5 anos)
- **cpf único**: CPF não pode existir no sistema (alunos ou responsáveis)
- **email único**: Email não pode existir em outra pré-matrícula ativa
- **campos obrigatórios**: Todos os campos marcados como obrigatório
- **formato documentos**: Apenas PDF, JPG, PNG (máximo 5MB por arquivo)

### Validações de Negócio
- **faixa_etaria_nivel**: Verificar compatibilidade idade (2-5 anos) com Nível I
- **vagas_disponiveis**: Verificar capacidade da turma/nível
- **dependencias**: Documentos do responsável se aluno < 18 anos
- **regionalizacao**: Verificar disponibilidade por polo/região

### Validações de Documentos
- **validade_comprovante**: Máximo 90 dias
- **clareza_imagem**: Mínimo de qualidade para leitura
- **completude**: Todos os documentos obrigatórios
- **autenticidade**: Verificação básica de documentos

### Regras de Fluxo
- **unidade_cpf**: Um CPF só pode ter uma pré-matrícula ativa
- **ordem_cronologica**: Processamento por data de envio
- **prioridade**: Irmãos de alunos ativos têm prioridade
- **limite_tempo**: Pré-matrícula expira em 30 dias sem interação

## 6. Notificações e Comunicação

### Para Responsável
- **confimacao_envio**: Email de recebimento da solicitação
- **solicitacao_documento**: Notificação de documento pendente
- **resultado_analise**: Email de aprovação/rejeição
- **convocacao_matricula**: Chamada para formalizar matrícula

### Para Administradores
- **nova_pre_matricula**: Alerta de nova solicitação
- **documento_pendente**: Lembrete de documentos faltando
- **expiracao_prazo**: Alerta de pré-matrículas próximas ao vencimento

## 7. Relatórios e Dashboards

### Indicadores Principais
- **total_pre_matriculas**: Por período, polo, nível
- **taxa_conversao**: De pré-matrícula para matrícula formal
- **tempo_medio_analise**: Tempo médio de processamento
- **motivos_rejeicao**: Principais motivos de rejeição
- **fila_espera**: Quantidade por nível/polo

### Filtros Disponíveis
- **período**: Data de envio
- **polo_id**: Unidade específica
- **nivel_desejado**: Nível desejado
- **status**: Estado atual
- **responsavel**: Por responsável (CPF/nome)
