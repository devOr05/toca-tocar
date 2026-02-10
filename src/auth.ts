import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma) as any,
    session: { strategy: 'jwt' }, // Force Strategy to JWT for compatibility with Credentials and Edge
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: 'Guest',
            credentials: {
                name: { label: "Nombre", type: "text" },
            },
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ name: z.string().min(1) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { name } = parsedCredentials.data;

                    // Check if user exists, if not create a guest user (or find existing by name)
                    // Ideally for Guest credentials we might verify connection to a Jam Code?
                    // For now, simple name-based login as requested

                    // WARNING: Credentials provider with Prisma Adapter doesn't persist sessions in DB automatically
                    // We handle this via JWT strategy.

                    let user = await prisma.user.findFirst({
                        where: { name: name, email: null } // Find guest user
                    });

                    if (!user) {
                        user = await prisma.user.create({
                            data: { name: name }
                        });
                    }

                    return user;
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.mainInstrument = user.mainInstrument;
                token.isVerifiedOrganizer = user.isVerifiedOrganizer;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub!;
                session.user.role = token.role as string;
                session.user.mainInstrument = token.mainInstrument as string | null;
                session.user.isVerifiedOrganizer = token.isVerifiedOrganizer as boolean;
            }
            return session;
        }
    }
});
