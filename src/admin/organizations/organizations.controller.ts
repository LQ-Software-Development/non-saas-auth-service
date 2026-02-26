import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ApiHeader } from '@nestjs/swagger';
import { OrganizationService } from './organizatons.service';
import { AdminApplicationKeyGuard } from 'src/auth/guards/admin-application-key.guard';

@ApiHeader({
  name: 'application-key',
  required: true,
  description: 'Application Key for Admin Access',
})
@UseGuards(AdminApplicationKeyGuard)
@Controller('admin/organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(@Body() bodyData) {
    return this.organizationService.create(bodyData);
  }

  @Get()
  findAll(@Query() query: { page: number; limit: number }) {
    return this.organizationService.findAll({
      page: query.page || 1,
      limit: query.limit || 10,
    });
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.organizationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganization) {
    return this.organizationService.update();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationService.remove(+id);
  }
}
