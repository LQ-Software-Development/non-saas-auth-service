import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PositionsController } from './positions.controller';
import { Position, PositionSchema } from './entities/position.entity';
import { CreatePositionService } from './services/create-position.service';
import { GetPositionsService } from './services/get-positions.service';
import { GetPositionService } from './services/get-position.service';
import { UpdatePositionService } from './services/update-position.service';
import { RemovePositionService } from './services/remove-position.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Position.name, schema: PositionSchema },
        ]),
    ],
    controllers: [PositionsController],
    providers: [
        CreatePositionService,
        GetPositionsService,
        GetPositionService,
        UpdatePositionService,
        RemovePositionService,
    ],
    exports: [
        CreatePositionService,
        GetPositionsService,
        GetPositionService,
        UpdatePositionService,
        RemovePositionService,
    ],
})
export class PositionsModule { }
