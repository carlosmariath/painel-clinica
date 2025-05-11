# Painel Clínica - Project Brief

## Visão Geral
O Painel Clínica é um sistema completo para gerenciamento de clínicas de saúde, composto por duas partes principais:

1. **Frontend (painel-clinica)**: Interface de usuário desenvolvida em React com Material UI
2. **Backend (backend-clinica)**: API REST desenvolvida em NestJS com Prisma ORM

Este sistema permite o gerenciamento completo de agendamentos, pacientes, terapeutas e base de conhecimento, fornecendo uma solução integrada para clínicas de saúde.

## Objetivos do Projeto

### Objetivos Primários
- Facilitar o gerenciamento de agendamentos entre pacientes e terapeutas
- Permitir o controle eficiente de clientes e profissionais
- Fornecer insights através de dashboards informativos
- Centralizar o conhecimento através de uma base de dados estruturada

### Objetivos Secundários
- Melhorar a comunicação entre equipe e pacientes
- Reduzir o tempo gasto em tarefas administrativas
- Aumentar a satisfação dos pacientes com atendimento mais eficiente
- Prover uma ferramenta de análise de perguntas frequentes e dúvidas recorrentes

## Escopo do Projeto

### Frontend (React/Material UI)
- Autenticação e autorização de usuários
- Dashboard com métricas e informações essenciais
- Gerenciamento de agendamentos com filtragem e busca
- Cadastro e gerenciamento de clientes
- Cadastro e gerenciamento de terapeutas
- Visualização de agenda de terapeutas
- Sistema de base de conhecimento com:
  - Gerenciamento de entradas de conhecimento
  - Categorização de conteúdo
  - Análise de perguntas frequentes

### Backend (NestJS/Prisma)
- API RESTful com autenticação JWT
- Operações CRUD para todas as entidades do sistema
- Validação de dados e regras de negócio
- Persistência de dados com PostgreSQL via Prisma ORM
- Endpoints específicos para:
  - Autenticação de usuários
  - Gerenciamento de agendamentos
  - Gerenciamento de clientes
  - Gerenciamento de terapeutas
  - Base de conhecimento e categorias
  - Análise de perguntas frequentes

## Relacionamento entre os Projetos
O frontend consome as APIs do backend através de serviços HTTP implementados com Axios. Todas as comunicações entre os dois sistemas são feitas via requisições HTTP autenticadas usando tokens JWT.

## Tecnologias Principais

### Frontend
- React 18+
- TypeScript
- Material UI 5
- Axios
- React Router
- Vite

### Backend
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT para autenticação
- Swagger para documentação de API

## Dependências Externas
- Banco de dados PostgreSQL
- Serviço de e-mail (para recuperação de senha e notificações)
- Ambiente de hospedagem para frontend e backend

## Restrições e Limitações
- O sistema deve ser responsivo e funcionar em dispositivos desktop e móveis
- A autenticação deve ser segura e seguir as melhores práticas
- O sistema deve manter a integridade dos dados, especialmente para agendamentos

## Status Atual
O projeto está em desenvolvimento ativo, com a maioria das funcionalidades do frontend e backend já implementadas. Recentemente, foi adicionado o módulo de Base de Conhecimento com suas categorias e análise de perguntas frequentes. 