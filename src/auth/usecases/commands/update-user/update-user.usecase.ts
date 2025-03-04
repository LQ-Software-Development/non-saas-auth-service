import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { UserRepositoryInterface } from '../../../repositories/user.repository.interface';
import { Result } from '../../../../core/application/result';
import { ForbiddenException } from '../../../../core/exceptions';
import { UpdateUserDto, UpdateUserOptionsDto } from './update-user.dto';
import { User } from 'src/auth/database/providers/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('user-repository')
    private readonly userRepository: UserRepositoryInterface,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async update(
    id: string,
    data: UpdateUserDto,
    options?: UpdateUserOptionsDto,
  ): Promise<Result<User>> {
    const user = (await this.userRepository.findById(id)).value;
    if (!user) {
      return Result.fail(new ForbiddenException('User not found'));
    }

    // verificar se já tem um usuário com o mesmo email telefone ou documento
    const duplicatedUser = await this.userModel.findOne({
      $or: [
        data.email && { email: data.email },
        data.phone && { phone: data.phone },
        data.document && { document: data.document },
      ].filter(Boolean),
    });

    if (duplicatedUser) {
      throw new ConflictException('Duplicated field found');
    }

    if (options?.findDuplicates && options.findDuplicates.length > 0) {
      const field = options.findDuplicates;

      console.log(`document --------------> ${data[field]}`);
      if (data[field] === undefined) data[field] = null;

      const duplicatedUser = await this.userModel.findOne({
        where: { [field]: data[field] },
      });

      if (duplicatedUser)
        throw new ConflictException(`Duplicated field found: ${field}`);

      user[field] = data[field];
    }

    user.email = data.email;
    user.name = data.name;
    user.updatedAt = new Date();
    const updatedUserOrError = await this.userRepository.update(id, user);
    if (updatedUserOrError.isFailure) {
      return Result.fail(updatedUserOrError.error);
    }
    return Result.ok(updatedUserOrError).value;
  }
}
