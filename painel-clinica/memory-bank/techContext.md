# Contexto Técnico

## Stack Tecnológica

### Frontend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 18.x | Biblioteca principal para UI |
| TypeScript | 4.9+ | Tipagem estática para JavaScript |
| Material UI | 5.x | Framework de componentes visuais |
| React Router | 6.x | Gerenciamento de rotas |
| Axios | 1.x | Cliente HTTP para requisições à API |
| React Hook Form | 7.x | Gerenciamento de formulários |
| Dayjs | 1.x | Manipulação de datas e horários |
| Vite | 4.x | Bundler e ambiente de desenvolvimento |
| Notistack | 3.x | Sistema de notificações em snackbars |

### Backend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| NestJS | 10.x | Framework backend baseado em Node.js |
| TypeScript | 4.9+ | Tipagem estática para JavaScript |
| Prisma | 4.x | ORM para acesso ao banco de dados |
| PostgreSQL | 14+ | Banco de dados relacional |
| Passport | 0.6.x | Estratégias de autenticação |
| JWT | 5.x | Tokens de autenticação |
| Class Validator | 0.14.x | Validação de dados |
| Swagger | 6.x | Documentação automática de API |

## Estrutura de Ambiente

### Ambientes de Desenvolvimento
- **Local**: Ambiente de desenvolvimento individual, executado na máquina do desenvolvedor
- **Dev**: Ambiente compartilhado para testes integrados
- **Staging**: Ambiente de pré-produção para testes finais
- **Produção**: Ambiente de produção acessado pelos usuários finais

### Infraestrutura
- **Backend**: Serviço Node.js containerizado via Docker
- **Frontend**: Aplicação estática servida via CDN
- **Banco de Dados**: PostgreSQL gerenciado
- **Cache**: Redis para caching de dados frequentes

### Variáveis de Ambiente

#### Frontend (Vite)
```
VITE_API_URL=http://localhost:3000       # URL base da API
VITE_APP_TITLE=Painel Clínica            # Título da aplicação
VITE_APP_VERSION=1.0.0                   # Versão da aplicação
```

#### Backend (NestJS)
```
DATABASE_URL=postgresql://...            # String de conexão PostgreSQL
JWT_SECRET=seu_segredo_jwt               # Segredo para assinatura JWT
JWT_EXPIRATION=1d                        # Expiração do token JWT
PORT=3000                                # Porta do servidor
NODE_ENV=development                     # Ambiente de execução
```

## Fluxo de Desenvolvimento

### Controle de Versão
- Sistema: Git
- Plataforma: GitHub
- Estratégia de Branching: GitFlow
  - `main`: Branch de produção estável
  - `develop`: Branch de desenvolvimento
  - `feature/*`: Branches para novas funcionalidades
  - `bugfix/*`: Branches para correção de bugs
  - `release/*`: Branches para preparação de releases

### Processo de CI/CD
1. **Lint e Type Check**: Verificação de código com ESLint e TypeScript
2. **Testes Automatizados**: Execução de testes unitários e de integração
3. **Build**: Compilação dos artefatos da aplicação
4. **Deploy**: Implantação automática no ambiente correspondente

### Convenções de Código
- **Estilo**: Prettier para formatação consistente
- **Linting**: ESLint com regras personalizadas
- **Commits**: Conventional Commits com prefixos semânticos
  - `feat:` Nova funcionalidade
  - `fix:` Correção de bug
  - `docs:` Documentação
  - `chore:` Tarefas de manutenção
  - `refactor:` Refatoração sem mudança de comportamento
  - `test:` Adição ou modificação de testes

## Integrações Externas

### APIs de Terceiros
- **Serviço de E-mail**: SendGrid para envio de notificações e lembretes
- **Autorização OAuth**: Google e Microsoft para login social (planejado)
- **Pagamentos**: Integração com gateway de pagamentos (planejado)

### Ferramentas de Monitoramento
- **Logs**: Winston para geração de logs no backend
- **APM**: New Relic para monitoramento de performance
- **Analytics**: Google Analytics para análise de uso do frontend

## Segurança

### Práticas Implementadas
- **Autenticação**: JWT com expiração e refresh tokens
- **Autorização**: RBAC (Role-Based Access Control)
- **Validação de Dados**: Validação completa no cliente e servidor
- **Proteção CSRF**: Tokens anti-CSRF para requisições de modificação
- **Sanitização de Input**: Escape de HTML e validação de entrada
- **CORS**: Configuração restritiva de Cross-Origin Resource Sharing
- **Rate Limiting**: Limitação de requisições por IP

### Padrões de Armazenamento
- **Senhas**: Hashing com bcrypt e salt
- **Dados Sensíveis**: Criptografia em nível de banco para PII
- **Tokens**: Armazenamento em localStorage com validação de origem

## Padrões de API

### Formato de Requisição/Resposta
- **Formato**: JSON para todas as comunicações
- **Content-Type**: application/json
- **Charset**: UTF-8

### Exemplo de Estruturas de Resposta

#### Sucesso
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "attribute1": "value1",
    "attribute2": "value2"
  },
  "meta": {
    "timestamp": "2023-07-20T10:30:00Z"
  }
}
```

#### Erro
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "O recurso solicitado não foi encontrado",
    "details": "O ID '123' não corresponde a nenhum registro"
  },
  "meta": {
    "timestamp": "2023-07-20T10:30:00Z"
  }
}
```

#### Paginação
```json
{
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3
  }
}
```

## Dependências e Bibliotecas Principais

### Frontend

#### Core
- **react**: Biblioteca principal de UI
- **react-dom**: Renderização para ambiente web
- **react-router-dom**: Roteamento da aplicação
- **@mui/material**: Componentes Material UI
- **@mui/icons-material**: Ícones Material Design
- **axios**: Cliente HTTP

#### Formulários e Validação
- **react-hook-form**: Gerenciamento de formulários
- **yup**: Validação de esquemas
- **@hookform/resolvers**: Integração entre react-hook-form e yup

#### Data e Tempo
- **dayjs**: Manipulação de datas e horários
- **@mui/x-date-pickers**: Seletores de data e hora

#### Utilitários
- **lodash**: Funções utilitárias
- **uuid**: Geração de IDs únicos
- **notistack**: Sistema de notificações baseado em snackbars

### Backend

#### Core
- **@nestjs/core**: Framework NestJS
- **@nestjs/common**: Utilitários comuns
- **@nestjs/platform-express**: Adaptador Express

#### Database
- **@prisma/client**: Cliente Prisma ORM
- **prisma**: CLI e utilitários Prisma

#### Autenticação e Segurança
- **@nestjs/passport**: Integração Passport com NestJS
- **passport**: Biblioteca de autenticação
- **passport-jwt**: Estratégia JWT para Passport
- **bcrypt**: Hashing de senhas
- **@nestjs/jwt**: Suporte JWT para NestJS

#### Validação
- **class-validator**: Validação baseada em decoradores
- **class-transformer**: Transformação de objetos

#### Documentação
- **@nestjs/swagger**: Geração de documentação OpenAPI

## Gestão de Pacotes e Scripts

### Frontend (package.json)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

### Backend (package.json)
```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

## Configurações Específicas e Desafios Técnicos

### Configuração do Tema Material UI

O tema Material UI requer atenção especial na configuração das sombras (shadows), que são usadas para criar efeitos de elevação nos componentes. O Material UI 5 requer a definição completa de 25 níveis de sombra.

**Exemplo de Definição Correta de Sombras:**
```typescript
shadows: [
  'none',
  '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)',
  // ... todos os 25 níveis devem ser definidos
  '0px 25px 50px rgba(0, 0, 0, 0.25)',
]
```

### Sistema de Notificações

O sistema utiliza a biblioteca `notistack` para gerenciar notificações de forma eficiente. Esta biblioteca estende as funcionalidades do Snackbar do Material UI:

**Configuração Básica:**
```tsx
<NotistackProvider maxSnack={3} autoHideDuration={3000}>
  <App />
</NotistackProvider>
```

**Uso:**
```tsx
const { enqueueSnackbar } = useSnackbar();

// Para exibir uma notificação
enqueueSnackbar('Operação realizada com sucesso!', { 
  variant: 'success'  // 'success', 'error', 'warning', 'info'
});
```

### Arquitetura de Providers

A aplicação utiliza vários providers React para gerenciar estado global e funcionalidades compartilhadas:

```tsx
// Em App.tsx
<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
  <ThemeProvider theme={theme}>
    <NotistackProvider maxSnack={3} autoHideDuration={3000}>
      <BranchProvider>
        <AppRoutes />
      </BranchProvider>
    </NotistackProvider>
  </ThemeProvider>
</LocalizationProvider>
```

O encadeamento correto desses providers é essencial para garantir que todas as funcionalidades estejam disponíveis em toda a aplicação. 