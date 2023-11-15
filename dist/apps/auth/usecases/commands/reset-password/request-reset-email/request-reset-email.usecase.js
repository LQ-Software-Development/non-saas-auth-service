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
exports.RequestResetEmailUseCase = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const result_1 = require("../../../../../../core/application/result");
const exceptions_1 = require("../../../../../../core/exceptions");
let RequestResetEmailUseCase = class RequestResetEmailUseCase {
    constructor(userRepository, jwtService, emailProvider) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.emailProvider = emailProvider;
    }
    async requestResetEmail(email) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            return result_1.Result.fail(new exceptions_1.NotFoundException('User not found'));
        }
        const token = this.jwtService.sign({
            sub: user.id,
        }, {
            expiresIn: '30m',
        });
        const url = `Hi, Please follow this link to reset your password. This is valid for 10 minutes. <a href="http://localhost:${process.env.AUTH_URL}/reset-password/${token}">Click here</a>`;
        const data = {
            to: user.email,
            text: 'Hey User',
            from: 'Hey <abc@gmail.com>',
            subject: 'Forgot Password Link',
            html: url,
        };
        this.emailProvider.sendMail(data);
        return result_1.Result.ok({ token: token });
    }
};
RequestResetEmailUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('user-repository')),
    __param(1, (0, common_1.Inject)('jwt-service')),
    __param(2, (0, common_1.Inject)('email-provider')),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService, Object])
], RequestResetEmailUseCase);
exports.RequestResetEmailUseCase = RequestResetEmailUseCase;
//# sourceMappingURL=request-reset-email.usecase.js.map