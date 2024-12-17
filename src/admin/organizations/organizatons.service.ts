import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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

  create(bodyData) {
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
