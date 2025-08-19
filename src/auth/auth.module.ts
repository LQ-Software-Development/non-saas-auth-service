import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { databaseProviders } from './database/providers/database.provider';
import { emailProvider } from './providers/mailer/email.provider';
import {
  User,
  UserSchema,
  userSchemaProviders,
} from './database/providers/schema/user.schema';
import { UserRepository } from './repositories/implements/user.respository';
import { ChangeUserPassowrdController } from './usecases/commands/change-user-password/change-user-password.controller';
import { ChangeUserPassowrdUseCase } from './usecases/commands/change-user-password/change-user-password.usecase';
import { LoginUserService } from './services/login-user.service';
import { RegisterUserController } from './usecases/commands/register-user/register-user.controller';
import { RegisterUserUseCase } from './usecases/commands/register-user/register-user.usecase';
import { RequestResetEmailController } from './usecases/commands/reset-password/request-reset-email/request-reset-email.controller';
import { RequestResetEmailUseCase } from './usecases/commands/reset-password/request-reset-email/request-reset-email.usecase';
import { RequestResetPasswordController } from './usecases/commands/reset-password/request-reset-password/request-reset-password.controller';
import { RequestResetPasswordUseCase } from './usecases/commands/reset-password/request-reset-password/request-reset-password.usecase';
import { UpdateUserController } from './usecases/commands/update-user/update-user.controller';
import { UpdateUserUseCase } from './usecases/commands/update-user/update-user.usecase';
import { VerifyUserEmailController } from './usecases/commands/verify-user-email/verify-user-email.controller';
import { VerifyUserEmailUseCase } from './usecases/commands/verify-user-email/verify-user-email.usecase';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Participant,
  ParticipantSchema,
} from 'src/organizations/participants/entities/participant.entity';
import {
  Organization,
  OrganizationSchema,
} from 'src/organizations/entities/organization.schema';
import { AuthController } from './auth.controller';
import { RefreshTokenInfoService } from './services/refresh-token-info.service';
import { ResendEmailVerificationService } from './services/resend-email-verification.service';
import { AuthV2Controller } from './auth-v2.controller';
import { LoginWithoutMetadataService } from './services/login-without-metadata.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Participant.name,
        schema: ParticipantSchema,
      },
      {
        name: Organization.name,
        schema: OrganizationSchema,
      },
    ]),
  ],
  controllers: [
    RegisterUserController,
    ChangeUserPassowrdController,
    RequestResetEmailController,
    RequestResetPasswordController,
    UpdateUserController,
    VerifyUserEmailController,
    AuthController,
    AuthV2Controller,
  ],
  providers: [
    LoginUserService,
    RegisterUserUseCase,
    ChangeUserPassowrdUseCase,
    RequestResetEmailUseCase,
    RequestResetPasswordUseCase,
    UpdateUserUseCase,
    VerifyUserEmailUseCase,
    ResendEmailVerificationService,
    RefreshTokenInfoService,
    LoginWithoutMetadataService,
    {
      provide: 'user-repository',
      useClass: UserRepository,
    },
    {
      provide: 'jwt-service',
      useFactory: () => {
        return new JwtService({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '90d' },
        });
      },
    },
    {
      provide: 'email-provider',
      useClass: emailProvider,
    },
    ...userSchemaProviders,
    ...databaseProviders,
  ],
})
export class AuthModule { }
