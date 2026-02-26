import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { AdminApplicationKeyGuard } from 'src/auth/guards/admin-application-key.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserResponseDto } from './dto/get-user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users Management')
@ApiHeader({
  name: 'application-key',
  required: true,
  description: 'Application Key for Admin Access',
})
@UseGuards(AdminApplicationKeyGuard)
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('export')
  exportUsersToCSV() {
    return this.usersService.exportUsersToCSV();
  }

  @Get()
  findAll(@Query() query: { page: number; limit: number }) {
    return this.usersService.findAll({
      page: query.page || 1,
      limit: query.limit || 10,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Promise<GetUserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
