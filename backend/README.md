# IBUC System - Backend API

Backend NestJS para o sistema IBUC, fornecendo APIs REST, workers para geração de PDFs e integrações.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **Supabase** - Banco de dados e autenticação
- **BullMQ/Redis** - Fila de jobs para processamento assíncrono
- **PDFKit** - Geração de PDFs
- **Nodemailer** - Envio de emails
- **Swagger** - Documentação da API

## 📋 Pré-requisitos

- Node.js 18+
- Redis (para filas de jobs)
- Conta no Supabase

## 🔧 Instalação

```bash
cd backend
npm install
```

## ⚙️ Configuração

1. Copie `.env.example` para `.env`
2. Configure as variáveis de ambiente:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
REDIS_HOST=localhost
REDIS_PORT=6379
SMTP_HOST=smtp.gmail.com
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
```

## 🏃 Executar

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod

# Worker (processo separado)
npm run worker:dev
```

## 📚 API Documentation

Após iniciar o servidor, acesse:
- Swagger UI: http://localhost:3000/api/docs

## 🔄 Workers

Os workers processam jobs assíncronos:

- **Geração de PDFs**: Termos de matrícula, boletins, certificados, recibos
- **Envio de emails**: Notificações de matrícula, aprovação, recusa
- **Relatórios**: Geração de relatórios financeiros e educacionais

Para iniciar o worker:

```bash
npm run worker:dev
```

## 📦 Estrutura

```
backend/
├── src/
│   ├── alunos/          # Módulo de alunos
│   ├── matriculas/      # Módulo de matrículas
│   ├── presencas/       # Módulo de presenças
│   ├── avaliacoes/      # Módulo de avaliações
│   ├── mensalidades/    # Módulo de mensalidades
│   ├── pagamentos/      # Módulo de pagamentos
│   ├── relatorios/      # Módulo de relatórios
│   ├── notificacoes/    # Módulo de notificações
│   ├── lgpd/            # Módulo LGPD
│   ├── workers/         # Workers e processadores
│   └── supabase/        # Cliente Supabase
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Cobertura
npm run test:cov
```

## 🔐 Segurança

- JWT para autenticação
- RLS (Row Level Security) no Supabase
- Validação de dados com class-validator
- Rate limiting (a implementar)

## 📝 Endpoints Principais

### Matrículas
- `POST /matriculas` - Criar matrícula
- `GET /matriculas` - Listar matrículas
- `GET /matriculas/protocolo/:protocolo` - Buscar por protocolo
- `PUT /matriculas/:id/aprovar` - Aprovar matrícula
- `PUT /matriculas/:id/recusar` - Recusar matrícula

### Relatórios
- `GET /relatorios/boletim` - Gerar boletim PDF
- `GET /relatorios/presenca` - Exportar lista de presença CSV
- `GET /relatorios/financeiro` - Relatório financeiro

### LGPD
- `GET /lgpd/export/:type/:id` - Exportar dados
- `POST /lgpd/anonymize/:type/:id` - Anonymizar dados

## 🔗 Integrações

- **Supabase**: Banco de dados e storage
- **SMTP**: Envio de emails transacionais
- **WhatsApp API**: Notificações (mock implementado)
- **Gateway Pagamento**: Processamento de pagamentos (mock implementado)

## 📄 Licença

Proprietário - IBUC

