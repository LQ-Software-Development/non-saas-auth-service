# Implementações Sugeridas - Funcionalidades Faltantes

Este documento contém o código sugerido para implementar as funcionalidades faltantes identificadas no guia de integração do backoffice.

## 1. Impersonificação de Usuário (Token Generation)

### 1.1 Service - impersonate-user.service.ts

```typescript
// src/admin/users/services/impersonate-user.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/auth/database/providers/schema/user.schema';
import { Participant } from 'src/organizations/participants/entities/participant.entity';
import { Organization } from 'src/organizations/entities/organization.schema';

interface OrganizationAccess {
  id: string;
  name: string;
  externalId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  participantId?: string;
  role: string;
  accessMetadata?: Record<string, any>;
}

interface ImpersonateResponseDto {
  token: string;
  expiresIn: string;
  userId: string;
  userName: string;
  accesses: OrganizationAccess[];
}

@Injectable()
export class ImpersonateUserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Participant.name)
    private participantModel: Model<Participant>,
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
    @Inject('jwt-service')
    private jwtService: JwtService,
  ) {}

  async execute(userId: string, adminIdentifier?: string): Promise<ImpersonateResponseDto> {
    // Buscar usuário
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const userIdString = userId;

    // Determinar identificador principal
    let identifierField: 'email' | 'phone' | 'document';
    let identifierValue: string;
    if (user.email) {
      identifierField = 'email';
      identifierValue = user.email;
    } else if (user.phone) {
      identifierField = 'phone';
      identifierValue = user.phone;
    } else {
      identifierField = 'document';
      identifierValue = user.document;
    }

    // Buscar acessos do usuário
    const accesses = await this.getUserAccesses(user, userIdString, identifierField, identifierValue);

    // Gerar token com flag de impersonificação
    const token = this.jwtService.sign(
      {
        sub: userIdString,
        name: user.name,
        email: user.email,
        verifiedEmail: user.verifiedEmail,
        document: user.document,
        phone: user.phone,
        accesses: accesses,
        // Flags de impersonificação para auditoria
        isImpersonated: true,
        impersonatedBy: adminIdentifier || 'admin',
        impersonatedAt: new Date().toISOString(),
      },
      { expiresIn: '1h' } // Token de impersonificação com validade curta
    );

    return {
      token,
      expiresIn: '1h',
      userId: userIdString,
      userName: user.name,
      accesses,
    };
  }

  private async getUserAccesses(
    user: any,
    userIdString: string,
    identifierField: 'email' | 'phone' | 'document',
    identifierValue: string,
  ): Promise<OrganizationAccess[]> {
    // Buscar participações primárias
    const primaryQueryCondition = { [identifierField]: identifierValue };
    const primaryParticipants = await this.participantModel
      .find({
        $and: [
          primaryQueryCondition,
          { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
        ],
      })
      .lean();

    const primaryParticipantIds = primaryParticipants.map((p) => p._id);

    // Buscar participações secundárias
    const secondaryIdentifiers: { field: string; value: string }[] = [];
    if (user.email && identifierField !== 'email') {
      secondaryIdentifiers.push({ field: 'email', value: user.email });
    }
    if (user.phone && identifierField !== 'phone') {
      secondaryIdentifiers.push({ field: 'phone', value: user.phone });
    }
    if (user.document && identifierField !== 'document') {
      secondaryIdentifiers.push({ field: 'document', value: user.document });
    }

    let secondaryParticipants: any[] = [];
    if (secondaryIdentifiers.length > 0) {
      const orConditions = secondaryIdentifiers.map(({ field, value }) => ({ [field]: value }));
      secondaryParticipants = await this.participantModel
        .find({
          $and: [
            { _id: { $nin: primaryParticipantIds } },
            { $or: orConditions },
            { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
          ],
        })
        .lean();
    }

    // Combinar participantes
    const allParticipants = [
      ...primaryParticipants.map((p) => ({ ...p, organizationId: String(p.organizationId) })),
      ...secondaryParticipants.map((p) => ({ ...p, organizationId: String(p.organizationId) })),
    ];

    // Buscar organizações
    const organizationIds = allParticipants.map((p) => p.organizationId).filter(Boolean);
    const findConditions: any[] = [{ ownerId: userIdString }];
    if (organizationIds.length > 0) {
      findConditions.push({ _id: { $in: organizationIds } });
    }

    const organizations = await this.organizationModel
      .find({ $or: findConditions })
      .lean();

    // Formatar acessos
    return organizations.map((org) => {
      const orgIdString = String(org._id);
      const participant = allParticipants.find((p) => String(p.organizationId) === orgIdString);

      let role = 'unknown';
      let participantId: string | undefined;
      let accessMetadata: Record<string, any> | undefined;

      if (participant) {
        role = participant.role || 'member';
        participantId = String(participant._id);
        accessMetadata = {
          ...(participant.metadata || {}),
          createdAt: participant.createdAt,
          updatedAt: participant.updatedAt,
        };
      } else if (org.ownerId === userIdString) {
        role = 'owner';
      }

      return {
        id: orgIdString,
        name: org.name,
        externalId: org.externalId,
        metadata: org.metadata,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        participantId,
        role,
        accessMetadata,
      };
    });
  }
}
```

### 1.2 DTO - impersonate-user.dto.ts

```typescript
// src/admin/users/dto/impersonate-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ImpersonateUserDto {
  @ApiPropertyOptional({
    description: 'Identificador do admin realizando a impersonificação (para auditoria)',
    example: 'admin@empresa.com',
  })
  @IsString()
  @IsOptional()
  adminIdentifier?: string;

  @ApiPropertyOptional({
    description: 'ID da organização específica para o token (opcional)',
    example: '507f1f77bcf86cd799439099',
  })
  @IsString()
  @IsOptional()
  organizationId?: string;
}

export class ImpersonateUserResponseDto {
  @ApiProperty({
    description: 'Token JWT gerado para o usuário',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'Tempo de expiração do token',
    example: '1h',
  })
  expiresIn: string;

  @ApiProperty({
    description: 'ID do usuário impersonificado',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;

  @ApiProperty({
    description: 'Nome do usuário impersonificado',
    example: 'João Silva',
  })
  userName: string;
}
```

### 1.3 Atualização do Controller

```typescript
// Adicionar ao users.controller.ts

import { ImpersonateUserService } from './services/impersonate-user.service';
import { ImpersonateUserDto, ImpersonateUserResponseDto } from './dto/impersonate-user.dto';

// No constructor, adicionar:
// private readonly impersonateUserService: ImpersonateUserService

@Post(':id/impersonate')
@ApiOperation({ summary: 'Gera token JWT para impersonificar um usuário' })
@ApiResponse({
  status: 201,
  description: 'Token gerado com sucesso',
  type: ImpersonateUserResponseDto,
})
@ApiResponse({ status: 404, description: 'Usuário não encontrado' })
impersonate(
  @Param('id') id: string,
  @Body() impersonateDto: ImpersonateUserDto,
): Promise<ImpersonateUserResponseDto> {
  return this.impersonateUserService.execute(id, impersonateDto.adminIdentifier);
}
```

---

## 2. Busca Avançada de Usuários

### 2.1 Service - search-users.service.ts

```typescript
// src/admin/users/services/search-users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/database/providers/schema/user.schema';
import { Participant } from 'src/organizations/participants/entities/participant.entity';

export interface SearchUsersFilters {
  email?: string;
  document?: string;
  phone?: string;
  name?: string;
  organizationId?: string;
  verifiedEmail?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class SearchUsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Participant.name)
    private participantModel: Model<Participant>,
  ) {}

  async execute(filters: SearchUsersFilters) {
    const { page = 1, limit = 20, organizationId, ...searchFilters } = filters;
    const query: any = {};

    // Construir query de busca
    if (searchFilters.email) {
      query.email = { $regex: searchFilters.email, $options: 'i' };
    }
    if (searchFilters.document) {
      query.document = searchFilters.document;
    }
    if (searchFilters.phone) {
      query.phone = { $regex: searchFilters.phone, $options: 'i' };
    }
    if (searchFilters.name) {
      query.name = { $regex: searchFilters.name, $options: 'i' };
    }
    if (searchFilters.verifiedEmail !== undefined) {
      query.verifiedEmail = searchFilters.verifiedEmail;
    }

    // Se filtrar por organização, buscar userIds dos participantes primeiro
    let userIdsFromOrg: string[] | null = null;
    if (organizationId) {
      const participants = await this.participantModel
        .find({
          organizationId,
          $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
        })
        .select('userId')
        .lean();
      userIdsFromOrg = participants.map((p) => p.userId);
      query._id = { $in: userIdsFromOrg };
    }

    // Executar busca com paginação
    const [data, count] = await Promise.all([
      this.userModel
        .find(query)
        .select('-password -emailToken -passwordToken')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.userModel.countDocuments(query),
    ]);

    return {
      data,
      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }
}
```

### 2.2 DTO - search-users.dto.ts

```typescript
// src/admin/users/dto/search-users.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SearchUsersDto {
  @ApiPropertyOptional({ description: 'Buscar por email (parcial)', example: 'joao@' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Buscar por documento (exato)', example: '12345678900' })
  @IsString()
  @IsOptional()
  document?: string;

  @ApiPropertyOptional({ description: 'Buscar por telefone (parcial)', example: '11999' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Buscar por nome (parcial)', example: 'João' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID da organização', example: '507f1f77bcf86cd799439099' })
  @IsString()
  @IsOptional()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por email verificado', example: true })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  verifiedEmail?: boolean;

  @ApiPropertyOptional({ description: 'Número da página', default: 1, minimum: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 20, minimum: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 20;
}
```

### 2.3 Atualização do Controller

```typescript
// Adicionar ao users.controller.ts

import { SearchUsersService } from './services/search-users.service';
import { SearchUsersDto } from './dto/search-users.dto';

// No constructor, adicionar:
// private readonly searchUsersService: SearchUsersService

@Get('search')
@ApiOperation({ summary: 'Busca avançada de usuários' })
@ApiQuery({ name: 'email', required: false, description: 'Buscar por email (parcial)' })
@ApiQuery({ name: 'document', required: false, description: 'Buscar por documento (exato)' })
@ApiQuery({ name: 'phone', required: false, description: 'Buscar por telefone (parcial)' })
@ApiQuery({ name: 'name', required: false, description: 'Buscar por nome (parcial)' })
@ApiQuery({ name: 'organizationId', required: false, description: 'Filtrar por organização' })
@ApiQuery({ name: 'verifiedEmail', required: false, description: 'Filtrar por email verificado' })
search(@Query() searchDto: SearchUsersDto) {
  return this.searchUsersService.execute(searchDto);
}
```

---

## 3. Correção do Update de Organization

```typescript
// src/admin/organizations/organizatons.service.ts

// Substituir o método update() existente por:

async update(id: string, updateData: Partial<{
  name?: string;
  externalId?: string;
  metadata?: Record<string, any>;
  active?: boolean;
  ownerId?: string;
}>) {
  const organization = await this.organizationModel.findById(id);
  
  if (!organization) {
    return Result.fail(new NotFoundException('Organization not found'));
  }

  // Verificar conflito de nome se estiver alterando
  if (updateData.name && updateData.name !== organization.name) {
    const nameExists = await this.organizationModel.findOne({
      _id: { $ne: id },
      name: updateData.name,
    });
    if (nameExists) {
      return Result.fail(new ConflictException('Organization name already exists'));
    }
  }

  const updated = await this.organizationModel.findByIdAndUpdate(
    id,
    {
      ...updateData,
      updatedAt: new Date(),
    },
    { new: true }
  );

  return updated;
}
```

**Também corrigir o controller:**

```typescript
// src/admin/organizations/organizations.controller.ts

// Criar DTO de atualização:
// src/admin/organizations/dto/update-organization.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Novo Nome da Empresa' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'novo-external-id-123' })
  @IsString()
  @IsOptional()
  externalId?: string;

  @ApiPropertyOptional({ example: { plano: 'enterprise' } })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsOptional()
  ownerId?: string;
}

// Atualizar método no controller:
@Patch(':id')
update(
  @Param('id') id: string,
  @Body() updateOrganizationDto: UpdateOrganizationDto,
) {
  return this.organizationService.update(id, updateOrganizationDto);
}
```

---

## 4. Reset de Senha pelo Admin

### 4.1 Service - admin-reset-password.service.ts

```typescript
// src/admin/users/services/admin-reset-password.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { User } from 'src/auth/database/providers/schema/user.schema';

interface ResetPasswordOptions {
  newPassword: string;
  sendEmail?: boolean;
  notifyUser?: boolean;
}

@Injectable()
export class AdminResetPasswordService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string, options: ResetPasswordOptions) {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(options.newPassword, 10);

    // Atualizar senha
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
      passwordToken: null, // Limpar token de reset existente
      updatedAt: new Date(),
    });

    // Opcionalmente notificar usuário por email
    if (options.sendEmail && user.email) {
      this.eventEmitter.emit('admin.password-reset', {
        user,
        temporaryPassword: options.newPassword,
      });
    }

    return {
      success: true,
      message: 'Password reset successfully',
      userId,
      emailSent: options.sendEmail && !!user.email,
    };
  }
}
```

### 4.2 DTO

```typescript
// src/admin/users/dto/admin-reset-password.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminResetPasswordDto {
  @ApiProperty({
    description: 'Nova senha para o usuário',
    example: 'NovaSenha123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiPropertyOptional({
    description: 'Enviar email notificando o usuário sobre a nova senha',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean = false;
}
```

### 4.3 Controller Update

```typescript
@Post(':id/reset-password')
@ApiOperation({ summary: 'Reset de senha de usuário pelo admin' })
resetPassword(
  @Param('id') id: string,
  @Body() resetDto: AdminResetPasswordDto,
) {
  return this.adminResetPasswordService.execute(id, resetDto);
}
```

---

## 5. Verificar Email Manualmente (Admin)

### 5.1 Service

```typescript
// src/admin/users/services/admin-verify-email.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/database/providers/schema/user.schema';

@Injectable()
export class AdminVerifyEmailService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async execute(userId: string) {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (!user.email) {
      throw new BadRequestException('User does not have an email address');
    }

    if (user.verifiedEmail) {
      return {
        success: true,
        message: 'Email already verified',
        userId,
        email: user.email,
      };
    }

    await this.userModel.findByIdAndUpdate(userId, {
      verifiedEmail: true,
      emailToken: null,
      updatedAt: new Date(),
    });

    return {
      success: true,
      message: 'Email verified successfully',
      userId,
      email: user.email,
    };
  }
}
```

### 5.2 Controller Update

```typescript
@Post(':id/verify-email')
@ApiOperation({ summary: 'Verificar email de usuário manualmente' })
verifyEmail(@Param('id') id: string) {
  return this.adminVerifyEmailService.execute(id);
}
```

---

## 6. Listar Organizações de um Usuário

### 6.1 Service

```typescript
// src/admin/users/services/get-user-organizations.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/database/providers/schema/user.schema';
import { Participant } from 'src/organizations/participants/entities/participant.entity';
import { Organization } from 'src/organizations/entities/organization.schema';

@Injectable()
export class GetUserOrganizationsService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Participant.name)
    private participantModel: Model<Participant>,
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
  ) {}

  async execute(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Buscar participações do usuário
    const participants = await this.participantModel
      .find({
        userId,
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
      })
      .lean();

    // Buscar organizações onde é owner ou participante
    const orgIds = participants.map((p) => p.organizationId);
    const organizations = await this.organizationModel
      .find({
        $or: [
          { _id: { $in: orgIds } },
          { ownerId: userId },
        ],
      })
      .lean();

    return organizations.map((org) => {
      const participant = participants.find(
        (p) => String(p.organizationId) === String(org._id)
      );

      return {
        organizationId: org._id,
        name: org.name,
        externalId: org.externalId,
        active: org.active,
        role: org.ownerId === userId ? 'owner' : participant?.role || 'member',
        participantId: participant?._id,
        joinedAt: participant?.createdAt,
        metadata: org.metadata,
      };
    });
  }
}
```

### 6.2 Controller Update

```typescript
@Get(':id/organizations')
@ApiOperation({ summary: 'Listar organizações de um usuário' })
getUserOrganizations(@Param('id') id: string) {
  return this.getUserOrganizationsService.execute(id);
}
```

---

## 7. Atualização do Module

```typescript
// src/admin/users/users.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from 'src/auth/database/providers/schema/user.schema';
import { Participant, ParticipantSchema } from 'src/organizations/participants/entities/participant.entity';
import { Organization, OrganizationSchema } from 'src/organizations/entities/organization.schema';

// Novos services
import { ImpersonateUserService } from './services/impersonate-user.service';
import { SearchUsersService } from './services/search-users.service';
import { AdminResetPasswordService } from './services/admin-reset-password.service';
import { AdminVerifyEmailService } from './services/admin-verify-email.service';
import { GetUserOrganizationsService } from './services/get-user-organizations.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Participant.name, schema: ParticipantSchema },
      { name: Organization.name, schema: OrganizationSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    ImpersonateUserService,
    SearchUsersService,
    AdminResetPasswordService,
    AdminVerifyEmailService,
    GetUserOrganizationsService,
    {
      provide: 'jwt-service',
      useExisting: JwtModule,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## Resumo das Novas Rotas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/admin/users/:id/impersonate` | Gerar token de impersonificação |
| `GET` | `/admin/users/search` | Busca avançada de usuários |
| `POST` | `/admin/users/:id/reset-password` | Reset de senha pelo admin |
| `POST` | `/admin/users/:id/verify-email` | Verificar email manualmente |
| `GET` | `/admin/users/:id/organizations` | Listar organizações do usuário |

---

## Considerações de Segurança

1. **Impersonificação**:
   - Registrar em log toda impersonificação (quem, quando, qual usuário)
   - Token de impersonificação deve ter validade curta (1h máximo)
   - Incluir flag `isImpersonated` no token para identificação

2. **Reset de Senha**:
   - Não enviar senha em texto plano por email em produção
   - Considerar enviar link de reset ao invés da senha
   - Registrar ação em audit log

3. **Rate Limiting**:
   - Implementar rate limit em endpoints sensíveis
   - Especialmente em `/impersonate` e `/reset-password`

4. **Audit Log**:
   - Todas essas ações devem ser registradas
   - Incluir: timestamp, adminId, action, targetUserId, ip, userAgent
