import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/database/providers/schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { Parser } from 'json2csv';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(props: { page: number; limit: number }) {
    const data = await this.userModel
      .find()
      .skip((props.page - 1) * props.limit)
      .limit(props.limit);

    const count = await this.userModel.countDocuments();

    return {
      data,
      count,
    };
  }

  async exportUsersToCSV(): Promise<string> {
    const users = await this.userModel.find().lean();

    // Extrair campos de metadata dinamicamente
    const metadataFields = new Set<string>();
    users.forEach((user) => {
      if (user.metadata) {
        Object.keys(user.metadata).forEach((key) =>
          metadataFields.add(`metadata.${key}`),
        );
      }
    });

    const fields = [
      '_id',
      'name',
      'email',
      'createdAt',
      'updatedAt',
      ...Array.from(metadataFields),
    ];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(users);

    const exportsDir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }

    const filePath = path.join(exportsDir, 'users.csv');
    fs.writeFileSync(filePath, csv);

    // Enviar o arquivo CSV para a API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    try {
      const response = await axios.post(
        'https://pinplaces-upload-files-api.jtiiho.easypanel.host/file',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        },
      );

      if (response.status !== 201) {
        throw new Error('Failed to upload file');
      }

      return 'https://' + response.data.url;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  findOne(id: string) {
    return this.userModel.findById(id);
  }

  update() {
    return `This action updates a user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
