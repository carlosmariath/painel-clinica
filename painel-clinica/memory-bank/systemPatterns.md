# Padrões do Sistema

## Arquitetura Geral

O Painel Clínica segue uma arquitetura cliente-servidor com separação clara entre o frontend (cliente) e o backend (servidor), conectados por uma API REST.

```
┌─────────────┐               ┌─────────────┐               ┌─────────────┐
│             │   Requisições  │             │   Queries &   │             │
│   Frontend  │ ──────────────▶│   Backend   │ ◀─────────────▶│   Database  │
│  (React/TS) │   HTTP/JSON    │  (NestJS)   │   Mutations   │ (PostgreSQL)│
│             │ ◀──────────────│             │ ──────────────▶│             │
└─────────────┘     REST API   └─────────────┘     Prisma    └─────────────┘
```

### Padrões Arquiteturais

1. **Arquitetura de Microsserviços Leve**
   - Frontend e backend são aplicações separadas
   - Cada módulo do backend é independente mas integrado
   - Comunicação entre módulos via injeção de dependência

2. **Padrão MVC Modificado**
   - **Frontend**: Componentes React (View) + Hooks/State (Controller) + Services (Model)
   - **Backend**: Controllers + Services + Repositories + Entities

3. **API-First Design**
   - Contrato de API definido antes da implementação
   - Documentação automática via Swagger/OpenAPI
   - Respostas e erros padronizados

## Arquitetura Frontend (React/TypeScript)

### Estrutura de Diretórios
```
src/
├── assets/          # Recursos estáticos (imagens, ícones)
├── components/      # Componentes reutilizáveis
├── context/         # Contextos React (Auth, notificações, branches)
├── layouts/         # Estruturas de layout (MainLayout, etc)
├── pages/           # Componentes de página
├── services/        # Serviços de API e lógica de negócios
├── types/           # Definições de tipos TypeScript
├── api/             # Configuração do cliente API (Axios)
├── routes.tsx       # Definição de rotas da aplicação
├── theme.ts         # Configuração do tema Material UI
└── main.tsx         # Ponto de entrada da aplicação
```

### Padrões de Design Frontend

1. **Component-Based Architecture**
   - Componentes modulares e reutilizáveis
   - Composição de componentes para criar interfaces complexas
   - Props para comunicação descendente, Context para estado global

2. **Container/Presentation Pattern**
   - Páginas como containers (gerenciam estado e lógica)
   - Componentes como presentational (renderizam UI baseada em props)

3. **Custom Hooks Pattern**
   - Lógica reutilizável extraída para hooks personalizados
   - Hooks para autenticação, notificações, formulários, etc.

4. **Context API para Estado Global**
   - AuthContext para gerenciamento de autenticação
   - ThemeContext para personalização de tema
   - NotificationContext para sistema de notificações
   - BranchContext para gerenciamento de filiais

5. **Provider Pattern**
   - Providers encadeados para fornecer contexto em toda a aplicação
   - Hierarquia de providers para garantir disponibilidade de funcionalidades
   - Providers específicos para funcionalidades como localização, notificações e filiais

## Arquitetura Backend (NestJS/Prisma)

### Estrutura de Módulos
```
src/
├── app.module.ts                # Módulo principal
├── main.ts                      # Ponto de entrada da aplicação
├── auth/                        # Módulo de autenticação
├── appointments/                # Módulo de agendamentos
├── clients/                     # Módulo de clientes
├── therapists/                  # Módulo de terapeutas
├── branches/                    # Módulo de filiais
├── knowledge/                   # Módulo da base de conhecimento
│   ├── dto/                     # Objetos de transferência de dados
│   ├── entities/                # Entidades Prisma
│   ├── knowledge.controller.ts  # Controlador REST
│   ├── knowledge.service.ts     # Serviço com lógica de negócios
│   ├── knowledge.module.ts      # Definição do módulo
│   └── categories/              # Submódulo de categorias
└── common/                      # Utilitários e decorators compartilhados
```

### Padrões de Design Backend

1. **Modular Architecture (NestJS)**
   - Cada recurso tem seu próprio módulo
   - Módulos encapsulam controladores, serviços e provedores
   - Injeção de dependência para acoplamento flexível

2. **Repository Pattern via Prisma**
   - Prisma Client como camada de abstração para o banco de dados
   - Modelos/Schemas definem a estrutura e relacionamentos
   - Migrations para versionamento do schema

3. **DTO Pattern**
   - Data Transfer Objects para validação de entrada
   - Class-validator para validações declarativas
   - Mapeamento entre DTOs e entidades

4. **Service Layer Pattern**
   - Serviços encapsulam a lógica de negócios
   - Controladores delegam operações aos serviços
   - Injeção de dependência para acesso a outros serviços/repositórios

## Padrões de Comunicação

### API REST

- URLs semânticas seguindo recursos e subrecursos
  ```
  /api/clients
  /api/therapists
  /api/appointments
  /api/knowledge
  /api/knowledge/categories
  /api/knowledge/frequent-questions
  /api/branches
  ```

- Verbos HTTP para operações CRUD
  ```
  GET: Recuperar recursos
  POST: Criar recursos
  PUT: Atualizar recursos
  DELETE: Remover recursos
  ```

- Status HTTP semânticos
  ```
  200: Sucesso
  201: Criado
  400: Requisição inválida
  401: Não autorizado
  404: Não encontrado
  500: Erro interno
  ```

### Autenticação e Autorização

- **JWT (JSON Web Tokens)**
  - Tokens de acesso enviados no header Authorization
  - Proteção de rotas via Guards no backend
  - Interceptadores para renovação automática de tokens

- **Controle de Acesso Baseado em Funções (RBAC)**
  - Diferentes papéis: admin, recepcionista, terapeuta
  - Autorização baseada em papéis para operações específicas

## Padrões de UI/UX

### Material Design

- Componentes Material UI para consistência visual
- Sistema de temas com cores, tipografia e espaçamento definidos
- Grid system para layouts responsivos
- Componentes adaptáveis a diferentes tamanhos de tela
- Sistema completo de elevação (shadows) com 25 níveis definidos

### Padrões de Navegação

- Barra lateral para navegação principal
- Breadcrumbs para navegação hierárquica
- Tabs para alternar entre visualizações relacionadas
- Modais para ações focadas sem mudança de contexto

### Feedback ao Usuário

- Sistema de notificações para confirmações e erros (via notistack)
- Indicadores de carregamento para operações assíncronas
- Confirmações para ações destrutivas
- Mensagens de erro informativas com sugestões de correção

## Padrões de Dados

### Modelagem de Dados Core

- **Appointment (Agendamento)**
  - Relacionamentos: Client, Therapist, Branch
  - Atributos: date, startTime, endTime, notes, status

- **Client (Cliente)**
  - Relacionamentos: Appointments, Branch
  - Atributos: name, email, phone, address, status

- **Therapist (Terapeuta)**
  - Relacionamentos: Appointments, Branch
  - Atributos: name, specialty, licenseNumber, status

- **Knowledge (Base de Conhecimento)**
  - Relacionamentos: Category
  - Atributos: question, answer, tags, viewCount, enabled

- **Branch (Filial)**
  - Relacionamentos: Appointments, Clients, Therapists
  - Atributos: name, address, phone, isActive, createdAt, updatedAt

### Padrões de Validação

- Validação no cliente para feedback imediato
- Validação no servidor para segurança
- Schemas de validação consistentes entre frontend e backend
- Mensagens de erro amigáveis e específicas

## Padrões de Performance

- Paginação para listas longas
- Carregamento sob demanda (lazy loading)
- Otimização de queries no banco de dados
- Caching de dados frequentemente acessados

## Padrões de Código

- **Convenções de Nomenclatura**
  - PascalCase para componentes React e classes
  - camelCase para variáveis, funções e métodos
  - snake_case para chaves de API e nomes de colunas no banco

- **Estrutura de Arquivos**
  - Um componente por arquivo (React)
  - Módulos agrupados por funcionalidade
  - Código compartilhado em diretórios comuns

- **Práticas de Qualidade**
  - Typechecking com TypeScript
  - Linting com ESLint
  - Formatação com Prettier
  - Testes unitários para lógica crítica

## Padrões Específicos de Implementação

### Sistema de Filiais (Branches)

O sistema implementa um padrão de multi-tenancy leve baseado em filiais, onde:

1. **Contexto de Filial**
   - `BranchContext` mantém a filial atual selecionada
   - Componentes acessam a filial atual via hook `useBranch()`
   - Todas as operações CRUD consideram a filial atual

2. **Componentes Específicos**
   - `BranchSelector`: Dropdown para selecionar filiais em formulários
   - `BranchSwitcher`: Componente para alternar entre filiais na interface

3. **Fluxo de Dados**
   ```
   BranchProvider
     └─ Armazena filial selecionada
        └─ Componentes consomem via useBranch()
           └─ Serviços incluem branchId nas requisições
              └─ Backend filtra dados por filial
   ```

4. **Validações**
   - Verificações para garantir que o BranchContext está disponível
   - Fallbacks para quando o contexto não está acessível
   - Tratamento para operações que devem ignorar o contexto de filial

### Arquitetura de Providers

A aplicação utiliza uma hierarquia de providers para gerenciar estado global:

```
ThemeProvider (Material UI)
└─ LocalizationProvider (MUI X Date Pickers)
   └─ NotistackProvider (Sistema de notificações)
      └─ BranchProvider (Contexto de filiais)
         └─ Componentes da aplicação
```

Esta estrutura garante que:
- O tema esteja disponível para todos os componentes
- A localização (i18n) seja consistente em toda a aplicação
- As notificações possam ser disparadas de qualquer componente
- O contexto de filial esteja acessível onde necessário 