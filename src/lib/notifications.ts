import { prisma } from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher-server';

export type NotificationType = 'MENTION' | 'SYSTEM' | 'REPLY' | 'JAM_INVITE';

/**
 * Create a notification for a user and trigger a Pusher event
 */
export async function createNotification(
    userId: string,
    type: NotificationType,
    message: string,
    link?: string,
    actorId?: string
) {
    try {
        // 1. Create in DB
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                message,
                link,
                actorId,
                read: false,
            },
            include: {
                actor: {
                    select: { name: true, image: true }
                }
            }
        });

        // 2. Trigger Real-time Event (Private User Channel)
        // Channel: user-{userId}
        await pusherServer.trigger(`user-${userId}`, 'new-notification', {
            id: notification.id,
            message: notification.message,
            link: notification.link,
            read: false,
            createdAt: notification.createdAt,
            type: notification.type,
            actorName: notification.actor?.name,
            actorImage: notification.actor?.image,
        });

        return { success: true };
    } catch (error) {
        console.error('Error creating notification:', error);
        return { success: false, error: 'Failed to create notification' };
    }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string) {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });
        return { success: true };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return { success: false };
    }
}
