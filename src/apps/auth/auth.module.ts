import { Module } from '@nestjs/common';
import { LoginUserController } from './usecases/commands/login-user/login-user.controller';
import { LoginUserUseCase } from './usecases/commands/login-user/login-user.usecase';
import { UserRepository } from './repositories/implements/user.respository';
import { JwtService } from '@nestjs/jwt';
import { userSchemaProviders } from './database/providers/schema/user.schema';
import { databaseProviders } from './database/providers/database.provider';
import { RegisterUserController } from './usecases/commands/register-user/register-user.controller';
import { RegisterUserUseCase } from './usecases/commands/register-user/register-user.usecase';
import { ChangeUserPassowrdUseCase } from './usecases/commands/change-user-password/change-user-password.usecase';
import { ChangeUserPassowrdController } from './usecases/commands/change-user-password/change-user-password.controller';
import { RequestResetEmailController } from './usecases/commands/reset-password/request-reset-email/request-reset-email.controller';
import { RequestResetEmailUseCase } from './usecases/commands/reset-password/request-reset-email/request-reset-email.usecase';

@Module({
  controllers: [
    LoginUserController,
    RegisterUserController,
    ChangeUserPassowrdController,
    RequestResetEmailController,
  ],
  providers: [
    LoginUserUseCase,
    RegisterUserUseCase,
    ChangeUserPassowrdUseCase,
    RequestResetEmailUseCase,
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
    ...userSchemaProviders,
    ...databaseProviders,
  ],
})
export class AuthModule {}
