import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    Organization,
    OrganizationSchema,
} from '../organizations/entities/organization.schema';
import { ApplicationKeysController } from './application-keys.controller';
import { GenerateApplicationKeyService } from './services/generate-application-key.service';
import { RevokeApplicationKeyService } from './services/revoke-application-key.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Organization.name, schema: OrganizationSchema },
        ]),
    ],
    controllers: [ApplicationKeysController],
    providers: [GenerateApplicationKeyService, RevokeApplicationKeyService],
})
export class ApplicationKeysModule { }
