export interface CrudPermissions {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
}

export interface ParticipantPermissions {
    /** Permissões para gerenciar participantes da organização */
    participants?: CrudPermissions;

    /** Permissões para gerenciar a organização */
    organization?: CrudPermissions;

    /** Permissões para gerenciar cargos */
    positions?: CrudPermissions;

    /** Permissões customizadas definidas pela organização */
    custom?: Record<string, boolean>;
}
