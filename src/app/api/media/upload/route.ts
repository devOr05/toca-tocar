import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadMedia } from '@/app/actions';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const body = await request.json();
        const { jamId, type, url, thumbnailUrl, caption } = body;

        if (!jamId || !type || !url) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
        }

        const result = await uploadMedia(jamId, type, url, caption);

        if (result.success) {
            return NextResponse.json(result.media);
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in media upload API:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
