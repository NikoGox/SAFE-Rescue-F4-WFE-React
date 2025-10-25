
export type IncidentStatus = 'En progreso' | 'Localizado' | 'Cerrado';
export type IncidentCategory = 'Desaparición' | 'Robo' | 'Daño' | 'Otro';

export interface Incident {
    id: number;
    title: string;
    description: string;
    location: string;
    dateTime: string;
    type: IncidentCategory;
    status: IncidentStatus;
    imageUrl: string;
}

export interface IncidentForm {
    title: string;
    description: string;
    location: string;
    dateTime: string;
    type: IncidentCategory;
    status: IncidentStatus;
    imageUrl: string;
}

export interface ImageUploadModel {
    file: File | null;
    previewUrl: string | null;
}