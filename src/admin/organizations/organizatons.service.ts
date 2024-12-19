import { Injectable } from '@nestjs/common';
import { ConflictException } from '../../core/exceptions';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Result } from 'src/core/application/result';

import { Organization } from 'src/organizations/entities/organization.schema';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
  ) {}

  async findAll(props: { page: number; limit: number }) {
    const data = await this.organizationModel
      .find()
      .skip((props.page - 1) * props.limit)
      .limit(props.limit);

    const count = await this.organizationModel.countDocuments();

    return {
      data,
      count,
    };
  }

  async create(bodyData) {
    const organizationExists = await this.organizationModel.findOne({
      name: { $eq: bodyData.name },
    });

    if (organizationExists) {
      return Result.fail(new ConflictException('Organization already exists'));
    }

    return this.organizationModel.create(bodyData);
  }

  findOne(id: string) {
    return this.organizationModel.findById(id);
  }

  update() {
    return `This action updates a organization`;
  }

  remove(id: number) {
    return `This action removes a #${id} organization`;
  }
}
