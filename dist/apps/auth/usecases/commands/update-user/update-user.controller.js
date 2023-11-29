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
exports.UpdateUserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const controller_base_1 = require("../../../../../core/application/controller.base");
const update_user_usecase_1 = require("./update-user.usecase");
const update_user_dto_1 = require("./update-user.dto");
let UpdateUserController = class UpdateUserController extends controller_base_1.ControllerBase {
    constructor(userUpdateUseCase) {
        super();
        this.userUpdateUseCase = userUpdateUseCase;
    }
    async update(id, data) {
        const result = await this.userUpdateUseCase.update(id, data);
        if (result.isFailure) {
            return this.handleErrorResponse(result.error);
        }
        return result.value;
    }
};
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Rota para atualizar dados do Usuario' }),
    (0, swagger_1.ApiCreatedResponse)({
        status: 201,
        description: 'Dados atualziada com sucesso',
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        status: 404,
        description: 'Usuario não encontrado',
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        status: 400,
        description: 'O corpo da requisição esta errado, confira',
    }),
    (0, swagger_1.ApiInternalServerErrorResponse)({
        status: 500,
        description: 'Erro interno na hora de persistir o anuncio',
    }),
    (0, common_1.Patch)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UpdateUserController.prototype, "update", null);
UpdateUserController = __decorate([
    (0, common_1.Controller)('update-user'),
    (0, swagger_1.ApiTags)('Update User'),
    __metadata("design:paramtypes", [update_user_usecase_1.UpdateUserUseCase])
], UpdateUserController);
exports.UpdateUserController = UpdateUserController;
//# sourceMappingURL=update-user.controller.js.map