'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function completeOnboarding(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    const city = formData.get('city') as string;
    const mainInstrument = formData.get('mainInstrument') as string;

    if (!city || !mainInstrument) {
        return { success: false, error: 'Por favor completa todos los campos requeridos.' };
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                city,
                mainInstrument
            }
        });

        // Force session update logic if needed, but for now redirect will trigger re-check
        // Note: Client side session update might be needed or page reload.

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error completing onboarding:', error);
        return { success: false, error: 'Error al actualizar el perfil.' };
    }
}
