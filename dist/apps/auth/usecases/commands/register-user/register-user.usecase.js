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
exports.RegisterUserUseCase = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../../../../core/application/result");
const exceptions_1 = require("../../../../../core/exceptions");
const bcrypt = require("bcrypt");
let RegisterUserUseCase = class RegisterUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async register(data) {
        const userExists = await this.userRepository.findByDocument(data.document);
        if (userExists) {
            return result_1.Result.fail(new exceptions_1.ForbiddenException('User existent'));
        }
        const passwordHash = bcrypt.hashSync(data.password, 10);
        const user = await this.userRepository.create(Object.assign(Object.assign({}, data), { password: passwordHash }));
        if (user.isFailure) {
            return result_1.Result.fail(new exceptions_1.ForbiddenException('User existent'));
        }
        return user;
    }
};
RegisterUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('user-repository')),
    __metadata("design:paramtypes", [Object])
], RegisterUserUseCase);
exports.RegisterUserUseCase = RegisterUserUseCase;
//# sourceMappingURL=register-user.usecase.js.map