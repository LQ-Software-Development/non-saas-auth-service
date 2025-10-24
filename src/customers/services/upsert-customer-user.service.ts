import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/auth/database/providers/schema/user.schema";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UpsertCustomerUserService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
    ) { }

    async execute(customerData: any) {
        const { email, name, phone, document, customerId, metadata } = customerData;

        const queries = [];

        if (customerId)
            queries.push({ 'metadata.customerId': customerId });
        if (email)
            queries.push({ email });
        if (phone)
            queries.push({ phone });
        if (document)
            queries.push({ document });

        if (queries.length === 0) {
            console.error('Nenhum dado válido fornecido para localizar ou criar o usuário do cliente.');
            return;
        }


        let user = await this.userModel.findOne({ $or: queries }).exec();

        if (user) {
            // Atualiza o usuário existente
            user.name = name || user.name;
            user.phone = phone || user.phone;
            user.document = document || user.document;
            user.metadata = { ...user.metadata, ...metadata, customerId: customerId || user.metadata.customerId };

            if (metadata?.password) {
                user.password = bcrypt.hashSync(metadata.password, 10);
            }

            console.log(`Usuário atualizado para o cliente ID: ${customerId}`);
        } else {
            if (!metadata?.password) {
                console.error('Senha não fornecida para novo usuário do cliente.');
                return;
            }

            user = new this.userModel({
                email,
                name,
                phone,
                document,
                password: bcrypt.hashSync(metadata.password, 10),
                verifiedEmail: true,
                metadata: { ...metadata, customerId },
            });
            console.log(`Novo usuário criado para o cliente ID: ${customerId}`);
        }

        return await user.save();

    }
}
