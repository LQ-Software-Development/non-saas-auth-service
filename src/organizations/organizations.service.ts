import { Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Organization } from './entities/organization.schema';
import { Model } from 'mongoose';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
  ) {}

  create(createOrganizationDto: CreateOrganizationDto) {
    const createdOrganization = new this.organizationModel(
      createOrganizationDto,
    );

    return createdOrganization.save();
  }

  findAll({
    userId,
    showInactive,
  }: {
    userId: string;
    showInactive?: boolean;
  }) {
    return this.organizationModel
      .find({
        ownerId: userId,
        ...(showInactive
          ? {}
          : { $or: [{ active: true }, { active: { $exists: false } }] }),
      })
      .exec();
  }

  findOne(id: string, userId: string) {
    return this.organizationModel
      .findOne({
        _id: id,
      })
      .exec();
  }

  update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationModel.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        $set: updateOrganizationDto,
      },
      {
        new: true,
      },
    );
  }

  remove(id: string) {
    return this.organizationModel.deleteOne({
      _id: id,
    });
  }
}
