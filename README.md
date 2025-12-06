# IBUC System - Sistema de Gestão de Curso de Teologia Infanto-Juvenil

Sistema web completo para gestão de curso de teologia infanto-juvenil com suporte multi-tenant (múltiplos polos), desenvolvido com React, TypeScript, NestJS, Supabase e seguindo Clean Architecture.

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)]()
[![Backend](https://img.shields.io/badge/backend-NestJS-red)]()
[![Frontend](https://img.shields.io/badge/frontend-React-blue)]()
[![Database](https://img.shields.io/badge/database-Supabase-green)]()

## 📦 Repositório

Este projeto está versionado no GitHub. Para clonar:

```bash
git clone https://github.com/SEU_USUARIO/IBUC-System-v2.git
cd IBUC-System-v2
```

Para mais informações sobre como fazer push, veja [GITHUB_SETUP.md](./GITHUB_SETUP.md) ou [COMANDOS_GIT.md](./COMANDOS_GIT.md).

## 🎨 Paleta de Cores

O sistema utiliza as seguintes cores obrigatórias:
- **Amarelo**: `#FFC107` / `yellow-500`
- **Azul**: `#2196F3` / `blue-500`
- **Verde**: `#4CAF50` / `green-500`
- **Vermelho**: `#F44336` / `red-500`

## 🏗️ Arquitetura

O projeto segue Clean Architecture com as seguintes camadas:

```
src/                          # Frontend (React)
├── components/               # Componentes React (Presentation)
├── pages/                    # Páginas/Views (Presentation)
├── services/                 # Serviços de negócio (Application)
├── lib/                      # Bibliotecas e configurações (Infrastructure)
└── types/                    # Tipos TypeScript (Domain)

backend/                      # Backend (NestJS)
├── src/
│   ├── alunos/              # Módulo de alunos
│   ├── matriculas/          # Módulo de matrículas
│   ├── workers/             # Workers para PDFs
│   └── ...
```

## 🚀 Tecnologias

### Frontend
- **React 18** + TypeScript + Vite
- **Tailwind CSS** para estilização
- **React Router v7** para navegação
- **Lucide React** para ícones

### Backend
- **NestJS** - Framework Node.js
- **Supabase** - Banco de dados PostgreSQL + Auth + Storage
- **BullMQ/Redis** - Fila de jobs para processamento assíncrono
- **PDFKit** - Geração de PDFs
- **Nodemailer** - Envio de emails
- **Swagger** - Documentação da API

### Banco de Dados
- **PostgreSQL** (via Supabase)
- **Row Level Security (RLS)** para multi-tenancy
- **21 tabelas** principais
- **15 ENUMs** customizados

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Redis (para filas de jobs)
- Conta no Supabase (https://supabase.com)
- Git (para versionamento)

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/IBUC-System-v2.git
cd IBUC-System-v2
```

### 2. Instale as dependências do Frontend

```bash
npm install
```

### 3. Instale as dependências do Backend

```bash
cd backend
npm install
cd ..
```

### 4. Configure o Supabase

1. Crie um projeto no Supabase
2. Execute as migrations:

```bash
# Via Dashboard (Recomendado)
# 1. Acesse SQL Editor no Supabase
# 2. Execute supabase/migrations/001_initial_schema.sql
# 3. Execute supabase/migrations/002_seed_data.sql

# Ou via CLI
supabase db push
```

### 5. Configure as variáveis de ambiente

#### Frontend (`.env`)

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_API_URL=http://localhost:3000
```

#### Backend (`backend/.env`)

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
JWT_SECRET=seu-jwt-secret
REDIS_HOST=localhost
REDIS_PORT=6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
PORT=3000
```

### 6. Execute o projeto

#### Terminal 1 - Backend
```bash
cd backend
npm run start:dev
```

#### Terminal 2 - Worker (opcional)
```bash
cd backend
npm run worker:dev
```

#### Terminal 3 - Frontend
```bash
npm run dev
```

O projeto estará disponível em:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`
- **Swagger**: `http://localhost:3000/api/docs`

## 📁 Estrutura do Projeto

```
IBUC-System-v2/
├── backend/                 # Backend NestJS
│   ├── src/
│   │   ├── alunos/         # Módulo de alunos
│   │   ├── matriculas/     # Módulo de matrículas
│   │   ├── presencas/      # Módulo de presenças
│   │   ├── workers/        # Workers e processadores
│   │   └── ...
│   └── package.json
├── src/                     # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/              # Páginas da aplicação
│   ├── services/           # Serviços de negócio
│   └── lib/                # Configurações
├── supabase/
│   └── migrations/         # Migrations SQL
├── docs/                   # Documentação
│   └── api.yaml           # OpenAPI/Swagger
└── scripts/                # Scripts utilitários
```

## 🔐 Autenticação e Autorização

O sistema utiliza Supabase Auth para autenticação e Row Level Security (RLS) para autorização.

### Roles do Sistema

- `super_admin`: Acesso total ao sistema
- `admin_geral`: Administrador geral com acesso a todos os polos
- `diretor_polo`: Diretor de um polo específico
- `coordenador_polo`: Coordenador de um polo específico
- `secretario_polo`: Secretário de um polo específico
- `professor`: Professor com acesso às suas turmas
- `responsavel`: Responsável por aluno(s)
- `aluno`: Aluno do curso

### RLS (Row Level Security)

Todas as tabelas possuem políticas RLS que garantem:
- Usuários só acessam dados do seu polo (exceto super_admin e admin_geral)
- Professores só veem dados das suas turmas
- Responsáveis só veem dados dos seus alunos

## 📊 Modelo de Dados

### Principais Entidades

- **Polos**: Congregações/Unidades (tenant principal)
- **Usuários**: Usuários do sistema com diferentes roles
- **Alunos**: Alunos cadastrados
- **Responsáveis**: Pais/responsáveis pelos alunos
- **Turmas**: Turmas de alunos
- **Matrículas**: Matrículas (online ou presencial)
- **Presenças**: Registro de presença
- **Mensalidades**: Mensalidades dos alunos
- **Documentos**: Documentos dos alunos/responsáveis
- **Consents**: Consentimentos LGPD

## 🔄 Fluxos Principais

### 1. Matrícula Online (Pré-matrícula)

1. Responsável preenche formulário no site
2. Sistema cria aluno com status `pendente`
3. Sistema cria matrícula com status `pendente` e gera protocolo
4. Secretária do polo recebe notificação
5. Secretária valida documentos presencialmente
6. Secretária efetiva matrícula (status → `ativa`)

### 2. Matrícula Presencial

1. Responsável vai ao polo
2. Secretária preenche formulário completo
3. Sistema cria aluno e matrícula com status `ativa` imediatamente
4. Sistema gera termo de matrícula (PDF)

### 3. Registro de Presença

1. Professor acessa lista de alunos da turma
2. Professor marca presença/ausência
3. Sistema registra no banco
4. Sistema gera alertas para faltas consecutivas

## 📝 Funcionalidades

- ✅ Landing page completa (FAQ, depoimentos, busca de polos)
- ✅ Pré-matrícula online
- ✅ Matrícula presencial
- ✅ Gestão de alunos, turmas e polos
- ✅ Registro de presença
- ✅ Avaliações e notas
- ✅ Mensalidades e pagamentos
- ✅ Geração de PDFs (termos, boletins, certificados)
- ✅ Relatórios e exports
- ✅ Notificações por email
- ✅ LGPD (exportação e anonymização de dados)

## 🧪 Testes

```bash
# Backend - Testes unitários
cd backend
npm run test

# Backend - Testes E2E
npm run test:e2e

# Frontend - Testes (a implementar)
npm run test
```

## 📚 Documentação API

A documentação OpenAPI/Swagger está disponível em:
- **Swagger UI**: `http://localhost:3000/api/docs`
- **Arquivo YAML**: `docs/api.yaml`

## 🔒 Segurança e LGPD

- Todos os consentimentos são armazenados com versão, IP e user-agent
- Logs de auditoria para todas as ações críticas
- Endpoint para exportação de dados (LGPD)
- Endpoint para exclusão/anonymização de dados
- RLS garante isolamento de dados entre polos

## 📦 Deploy

### Frontend (Vercel/Netlify)

1. Configure as variáveis de ambiente no painel
2. Conecte o repositório
3. Configure o build command: `npm run build`
4. Configure o output directory: `dist`

### Backend (Railway/Render/Heroku)

1. Configure as variáveis de ambiente
2. Configure o build command: `cd backend && npm install && npm run build`
3. Configure o start command: `cd backend && npm run start:prod`

### Banco (Supabase)

As migrations são executadas automaticamente via Supabase CLI ou manualmente no dashboard.

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Faça commit das mudanças
3. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 🆘 Suporte

Para suporte, entre em contato com a equipe de desenvolvimento.

## 📊 Status do Projeto

**Implementado: ~75%**

- ✅ Backend NestJS: 90%
- ✅ Frontend React: 70%
- ✅ Workers/PDFs: 60%
- ⚠️ Testes: 0%
- ✅ Integrações: 80%
- ✅ LGPD: 80%

Veja `IMPLEMENTACAO_COMPLETA.md` para mais detalhes.

---

**Desenvolvido com ❤️ para o IBUC - Instituto Bíblico Único Caminho**
