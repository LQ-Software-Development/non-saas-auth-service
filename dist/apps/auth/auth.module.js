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
const login_user_controller_1 = require("./usecases/commands/login-user/login-user.controller");
const login_user_usecase_1 = require("./usecases/commands/login-user/login-user.usecase");
const user_respository_1 = require("./repositories/implements/user.respository");
const jwt_1 = require("@nestjs/jwt");
const user_schema_1 = require("./database/providers/schema/user.schema");
const database_provider_1 = require("./database/providers/database.provider");
const register_user_controller_1 = require("./usecases/commands/register-user/register-user.controller");
const register_user_usecase_1 = require("./usecases/commands/register-user/register-user.usecase");
const change_user_password_usecase_1 = require("./usecases/commands/change-user-password/change-user-password.usecase");
const change_user_password_controller_1 = require("./usecases/commands/change-user-password/change-user-password.controller");
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    (0, common_1.Module)({
        controllers: [login_user_controller_1.LoginUserController, register_user_controller_1.RegisterUserController, change_user_password_controller_1.ChangeUserPassowrdController],
        providers: [
            login_user_usecase_1.LoginUserUseCase,
            register_user_usecase_1.RegisterUserUseCase,
            change_user_password_usecase_1.ChangeUserPassowrdUseCase,
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
            ...user_schema_1.userSchemaProviders,
            ...database_provider_1.databaseProviders,
        ],
    })
], AuthModule);
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map