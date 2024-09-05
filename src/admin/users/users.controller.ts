import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiHeader } from '@nestjs/swagger';

@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiHeader({
    name: 'application-key',
    required: true,
    description: 'Application Key for Admin Access',
  })
  @Get()
  findAll(
    @Headers() headers: { 'application-key': string },
    @Query() query: { page: number; limit: number },
  ) {
    if (
      !headers['application-key'] ||
      headers['application-key'] !== process.env.APPLICATION_KEY
    ) {
      throw new ForbiddenException('Forbidden Resource');
    }

    return this.usersService.findAll({
      page: query.page || 1,
      limit: query.limit || 10,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
