import Pusher from 'pusher-js';

// Get keys from environment
const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

if (!pusherKey || !pusherCluster) {
    console.error('Pusher keys are missing. Real-time features will not work.');
}

// Create Pusher instance (Singleton pattern)
export const pusherClient = new Pusher(pusherKey || 'MISSING_KEY', {
    cluster: pusherCluster || 'us2',
    forceTLS: true,
});

// Debug log for development
if (process.env.NODE_ENV === 'development') {
    pusherClient.connection.bind('connected', () => {
        console.log('✅ Pusher Connected Success');
    });
    pusherClient.connection.bind('error', (err: any) => {
        console.error('❌ Pusher Connection Error:', err);
    });
}
