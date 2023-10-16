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
exports.ChangeUserPassowrdUseCase = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../../../../core/application/result");
const exceptions_1 = require("../../../../../core/exceptions");
const bcrypt = require("bcrypt");
let ChangeUserPassowrdUseCase = class ChangeUserPassowrdUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async changePassword(data) {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            return result_1.Result.fail(new exceptions_1.ForbiddenException('User existent'));
        }
        if (!bcrypt.compareSync(data.oldPassword, user.password)) {
            return result_1.Result.fail(new exceptions_1.ForbiddenException('User of password incorrect'));
        }
        const newPasswordHash = bcrypt.hashSync(data.newPassword, 10);
        user.password = newPasswordHash;
        await this.userRepository.update(user, user.id);
        return result_1.Result.ok({
            message: 'Password changed successfully',
        });
    }
};
ChangeUserPassowrdUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('user-repository')),
    __metadata("design:paramtypes", [Object])
], ChangeUserPassowrdUseCase);
exports.ChangeUserPassowrdUseCase = ChangeUserPassowrdUseCase;
//# sourceMappingURL=change-user-password.usecase.js.map