# Visão Geral do Projeto: Microsserviço de Autenticação e Organizações (`auth-service`)

**Data:** 2024-07-27 (Atualizado)

## 1. Introdução

Este documento fornece uma visão geral do microsserviço `auth-service`. Construído em NestJS, ele é responsável por funcionalidades críticas como autenticação (registro, login, reset de senha), gerenciamento de usuários, gerenciamento de organizações e participantes, e operações administrativas.

O serviço está passando por um processo de **refatoração e evolução contínua** para endereçar desafios de manutenibilidade, confiabilidade e para adaptar-se a novos casos de uso. Os guias técnicos para esta evolução são:

*   `docs/refactoring_tdd.md`: Define as decisões técnicas (arquitetura, tecnologias, estrutura) que guiam tanto a refatoração inicial quanto o desenvolvimento de novas funcionalidades.
*   `docs/api_legacy_documentation.md`: Documenta a API original, servindo como base para garantir a retrocompatibilidade.

## 2. Objetivos de Longo Prazo

Os objetivos centrais para a evolução deste microsserviço são:

*   Manter e melhorar continuamente a qualidade do código.
*   Garantir alta robustez e confiabilidade.
*   Possuir um sistema de **logs** estruturado e eficaz.
*   Manter e evoluir um sistema de **permissionamento** granular e flexível.
*   Suportar de forma nativa cenários onde o conceito de **Organização é opcional**.
*   Preservar a **retrocompatibilidade** com a API existente sempre que possível.
*   Implementar mudanças (refatoração e novas features) de forma **gradual** e segura.

## 3. Decisões Técnicas Fundamentais (Resumo do TDD)

*   **Framework:** **NestJS**.
*   **Estrutura:** Padrão NestJS com serviços granulares e modelos centralizados (`src/models/`).
*   **Logging:** **Pino** (`nestjs-pino`).
*   **Permissionamento:** **CASL** (`@casl/ability`).
*   **Organizações Opcionais:** Suportado na modelagem e lógica.
*   **Banco de Dados:** **Mongoose** (ou similar) + Repositories + **Migrations**.
*   **Eventos Internos:** `@nestjs/event-emitter`.
*   **Testes:** **Jest** (Unit, Integration, E2E).

## 4. Princípios Orientadores

*   **Retrocompatibilidade Primeiro:** A API legada é o contrato base. Quebras devem ser evitadas ou cuidadosamente gerenciadas.
*   **Migração e Evolução Gradual:** Mudanças são introduzidas em fases ou de forma iterativa.
*   **Flexibilidade:** O design acomoda diversos modelos de implantação (SaaS/não-SaaS, multi/single-tenant).

## 5. Modelo de Implantação

Lembrete: **Cada projeto/aplicação cliente recebe sua própria instância independente deste serviço**. O design não deve assumir estado compartilhado entre instâncias.

## 6. Considerações Futuras

*   **Observabilidade Unificada:** Investigar centralização de logs/métricas/traces de múltiplas instâncias.
*   **Evolução da API:** Planejar futuras versões da API que possam introduzir mudanças não retrocompatíveis de forma controlada.

---

Este documento, junto com o TDD e a documentação da API legada, forma a base de conhecimento para o desenvolvimento contínuo do `auth-service`. 