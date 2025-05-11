# Contexto Ativo

## Foco de Desenvolvimento Atual

O foco de desenvolvimento atual está na implementação e integração dos módulos de Planos de Terapia e Financeiro, além da base de conhecimento do sistema. Recentemente, foram criados novos modelos no banco de dados, serviços e componentes para suportar essas funcionalidades, bem como a integração entre os módulos.

### Funcionalidades em Implementação

1. **Planos de Terapia e Assinaturas**
   - Gerenciamento completo de planos de terapia com número de sessões e validade
   - Sistema de assinaturas de planos pelos clientes
   - Fluxo de aceite de planos via token
   - Consumo automático de sessões ao confirmar agendamentos
   - Regras para cancelamento de assinaturas

2. **Gestão Financeira**
   - CRUD completo de transações financeiras (receitas e despesas)
   - Categorização de transações por tipo e categoria
   - Gerenciamento de métodos de pagamento
   - Relatórios e resumo financeiro
   - Geração automática de transações a partir de eventos do sistema

3. **Gerenciamento de Entradas de Conhecimento**
   - Interface para criar, visualizar, editar e excluir entradas
   - Filtros por categoria, status e texto
   - Ativação/desativação de entradas
   - Visualização de métricas de uso

4. **Gerenciamento de Categorias**
   - CRUD completo para categorias
   - Visualização da quantidade de entradas por categoria
   - Prevenção de exclusão de categorias em uso

5. **Análise de Perguntas Frequentes**
   - Visualização de perguntas mais frequentes ordenadas por relevância
   - Conversão de perguntas frequentes em entradas da base de conhecimento
   - Filtros para perguntas sem resposta
   - Métricas de frequência e origem das perguntas

6. **Integração Frontend-Backend**
   - Mapeamento correto de rotas e endpoints API
   - Estrutura para comunicação eficiente entre os dois sistemas
   - Tratamento de erros e estados de carregamento
   - Integração entre módulos de agendamento, planos de terapia e financeiro

## Problemas Recentes e Soluções

### Problema: Erro no AppointmentForm.tsx relacionado à exportação do BranchContext
**Descrição**: O componente AppointmentForm estava tendo problemas para importar corretamente o contexto de filial, resultando em erros durante a renderização.

**Solução Implementada**:
- Adicionada exportação explícita do BranchContext no arquivo BranchContext.tsx
- Verificado que o contexto é corretamente importado nos componentes que o utilizam
- Corrigido o uso de hooks de contexto em todos os formulários

### Problema: Erro ao buscar agendamentos no backend
**Descrição**: O Prisma Client está gerando erros ao tentar buscar agendamentos devido a inconsistências nos relacionamentos.
```
Invalid `this.prisma.appointment.findMany()` invocation in
Inconsistent query result: Field client is required to return data, got `null` instead.
```

**Possíveis Causas**:
- Relacionamento mal configurado no schema Prisma
- Dados inconsistentes na base de dados
- Problema na inclusão automática de relações

**Abordagens de Solução**:
1. Verificar se todos os registros em Appointment possuem um clientId válido
2. Modificar a consulta para lidar melhor com relacionamentos potencialmente nulos
3. Atualizar o schema Prisma para permitir relacionamentos opcionais
4. Isolar a recuperação dos dados em etapas separadas

### Problema: Rotas de API precisam de ajuste
**Descrição**: As rotas da API da Base de Conhecimento precisam seguir um padrão consistente com prefixo "/api" e estrutura hierárquica adequada.

**Solução Implementada**:
- Ajustado o cliente de API no frontend para usar o prefixo correto
- Padronizada a estrutura de endpoints para seguir o formato `/api/knowledge/...`
- Rotas organizadas hierarquicamente para refletir relacionamentos:
  ```
  /api/knowledge
  /api/knowledge/categories
  /api/knowledge/frequent-questions
  ```

### Problema: Duplicação de arquivo MainLayout.tsx
**Descrição**: Foi encontrado um arquivo MainLayout.tsx duplicado na raiz do projeto, enquanto o correto está em src/layouts/MainLayout.tsx.

**Solução Implementada**:
- Removido o arquivo duplicado da raiz do projeto (painel-clinica/src/MainLayout.tsx)
- Confirmado que todas as importações estão apontando para a versão correta em src/layouts/MainLayout.tsx

### Problema: Erro no tema Material UI relacionado à definição de elevação
**Descrição**: O tema Material UI apresentava um erro relacionado à definição incompleta de elevação (shadows).

**Solução Implementada**:
- Atualizado o arquivo theme.ts para incluir todos os 25 níveis de sombra necessários
- Verificado que as definições estão completas e seguem o padrão esperado pelo Material UI

## Decisões Técnicas Recentes

### Estrutura de Serviços para Novos Módulos
- Decisão: Criar serviços específicos para gerenciar Planos de Terapia e Finanças
- Implementação: Criados os arquivos `src/services/therapyPlanService.ts` e `src/services/financeService.ts`
- Benefícios:
  - Organização clara da comunicação com a API
  - Tipagem forte para todas as entidades
  - Separação de responsabilidades por domínio

### Integração entre Módulos
- Decisão: Implementar fluxos automáticos entre agendamentos, planos e finanças
- Implementação: 
  - Consumo automático de sessões ao confirmar agendamento
  - Geração de transações financeiras ao criar planos e assinaturas
- Benefícios:
  - Consistência de dados entre módulos
  - Automação de tarefas repetitivas
  - Melhor experiência do usuário

### Padronização da Comunicação com a API
- Decisão: Centralizar toda a configuração de API em um único arquivo
- Implementação: Criado o arquivo `src/api/index.ts` para configuração do Axios
- Benefícios: 
  - Simplifica a manutenção
  - Garante consistência no tratamento de erros
  - Facilita a adição de interceptores globais

### Tipagem Forte para Comunicação Frontend-Backend
- Decisão: Criar interfaces TypeScript para todos os modelos de dados
- Implementação: Adicionado o diretório `src/types` com definições explícitas
- Benefícios:
  - Prevenção de erros em tempo de compilação
  - Melhor autocompleção e documentação inline
  - Validação consistente entre cliente e servidor

### Estrutura de Serviços para Acesso à API
- Decisão: Organizar chamadas de API em serviços específicos por domínio
- Implementação: Criado o arquivo `src/services/knowledgeService.ts` 
- Benefícios:
  - Encapsulamento da lógica de API
  - Reutilização de código
  - Facilidade para implementar caching e otimizações

### Organização de Layouts
- Decisão: Manter todos os layouts em diretório específico
- Implementação: Consolidado os arquivos de layout em `src/layouts/`
- Benefícios:
  - Organização mais clara do código
  - Evita duplicação de componentes
  - Facilita a manutenção dos diferentes layouts

## Padrões em Evolução

### UI/UX
- **Tendência Atual**: Adoção de modais para ações focadas (formulários) em vez de navegação
- **Evolução**: Melhorar feedback visual em operações assíncronas e estados intermediários
- **Próximos Passos**: Implementar animações de transição e toasts para notificações não-intrusivas

### Gestão de Estado
- **Tendência Atual**: Uso de combinação de Context API e useState local
- **Evolução**: Considerar bibliotecas de gestão de estado para operações mais complexas
- **Próximos Passos**: Avaliar implementação de React Query para cache e sincronização com servidor

### Formulários
- **Tendência Atual**: Formulários gerenciados com hooks useState
- **Evolução**: Migrar para React Hook Form para melhor desempenho e validação
- **Próximos Passos**: Criar componentes de formulário reutilizáveis com validação integrada

## Desafios Atuais e Próximos Passos

### Desafios Imediatos
1. **Correção de Erros de Tipagem**: Resolver problemas com react-hook-form e outros pacotes
2. **Implementação de Relatórios Financeiros**: Criar visualizações detalhadas do fluxo financeiro
3. **Integração Completa entre Módulos**: Finalizar a integração entre agendamentos, planos e finanças
4. **Conexão com API**: Resolver erros de integração e garantir consistência nas chamadas
5. **Tratamento de Erros**: Implementar estratégia robusta para tratamento de erros de API

### Próximos Incrementos Planejados
1. **Relatórios Financeiros Avançados**:
   - Gráficos de fluxo de caixa
   - Análise de receitas e despesas por categoria
   - Projeções financeiras baseadas em assinaturas ativas

2. **Gestão Avançada de Planos**:
   - Renovação automática de planos
   - Notificações de expiração e sessões restantes
   - Histórico detalhado de consumo de sessões

3. **Dashboard Aprimorado**:
   - Adicionar métricas relacionadas à base de conhecimento
   - Visualizações gráficas de dados de uso
   - Indicadores de performance por terapeuta

4. **Autenticação e Autorização**:
   - Implementar controle de acesso baseado em funções
   - Suporte a múltiplos perfis de usuário
   - Tela de gerenciamento de usuários

5. **Melhorias de UX**:
   - Tema escuro/claro
   - Layouts responsivos otimizados
   - Feedback visual aprimorado

### Bugs e Problemas Conhecidos
- Erro ao carregar agendamentos devido a problema de relacionamento no Prisma
- Inconsistência no formato de datas entre frontend e backend
- Problemas com o DatePicker do Material UI X em algumas situações
- Erro na exportação do BranchContext afetando o AppointmentForm

## Insights e Aprendizados

### Insights Técnicos
- A estrutura modular facilita a adição de novos módulos, mas requer atenção na integração entre eles
- O uso de tipagem forte no TypeScript é essencial para manter a consistência entre frontend e backend
- Os formulários complexos com validações e campos dinâmicos requerem gerenciamento cuidadoso

### Oportunidades de Melhoria
- Implementar testes automatizados tanto no frontend quanto no backend
- Melhorar a documentação de API com exemplos mais claros
- Adicionar mais validações de segurança para entradas de usuário
- Garantir que não existam arquivos duplicados ou não utilizados no projeto

### Decisões a Reconsiderar
- Avaliar o uso do Prisma vs TypeORM para o ORM do backend
- Considerar alternativas ao Material UI para alguns componentes específicos
- Repensar a estratégia de autenticação para suportar múltiplos tipos de usuários 