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
exports.RequestResetPasswordController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const controller_base_1 = require("../../../../../../core/application/controller.base");
const request_reset_password_usecase_1 = require("./request-reset-password.usecase");
const request_reset_password_dto_1 = require("./request-reset-password.dto");
let RequestResetPasswordController = class RequestResetPasswordController extends controller_base_1.ControllerBase {
    constructor(requestResetPasswordUseCase) {
        super();
        this.requestResetPasswordUseCase = requestResetPasswordUseCase;
    }
    async resetPassword(token, data) {
        return await this.requestResetPasswordUseCase.resetPassword(data, token);
    }
};
__decorate([
    (0, common_1.Put)('/:token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, request_reset_password_dto_1.RequestResetPasswordDto]),
    __metadata("design:returntype", Promise)
], RequestResetPasswordController.prototype, "resetPassword", null);
RequestResetPasswordController = __decorate([
    (0, common_1.Controller)('reset-password'),
    (0, swagger_1.ApiTags)('Reset Password'),
    __metadata("design:paramtypes", [request_reset_password_usecase_1.RequestResetPasswordUseCase])
], RequestResetPasswordController);
exports.RequestResetPasswordController = RequestResetPasswordController;
//# sourceMappingURL=request-reset-password.controller.js.map