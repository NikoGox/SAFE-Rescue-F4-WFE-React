
export type IncidentStatus = 'En progreso' | 'Localizado' | 'Cerrado';
export type IncidentCategory = 'Desaparición' | 'Robo' | 'Daño' | 'Otro';

export interface Incident {
    id: number;
    type: string;
    description: string;
    location: string;
    dateTime: string;
    status: string;
    imageUrl: string;
}

export interface IncidentForm {
    type: string;
    description: string;
    location: string;
    imageUrl: string;
}

export interface EditForm {
    description: string;
    location: string;
    type: string;
    status: string;
    imageUrl: string;
}