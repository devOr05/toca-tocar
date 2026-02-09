import { Jam, Theme, Participation, User } from '../types';

export const MOCK_USER: User = {
    id: 'user-1',
    name: 'Sax Cat',
    role: 'USER',
};

export const MOCK_JAM: Jam = {
    id: 'jam-1',
    code: 'JAZZ',
    name: 'Monday Night Jam',
    description: 'Estándares de los 50s. Trae tu Real Book.',
    location: 'The Blue Note',
    status: 'ACTIVE',
    hostId: 'host-1',
    createdAt: new Date(),
};

export const MOCK_THEMES: Theme[] = [
    { id: 't-1', name: 'Autumn Leaves', tonality: 'Gm', status: 'PLAYING', jamId: 'jam-1' },
    { id: 't-2', name: 'Blue Bossa', tonality: 'Cm', status: 'QUEUED', jamId: 'jam-1' },
    { id: 't-3', name: 'All The Things You Are', tonality: 'Ab', status: 'OPEN', jamId: 'jam-1' },
    { id: 't-4', name: 'So What', tonality: 'Dm', status: 'OPEN', jamId: 'jam-1' },
];

export const MOCK_PARTICIPATIONS: Participation[] = [
    { id: 'p-1', userId: 'u-2', userName: 'Miles', themeId: 't-1', instrument: 'Trumpet', status: 'SELECTED', createdAt: new Date() },
    { id: 'p-2', userId: 'u-3', userName: 'Trane', themeId: 't-1', instrument: 'Tenor Sax', status: 'SELECTED', createdAt: new Date() },
    { id: 'p-3', userId: 'u-4', userName: 'Bill', themeId: 't-1', instrument: 'Piano', status: 'SELECTED', createdAt: new Date() },
    { id: 'p-4', userId: 'u-5', userName: 'Paul', themeId: 't-1', instrument: 'Bass', status: 'SELECTED', createdAt: new Date() },
    { id: 'p-5', userId: 'u-6', userName: 'Jimmy', themeId: 't-1', instrument: 'Drums', status: 'SELECTED', createdAt: new Date() },

    // Waiting for Blue Bossa
    { id: 'p-6', userId: 'u-7', userName: 'Dexter', themeId: 't-2', instrument: 'Tenor Sax', status: 'WAITING', createdAt: new Date() },
];
