# Documentação da API do Microsserviço de Autenticação e Organizações

Este documento detalha todas as rotas da API existentes, seus parâmetros, corpos de requisição esperados e propósitos.

## Autenticação (`/auth`, `/login`, `/registro`, `/users`, `/recovery`, `/reset-password`)

### 1. Registro de Usuário

*   **Endpoint:** `POST /registro`
*   **Descrição:** Cria uma nova conta de usuário no sistema.
*   **Autenticação:** Nenhuma.
*   **Corpo da Requisição:** `RegisterDto` (contém dados como `name`, `email`, `password`, `cpf`, etc.).
*   **Possíveis Respostas:**
    *   `201 Created`: Usuário criado com sucesso (retorna dados do usuário).
    *   `400 Bad Request`: Dados inválidos na requisição.
    *   `409 Conflict` (Implícito): E-mail ou CPF já cadastrado (depende da implementação do UseCase).
    *   `500 Internal Server Error`: Erro interno.

### 2. Login de Usuário

*   **Endpoint:** `POST /login`
*   **Descrição:** Autentica um usuário existente.
*   **Autenticação:** Nenhuma.
*   **Corpo da Requisição:** `LoginUserDto` (contém `email` e `password`).
*   **Possíveis Respostas:**
    *   `201 Created` (ou `200 OK`): Login bem-sucedido (retorna tokens JWT - acesso e refresh - ou dados da sessão).
    *   `400 Bad Request`: Dados inválidos na requisição.
    *   `401 Unauthorized`: Credenciais inválidas.
    *   `500 Internal Server Error`: Erro interno.

### 3. Verificação de E-mail

*   **Endpoint:** `POST /users/:id/verify-email`
*   **Descrição:** Confirma o endereço de e-mail do usuário usando um token.
*   **Autenticação:** Nenhuma.
*   **Parâmetros de Rota:**
    *   `id`: ID do usuário.
*   **Corpo da Requisição:** `{ "emailToken": "string" }`
*   **Possíveis Respostas:**
    *   `200 OK`: E-mail verificado com sucesso.
    *   `400 Bad Request`: Token inválido ou expirado, ID do usuário não encontrado.
    *   `500 Internal Server Error`: Erro interno.

### 4. Reenvio de E-mail de Verificação

*   **Endpoint:** `PUT /auth/email-verification`
*   **Descrição:** Solicita o reenvio do e-mail de verificação para o usuário logado.
*   **Autenticação:** Requer JWT (`Authorization: Bearer <token>`).
*   **Possíveis Respostas:**
    *   `200 OK` (ou `202 Accepted`): Solicitação de reenvio aceita.
    *   `401 Unauthorized`: Token JWT inválido ou ausente.
    *   `400 Bad Request`: Usuário já verificado ou não encontrado.
    *   `500 Internal Server Error`: Erro interno.

### 5. Solicitação de Redefinição de Senha

*   **Endpoint:** `POST /reset-password`
*   **Descrição:** Inicia o fluxo de redefinição de senha enviando um e-mail com um token.
*   **Autenticação:** Nenhuma.
*   **Corpo da Requisição:** `{ "email": "string" }`
*   **Possíveis Respostas:**
    *   `200 OK` (ou `202 Accepted`): Solicitação aceita (e-mail será enviado se o usuário existir).
    *   `400 Bad Request`: E-mail inválido.
    *   `404 Not Found`: E-mail não cadastrado.
    *   `500 Internal Server Error`: Erro interno.

### 6. Redefinição de Senha (Confirmação)

*   **Endpoint:** `PUT /reset-password/:token`
*   **Descrição:** Define uma nova senha usando o token de redefinição.
*   **Autenticação:** Nenhuma.
*   **Parâmetros de Rota:**
    *   `token`: Token recebido por e-mail.
*   **Corpo da Requisição:** `RequestResetPasswordDto` (contém `password` e `passwordConfirmation`).
*   **Possíveis Respostas:**
    *   `200 OK`: Senha redefinida com sucesso.
    *   `400 Bad Request`: Token inválido/expirado, senhas não conferem ou não atendem aos critérios.
    *   `500 Internal Server Error`: Erro interno.

### 7. Alteração de Senha (Usuário Logado)

*   **Endpoint:** `PUT /recovery/password`
*   **Descrição:** Permite que um usuário autenticado altere sua própria senha.
*   **Autenticação:** Requer JWT (`Authorization: Bearer <token>`).
*   **Corpo da Requisição:** `ChangePasswordDto` (contém `oldPassword`, `newPassword`, `newPasswordConfirmation`).
*   **Possíveis Respostas:**
    *   `200 OK` (ou `201 Created`): Senha alterada com sucesso.
    *   `400 Bad Request`: Senha antiga incorreta, novas senhas não conferem ou inválidas.
    *   `401 Unauthorized`: Token JWT inválido ou ausente.
    *   `500 Internal Server Error`: Erro interno.

### 8. Atualização de Dados do Usuário

*   **Endpoint:** `PATCH /updated-user/:id`
*   **Descrição:** Atualiza informações do perfil do usuário.
*   **Autenticação:** Requer JWT (`Authorization: Bearer <token>`). (Embora não haja `UseGuards` explícito no controller, o endpoint `/updated-user/` pode estar protegido globalmente ou a verificação pode ocorrer no UseCase/Service). **Verificar permissões!** Pode ser que um usuário só possa atualizar seus próprios dados, ou precise de permissões específicas.
*   **Parâmetros de Rota:**
    *   `id`: ID do usuário a ser atualizado.
*   **Parâmetros de Query:**
    *   `findDuplicates` (opcional, array): Campos para verificar duplicidade (ex: `email`, `cpf`).
*   **Corpo da Requisição:** `UpdateUserDto` (campos a serem atualizados, ex: `name`, `phone`, etc.).
*   **Possíveis Respostas:**
    *   `200 OK` (ou `201 Created`): Usuário atualizado com sucesso.
    *   `400 Bad Request`: Dados inválidos, conflito de duplicidade.
    *   `401 Unauthorized`/`403 Forbidden`: Sem permissão para atualizar este usuário.
    *   `404 Not Found`: Usuário não encontrado.
    *   `500 Internal Server Error`: Erro interno.

### 9. Refresh Token Info (Potencialmente Obter Novo Token de Acesso)

*   **Endpoint:** `POST /auth/refresh-token-info`
*   **Descrição:** Ação relacionada a refresh tokens. Pode ser para validar um refresh token, obter informações sobre ele, ou usá-lo para gerar um novo token de acesso. A implementação exata está no `RefreshTokenInfoService`.
*   **Autenticação:** Requer JWT (`Authorization: Bearer <token>`). O uso do token de acesso aqui é incomum para uma operação de *refresh*, que normalmente usa o *refresh token* em si. **Verificar implementação!**
*   **Possíveis Respostas:**
    *   `200 OK`/`201 Created`: Operação bem-sucedida (retorna novas informações ou tokens).
    *   `401 Unauthorized`: Token JWT inválido ou ausente (ou refresh token inválido, dependendo da lógica).
    *   `500 Internal Server Error`: Erro interno.

---

## Organizações (`/organizations`)

Estas rotas são para usuários autenticados gerenciarem suas próprias organizações.

### 1. Criar Organização

*   **Endpoint:** `POST /organizations`
*   **Descrição:** Cria uma nova organização associada ao usuário logado.
*   **Autenticação:** Requer JWT (`Authorization: Bearer <token>`).
*   **Corpo da Requisição:** `CreateOrganizationDto` (contém dados como `name`, etc.).
*   **Possíveis Respostas:**
    *   `201 Created`: Organização criada com sucesso.
    *   `400 Bad Request`: Dados inválidos.
    *   `401 Unauthorized`: Token JWT inválido ou ausente.
    *   `500 Internal Server Error`: Erro interno.

### 2. Listar Organizações

*   **Endpoint:** `GET /organizations`
*   **Descrição:** Lista as organizações às quais o usuário logado pertence ou tem acesso.
*   **Autenticação:** Requer JWT (`Authorization: Bearer <token>`).
*   **Parâmetros de Query:**
    *   `showInactive` (boolean, opcional): Incluir organizações inativas na listagem.
*   **Possíveis Respostas:**
    *   `200 OK`: Retorna lista de organizações.
    *   `401 Unauthorized`: Token JWT inválido ou ausente.
    *   `500 Internal Server Error`: Erro interno.

### 3. Buscar Organização por ID

*   **Endpoint:** `GET /organizations/:id`
*   **Descrição:** Obtém detalhes de uma organização específica, verificando a permissão do usuário.
*   **Autenticação:** Requer JWT (`Authorization: Bearer <token>`).
*   **Parâmetros de Rota:**
    *   `id`: ID da organização.
*   **Possíveis Respostas:**
    *   `200 OK`: Retorna detalhes da organização.
    *   `401 Unauthorized`: Token JWT inválido ou ausente.
    *   `403 Forbidden`: Usuário sem permissão para acessar esta organização.
    *   `404 Not Found`: Organização não encontrada.
    *   `500 Internal Server Error`: Erro interno.

### 4. Atualizar Organização

*   **Endpoint:** `PATCH /organizations/:id`
*   **Descrição:** Atualiza dados de uma organização específica. Requer permissão.
*   **Autenticação:** Requer JWT (`Authorization: Bearer <token>`).
*   **Parâmetros de Rota:**
    *   `id`: ID da organização.
*   **Corpo da Requisição:** `UpdateOrganizationDto` (campos a serem atualizados).
*   **Possíveis Respostas:**
    *   `200 OK`: Organização atualizada com sucesso.
    *   `400 Bad Request`: Dados inválidos.
    *   `401 Unauthorized`: Token JWT inválido ou ausente.
    *   `403 Forbidden`: Usuário sem permissão para atualizar esta organização.
    *   `404 Not Found`: Organização não encontrada.
    *   `500 Internal Server Error`: Erro interno.

### 5. Remover Organização

*   **Endpoint:** `DELETE /organizations/:id`
*   **Descrição:** Remove (ou marca como inativa) uma organização específica. Requer permissão.
*   **Autenticação:** Requer JWT (`Authorization: Bearer <token>`).
*   **Parâmetros de Rota:**
    *   `id`: ID da organização.
*   **Possíveis Respostas:**
    *   `200 OK` (ou `204 No Content`): Organização removida com sucesso.
    *   `401 Unauthorized`: Token JWT inválido ou ausente.
    *   `403 Forbidden`: Usuário sem permissão para remover esta organização.
    *   `404 Not Found`: Organização não encontrada.
    *   `500 Internal Server Error`: Erro interno.

---

## Participantes de Organizações (`/organizations/:organizationId/participants`)

Estas rotas gerenciam os membros (participantes) dentro de uma organização específica, acessíveis por usuários autenticados com permissão na organização.

### 1. Adicionar Participante

*   **Endpoint:** `POST /organizations/:organizationId/participants`
*   **Descrição:** Adiciona um novo participante a uma organização.
*   **Autenticação:** Requer JWT (`Authorization: Bearer <token>`).
*   **Parâmetros de Rota:**
    *   `organizationId`: ID da organização.
*   **Corpo da Requisição:** `CreateParticipantDto` (contém `userId`, `role`, etc.).
*   **Possíveis Respostas:**
    *   `201 Created`: Participante adicionado com sucesso.
    *   `400 Bad Request`: Dados inválidos (ex: usuário já é participante).
    *   `401 Unauthorized`: Token JWT inválido ou ausente.
    *   `403 Forbidden`: Usuário sem permissão para adicionar participantes nesta organização.
    *   `404 Not Found`: Organização ou usuário não encontrado.
    *   `500 Internal Server Error`: Erro interno.

### 2. Listar Participantes

*   **Endpoint:** `GET /organizations/:organizationId/participants`
*   **Descrição:** Lista todos os participantes de uma organização.
*   **Autenticação:** Requer JWT (`Authorization: Bearer <token>`).
*   **Parâmetros de Rota:**
    *   `organizationId`: ID da organização.
*   **Possíveis Respostas:**
    *   `200 OK`: Retorna lista de participantes.
    *   `401 Unauthorized`: Token JWT inválido ou ausente.
    *   `403 Forbidden`: Usuário sem permissão para listar participantes nesta organização.
    *   `404 Not Found`: Organização não encontrada.
    *   `500 Internal Server Error`: Erro interno.

### 3. Buscar Participante por ID

*   **Endpoint:** `GET /organizations/:organizationId/participants/:id`
*   **Descrição:** Obtém detalhes de um participante específico dentro de uma organização.
*   **Autenticação:** Requer JWT (`Authorization: Bearer <token>`).
*   **Parâmetros de Rota:**
    *   `organizationId`: ID da organização.
    *   `id`: ID do participante (geralmente o ID da *relação* participante-organização, não o ID do usuário). **Confirmar estrutura!**
*   **Possíveis Respostas:**
    *   `200 OK`: Retorna detalhes do participante.
    *   `401 Unauthorized`: Token JWT inválido ou ausente.
    *   `403 Forbidden`: Usuário sem permissão para ver este participante.
    *   `404 Not Found`: Organização ou participante não encontrado.
    *   `500 Internal Server Error`: Erro interno.

### 4. Atualizar Participante

*   **Endpoint:** `PATCH /organizations/:organizationId/participants/:id`
*   **Descrição:** Atualiza informações de um participante (ex: mudar o papel/role).
*   **Autenticação:** Requer JWT (`Authorization: Bearer <token>`).
*   **Parâmetros de Rota:**
    *   `organizationId`: ID da organização.
    *   `id`: ID do participante.
*   **Corpo da Requisição:** `UpdateParticipantDto` (campos a serem atualizados, ex: `role`).
*   **Possíveis Respostas:**
    *   `200 OK`: Participante atualizado com sucesso.
    *   `400 Bad Request`: Dados inválidos.
    *   `401 Unauthorized`: Token JWT inválido ou ausente.
    *   `403 Forbidden`: Usuário sem permissão para atualizar este participante.
    *   `404 Not Found`: Organização ou participante não encontrado.
    *   `500 Internal Server Error`: Erro interno.

### 5. Remover Participante

*   **Endpoint:** `DELETE /organizations/:organizationId/participants/:id`
*   **Descrição:** Remove um participante de uma organização.
*   **Autenticação:** Requer JWT (`Authorization: Bearer <token>`).
*   **Parâmetros de Rota:**
    *   `organizationId`: ID da organização.
    *   `id`: ID do participante.
*   **Possíveis Respostas:**
    *   `200 OK` (ou `204 No Content`): Participante removido com sucesso.
    *   `401 Unauthorized`: Token JWT inválido ou ausente.
    *   `403 Forbidden`: Usuário sem permissão para remover este participante.
    *   `404 Not Found`: Organização ou participante não encontrado.
    *   `500 Internal Server Error`: Erro interno.

---

## Administração (`/admin`)

Estas rotas são destinadas a operações administrativas e requerem uma chave de aplicação (`application-key`) no header.

### Admin: Usuários (`/admin/users`)

#### 1. Criar Usuário (Admin)

*   **Endpoint:** `POST /admin/users`
*   **Descrição:** Cria um novo usuário (ação administrativa).
*   **Autenticação:** Requer Header `application-key`.
*   **Corpo da Requisição:** `CreateUserDto` (similar ao `RegisterDto`, mas pode ter campos adicionais ou validações diferentes).
*   **Possíveis Respostas:**
    *   `201 Created`: Usuário criado com sucesso.
    *   `400 Bad Request`: Dados inválidos.
    *   `401 Unauthorized`/`403 Forbidden`: Chave de aplicação inválida ou ausente.
    *   `500 Internal Server Error`: Erro interno.

#### 2. Exportar Usuários para CSV (Admin)

*   **Endpoint:** `POST /admin/users/export`
*   **Descrição:** Inicia a exportação de dados de usuários para um arquivo CSV. A resposta pode ser o arquivo diretamente ou um link/job ID.
*   **Autenticação:** Requer Header `application-key`.
*   **Possíveis Respostas:**
    *   `200 OK`/`202 Accepted`: Exportação iniciada/concluída (retorna CSV ou status).
    *   `401 Unauthorized`/`403 Forbidden`: Chave de aplicação inválida ou ausente.
    *   `500 Internal Server Error`: Erro interno.

#### 3. Listar Usuários (Admin)

*   **Endpoint:** `GET /admin/users`
*   **Descrição:** Lista usuários com paginação.
*   **Autenticação:** Requer Header `application-key`.
*   **Parâmetros de Query:**
    *   `page` (number, opcional, default: 1): Número da página.
    *   `limit` (number, opcional, default: 10): Quantidade de itens por página.
*   **Possíveis Respostas:**
    *   `200 OK`: Retorna lista paginada de usuários.
    *   `401 Unauthorized`/`403 Forbidden`: Chave de aplicação inválida ou ausente.
    *   `500 Internal Server Error`: Erro interno.

#### 4. Buscar Usuário por ID (Admin)

*   **Endpoint:** `GET /admin/users/:id`
*   **Descrição:** Obtém detalhes de um usuário específico.
*   **Autenticação:** Requer Header `application-key`.
*   **Parâmetros de Rota:**
    *   `id`: ID do usuário.
*   **Possíveis Respostas:**
    *   `200 OK`: Retorna detalhes do usuário.
    *   `401 Unauthorized`/`403 Forbidden`: Chave de aplicação inválida ou ausente.
    *   `404 Not Found`: Usuário não encontrado.
    *   `500 Internal Server Error`: Erro interno.

#### 5. Atualizar Usuário (Admin)

*   **Endpoint:** `PATCH /admin/users/:id`
*   **Descrição:** Atualiza dados de um usuário específico. **A implementação atual `this.usersService.update()` parece incompleta, não recebe DTO.**
*   **Autenticação:** Requer Header `application-key`.
*   **Parâmetros de Rota:**
    *   `id`: ID do usuário.
*   **Corpo da Requisição:** `UpdateUserDto`.
*   **Possíveis Respostas:**
    *   `200 OK`: Usuário atualizado com sucesso.
    *   `400 Bad Request`: Dados inválidos.
    *   `401 Unauthorized`/`403 Forbidden`: Chave de aplicação inválida ou ausente.
    *   `404 Not Found`: Usuário não encontrado.
    *   `500 Internal Server Error`: Erro interno.

#### 6. Remover Usuário (Admin)

*   **Endpoint:** `DELETE /admin/users/:id`
*   **Descrição:** Remove um usuário específico.
*   **Autenticação:** Requer Header `application-key`.
*   **Parâmetros de Rota:**
    *   `id`: ID do usuário.
*   **Possíveis Respostas:**
    *   `200 OK` (ou `204 No Content`): Usuário removido com sucesso.
    *   `401 Unauthorized`/`403 Forbidden`: Chave de aplicação inválida ou ausente.
    *   `404 Not Found`: Usuário não encontrado.
    *   `500 Internal Server Error`: Erro interno.

### Admin: Organizações (`/admin/organizations`)

#### 1. Criar Organização (Admin)

*   **Endpoint:** `POST /admin/organizations`
*   **Descrição:** Cria uma nova organização (ação administrativa).
*   **Autenticação:** Requer Header `application-key`.
*   **Corpo da Requisição:** Dados da organização (DTO não especificado claramente, usa `bodyData`).
*   **Possíveis Respostas:**
    *   `201 Created`: Organização criada com sucesso.
    *   `400 Bad Request`: Dados inválidos.
    *   `401 Unauthorized`/`403 Forbidden`: Chave de aplicação inválida ou ausente.
    *   `500 Internal Server Error`: Erro interno.

#### 2. Listar Organizações (Admin)

*   **Endpoint:** `GET /admin/organizations`
*   **Descrição:** Lista organizações com paginação.
*   **Autenticação:** Requer Header `application-key`.
*   **Parâmetros de Query:**
    *   `page` (number, opcional, default: 1): Número da página.
    *   `limit` (number, opcional, default: 10): Quantidade de itens por página.
*   **Possíveis Respostas:**
    *   `200 OK`: Retorna lista paginada de organizações.
    *   `401 Unauthorized`/`403 Forbidden`: Chave de aplicação inválida ou ausente.
    *   `500 Internal Server Error`: Erro interno.

#### 3. Buscar Organização por ID (Admin)

*   **Endpoint:** `GET /admin/organizations/:id`
*   **Descrição:** Obtém detalhes de uma organização específica.
*   **Autenticação:** Requer Header `application-key`.
*   **Parâmetros de Rota:**
    *   `id`: ID da organização.
*   **Possíveis Respostas:**
    *   `200 OK`: Retorna detalhes da organização.
    *   `401 Unauthorized`/`403 Forbidden`: Chave de aplicação inválida ou ausente.
    *   `404 Not Found`: Organização não encontrada.
    *   `500 Internal Server Error`: Erro interno.

#### 4. Atualizar Organização (Admin)

*   **Endpoint:** `PATCH /admin/organizations/:id`
*   **Descrição:** Atualiza dados de uma organização específica. **A implementação atual `this.organizationService.update()` parece incompleta, não recebe DTO.**
*   **Autenticação:** Requer Header `application-key`.
*   **Parâmetros de Rota:**
    *   `id`: ID da organização.
*   **Corpo da Requisição:** Dados da organização (`updateOrganization` não tipado).
*   **Possíveis Respostas:**
    *   `200 OK`: Organização atualizada com sucesso.
    *   `400 Bad Request`: Dados inválidos.
    *   `401 Unauthorized`/`403 Forbidden`: Chave de aplicação inválida ou ausente.
    *   `404 Not Found`: Organização não encontrada.
    *   `500 Internal Server Error`: Erro interno.

#### 5. Remover Organização (Admin)

*   **Endpoint:** `DELETE /admin/organizations/:id`
*   **Descrição:** Remove uma organização específica.
*   **Autenticação:** Requer Header `application-key`.
*   **Parâmetros de Rota:**
    *   `id`: ID da organização.
*   **Possíveis Respostas:**
    *   `200 OK` (ou `204 No Content`): Organização removida com sucesso.
    *   `401 Unauthorized`/`403 Forbidden`: Chave de aplicação inválida ou ausente.
    *   `404 Not Found`: Organização não encontrada.
    *   `500 Internal Server Error`: Erro interno.

### Admin: Participantes de Organizações (`/admin/organizations/:organizationId/participants`)

#### 1. Adicionar Participantes (Admin)

*   **Endpoint:** `POST /admin/organizations/:organizationId/participants`
*   **Descrição:** Adiciona um ou mais participantes a uma organização.
*   **Autenticação:** Requer Header `application-key`.
*   **Parâmetros de Rota:**
    *   `organizationId`: ID da organização.
*   **Corpo da Requisição:** Array de `CreateParticipantDto`.
*   **Possíveis Respostas:**
    *   `201 Created`: Participantes adicionados com sucesso.
    *   `400 Bad Request`: Dados inválidos.
    *   `401 Unauthorized`/`403 Forbidden`: Chave de aplicação inválida ou ausente.
    *   `404 Not Found`: Organização não encontrada.
    *   `500 Internal Server Error`: Erro interno.

#### 2. Listar Participantes (Admin)

*   **Endpoint:** `GET /admin/organizations/:organizationId/participants`
*   **Descrição:** Lista todos os participantes de uma organização.
*   **Autenticação:** Requer Header `application-key`.
*   **Parâmetros de Rota:**
    *   `organizationId`: ID da organização.
*   **Possíveis Respostas:**
    *   `200 OK`: Retorna lista de participantes.
    *   `401 Unauthorized`/`403 Forbidden`: Chave de aplicação inválida ou ausente.
    *   `404 Not Found`: Organização não encontrada.
    *   `500 Internal Server Error`: Erro interno.

#### 3. Remover Participante (Admin)

*   **Endpoint:** `DELETE /admin/organizations/:organizationId/participants/:id`
*   **Descrição:** Remove um participante específico de uma organização.
*   **Autenticação:** Requer Header `application-key`.
*   **Parâmetros de Rota:**
    *   `organizationId`: ID da organização.
    *   `id`: ID do participante a ser removido.
*   **Possíveis Respostas:**
    *   `200 OK` (ou `204 No Content`): Participante removido com sucesso.
    *   `401 Unauthorized`/`403 Forbidden`: Chave de aplicação inválida ou ausente.
    *   `404 Not Found`: Organização ou participante não encontrado.
    *   `500 Internal Server Error`: Erro interno.

---

## E-mails (Listeners Internos)

O `EmailsController` não possui rotas HTTP, mas escuta eventos internos para disparar e-mails:

*   **Evento:** `users.created`
    *   **Ação:** Envia e-mail de verificação para o novo usuário (se tiver `emailToken` e `email`).
*   **Evento:** `users.update-email`
    *   **Ação:** Envia novo e-mail de verificação quando o e-mail do usuário é alterado (se tiver `emailToken` e `email`).
*   **Evento:** `users.request-password-reset`
    *   **Ação:** Envia e-mail de redefinição de senha contendo o token (se tiver `email`).

---

**Observações:**

*   Muitos endpoints retornam `result.value` ou `handleErrorResponse(result.error)` vindo de UseCases que seguem um padrão Result (`isSuccess`/`isFailure`). A estrutura exata do erro (`result.error`) e do sucesso (`result.value`) pode variar.
*   Alguns DTOs (Data Transfer Objects) não foram detalhados (ex: campos exatos em `RegisterDto`, `LoginUserDto`, etc.). Seria necessário inspecionar os arquivos DTO correspondentes para completar essa informação.
*   As rotas PATCH de atualização de usuário e organização na área de admin (`/admin/users/:id` e `/admin/organizations/:id`) parecem ter implementações incompletas nos controllers, pois não passam os dados recebidos (`updateUserDto`, `updateOrganization`) para os respectivos serviços. Isso precisa ser corrigido ou verificado se a lógica está apenas no serviço.
*   A rota `POST /auth/refresh-token-info` usa autenticação JWT baseada no token de *acesso* para uma operação de *refresh*, o que é atípico. Verificar a lógica no `RefreshTokenInfoService`.
*   A proteção de rotas (ex: se um usuário só pode editar seus próprios dados ou organizações) geralmente é implementada nos UseCases/Serviços, mas não está explícita apenas pela análise dos controllers.
*   O ID do participante (`/organizations/:orgId/participants/:id`) pode se referir ao ID do usuário ou a um ID específico da relação `participante-organização`. A estrutura do banco de dados ou do serviço esclareceria isso.

</rewritten_file> 