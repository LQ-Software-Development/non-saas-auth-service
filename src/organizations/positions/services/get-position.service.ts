import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Position } from '../entities/position.entity';

@Injectable()
export class GetPositionService {
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
    }): Promise<Position | null> {
        return this.positionModel.findOne({
            _id: id,
            organizationId,
            deletedAt: null,
        });
    }
}
