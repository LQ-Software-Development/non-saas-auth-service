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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserResponseDto } from './dto/get-user-response.dto';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApplicationKeyGuard } from 'src/auth/guards/application-key.guard';

@ApiTags('Users Management')
@ApiHeader({
  name: 'application-key',
  required: true,
  description: 'Application Key for Admin Access',
})
@UseGuards(ApplicationKeyGuard)
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
