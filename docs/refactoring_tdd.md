# Documento de Decisão Técnica: Refatoração do Microsserviço de Autenticação e Organizações

**Versão:** 1.1
**Data:** 2024-07-27

## 1. Introdução e Contexto

Este documento descreve as decisões técnicas para a refatoração do atual microsserviço de Autenticação e Organizações, construído em NestJS. O serviço lida com registro, login, gerenciamento de usuários, organizações, participantes e funcionalidades administrativas, conforme detalhado em `docs/api_legacy_documentation.md`.

A refatoração é motivada pela necessidade de resolver problemas recorrentes, melhorar a manutenibilidade, a testabilidade e estender a funcionalidade para suportar novos casos de uso, como a opcionalidade de organizações, um sistema de logs mais eficaz e um controle de permissões granular. A principal diretriz é garantir a **retrocompatibilidade** durante todo o processo, permitindo uma migração gradual e segura.

## 2. Objetivos da Refatoração

*   **Melhoria da Qualidade do Código:** Aumentar a manutenibilidade, legibilidade e aderência a boas práticas.
*   **Robustez e Confiabilidade:** Reduzir a ocorrência de bugs e facilitar a depuração.
*   **Logs Robustos:** Implementar um sistema de logging estruturado e contextualizado para monitoramento e análise eficazes.
*   **Permissionamento Granular:** Introduzir um sistema de controle de acesso baseado em papéis e permissões (RBAC/ABAC).
*   **Opcionalidade de Organizações:** Permitir que o sistema funcione corretamente mesmo em cenários onde o conceito de "Organização" não é mandatório para todos os usuários ou fluxos.
*   **Retrocompatibilidade:** Garantir que as mudanças não quebrem a API existente para os consumidores atuais.
*   **Migração Gradual:** Implementar as mudanças em fases, permitindo validação contínua e minimizando riscos.

## 3. Decisões Técnicas

### 3.1. Arquitetura Geral e Framework

*   **Framework:** Manter o **NestJS**. Sua natureza modular, suporte a TypeScript e ecossistema robusto são ideais para os objetivos.
*   **Princípios:** Focar em clareza, separação de responsabilidades e manutenibilidade dentro da estrutura padrão do NestJS.
*   **Módulos:** Organizar a aplicação em módulos coesos por feature (ver Estrutura de Pastas).

### 3.2. Estrutura de Pastas

Adotar uma estrutura baseada no padrão NestJS, com modificações para centralizar modelos e granularizar serviços:

```
src/
├── core/                   # Lógica compartilhada: Decorators, Pipes, Guards globais, Interfaces base, etc.
│   ├── guards/
│   ├── pipes/
│   ├── decorators/
│   └── ...
├── infra/                  # Configuração e implementação de infraestrutura: DB, Cache, Logging, HTTP Clients
│   ├── database/
│   │   ├── mongodb/        # Ex: Configuração Mongoose, conexão
│   │   └── migrations/
│   ├── logging/            # Configuração do Pino
│   ├── cache/              # Configuração do Cache (ex: Redis)
│   └── ...
├── models/                 # Pasta centralizada para todas as definições de Modelos/Entidades do BD
│   ├── user.model.ts       # Ex: Schema Mongoose para User
│   ├── organization.model.ts
│   ├── participant.model.ts
│   └── ...
├── modules/                # Módulos/Features principais da aplicação
│   ├── auth/
│   │   ├── controllers/    # Controllers (Auth, Login, Register, ResetPassword...)
│   │   │   └── auth.controller.ts
│   │   ├── services/       # Serviços específicos por ação/use case
│   │   │   ├── login-user.service.ts
│   │   │   ├── register-user.service.ts
│   │   │   ├── verify-email.service.ts
│   │   │   ├── refresh-token-info.service.ts # Serviço mencionado na doc legada
│   │   │   ├── resend-email-verification.service.ts # Serviço mencionado na doc legada
│   │   │   └── ...
│   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── login-user.dto.ts
│   │   │   └── register-user.dto.ts
│   │   ├── guards/         # Guards específicos do módulo (JwtAuthGuard, ApplicationKeyGuard)
│   │   ├── repositories/   # Abstrações/Implementações de acesso a dados (opcional, pode estar em infra)
│   │   │   └── user.repository.ts # Pode ser interface ou implementação concreta
│   │   └── auth.module.ts
│   ├── users/              # Módulo para gerenciamento de usuários (CRUD, Profile)
│   │   ├── controllers/
│   │   │   └── users.controller.ts # Pode cobrir CRUD ou ter controllers específicos
│   │   ├── services/
│   │   │   ├── create-user.service.ts # Serviço para POST /admin/users
│   │   │   ├── find-all-users.service.ts # Serviço para GET /admin/users
│   │   │   ├── find-one-user.service.ts # Serviço para GET /admin/users/:id
│   │   │   ├── update-user.service.ts # Serviço para PATCH /updated-user/:id e /admin/users/:id
│   │   │   ├── delete-user.service.ts # Serviço para DELETE /admin/users/:id
│   │   │   └── export-users.service.ts # Serviço para POST /admin/users/export
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── repositories/
│   │   │   └── ...
│   │   └── users.module.ts
│   ├── organizations/      # Módulo para gerenciamento de organizações
│   │   ├── controllers/    # OrganizationController (usuário) e AdminOrganizationController
│   │   ├── services/       # CreateOrganizationService, FindAllOrganizationsService, etc. (separado para admin/user se necessário)
│   │   ├── dto/
│   │   ├── repositories/
│   │   │   └── organization.repository.ts
│   │   └── organizations.module.ts
│   ├── participants/       # Módulo para gerenciamento de participantes
│   │   ├── controllers/    # ParticipantController (usuário) e AdminParticipantController
│   │   ├── services/       # AddParticipantService, ListParticipantsService, etc. (separado para admin/user)
│   │   ├── dto/
│   │   ├── repositories/
│   │   │   └── participant.repository.ts
│   │   └── participants.module.ts
│   ├── admin/              # Módulo agregador para funcionalidades administrativas (pode importar outros módulos)
│   │   ├── controllers/    # Pode ter controllers específicos de admin ou usar os dos módulos com guards
│   │   └── admin.module.ts # Configura o guard ApplicationKeyGuard para as rotas
│   └── emails/             # Módulo para envio de emails
│       ├── listeners/      # Handlers para @OnEvent
│       │   └── user-events.listener.ts
│       ├── services/       # Serviços de envio de email específicos
│       │   ├── send-verification-email.service.ts
│       │   └── send-reset-password-email.service.ts
│       └── emails.module.ts
├── app.module.ts
└── main.ts
```

*   **Explicação:**
    *   `src/core`: Mantido para código realmente transversal (pipes, guards globais, decorators).
    *   `src/infra`: Mantido para configuração e implementação de baixo nível de acesso a banco, logs, cache, etc.
    *   `src/models`: Nova pasta centralizada para definições de schema/modelo do banco de dados (ex: `user.model.ts` com o schema Mongoose).
    *   `src/modules`: Contém os módulos de features.
        *   Dentro de cada módulo:
            *   `controllers/`: Define os endpoints da API.
            *   `services/`: Contém classes de serviço focadas em ações específicas (ex: `create-user.service.ts` em vez de um `users.service.ts` genérico).
            *   `dto/`: Data Transfer Objects usados pelos controllers e services.
            *   `guards/`: Guards específicos daquele módulo.
            *   `repositories/` (Opcional): Pode conter interfaces ou implementações de repositório se não estiverem centralizadas na camada `infra`.
            *   `*.module.ts`: Arquivo de definição do módulo NestJS.
    *   `emails/listeners`: Pasta específica para os listeners de eventos (`@OnEvent`).
*   **Retrocompatibilidade:** A mudança na estrutura de pastas é interna e não afeta a API externa.

### 3.3. Logs

*   **Tecnologia:** Adotar **Pino** através do módulo `nestjs-pino`.
*   **Formato:** Padronizar logs em **JSON** para facilitar a integração com ferramentas de observabilidade (Datadog, ELK, etc.).
*   **Contexto:** Implementar logging contextualizado, incluindo `traceId` (ou `correlationId`) em todas as requisições para rastreabilidade ponta-a-ponta. O `nestjs-pino` facilita isso.
*   **Níveis:** Utilizar níveis de log apropriados (info, warn, error, debug).
*   **Cobertura:** Adicionar logs significativos na entrada/saída de controllers, services, tratamento de erros e eventos importantes.
*   **Retrocompatibilidade:** Implementação puramente aditiva e transparente para os consumidores da API.

### 3.4. Autenticação e Autorização (Permissionamento)

*   **Autenticação:**
    *   Manter **JWT** para autenticação de usuários (`JwtAuthGuard`). Isso garante retrocompatibilidade.
    *   Manter o `application-key` para rotas administrativas (`/admin/*`) *por enquanto*, por retrocompatibilidade. Avaliar substituição futura por roles/permissions de admin via JWT.
*   **Autorização (Permissionamento):**
    *   Adotar **CASL (`@casl/ability`)**. É uma biblioteca poderosa e flexível para definir permissões, integrando-se bem com NestJS.
    *   **Estratégia:** Definir *Subjects* (baseado nos Models em `src/models/`), *Actions* (create, read, update, delete, manage, etc.) e *Roles* (admin, user, org_owner, org_member, etc.).
    *   **Implementação:** Criar um `CaslAbilityFactory` para gerar a `Ability` do usuário com base em seus papéis e/ou permissões diretas (possivelmente armazenadas no DB ou no próprio token JWT). Usar um `PoliciesGuard` (ou similar) que utilize a `Ability` para verificar permissões nos controllers/rotas.
    *   **Migração Gradual:** Começar mapeando as permissões *implícitas* atuais (acesso a rotas `/admin` com `application-key`, acesso a rotas autenticadas com JWT) para regras CASL. Gradualmente, adicionar regras mais finas (ex: só o `org_owner` pode deletar a organização).
*   **Retrocompatibilidade:** A introdução de CASL pode ser feita de forma aditiva, inicialmente apenas replicando as regras de acesso existentes. Novas regras mais restritivas só devem ser aplicadas a novas funcionalidades ou em fases futuras (ver seção 6).

### 3.5. Organizações Opcionais

*   **Modelagem:**
    *   Ajustar os modelos em `src/models/` para tornar relacionamentos com `Organization` opcionais/nuláveis onde fizer sentido (ex: `User.organizationId` pode ser `null` no `user.model.ts`).
    *   Avaliar se o `participant.model.ts` ainda faz sentido universalmente ou se deve estar estritamente ligado a uma organização não-nula.
*   **Lógica de Negócio:** Adaptar os *Services* (em `src/modules/*/services/`) para lidar com cenários onde um usuário ou recurso não pertence a uma organização.
*   **API:**
    *   Manter as rotas existentes que incluem `:organizationId` no path (ex: `/organizations/:organizationId/participants`) para retrocompatibilidade.
    *   Avaliar a necessidade de *novas* rotas ou modificações em rotas existentes para cenários sem organização (ex: um `GET /users/me` que funcione independentemente de organização).
*   **Retrocompatibilidade:** As mudanças no banco (adicionar campos nuláveis nos modelos) e na lógica interna (nos serviços) podem ser feitas sem quebrar a API atual. Novas rotas são adições.

### 3.6. Interação por Eventos

*   **Eventos Internos:** Continuar usando `@nestjs/event-emitter` para comunicação *dentro* do mesmo microsserviço (como já é feito para e-mails, usando os listeners em `src/modules/emails/listeners/`). É simples e eficaz para baixo acoplamento entre módulos internos.
*   **Contratos de Eventos:** Definir DTOs claros para os payloads de cada evento para garantir um contrato estável.
*   **Eventos Externos (Futuro):** Se houver necessidade de comunicação com *outros* microsserviços, considerar a adoção de um Message Broker (ex: **RabbitMQ**, **Kafka**) usando `@nestjs/microservices`. Marcar como "Decisão Futura" se não for um requisito imediato.
*   **Retrocompatibilidade:** O uso de `@nestjs/event-emitter` é um detalhe de implementação interno.

### 3.7. Banco de Dados

*   **Tecnologia:** (Assumindo MongoDB, comum com NestJS, mas adaptar se for outro). Padronizar o uso de um ODM como **Mongoose** (`@nestjs/mongoose`), com os Schemas/Models definidos em `src/models/`.
*   **Repositórios:** Utilizar o padrão Repository para abstrair o acesso a dados. Interfaces podem ficar no módulo (`src/modules/*/repositories/`) ou no `core`, e implementações concretas podem ficar nos módulos ou na camada `infra`.
*   **Migrations:** Adotar uma ferramenta de migration (ex: `migrate-mongo`) para gerenciar alterações de schema de forma controlada e versionada (configuração em `src/infra/database/migrations/`). **Crucial** para migrações graduais e retrocompatíveis.
*   **Retrocompatibilidade:** Alterações de schema (nos arquivos de `src/models/`) devem ser retrocompatíveis na fase inicial (ex: adicionar campos nuláveis, evitar renomear/remover campos usados pela versão antiga da API). Migrations complexas devem ser planejadas com cuidado.

### 3.8. Testes

*   **Tipos:** Manter e expandir a cobertura de testes **Unitários** (para Services, Helpers), de **Integração** (para Módulos) e **End-to-End (E2E)** (para Controllers/API).
*   **Ferramentas:** Utilizar **Jest** (padrão do NestJS).
*   **Foco em Retrocompatibilidade:** Usar a `docs/api_legacy_documentation.md` como base para criar/manter testes E2E que garantam que nenhum endpoint existente seja quebrado durante a refatoração.
*   **Novas Funcionalidades:** Garantir cobertura de testes para todas as novas features e regras de permissão implementadas.

## 4. Plano de Migração Gradual

1.  **Fase 0: Preparação**
    *   Configurar ferramenta de migration de banco de dados.
    *   Implementar `nestjs-pino` e configurar logging básico.
    *   Melhorar cobertura de testes E2E para a API legada.
    *   Reorganizar pastas para a nova estrutura base (incluindo `src/models/` e `services/` granulares).
2.  **Fase 1: Fundações (Logs, Permissões Básicas)**
    *   Detalhar e implementar logging contextualizado.
    *   Introduzir CASL e o `PoliciesGuard`, mapeando as regras de acesso *atuais* (JWT, `application-key`) para roles/permissions iniciais. Garantir que o acesso continue funcionando como antes.
3.  **Fase 2: Organizações Opcionais e Permissões Granulares**
    *   Aplicar migrations no DB (via `src/infra/database/migrations/`) para tornar campos relacionados a organizações nuláveis nos modelos (`src/models/`).
    *   Refatorar os `services` para lidar com organizações opcionais.
    *   Começar a implementar permissões mais granulares com CASL (ex: `org_owner` vs `org_member`), aplicando-as *inicialmente* a funcionalidades novas ou internas, ou usando feature flags.
    *   Adicionar/Ajustar testes para cobrir os novos cenários.
4.  **Fase 3: Refatoração e Otimização**
    *   Refatorar módulos específicos identificados como problemáticos, focando na clareza e separação de responsabilidades dentro dos `services`.
    *   Corrigir implementações (ex: os métodos `update` nos controllers Admin que parecem incompletos, garantindo que chamem o `UpdateUserService` correto).
    *   Otimizar queries de banco de dados (nos repositórios).
    *   Expandir a cobertura de testes unitários e de integração.
5.  **Contínuo:** Monitorar logs e performance, coletar feedback e iterar sobre as melhorias.

*   **Feature Flags:** Utilizar feature flags (ex: variáveis de ambiente, config service) para habilitar/desabilitar gradualmente novas lógicas ou regras de permissão mais restritivas em produção.

## 5. Decisões Futuras (Potencialmente Não Retrocompatíveis)

Estas são mudanças que agregariam valor, mas exigiriam uma quebra de contrato com a API atual ou uma coordenação mais complexa, devendo ser planejadas para fases posteriores com comunicação adequada aos consumidores:

*   Renomear rotas para melhor semântica (ex: `/updated-user` -> `/users`, `/recovery` -> `/account/password`).
*   Substituir a autenticação por `application-key` por um sistema de roles/permissions para admin via JWT.
*   Remover endpoints ou campos de DTO marcados como obsoletos após um período de depreciação.
*   Introduzir um Message Broker para eventos que se tornem críticos para comunicação inter-serviços.
*   Realizar alterações de schema de banco de dados que não sejam retrocompatíveis (ex: renomear coleção/tabela, remover campos nos modelos em `src/models/`).

## 6. Considerações Adicionais

*   **Observabilidade:** Integrar com ferramentas de monitoramento (ex: Datadog APM, Prometheus/Grafana) e tracing distribuído (ex: OpenTelemetry) para uma visão completa da saúde da aplicação.
*   **CI/CD:** Garantir que o pipeline de CI/CD execute todos os testes (unit, integration, e2e) e linting a cada commit/PR. Automatizar deployments.
*   **Documentação:** Manter a documentação da API (seja via Swagger/OpenAPI ou Markdown) atualizada conforme as mudanças são implementadas.

## 7. Conclusão

Esta proposta de refatoração visa modernizar o microsserviço, tornando-o mais robusto, manutenível e flexível para novas demandas, ao mesmo tempo que mitiga os riscos através de um foco estrito em **retrocompatibilidade** e **migração gradual**. A adoção de tecnologias como Pino para logs, CASL para permissões e a estrutura de pastas padrão do NestJS modificada (com serviços granulares e modelos centralizados) fornecerá uma base sólida para o futuro do serviço. 