"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const database_provider_1 = require("./database/providers/database.provider");
const email_provider_1 = require("./providers/mailer/email.provider");
const user_schema_1 = require("./database/providers/schema/user.schema");
const user_respository_1 = require("./repositories/implements/user.respository");
const change_user_password_controller_1 = require("./usecases/commands/change-user-password/change-user-password.controller");
const change_user_password_usecase_1 = require("./usecases/commands/change-user-password/change-user-password.usecase");
const login_user_controller_1 = require("./usecases/commands/login-user/login-user.controller");
const login_user_usecase_1 = require("./usecases/commands/login-user/login-user.usecase");
const register_user_controller_1 = require("./usecases/commands/register-user/register-user.controller");
const register_user_usecase_1 = require("./usecases/commands/register-user/register-user.usecase");
const request_reset_email_controller_1 = require("./usecases/commands/reset-password/request-reset-email/request-reset-email.controller");
const request_reset_email_usecase_1 = require("./usecases/commands/reset-password/request-reset-email/request-reset-email.usecase");
const request_reset_password_controller_1 = require("./usecases/commands/reset-password/request-reset-password/request-reset-password.controller");
const request_reset_password_usecase_1 = require("./usecases/commands/reset-password/request-reset-password/request-reset-password.usecase");
const update_user_controller_1 = require("./usecases/commands/update-user/update-user.controller");
const update_user_usecase_1 = require("./usecases/commands/update-user/update-user.usecase");
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            login_user_controller_1.LoginUserController,
            register_user_controller_1.RegisterUserController,
            change_user_password_controller_1.ChangeUserPassowrdController,
            request_reset_email_controller_1.RequestResetEmailController,
            request_reset_password_controller_1.RequestResetPasswordController,
            update_user_controller_1.UpdateUserController,
        ],
        providers: [
            login_user_usecase_1.LoginUserUseCase,
            register_user_usecase_1.RegisterUserUseCase,
            change_user_password_usecase_1.ChangeUserPassowrdUseCase,
            request_reset_email_usecase_1.RequestResetEmailUseCase,
            request_reset_password_usecase_1.RequestResetPasswordUseCase,
            update_user_usecase_1.UpdateUserUseCase,
            {
                provide: 'user-repository',
                useClass: user_respository_1.UserRepository,
            },
            {
                provide: 'jwt-service',
                useFactory: () => {
                    return new jwt_1.JwtService({
                        secret: process.env.JWT_SECRET,
                        signOptions: { expiresIn: '1d' },
                    });
                },
            },
            {
                provide: 'email-provider',
                useClass: email_provider_1.emailProvider,
            },
            ...user_schema_1.userSchemaProviders,
            ...database_provider_1.databaseProviders,
        ],
    })
], AuthModule);
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map