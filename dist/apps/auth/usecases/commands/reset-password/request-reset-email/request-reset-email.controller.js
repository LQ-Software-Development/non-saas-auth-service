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
exports.RequestResetEmailController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const controller_base_1 = require("../../../../../../core/application/controller.base");
const request_reset_email_usecase_1 = require("./request-reset-email.usecase");
const request_reset_email_dto_1 = require("./request-reset-email.dto");
let RequestResetEmailController = class RequestResetEmailController extends controller_base_1.ControllerBase {
    constructor(requestResetEmailUseCase) {
        super();
        this.requestResetEmailUseCase = requestResetEmailUseCase;
    }
    async requestResetEmail(data) {
        const result = await this.requestResetEmailUseCase.requestResetEmail(data.email);
        if (result.isFailure) {
            return this.handleErrorResponse(result.error);
        }
        return result.value;
    }
};
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Rota para pedir email de reset da senha' }),
    (0, swagger_1.ApiOkResponse)({
        status: 200,
        description: 'Senha atualziada com sucesso',
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        status: 400,
        description: 'O corpo da requisição esta errado, confira',
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        status: 404,
        description: 'Email não cadastrado'
    }),
    (0, swagger_1.ApiInternalServerErrorResponse)({
        status: 500,
        description: 'Erro interno na hora de persistir o anuncio',
    }),
    (0, common_1.Post)(''),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_reset_email_dto_1.RequestResetEmailDto]),
    __metadata("design:returntype", Promise)
], RequestResetEmailController.prototype, "requestResetEmail", null);
RequestResetEmailController = __decorate([
    (0, common_1.Controller)('reset-password'),
    (0, swagger_1.ApiTags)('Reset Password'),
    __metadata("design:paramtypes", [request_reset_email_usecase_1.RequestResetEmailUseCase])
], RequestResetEmailController);
exports.RequestResetEmailController = RequestResetEmailController;
//# sourceMappingURL=request-reset-email.controller.js.map