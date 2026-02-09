import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/', // Login is on the landing page
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnJam = nextUrl.pathname.startsWith('/jam');

            if (isOnDashboard || isOnJam) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && nextUrl.pathname === '/') {
                // If logged in and on landing, redirect to dashboard
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        session({ session, user, token }) {
            if (session.user && token?.sub) {
                session.user.id = token.sub;
            }
            return session;
        }
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
