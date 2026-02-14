import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Position } from '../entities/position.entity';
import { UpdatePositionDto } from '../dto/update-position.dto';

@Injectable()
export class UpdatePositionService {
    constructor(
        @InjectModel(Position.name)
        private readonly positionModel: Model<Position>,
    ) { }

    async execute(updatePositionDto: UpdatePositionDto): Promise<Position | null> {
        const { id, organizationId, ...rest } = updatePositionDto;

        const position = await this.positionModel.findOne({
            _id: id,
            organizationId,
            deletedAt: null,
        });

        if (!position) {
            throw new NotFoundException('Cargo não encontrado');
        }

        if (rest.name && rest.name !== position.name) {
            const existing = await this.positionModel.findOne({
                organizationId,
                name: rest.name,
                deletedAt: null,
                _id: { $ne: id },
            });

            if (existing) {
                throw new ConflictException(
                    `Já existe um cargo com o nome "${rest.name}" nesta organização`,
                );
            }
        }

        if (rest.parentPositionId) {
            if (rest.parentPositionId === id) {
                throw new ConflictException('Um cargo não pode ser superior a si mesmo');
            }

            const parentPosition = await this.positionModel.findOne({
                _id: rest.parentPositionId,
                organizationId,
                deletedAt: null,
            });

            if (!parentPosition) {
                throw new NotFoundException('Cargo superior não encontrado');
            }
        }

        await this.positionModel.updateOne(
            { _id: id, organizationId },
            { ...rest, updatedAt: new Date() },
        );

        return this.positionModel.findOne({
            _id: id,
            organizationId,
            deletedAt: null,
        });
    }
}
