import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './auth/database/database.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmailsModule } from './emails/emails.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from './admin/admin.module';
import { ProfilesModule } from './profiles/profiles.module';
import { AccessesModule } from './accesses/accesses.module';
import { RecoveryModule } from './recovery/recovery.module';
import { CustomersModule } from './customers/customers.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.AUTH_DB_URL, {
      dbName: process.env.DB_COLLECTION_NAME,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '90d' },
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    AuthModule,
    EmailsModule,
    OrganizationsModule,
    AdminModule,
    ProfilesModule,
    AccessesModule,
    RecoveryModule,
    CustomersModule,
  ],
})
export class AppModule { }
