import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from '../database/providers/schema/user.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ResendEmailVerificationService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user || !user.email) {
      throw new NotFoundException('User not found');
    }

    const emailToken = Math.floor(100000 + Math.random() * 900000).toString();

    user.emailToken = emailToken;

    await this.userModel.findByIdAndUpdate(userId, {
      emailToken,
    });

    this.eventEmitter.emit('users.update-email', user);
  }
}
