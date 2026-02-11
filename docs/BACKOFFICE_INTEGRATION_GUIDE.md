# Guia Completo de Integração - Backoffice para Auth Service

## 📋 Sumário

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Autenticação e Segurança](#autenticação-e-segurança)
4. [Entidades e Relacionamentos](#entidades-e-relacionamentos)
5. [APIs Disponíveis para Backoffice](#apis-disponíveis-para-backoffice)
6. [Casos de Uso Operacionais](#casos-de-uso-operacionais)
7. [Funcionalidades Faltantes (Roadmap)](#funcionalidades-faltantes-roadmap)
8. [Boas Práticas de Implementação](#boas-práticas-de-implementação)
9. [Exemplos de Código](#exemplos-de-código)
10. [Troubleshooting](#troubleshooting)

---

## Visão Geral

Este documento descreve como integrar um **Backoffice Administrativo** com o microserviço de autenticação `non-saas-auth-service`. O objetivo é permitir que administradores possam:

- ✅ Criar e gerenciar **Organizations** (tenants/empresas)
- ✅ Criar e gerenciar **Usuários**
- ✅ Gerenciar **Participantes** (relação usuário-organização)
- 🔶 Gerar tokens para **impersonificação** de usuários
- ✅ Visualizar IDs e dados das entidades
- ✅ Exportar dados de usuários

### Ambiente de Produção

```plaintext
Base URL: https://your-auth-service.com
Header de Autenticação Admin: application-key: <YOUR_APPLICATION_KEY>
```

---

## Arquitetura do Sistema

### Modelo de Entidades

```
┌─────────────────────────────────────────────────────────────────┐
│                         AUTH SERVICE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐       ┌────────────────────┐                 │
│  │    User      │       │   Organization     │                 │
│  ├──────────────┤       ├────────────────────┤                 │
│  │ _id          │       │ _id                │                 │
│  │ name         │       │ name               │                 │
│  │ email        │       │ externalId         │                 │
│  │ document     │       │ metadata           │                 │
│  │ phone        │       │ active             │                 │
│  │ password     │       │ ownerId ──────────►│──── User._id    │
│  │ verifiedEmail│       │ createdAt          │                 │
│  │ metadata     │       │ updatedAt          │                 │
│  │ index        │       └────────────────────┘                 │
│  └──────────────┘                 ▲                            │
│          │                        │                            │
│          │         ┌──────────────┴──────────────┐             │
│          ▼         │                             │             │
│  ┌────────────────────────────────────────────┐  │             │
│  │              Participant                   │  │             │
│  ├────────────────────────────────────────────┤  │             │
│  │ _id                                        │  │             │
│  │ userId ──────────────────────────────────► User._id         │
│  │ organizationId ───────────────────────────►│                │
│  │ name                                       │                │
│  │ email                                      │                │
│  │ document                                   │                │
│  │ phone                                      │                │
│  │ role (owner|admin|member)                  │                │
│  │ permissions                                │                │
│  │ metadata                                   │                │
│  │ createdAt                                  │                │
│  │ updatedAt                                  │                │
│  │ deletedAt (soft delete)                    │                │
│  └────────────────────────────────────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxo de Relacionamento

1. **User**: Entidade de autenticação (credenciais de login)
2. **Organization**: Representa um tenant/empresa no SaaS
3. **Participant**: Relaciona User ↔ Organization com role e metadata específicos

> **Importante**: Um usuário pode participar de múltiplas organizações com roles diferentes em cada uma.

---

## Autenticação e Segurança

### Rotas de Admin

Todas as rotas `/admin/*` são protegidas pelo `ApplicationKeyGuard` e requerem o header:

```http
application-key: YOUR_SECRET_APPLICATION_KEY
```

A chave é validada contra a variável de ambiente `APPLICATION_KEY`.

### Rotas de Usuário Final

Rotas para usuários finais usam JWT Bearer Token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Estrutura do JWT Token

O token JWT contém:

```json
{
  "sub": "userId (ObjectId)",
  "name": "Nome do Usuário",
  "email": "email@example.com",
  "verifiedEmail": true,
  "document": "12345678900",
  "phone": "11999999999",
  "accesses": [
    {
      "id": "organizationId",
      "name": "Nome da Organização",
      "externalId": "external-ref-123",
      "metadata": {},
      "participantId": "participantId",
      "role": "admin",
      "accessMetadata": {}
    }
  ]
}
```

---

## Entidades e Relacionamentos

### User (Usuário)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `_id` | ObjectId | Auto | ID único do usuário |
| `name` | String | Sim | Nome completo |
| `email` | String | Não* | E-mail (pode ser usado como login) |
| `document` | String | Não* | CPF/CNPJ (pode ser usado como login) |
| `phone` | String | Não* | Telefone (pode ser usado como login) |
| `password` | String | Sim | Senha hasheada (bcrypt) |
| `verifiedEmail` | Boolean | Não | Se o e-mail foi verificado |
| `emailToken` | String | Não | Token de verificação de e-mail |
| `passwordToken` | String | Não | Token de reset de senha |
| `metadata` | Object | Não | Dados extras flexíveis |
| `index` | Number | Auto | Índice auto-incrementado |
| `createdAt` | Date | Auto | Data de criação |
| `updatedAt` | Date | Auto | Data de atualização |

> \* Pelo menos um identificador (email, document ou phone) é recomendado

### Organization (Organização)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `_id` | ObjectId | Auto | ID único da organização |
| `name` | String | Sim | Nome da organização |
| `externalId` | String | Não | ID de referência externa (seu sistema) |
| `metadata` | Object | Não | Dados extras (logo, banner, config, etc.) |
| `active` | Boolean | Não | Se a organização está ativa (default: true) |
| `ownerId` | String | Não | ID do usuário proprietário |
| `createdAt` | Date | Auto | Data de criação |
| `updatedAt` | Date | Auto | Data de atualização |

### Participant (Participante)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `_id` | ObjectId | Auto | ID único do participante |
| `userId` | String | Sim | Referência ao User._id |
| `organizationId` | String | Sim | Referência à Organization._id |
| `name` | String | Sim | Nome do participante |
| `email` | String | Sim | E-mail do participante |
| `document` | String | Sim | Documento do participante |
| `phone` | String | Sim | Telefone do participante |
| `role` | String | Não | Role: owner, admin, member (default: member) |
| `permissions` | Object | Não | Permissões específicas |
| `metadata` | Object | Não | Dados extras do participante na organização |
| `createdAt` | Date | Auto | Data de criação |
| `updatedAt` | Date | Auto | Data de atualização |
| `deletedAt` | Date | Não | Soft delete |

---

## APIs Disponíveis para Backoffice

### 🔑 Prefixo Admin: `/admin`

Todas as rotas admin requerem o header `application-key`.

---

### Gerenciamento de Usuários

#### Criar Usuário

```http
POST /admin/users
Content-Type: application/json
application-key: YOUR_KEY

{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "document": "12345678900",
  "phone": "11999999999",
  "password": "senhaSegura123",
  "metadata": {
    "origem": "backoffice",
    "plano": "premium"
  },
  "organizationId": "optional-org-id",
  "role": "admin"
}
```

**Response (201)**:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "document": "12345678900",
    "phone": "11999999999",
    "verifiedEmail": false
  },
  "profile": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "organizationId": "optional-org-id",
    "name": "João Silva",
    "role": "admin"
  }
}
```

#### Listar Usuários (Paginado)

```http
GET /admin/users?page=1&limit=20
application-key: YOUR_KEY
```

**Response (200)**:
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "document": "12345678900",
      "phone": "11999999999",
      "verifiedEmail": true,
      "index": 1,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 150
}
```

#### Buscar Usuário por ID

```http
GET /admin/users/:id
application-key: YOUR_KEY
```

**Response (200)**:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "name": "João Silva",
  "verifiedEmail": true,
  "phone": "11999999999",
  "document": "12345678900",
  "accesses": [
    {
      "id": "org-id-1",
      "name": "Empresa ABC",
      "externalId": "ext-123",
      "metadata": {},
      "participantId": "participant-id-1",
      "role": "admin",
      "accessMetadata": {}
    }
  ]
}
```

#### Atualizar Usuário

```http
PATCH /admin/users/:id
Content-Type: application/json
application-key: YOUR_KEY

{
  "name": "João Silva Atualizado",
  "email": "joao.novo@empresa.com",
  "phone": "11888888888",
  "password": "novaSenha123",
  "metadata": {
    "plano": "enterprise"
  },
  "organizationId": "org-id-1",
  "role": "owner"
}
```

#### Remover Usuário

```http
DELETE /admin/users/:id
application-key: YOUR_KEY
```

> ⚠️ Remove o usuário E todos os participantes associados

#### Exportar Usuários para CSV

```http
POST /admin/users/export
application-key: YOUR_KEY
```

**Response (200)**:
```json
"https://cdn.example.com/exports/users.csv"
```

---

### Gerenciamento de Organizações

#### Criar Organização

```http
POST /admin/organizations
Content-Type: application/json
application-key: YOUR_KEY

{
  "name": "Empresa ABC Ltda",
  "externalId": "seu-sistema-id-123",
  "metadata": {
    "logo": "https://cdn.example.com/logo.png",
    "banner": "https://cdn.example.com/banner.png",
    "plano": "enterprise",
    "limiteUsuarios": 100
  },
  "active": true,
  "ownerId": "507f1f77bcf86cd799439011"
}
```

#### Listar Organizações (Paginado)

```http
GET /admin/organizations?page=1&limit=20
application-key: YOUR_KEY
```

**Response (200)**:
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439099",
      "name": "Empresa ABC Ltda",
      "externalId": "seu-sistema-id-123",
      "active": true,
      "metadata": {},
      "ownerId": "507f1f77bcf86cd799439011"
    }
  ],
  "count": 45
}
```

#### Buscar Organização por ID

```http
GET /admin/organizations/:id
application-key: YOUR_KEY
```

#### Atualizar Organização

```http
PATCH /admin/organizations/:id
Content-Type: application/json
application-key: YOUR_KEY

{
  "name": "Novo Nome da Empresa",
  "active": false,
  "metadata": {
    "plano": "basic"
  }
}
```

> ⚠️ **Nota**: A implementação atual do `update()` está incompleta. Ver [Funcionalidades Faltantes](#funcionalidades-faltantes-roadmap).

#### Remover Organização

```http
DELETE /admin/organizations/:id
application-key: YOUR_KEY
```

---

### Gerenciamento de Participantes

#### Adicionar Participantes a uma Organização

```http
POST /admin/organizations/:organizationId/participants
Content-Type: application/json
application-key: YOUR_KEY

[
  {
    "name": "Maria Santos",
    "email": "maria@empresa.com",
    "phone": "11999999999",
    "document": "98765432100",
    "organizationId": "org-id-aqui",
    "role": "admin"
  },
  {
    "name": "Pedro Lima",
    "email": "pedro@empresa.com",
    "phone": "11888888888",
    "document": "11122233344",
    "organizationId": "org-id-aqui",
    "role": "member"
  }
]
```

> **Nota**: Aceita array de participantes para criação em lote

#### Listar Participantes de uma Organização

```http
GET /admin/organizations/:organizationId/participants
application-key: YOUR_KEY
```

#### Atualizar Participante

```http
PATCH /admin/organizations/:organizationId/participants/:participantId
Content-Type: application/json
application-key: YOUR_KEY

{
  "role": "owner",
  "metadata": {
    "cargo": "Diretor"
  }
}
```

#### Remover Participante

```http
DELETE /admin/organizations/:organizationId/participants/:participantId
application-key: YOUR_KEY
```

---

## Casos de Uso Operacionais

### Caso 1: Onboarding de Novo Cliente (Organização + Usuário Owner)

Fluxo completo para criar um novo cliente no SaaS:

```typescript
// 1. Criar a organização
const org = await fetch('/admin/organizations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'application-key': ADMIN_KEY
  },
  body: JSON.stringify({
    name: 'Nova Empresa Ltda',
    externalId: 'crm-cliente-456',
    metadata: {
      plano: 'trial',
      dataExpiracao: '2024-02-15'
    }
  })
});
const orgData = await org.json();

// 2. Criar o usuário owner com vínculo à organização
const user = await fetch('/admin/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'application-key': ADMIN_KEY
  },
  body: JSON.stringify({
    name: 'Carlos Proprietário',
    email: 'carlos@novaempresa.com',
    password: 'senhaTemporaria123!',
    phone: '11999999999',
    document: '12345678900',
    organizationId: orgData._id,
    role: 'owner',
    metadata: {
      criadoPor: 'backoffice',
      dataOnboarding: new Date().toISOString()
    }
  })
});
const userData = await user.json();

// 3. (Opcional) Atualizar ownerId da organização
await fetch(`/admin/organizations/${orgData._id}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'application-key': ADMIN_KEY
  },
  body: JSON.stringify({
    ownerId: userData.user._id
  })
});

console.log({
  organizationId: orgData._id,
  userId: userData.user._id,
  participantId: userData.profile._id
});
```

### Caso 2: Adicionar Múltiplos Usuários a uma Organização Existente

```typescript
// Dados dos novos colaboradores
const colaboradores = [
  {
    name: 'Ana Paula',
    email: 'ana@empresa.com',
    phone: '11999991111',
    document: '11111111111',
    role: 'admin'
  },
  {
    name: 'Bruno Costa',
    email: 'bruno@empresa.com',
    phone: '11999992222',
    document: '22222222222',
    role: 'member'
  }
];

const ORGANIZATION_ID = '507f1f77bcf86cd799439099';

// Criar cada usuário
for (const colab of colaboradores) {
  await fetch('/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'application-key': ADMIN_KEY
    },
    body: JSON.stringify({
      ...colab,
      password: 'SenhaTemporaria!123',
      organizationId: ORGANIZATION_ID
    })
  });
}
```

### Caso 3: Buscar Todos os IDs de um Cliente

```typescript
async function getClienteInfo(organizationId: string) {
  // Buscar organização
  const orgRes = await fetch(`/admin/organizations/${organizationId}`, {
    headers: { 'application-key': ADMIN_KEY }
  });
  const org = await orgRes.json();
  
  // Buscar participantes
  const participantsRes = await fetch(
    `/admin/organizations/${organizationId}/participants`,
    { headers: { 'application-key': ADMIN_KEY } }
  );
  const participants = await participantsRes.json();
  
  return {
    organization: {
      id: org._id,
      name: org.name,
      externalId: org.externalId
    },
    participants: participants.map(p => ({
      participantId: p._id,
      userId: p.userId,
      name: p.name,
      email: p.email,
      role: p.role
    }))
  };
}
```

### Caso 4: Dashboard de Métricas

```typescript
async function getDashboardMetrics() {
  // Total de usuários
  const usersRes = await fetch('/admin/users?page=1&limit=1', {
    headers: { 'application-key': ADMIN_KEY }
  });
  const users = await usersRes.json();
  
  // Total de organizações
  const orgsRes = await fetch('/admin/organizations?page=1&limit=1', {
    headers: { 'application-key': ADMIN_KEY }
  });
  const orgs = await orgsRes.json();
  
  return {
    totalUsers: users.count,
    totalOrganizations: orgs.count
  };
}
```

---

## Funcionalidades Faltantes (Roadmap)

As seguintes funcionalidades **NÃO EXISTEM** atualmente e precisam ser implementadas para um backoffice completo:

### 🔴 Alta Prioridade

#### 1. Geração de Token para Impersonificação

**Necessidade**: Gerar um token JWT válido para um usuário específico, permitindo que o admin "entre" na conta do usuário para suporte.

**Endpoint Sugerido**:
```http
POST /admin/users/:userId/impersonate
application-key: YOUR_KEY

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "1h",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Implementação Necessária**:
```typescript
// src/admin/users/services/impersonate-user.service.ts
@Injectable()
export class ImpersonateUserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Participant.name) private participantModel: Model<Participant>,
    @InjectModel(Organization.name) private organizationModel: Model<Organization>,
    @Inject('jwt-service') private jwtService: JwtService,
  ) {}

  async execute(userId: string, adminId?: string): Promise<{ token: string; expiresIn: string }> {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');

    // Buscar acessos do usuário (lógica similar ao login)
    const accesses = await this.getUserAccesses(userId);

    const token = this.jwtService.sign({
      sub: userId,
      name: user.name,
      email: user.email,
      verifiedEmail: user.verifiedEmail,
      document: user.document,
      phone: user.phone,
      accesses,
      impersonatedBy: adminId, // Marcar que é impersonificação
      isImpersonated: true,
    }, { expiresIn: '1h' });

    return { token, expiresIn: '1h' };
  }
}
```

#### 2. Busca/Filtros Avançados

**Necessidade**: Buscar usuários por email, documento, nome, organização.

**Endpoints Sugeridos**:
```http
GET /admin/users/search?email=joao@empresa.com
GET /admin/users/search?document=12345678900
GET /admin/users/search?name=João
GET /admin/users/search?organizationId=org-id-123
```

**Implementação Necessária**:
```typescript
// src/admin/users/services/search-users.service.ts
@Injectable()
export class SearchUsersService {
  async execute(filters: {
    email?: string;
    document?: string;
    phone?: string;
    name?: string;
    organizationId?: string;
  }) {
    const query: any = {};
    
    if (filters.email) query.email = { $regex: filters.email, $options: 'i' };
    if (filters.document) query.document = filters.document;
    if (filters.phone) query.phone = filters.phone;
    if (filters.name) query.name = { $regex: filters.name, $options: 'i' };
    
    let users = await this.userModel.find(query).lean();
    
    if (filters.organizationId) {
      const participants = await this.participantModel
        .find({ organizationId: filters.organizationId })
        .lean();
      const userIds = participants.map(p => p.userId);
      users = users.filter(u => userIds.includes(u._id.toString()));
    }
    
    return users;
  }
}
```

#### 3. Atualização Completa de Organização

**Status**: O método `update()` em `organizatons.service.ts` está incompleto.

**Correção Necessária**:
```typescript
// src/admin/organizations/organizatons.service.ts
async update(id: string, updateData: UpdateOrganizationDto) {
  const organization = await this.organizationModel.findById(id);
  if (!organization) {
    throw new NotFoundException('Organization not found');
  }
  
  return this.organizationModel.findByIdAndUpdate(
    id,
    {
      ...updateData,
      updatedAt: new Date()
    },
    { new: true }
  );
}
```

### 🟡 Média Prioridade

#### 4. Resetar Senha de Usuário (Admin)

**Endpoint Sugerido**:
```http
POST /admin/users/:userId/reset-password
application-key: YOUR_KEY

{
  "newPassword": "novaSenhaTemporaria123",
  "sendEmail": true
}
```

#### 5. Verificar Email Manualmente (Admin)

**Endpoint Sugerido**:
```http
POST /admin/users/:userId/verify-email
application-key: YOUR_KEY
```

#### 6. Desativar/Reativar Usuário

**Endpoint Sugerido**:
```http
PATCH /admin/users/:userId/status
application-key: YOUR_KEY

{
  "active": false,
  "reason": "Solicitação do cliente"
}
```

#### 7. Listar Organizações de um Usuário

**Endpoint Sugerido**:
```http
GET /admin/users/:userId/organizations
application-key: YOUR_KEY
```

### 🟢 Baixa Prioridade

#### 8. Audit Log / Histórico de Ações

Registrar todas as ações administrativas para compliance.

#### 9. Bulk Operations

```http
POST /admin/users/bulk
POST /admin/organizations/bulk
DELETE /admin/users/bulk
```

#### 10. Webhooks para Integrações

Notificar sistemas externos sobre eventos (user.created, organization.created, etc.)

---

## Boas Práticas de Implementação

### Segurança

1. **Proteger a Application Key**
   - Armazene em variáveis de ambiente
   - Rotacione periodicamente
   - Use diferentes keys para ambientes (dev, staging, prod)

2. **Rate Limiting**
   - Implemente rate limiting nas rotas admin
   - Considere 100 requests/minuto por IP

3. **Logging de Ações Admin**
   - Registre todas as operações de criação/atualização/deleção
   - Inclua: timestamp, adminId, action, targetEntity, payload

### Validação de Dados

```typescript
// Sempre valide os DTOs
export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'Document must be 11 digits' })
  @IsOptional()
  document?: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and number'
  })
  password: string;
}
```

### Tratamento de Erros

```typescript
// Padronize as respostas de erro
interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

// Exemplo
{
  "statusCode": 404,
  "message": "User with id 507f1f77bcf86cd799439011 not found",
  "error": "Not Found",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/admin/users/507f1f77bcf86cd799439011"
}
```

### Paginação

Sempre use paginação para listagens:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Exemplo de uso
const response = {
  data: users,
  count: 150,
  page: 1,
  limit: 20,
  totalPages: Math.ceil(150 / 20) // 8
};
```

---

## Exemplos de Código

### Cliente HTTP (TypeScript)

```typescript
// lib/auth-service-client.ts
import axios, { AxiosInstance } from 'axios';

interface CreateUserPayload {
  name: string;
  email?: string;
  document?: string;
  phone?: string;
  password: string;
  metadata?: Record<string, any>;
  organizationId?: string;
  role?: string;
}

interface CreateOrganizationPayload {
  name: string;
  externalId?: string;
  metadata?: Record<string, any>;
  active?: boolean;
  ownerId?: string;
}

export class AuthServiceClient {
  private client: AxiosInstance;

  constructor(baseURL: string, applicationKey: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'application-key': applicationKey,
      },
    });
  }

  // === USERS ===
  
  async createUser(data: CreateUserPayload) {
    const response = await this.client.post('/admin/users', data);
    return response.data;
  }

  async getUsers(page = 1, limit = 20) {
    const response = await this.client.get('/admin/users', {
      params: { page, limit },
    });
    return response.data;
  }

  async getUserById(id: string) {
    const response = await this.client.get(`/admin/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, data: Partial<CreateUserPayload>) {
    const response = await this.client.patch(`/admin/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.client.delete(`/admin/users/${id}`);
    return response.data;
  }

  async exportUsers() {
    const response = await this.client.post('/admin/users/export');
    return response.data;
  }

  // === ORGANIZATIONS ===

  async createOrganization(data: CreateOrganizationPayload) {
    const response = await this.client.post('/admin/organizations', data);
    return response.data;
  }

  async getOrganizations(page = 1, limit = 20) {
    const response = await this.client.get('/admin/organizations', {
      params: { page, limit },
    });
    return response.data;
  }

  async getOrganizationById(id: string) {
    const response = await this.client.get(`/admin/organizations/${id}`);
    return response.data;
  }

  async updateOrganization(id: string, data: Partial<CreateOrganizationPayload>) {
    const response = await this.client.patch(`/admin/organizations/${id}`, data);
    return response.data;
  }

  async deleteOrganization(id: string) {
    const response = await this.client.delete(`/admin/organizations/${id}`);
    return response.data;
  }

  // === PARTICIPANTS ===

  async addParticipants(organizationId: string, participants: any[]) {
    const response = await this.client.post(
      `/admin/organizations/${organizationId}/participants`,
      participants
    );
    return response.data;
  }

  async getParticipants(organizationId: string) {
    const response = await this.client.get(
      `/admin/organizations/${organizationId}/participants`
    );
    return response.data;
  }

  async updateParticipant(organizationId: string, participantId: string, data: any) {
    const response = await this.client.patch(
      `/admin/organizations/${organizationId}/participants/${participantId}`,
      data
    );
    return response.data;
  }

  async deleteParticipant(organizationId: string, participantId: string) {
    const response = await this.client.delete(
      `/admin/organizations/${organizationId}/participants/${participantId}`
    );
    return response.data;
  }
}

// Uso
const client = new AuthServiceClient(
  'https://auth.seudominio.com',
  process.env.AUTH_SERVICE_APPLICATION_KEY!
);

// Criar organização e usuário
const org = await client.createOrganization({
  name: 'Minha Empresa',
  externalId: 'crm-123'
});

const user = await client.createUser({
  name: 'João',
  email: 'joao@minhaempresa.com',
  password: 'Senha123!',
  organizationId: org._id,
  role: 'owner'
});
```

### React Hook (Frontend Backoffice)

```typescript
// hooks/useAuthServiceAdmin.ts
import { useState, useCallback } from 'react';
import { AuthServiceClient } from '@/lib/auth-service-client';

const client = new AuthServiceClient(
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL!,
  '' // Key será passada no header do backend
);

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, count: 0 });

  const fetchUsers = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/users?page=${page}&limit=${limit}`
      );
      const data = await response.json();
      setUsers(data.data);
      setPagination({ page, limit, count: data.count });
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: any) => {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  }, []);

  return { users, loading, pagination, fetchUsers, createUser };
}
```

---

## Troubleshooting

### Erro: "Forbidden Resource"

**Causa**: Header `application-key` ausente ou incorreto.

**Solução**:
```bash
# Verifique se a key está correta
curl -X GET "https://auth.seudominio.com/admin/users" \
  -H "application-key: YOUR_KEY"
```

### Erro: "User already exists with the same email, document or phone"

**Causa**: Tentativa de criar usuário com identificador duplicado.

**Solução**: 
- Busque o usuário existente: `GET /admin/users?email=...`
- Se necessário, atualize ao invés de criar

### Erro: "Perfil do usuário ... não encontrado"

**Causa**: Ao atualizar usuário, o `organizationId` informado não corresponde a um participante existente.

**Solução**: 
- Verifique se o usuário tem participação na organização informada
- Liste participantes: `GET /admin/organizations/:orgId/participants`

### Performance Lenta em Listagens

**Causa**: Muitos registros sem paginação adequada.

**Solução**:
- Sempre use `page` e `limit`
- Considere implementar índices no MongoDB para campos de busca frequente

### Token JWT Expirado

**Causa**: Tokens de usuário final expiram após o tempo configurado.

**Solução**:
- Implemente refresh token flow
- Para impersonificação, gere tokens com validade curta (1h)

---

## Referência Rápida de Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/admin/users` | Criar usuário |
| `GET` | `/admin/users` | Listar usuários (paginado) |
| `GET` | `/admin/users/:id` | Buscar usuário por ID |
| `PATCH` | `/admin/users/:id` | Atualizar usuário |
| `DELETE` | `/admin/users/:id` | Remover usuário |
| `POST` | `/admin/users/export` | Exportar CSV |
| `POST` | `/admin/organizations` | Criar organização |
| `GET` | `/admin/organizations` | Listar organizações |
| `GET` | `/admin/organizations/:id` | Buscar organização |
| `PATCH` | `/admin/organizations/:id` | Atualizar organização |
| `DELETE` | `/admin/organizations/:id` | Remover organização |
| `POST` | `/admin/organizations/:orgId/participants` | Adicionar participantes |
| `GET` | `/admin/organizations/:orgId/participants` | Listar participantes |
| `PATCH` | `/admin/organizations/:orgId/participants/:id` | Atualizar participante |
| `DELETE` | `/admin/organizations/:orgId/participants/:id` | Remover participante |

---

## Próximos Passos

1. **Implementar Impersonificação** - Prioridade alta para suporte ao cliente
2. **Implementar Busca Avançada** - Essencial para encontrar usuários rapidamente
3. **Corrigir Update de Organization** - Bug atual impede atualizações
4. **Adicionar Audit Log** - Compliance e rastreabilidade
5. **Criar SDK/Client Oficial** - Facilitar integrações

---

*Documento gerado em: Janeiro 2026*
*Versão: 1.0.0*
*Auth Service Version: non-saas-auth-service@latest*
