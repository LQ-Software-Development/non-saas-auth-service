import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { OrganizationModule } from './organizations/organization.module';

@Module({
  imports: [UsersModule, OrganizationModule],
})
export class AdminModule {}
