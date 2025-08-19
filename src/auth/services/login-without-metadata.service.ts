import * as bcrypt from 'bcrypt';

import { JwtService } from "@nestjs/jwt";
import { LoginUserDto } from "../dto/login-user.dto";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../database/providers/schema/user.schema";
import { Model } from "mongoose";
import { Inject, NotFoundException } from "@nestjs/common";

export class LoginWithoutMetadataService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        @Inject('jwt-service') private readonly jwtService: JwtService,
    ) { }

    async execute(data: LoginUserDto) {
        const identifiers = ['email', 'document', 'phone'];

        // Here the identifier is determined for the first field that is present in the data
        const providedIdentifier = identifiers.find(key => data[key]);

        if (!providedIdentifier) {
            throw new NotFoundException('No identifier provided');
        }

        // Here define the query with the provided identifier
        const query = { [providedIdentifier]: data[providedIdentifier] };

        const user = await this.userModel.findOne(query);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new NotFoundException('User not found');
        }

        const token = this.jwtService.sign({
            sub: user._id,
            id: user._id,
            _id: user._id,
        });

        return { user: { [providedIdentifier]: user[providedIdentifier], id: user._id }, token };
    }
}
