# FASE 4 - PRÉ-MATRÍCULA PÚBLICA
# Guia de Implementação e Próximos Passos

## Resumo da Implementação

A Fase 4 implementou completamente a funcionalidade de pré-matrícula pública conforme o PRD v2, com:

### 1. Schema Completo
- **6 tabelas principais**: `pre_matriculas`, `pre_matricula_documentos`, `pre_matricula_historico`, `pre_matricula_upload_tokens`, `notificacoes`, `email_templates`
- **4 enums**: `status_pre_matricula`, `nivel_ensino`, `tipo_documento`, `sexo`
- **Índices otimizados** para performance e unicidade
- **Constraints** para integridade de dados

### 2. Segurança Multi-tenant
- **RLS Policies** para controle de acesso granular
- **Functions SECURITY DEFINER** para operações administrativas
- **Validações de permissão** por polo e role
- **Proteção contra vazamento de dados** entre polos

### 3. Validações de Negócio
- **Idade mínima**: 2 anos para Nível I (validado automaticamente)
- **CPF único**: Impede duplicidade de pré-matrículas ativas
- **Email único**: Evita múltiplas solicitações
- **Transições de status**: Fluxo controlado e validado
- **Documentos obrigatórios**: Verificação automática antes do envio

### 4. Sistema de Documentos
- **Upload seguro** com tokens temporários
- **Validação de arquivos** (tamanho, MIME type, checksum)
- **Storage integration** pronto para Supabase Storage
- **Controle de versão** e histórico de alterações

### 5. Sistema de Notificações
- **Email templates** configuráveis
- **Notificações automáticas** via triggers
- **Fila de processamento** com retry
- **Templates personalizáveis** por polo

## Arquivos Gerados

1. **`fase4_consolidated.sql`** - SQL completo para execução
2. **`fase4_schema.sql`** - Schema detalhado
3. **`fase4_rls_policies.sql`** - Políticas de segurança
4. **`fase4_functions.sql`** - Functions administrativas
5. **`fase4_triggers.sql`** - Triggers de validação
6. **`fase4_storage.sql`** - Sistema de upload
7. **`fase4_notifications.sql`** - Sistema de notificações
8. **`fase4_pre_matricula_design.md`** - Design original

## Próximos Passos para Frontend

### 1. Setup Inicial
```bash
# Executar SQL consolidado
psql $DATABASE_URL -f fase4_consolidated.sql

# Criar storage bucket manualmente via Supabase Dashboard
# Bucket: pre-matricula-docs
# Público: false
# Tamanho máximo: 5MB
# MIME types: application/pdf, image/jpeg, image/png, image/webp
```

### 2. Components React

#### Formulário de Pré-matrícula
```typescript
// components/PreMatriculaForm.tsx
interface PreMatriculaFormData {
  // Dados do aluno
  nome_completo: string;
  data_nascimento: string;
  cpf: string;
  // ... demais campos
  
  // Documentos
  documentos: {
    tipo: TipoDocumento;
    arquivo: File;
  }[];
}
```

#### Upload de Documentos
```typescript
// services/documentUpload.ts
export class DocumentUploadService {
  async gerarUploadToken(preMatriculaId: string, tipo: TipoDocumento, arquivo: File): Promise<string> {
    // Chamar public.gerar_upload_token()
  }
  
  async uploadArquivo(token: string, arquivo: File): Promise<void> {
    // Upload para Supabase Storage
    // Chamar public.completar_upload()
  }
}
```

#### Dashboard Administrativo
```typescript
// components/AdminDashboard.tsx
export const AdminDashboard = () => {
  const { data: preMatriculas } = useQuery({
    queryKey: ['pre-matriculas'],
    queryFn: () => supabase.rpc('listar_pre_matriculas', {
      p_polo_id: userPoloId,
      p_status: selectedStatus
    })
  });
  
  // Actions: aprovar, rejeitar, solicitar documento, etc.
};
```

### 3. API Endpoints

#### Públicos (sem autenticação)
```typescript
// POST /api/pre-matricula
export async function criarPreMatricula(data: PreMatriculaFormData) {
  const { data: id } = await supabase.rpc('criar_pre_matricula', {
    // ... parâmetros
  });
  return id;
}
```

#### Protegidos (admin)
```typescript
// POST /api/pre-matricula/:id/aprovar
export async function aprovarPreMatricula(id: string, observacoes?: string) {
  return await supabase.rpc('aprovar_pre_matricula', {
    p_pre_matricula_id: id,
    p_observacoes_admin: observacoes
  });
}
```

### 4. Estados do Formulário

```typescript
// hooks/usePreMatriculaForm.ts
export const usePreMatriculaForm = () => {
  const [etapa, setEtapa] = useState<'dados' | 'documentos' | 'confirmacao'>('dados');
  const [preMatriculaId, setPreMatriculaId] = useState<string | null>(null);
  
  const salvarDados = async (dados: PreMatriculaFormData) => {
    const id = await criarPreMatricula(dados);
    setPreMatriculaId(id);
    setEtapa('documentos');
  };
  
  const enviarParaAnalise = async () => {
    await supabase.rpc('enviar_pre_matricula', {
      p_pre_matricula_id: preMatriculaId
    });
    setEtapa('confirmacao');
  };
  
  return { etapa, salvarDados, enviarParaAnalise };
};
```

### 5. Validações Client-side

```typescript
// utils/validations.ts
export const validateCPF = (cpf: string): boolean => {
  // Validação de CPF
};

export const validateIdade = (dataNascimento: string): boolean => {
  const idade = differenceInYears(new Date(), new Date(dataNascimento));
  return idade >= 2 && idade <= 5;
};

export const validateFile = (file: File): boolean => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  
  return file.size <= maxSize && allowedTypes.includes(file.type);
};
```

### 6. Notificações em Tempo Real

```typescript
// hooks/useRealtimeNotifications.ts
export const useRealtimeNotifications = (preMatriculaId: string) => {
  useEffect(() => {
    const channel = supabase
      .channel(`pre-matricula-${preMatriculaId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'pre_matriculas',
        filter: `id=eq.${preMatriculaId}`
      }, (payload) => {
        // Atualizar status na UI
        // Mostrar notificação toast
      })
      .subscribe();
      
    return () => supabase.removeChannel(channel);
  }, [preMatriculaId]);
};
```

## Configurações Adicionais

### 1. Cron Jobs
```sql
-- Limpeza automática (requer pg_cron)
SELECT cron.schedule('cleanup-pre-matricula-drafts', '0 2 * * *', 'SELECT public.cleanup_old_drafts();');
SELECT cron.schedule('cleanup-upload-tokens', '0 */6 * * *', 'SELECT public.limpar_tokens_expirados();');
SELECT cron.schedule('process-notificacoes', '*/5 * * * *', 'SELECT public.processar_notificacoes_pendentes();');
```

### 2. Variáveis de Ambiente
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Configurações de email (se necessário)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@ibuc.com.br
SMTP_PASS=your_smtp_password
```

### 3. Permissões Adicionais
```sql
-- Para desenvolvimento
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.polos TO anon; -- Para seleção de polo no formulário

-- Para produção
-- Ajustar policies conforme necessário
```

## Testes Recomendados

### 1. Testes de Integração
- [ ] Criar pré-matrícula completa
- [ ] Upload de todos os documentos obrigatórios
- [ ] Envio para análise
- [ ] Aprovação/rejeição administrativa
- [ ] Conversão para matrícula formal

### 2. Testes de Segurança
- [ ] Acesso cross-polo (não deve permitir)
- [ ] Manipulação de status (deve seguir fluxo)
- [ ] Upload de arquivos maliciosos
- [ ] Injeção SQL nos campos

### 3. Testes de Performance
- [ ] Upload de arquivos grandes
- [ ] Múltiplas pré-matrículas simultâneas
- [ ] Consultas com grande volume de dados

## Deploy

### 1. Database
```bash
# Executar migração
supabase db push --schema=public
```

### 2. Storage
```bash
# Criar bucket via dashboard ou CLI
supabase storage new pre-matricula-docs
```

### 3. Frontend
```bash
# Deploy da aplicação
npm run build
npm run start
```

## Monitoramento

### 1. Métricas
- Taxa de conversão (pré-matrícula → matrícula)
- Tempo médio de análise
- Taxa de rejeição por motivo
- Volume de uploads

### 2. Logs
- Erros de validação
- Falhas de upload
- Problemas de notificação
- Acessos não autorizados

## Suporte

### 1. Documentação
- API docs (OpenAPI/Swagger)
- Guia do usuário
- Manual administrativo

### 2. Treinamento
- Equipe de secretaria
- Administradores do sistema
- Suporte técnico

---

A implementação está completa e pronta para uso. O sistema oferece uma experiência robusta e segura para pré-matrículas públicas, com todas as validações e controles necessários conforme o PRD v2.
