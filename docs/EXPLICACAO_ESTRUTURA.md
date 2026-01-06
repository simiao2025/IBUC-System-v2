# 📁 Por que há duas pastas `src`?

## Estrutura do Projeto

Este projeto usa uma **estrutura monorepo** onde frontend e backend estão no mesmo repositório, mas são projetos **completamente separados**:

```
IBUC-System-v2/
├── src/                    # 🎨 FRONTEND (React + Vite)
│   ├── components/         # Componentes React
│   ├── pages/              # Páginas/Views
│   ├── services/           # Serviços do frontend
│   └── ...
│
├── backend/
│   └── src/                # ⚙️ BACKEND (NestJS)
│       ├── alunos/          # Módulo de alunos
│       ├── matriculas/     # Módulo de matrículas
│       ├── usuarios/       # Módulo de usuários
│       └── ...
│
├── package.json            # 📦 Dependências do FRONTEND
└── backend/
    └── package.json        # 📦 Dependências do BACKEND
```

## Por que essa estrutura?

### ✅ Vantagens:

1. **Separação clara**: Frontend e backend são projetos independentes
2. **Dependências isoladas**: Cada um tem seu próprio `node_modules`
3. **Builds independentes**: Podem ser compilados e deployados separadamente
4. **Organização**: Código relacionado fica agrupado
5. **Versionamento único**: Um único repositório Git para todo o sistema

### 🔧 Como funciona:

**Frontend (`src/`):**
- Framework: React + TypeScript + Vite
- Execução: `npm run dev` (na raiz)
- Porta: `http://localhost:5173` (padrão Vite)
- Configuração: `tsconfig.app.json`, `vite.config.ts`

**Backend (`backend/src/`):**
- Framework: NestJS (Node.js)
- Execução: `cd backend && npm run start:dev`
- Porta: `http://localhost:3000`
- Configuração: `backend/tsconfig.json`

## ⚠️ Por que a pasta backend aparece em vermelho?

A pasta `backend` pode aparecer em vermelho no VS Code porque:

1. **TypeScript do frontend tenta verificar o backend**: O TypeScript do frontend não encontra as dependências do NestJS (que estão em `backend/node_modules`)

2. **Isso é normal e esperado**: O backend tem seu próprio `tsconfig.json` e deve ser tratado como um projeto separado

3. **Solução**: As configurações em `.vscode/settings.json` e `tsconfig.json` já excluem o backend do TypeScript do frontend

## 🛠️ Como trabalhar com ambos:

### Desenvolvimento Local:

**Terminal 1 - Frontend:**
```bash
npm install          # Instala dependências do frontend
npm run dev          # Inicia servidor de desenvolvimento
```

**Terminal 2 - Backend:**
```bash
cd backend
npm install          # Instala dependências do backend
npm run start:dev    # Inicia servidor NestJS
```

### Build para Produção:

**Frontend:**
```bash
npm run build        # Gera arquivos em dist/
```

**Backend:**
```bash
cd backend
npm run build        # Gera arquivos em backend/dist/
```

## 📝 Notas Importantes:

- ✅ **Cada projeto é independente**: Pode trabalhar em um sem afetar o outro
- ✅ **Configurações separadas**: Cada um tem seu próprio `tsconfig.json` e `package.json`
- ✅ **Deploy separado**: Podem ser deployados em servidores diferentes
- ⚠️ **Erros no backend não afetam o frontend**: O TypeScript do frontend ignora o backend

## 🔍 Se ainda aparecer em vermelho:

1. **Recarregue o VS Code**: `Ctrl+Shift+P` → "Reload Window"
2. **Verifique se as dependências estão instaladas**:
   ```bash
   cd backend
   npm install
   ```
3. **Feche e reabra o VS Code**: Às vezes o TypeScript precisa reiniciar

---

**Resumo**: Duas pastas `src` = dois projetos separados no mesmo repositório. Isso é uma prática comum e recomendada! 🎯






