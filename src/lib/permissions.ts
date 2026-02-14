import { Jam, Theme, User } from '@/types';

/**
 * Check if a user is the host of a jam
 */
export function isJamHost(userId: string | undefined, jam: Jam): boolean {
    if (!userId) return false;
    return jam.hostId === userId;
}

/**
 * Check if a user can moderate a theme (host can moderate any theme)
 */
export function canModerateTheme(userId: string | undefined, jam: Jam, theme: Theme): boolean {
    if (!userId) return false;
    return isJamHost(userId, jam);
}

/**
 * Check if a user can delete a theme
 * Host can delete any theme in their jam
 */
export function canDeleteTheme(userId: string | undefined, jam: Jam, theme: Theme): boolean {
    if (!userId) return false;
    return isJamHost(userId, jam);
}

/**
 * Check if a user can edit a theme
 * Host can edit any theme in their jam
 */
export function canEditTheme(userId: string | undefined, jam: Jam, theme: Theme): boolean {
    if (!userId) return false;
    return isJamHost(userId, jam);
}

/**
 * Check if a user can reorder themes
 * Only host can reorder themes
 */
export function canReorderThemes(userId: string | undefined, jam: Jam): boolean {
    if (!userId) return false;
    return isJamHost(userId, jam);
}

/**
 * Check if a user can delete media
 * Uploader or jam host can delete
 */
export function canDeleteMedia(userId: string | undefined, jam: Jam, mediaUserId: string): boolean {
    if (!userId) return false;
    return userId === mediaUserId || isJamHost(userId, jam);
}

/**
 * Check if a user can edit jam settings
 * Only host can edit jam
 */
export function canEditJam(userId: string | undefined, jam: Jam): boolean {
    if (!userId) return false;
    return isJamHost(userId, jam);
}
