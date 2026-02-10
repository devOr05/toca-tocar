export interface User {
    id: string;
    name: string;
    role: 'USER' | 'ADMIN';
    city?: string | null;
    mainInstrument?: string | null;
    image?: string | null;
    bio?: string | null;
    socialLinks?: { [key: string]: string } | null;
}

export interface Jam {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    location?: string | null;
    city?: string | null;
    flyerUrl?: string | null;
    lat?: number | null;
    lng?: number | null;
    startTime?: Date | string | null;
    status: 'SCHEDULED' | 'ACTIVE' | 'FINISHED';
    isPrivate?: boolean;
    hostId: string;
    createdAt: Date;
}

export interface Theme {
    id: string;
    name: string;
    tonality?: string | null;
    description?: string | null;
    sheetMusicUrl?: string | null;
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
    jamId: string;
    themeId?: string | null;
    createdAt: Date;
}
