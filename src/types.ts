export interface User {
    id: string;
    name: string;
    email?: string | null;
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
    openingBand?: string | null;
    openingInfo?: string | null;
    openingThemes?: string | null;
    createdAt: Date;
    attendance?: JamAttendance[];
}

export interface Theme {
    id: string;
    name: string;
    tonality?: string | null;
    description?: string | null;
    sheetMusicUrl?: string | null;
    status: 'OPEN' | 'QUEUED' | 'PLAYING' | 'FINISHED';
    jamId: string;
    type?: 'SONG' | 'TOPIC' | string;
    visibility?: 'PUBLIC' | 'PRIVATE' | string;
    order?: number;
    proposedById?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Participation {
    id: string;
    userId: string;
    userName: string; // Denormalized for ease
    themeId: string;
    instrument: string;
    status: 'WAITING' | 'SELECTED';
    createdAt: Date;
    user?: User;
}

export interface DirectMessage {
    id: string;
    content: string;
    senderId: string;
    senderName?: string;
    receiverId: string;
    createdAt: Date;
    read: boolean;
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

export interface JamAttendance {
    id: string;
    userId: string;
    jamId: string;
    instrument?: string | null;
    joinedAt: Date;
    user: User;
}

export interface JamWithAttendance extends Jam {
    attendance: JamAttendance[];
}
