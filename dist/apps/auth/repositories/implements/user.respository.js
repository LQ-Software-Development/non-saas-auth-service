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
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../../../core/application/result");
const mongoose_1 = require("mongoose");
let UserRepository = class UserRepository {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(data) {
        const user = (await this.userModel.create(data)).toObject();
        return result_1.Result.ok(user);
    }
    async findByEmail(email) {
        const user = await this.userModel.findOne({ email: email });
        return user;
    }
    async findByDocument(document) {
        const user = await this.userModel.findOne({ document: document });
        if (!user)
            return null;
        return user;
    }
    async update(data, id) {
        const user = await this.userModel.findByIdAndUpdate(id, data, {
            new: true,
        });
        return result_1.Result.ok(user);
    }
    async findById(id) {
        const user = await this.userModel.findById(id);
        return result_1.Result.ok(user);
    }
};
UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('AUTH_USER_MODEL')),
    __metadata("design:paramtypes", [mongoose_1.Model])
], UserRepository);
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.respository.js.map