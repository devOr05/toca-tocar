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

                    try {
                        // 1. Try to find existing guest user
                        let user = await prisma.user.findFirst({
                            where: { name: name, email: null }
                        });

                        // 2. If not found, create new guest user
                        if (!user) {
                            console.log('Creating new guest user:', name);
                            user = await prisma.user.create({
                                data: {
                                    name: name,
                                    role: 'USER', // Explicit default
                                    image: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}` // Auto avatar
                                }
                            });
                        }

                        console.log('Authorize successful:', user.id, user.name);
                        return user; // Prisma user object has 'id'
                    } catch (error) {
                        console.error('Auth error:', error);
                        return null;
                    }
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                token.sub = user.id;
                token.role = (user as any).role;
                token.city = (user as any).city;
                token.mainInstrument = (user as any).mainInstrument;
            }

            // Sync with DB if fields are missing (e.g. existing sessions)
            if (token.sub && (!token.city || !token.mainInstrument || !token.role)) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.sub }
                    });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.city = dbUser.city;
                        token.mainInstrument = dbUser.mainInstrument;
                    }
                } catch (error) {
                    console.error("Error syncing user data in JWT:", error);
                }
            }

            // Update session flow (if we update profile)
            if (trigger === 'update' && session) {
                token.city = session.user.city;
                token.mainInstrument = session.user.mainInstrument;
            }

            return token;
        },
        async session({ session, token }) {
            session.user.mainInstrument = token.mainInstrument as string | null;
            return session;
        }
    }
});
