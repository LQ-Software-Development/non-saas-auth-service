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
exports.LoginUserUseCase = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const result_1 = require("../../../../../core/application/result");
const exceptions_1 = require("../../../../../core/exceptions");
const bcrypt = require("bcrypt");
let LoginUserUseCase = class LoginUserUseCase {
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    async login(data) {
        const { document, password } = data;
        const user = await this.userRepository.findByDocument(document);
        if (!user) {
            return result_1.Result.fail(new exceptions_1.ForbiddenException('User or password incorrect'));
        }
        if (!bcrypt.compareSync(password, user.password)) {
            return result_1.Result.fail(new exceptions_1.ForbiddenException('User or password incorrect'));
        }
        const token = this.jwtService.sign({ sub: user.id });
        return result_1.Result.ok({ token, userId: user.id });
    }
};
LoginUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('user-repository')),
    __param(1, (0, common_1.Inject)('jwt-service')),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService])
], LoginUserUseCase);
exports.LoginUserUseCase = LoginUserUseCase;
//# sourceMappingURL=login-user.usecase.js.map