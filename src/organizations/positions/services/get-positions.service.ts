import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Position } from '../entities/position.entity';

@Injectable()
export class GetPositionsService {
    constructor(
        @InjectModel(Position.name)
        private readonly positionModel: Model<Position>,
    ) { }

    async execute({
        organizationId,
        active,
    }: {
        organizationId: string;
        active?: boolean;
    }): Promise<Position[]> {
        const filter: Record<string, any> = {
            organizationId,
            deletedAt: null,
        };

        if (active !== undefined) {
            filter.active = active;
        }

        return this.positionModel
            .find(filter)
            .sort({ hierarchyLevel: 1, name: 1 })
            .exec();
    }
}
