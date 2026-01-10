import { Module } from "@nestjs/common";
import { CustomersRedisController } from "./customers.redis-controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/auth/database/providers/schema/user.schema";
import { UpsertCustomerUserService } from "./services/upsert-customer-user.service";
import { UsersService } from "src/admin/users/users.service";
import { Participant, ParticipantSchema } from "src/organizations/participants/entities/participant.entity";
import { Organization, OrganizationSchema } from "src/organizations/entities/organization.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{
            name: User.name,
            schema: UserSchema,
        }]),
    ],
    controllers: [CustomersRedisController],
    providers: [UpsertCustomerUserService],
})
export class CustomersModule { }