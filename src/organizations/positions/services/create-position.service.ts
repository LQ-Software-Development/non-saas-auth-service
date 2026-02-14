import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Position } from '../entities/position.entity';
import { CreatePositionDto } from '../dto/create-position.dto';

@Injectable()
export class CreatePositionService {
    constructor(
        @InjectModel(Position.name)
        private readonly positionModel: Model<Position>,
    ) { }

    async execute(createPositionDto: CreatePositionDto): Promise<Position> {
        const existing = await this.positionModel.findOne({
            organizationId: createPositionDto.organizationId,
            name: createPositionDto.name,
            deletedAt: null,
        });

        if (existing) {
            throw new ConflictException(
                `Já existe um cargo com o nome "${createPositionDto.name}" nesta organização`,
            );
        }

        if (createPositionDto.parentPositionId) {
            const parentPosition = await this.positionModel.findOne({
                _id: createPositionDto.parentPositionId,
                organizationId: createPositionDto.organizationId,
                deletedAt: null,
            });

            if (!parentPosition) {
                throw new NotFoundException('Cargo superior não encontrado');
            }
        }

        const createdPosition = new this.positionModel(createPositionDto);
        return createdPosition.save();
    }
}
