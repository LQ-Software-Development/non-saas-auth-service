import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { databaseProviders } from './database/providers/database.provider';
import { emailProvider } from './providers/mailer/email.provider';
import { userSchemaProviders } from './database/providers/schema/user.schema';
import { UserRepository } from './repositories/implements/user.respository';
import { ChangeUserPassowrdController } from './usecases/commands/change-user-password/change-user-password.controller';
import { ChangeUserPassowrdUseCase } from './usecases/commands/change-user-password/change-user-password.usecase';
import { LoginUserController } from './usecases/commands/login-user/login-user.controller';
import { LoginUserUseCase } from './usecases/commands/login-user/login-user.usecase';
import { RegisterUserController } from './usecases/commands/register-user/register-user.controller';
import { RegisterUserUseCase } from './usecases/commands/register-user/register-user.usecase';
import { RequestResetEmailController } from './usecases/commands/reset-password/request-reset-email/request-reset-email.controller';
import { RequestResetEmailUseCase } from './usecases/commands/reset-password/request-reset-email/request-reset-email.usecase';
import { RequestResetPasswordController } from './usecases/commands/reset-password/request-reset-password/request-reset-password.controller';
import { RequestResetPasswordUseCase } from './usecases/commands/reset-password/request-reset-password/request-reset-password.usecase';
import { UpdateUserController } from './usecases/commands/update-user/update-user.controller';
import { UpdateUserUseCase } from './usecases/commands/update-user/update-user.usecase';

@Module({
  controllers: [
    LoginUserController,
    RegisterUserController,
    ChangeUserPassowrdController,
    RequestResetEmailController,
    RequestResetPasswordController,
    UpdateUserController,
  ],
  providers: [
    LoginUserUseCase,
    RegisterUserUseCase,
    ChangeUserPassowrdUseCase,
    RequestResetEmailUseCase,
    RequestResetPasswordUseCase,
    UpdateUserUseCase,
    {
      provide: 'user-repository',
      useClass: UserRepository,
    },
    {
      provide: 'jwt-service',
      useFactory: () => {
        return new JwtService({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1d' },
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
export class AuthModule {}
