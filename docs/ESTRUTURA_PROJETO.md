# Estrutura do Projeto IBUC System

## 📁 Árvore de Diretórios

```
IBUCPalmas/
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql    # Schema completo do banco com RLS
│       └── 002_seed_data.sql         # Dados iniciais (níveis, módulos, etc)
│
├── docs/
│   └── api.yaml                      # Documentação OpenAPI
│
├── src/
│   ├── components/                   # Componentes React
│   │   ├── ui/                       # Componentes de UI base
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── ConfirmLink.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Layout.tsx
│   │   └── AccessControl.tsx
│   │
│   ├── pages/                        # Páginas da aplicação
│   │   ├── admin/                    # Páginas administrativas
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── PoloManagement.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── StaffManagement.tsx
│   │   │   ├── StudentManagement.tsx
│   │   │   ├── DirectorateManagement.tsx
│   │   │   ├── EnhancedPoloManagement.tsx
│   │   │   ├── SystemSettings.tsx
│   │   │   └── EducationalReports.tsx
│   │   ├── modules/                  # Páginas dos módulos
│   │   │   ├── Module01.tsx
│   │   │   ├── Module02.tsx
│   │   │   └── ... (Module03-10)
│   │   ├── Home.tsx
│   │   ├── AboutIBUC.tsx
│   │   ├── Enrollment.tsx
│   │   ├── PreMatricula.tsx          # ✨ NOVO: Pré-matrícula pública
│   │   ├── StudentRegistration.tsx
│   │   ├── StudentAccess.tsx
│   │   ├── AdminAccess.tsx
│   │   ├── Materials.tsx
│   │   └── ModulesPageClone.tsx
│   │
│   ├── services/                     # ✨ NOVO: Serviços de negócio
│   │   ├── polo.service.ts           # Serviço de polos
│   │   ├── aluno.service.ts          # Serviço de alunos
│   │   └── matricula.service.ts      # Serviço de matrículas
│   │
│   ├── lib/                          # ✨ NOVO: Bibliotecas e configurações
│   │   ├── supabase.ts               # Cliente Supabase
│   │   └── database.types.ts         # Tipos do Supabase
│   │
│   ├── types/                        # Tipos TypeScript
│   │   ├── index.ts                  # Tipos principais (atualizado)
│   │   └── database.ts               # ✨ NOVO: Tipos do banco de dados
│   │
│   ├── hooks/                        # Custom hooks
│   │   └── useNavigationConfirm.ts
│   │
│   ├── context/                      # Context API
│   │   └── AppContext.tsx            # Contexto principal (atualizado)
│   │
│   ├── App.tsx
│   ├── main.tsx
│   ├── router.tsx                    # Rotas (atualizado)
│   └── index.css
│
├── .env.example                      # ✨ NOVO: Exemplo de variáveis de ambiente
├── package.json                      # Dependências (atualizado)
├── tailwind.config.js                # Config Tailwind (atualizado com cores IBUC)
├── vite.config.ts
├── tsconfig.json
├── README.md                         # ✨ NOVO: Documentação principal
├── DEPLOY.md                         # ✨ NOVO: Guia de deploy
└── ESTRUTURA_PROJETO.md              # Este arquivo
```

## 🆕 Arquivos Criados

### Migrations SQL
- ✅ `supabase/migrations/001_initial_schema.sql` - Schema completo com 21 tabelas, RLS, triggers e views
- ✅ `supabase/migrations/002_seed_data.sql` - Dados iniciais (níveis, módulos, polos, usuários)

### Tipos TypeScript
- ✅ `src/types/database.ts` - Tipos completos do banco de dados

### Serviços
- ✅ `src/services/polo.service.ts` - CRUD de polos
- ✅ `src/services/aluno.service.ts` - CRUD de alunos e pré-matrículas
- ✅ `src/services/matricula.service.ts` - Gestão de matrículas

### Bibliotecas
- ✅ `src/lib/supabase.ts` - Cliente Supabase configurado
- ✅ `src/lib/database.types.ts` - Tipos do Supabase (estrutura base)

### Páginas
- ✅ `src/pages/PreMatricula.tsx` - Formulário público de pré-matrícula

### Documentação
- ✅ `README.md` - Documentação completa do projeto
- ✅ `DEPLOY.md` - Guia detalhado de deploy
- ✅ `docs/api.yaml` - Documentação OpenAPI
- ✅ `.env.example` - Exemplo de variáveis de ambiente

## 🔄 Arquivos Atualizados

- ✅ `package.json` - Adicionado `@supabase/supabase-js`
- ✅ `tailwind.config.js` - Adicionadas cores IBUC (amarelo, azul, verde, vermelho)
- ✅ `src/types/index.ts` - Re-exporta tipos do database
- ✅ `src/context/AppContext.tsx` - Adicionado `hasUnsavedChanges` e `setHasUnsavedChanges`
- ✅ `src/router.tsx` - Adicionada rota `/pre-matricula`

## 📊 Banco de Dados

### Tabelas Criadas (21)

1. **polos** - Polos/congregações (tenant principal)
2. **usuarios** - Usuários do sistema
3. **niveis** - Níveis do curso (I, II, III, IV)
4. **modulos** - Módulos do curso (1-10)
5. **turmas** - Turmas de alunos
6. **responsaveis** - Pais/responsáveis
7. **alunos** - Alunos cadastrados
8. **aluno_responsavel** - Relação N:N aluno-responsável
9. **matriculas** - Matrículas (online/presencial)
10. **licoes** - Lições dos módulos
11. **conteudos** - Conteúdos das lições
12. **presencas** - Registro de presença
13. **avaliacoes** - Avaliações
14. **notas** - Notas dos alunos
15. **boletins** - Boletins escolares
16. **documentos** - Documentos dos alunos/usuários
17. **mensalidades** - Mensalidades
18. **pagamentos** - Pagamentos
19. **notificacoes** - Notificações
20. **consents** - Consentimentos LGPD
21. **audit_logs** - Logs de auditoria

### Views Criadas

- `vw_aluno_progresso` - Progresso do aluno por módulos
- `vw_resumo_financeiro_aluno` - Resumo financeiro por aluno

### RLS (Row Level Security)

Todas as tabelas possuem políticas RLS que garantem:
- Isolamento por polo (multi-tenant)
- Acesso baseado em roles
- Super admin tem acesso total
- Professores veem apenas suas turmas

## 🎨 Cores do Sistema

Definidas em `tailwind.config.js`:
- `ibuc-yellow`: #FFC107
- `ibuc-blue`: #2196F3
- `ibuc-green`: #4CAF50
- `ibuc-red`: #F44336

## 🔐 Autenticação

- Integração com Supabase Auth
- Roles: super_admin, admin_geral, diretor_polo, coordenador_polo, secretario_polo, professor, responsavel, aluno
- RLS garante isolamento de dados

## 📝 Próximos Passos

### Pendente de Implementação

1. **Testes**
   - [ ] Testes unitários (Jest/Vitest)
   - [ ] Testes de integração
   - [ ] Testes E2E (Playwright/Cypress)

2. **Geração de PDFs**
   - [ ] Worker para geração de certificados
   - [ ] Worker para geração de boletins
   - [ ] Worker para geração de termos de matrícula
   - [ ] Fila de jobs (BullMQ/Redis)

3. **Integrações**
   - [ ] Gateway de pagamentos (mock ou real)
   - [ ] API WhatsApp para notificações
   - [ ] SMTP para e-mails transacionais

4. **Funcionalidades Adicionais**
   - [ ] Página de acompanhamento de matrícula por protocolo
   - [ ] Dashboard de relatórios
   - [ ] Sistema de notificações em tempo real
   - [ ] Upload de documentos para Supabase Storage

## 🚀 Como Começar

1. Instale as dependências: `npm install`
2. Configure o Supabase (veja `DEPLOY.md`)
3. Configure as variáveis de ambiente (veja `.env.example`)
4. Execute as migrations: `supabase db push`
5. Execute o projeto: `npm run dev`

## 📚 Documentação

- **README.md** - Visão geral e instruções básicas
- **DEPLOY.md** - Guia completo de deploy
- **docs/api.yaml** - Documentação OpenAPI da API

---

**Última atualização**: 2024-01-01

