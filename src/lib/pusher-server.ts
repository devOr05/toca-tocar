import Pusher from 'pusher';

if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_SECRET) {
    console.warn('Pusher server keys missing!');
}

export const pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID || '',
    key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
    secret: process.env.PUSHER_SECRET || '',
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
    useTLS: true,
});
