import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ParticipantPermissions } from '../../participants/types/permissions.type';

export type PositionDocument = HydratedDocument<Position>;

@Schema()
export class Position {
    @Prop({ required: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ required: true, index: true })
    organizationId: string;

    @Prop(raw({}))
    permissions?: ParticipantPermissions;

    /** Nível hierárquico (1 = mais alto, ex: Diretor; números maiores = subordinados) */
    @Prop({ default: 1 })
    hierarchyLevel: number;

    /** ID do cargo superior na hierarquia (opcional) */
    @Prop()
    parentPositionId?: string;

    @Prop({ default: true })
    active: boolean;

    @Prop(raw({}))
    metadata?: Record<string, any>;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now })
    updatedAt: Date;

    @Prop({ type: Date, default: null })
    deletedAt?: Date;
}

export const PositionSchema = SchemaFactory.createForClass(Position);

// Índice composto para garantir nome único por organização
PositionSchema.index({ organizationId: 1, name: 1 }, { unique: true });

// Índice para ordenação por hierarquia
PositionSchema.index({ organizationId: 1, hierarchyLevel: 1 });
