export interface User {
    id: string;
    name: string;
    role: 'USER' | 'ADMIN';
}

export interface Jam {
    id: string;
    code: string;
    name: string;
    description?: string;
    location?: string;
    city?: string;
    flyerUrl?: string;
    lat?: number;
    lng?: number;
    startTime?: Date | string;
    status: 'SCHEDULED' | 'ACTIVE' | 'FINISHED';
    isPrivate?: boolean;
    hostId: string;
    createdAt: Date;
}

export interface Theme {
    id: string;
    name: string;
    tonality?: string;
    description?: string;
    sheetMusicUrl?: string;
    status: 'OPEN' | 'QUEUED' | 'PLAYING' | 'FINISHED';
    jamId: string;
}

export interface Participation {
    id: string;
    userId: string;
    userName: string; // Denormalized for ease
    themeId: string;
    instrument: string;
    status: 'WAITING' | 'SELECTED';
    createdAt: Date;
}

export interface Message {
    id: string;
    content: string;
    userId: string;
    userName: string;
    themeId: string;
    createdAt: Date;
}
