import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Position } from '../entities/position.entity';

@Injectable()
export class RemovePositionService {
    constructor(
        @InjectModel(Position.name)
        private readonly positionModel: Model<Position>,
    ) { }

    async execute({
        id,
        organizationId,
    }: {
        id: string;
        organizationId: string;
    }): Promise<void> {
        const position = await this.positionModel.findOne({
            _id: id,
            organizationId,
            deletedAt: null,
        });

        if (!position) {
            throw new NotFoundException('Cargo não encontrado');
        }

        await this.positionModel.updateOne(
            { _id: id, organizationId },
            { deletedAt: new Date(), updatedAt: new Date() },
        );
    }
}
