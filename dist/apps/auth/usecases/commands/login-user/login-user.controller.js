"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const controller_base_1 = require("../../../../../core/application/controller.base");
const login_user_usecase_1 = require("./login-user.usecase");
const login_user_dto_1 = require("./login-user.dto");
let LoginUserController = class LoginUserController extends controller_base_1.ControllerBase {
    constructor(loginUserUseCase) {
        super();
        this.loginUserUseCase = loginUserUseCase;
    }
    async login(data) {
        const result = await this.loginUserUseCase.login(data);
        if (result.isFailure) {
            return this.handleErrorResponse(result.error);
        }
        return result.value;
    }
};
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Rota de login' }),
    (0, swagger_1.ApiCreatedResponse)({
        status: 201,
        type: login_user_dto_1.LoginUserDto,
        description: 'Usuario logado criado com sucesso',
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        status: 400,
        description: 'O corpo da requisição esta errado, confira',
    }),
    (0, swagger_1.ApiInternalServerErrorResponse)({
        status: 500,
        description: 'Erro interno na hora de persistir o anuncio',
    }),
    (0, common_1.Post)(''),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_user_dto_1.LoginUserDto]),
    __metadata("design:returntype", Promise)
], LoginUserController.prototype, "login", null);
LoginUserController = __decorate([
    (0, common_1.Controller)('login'),
    (0, swagger_1.ApiTags)('autenticação'),
    __metadata("design:paramtypes", [login_user_usecase_1.LoginUserUseCase])
], LoginUserController);
exports.LoginUserController = LoginUserController;
//# sourceMappingURL=login-user.controller.js.map