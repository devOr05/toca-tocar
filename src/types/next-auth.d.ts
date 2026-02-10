import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            mainInstrument?: string | null
            favoriteTheme?: string | null
            hasRecorded?: string | null
            externalLink?: string | null
            website?: string | null
            instagram?: string | null
            youtube?: string | null
            tiktok?: string | null
            bandcamp?: string | null
            soundcloud?: string | null
            isVerifiedOrganizer?: boolean
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        role: string
        mainInstrument?: string | null
        favoriteTheme?: string | null
        hasRecorded?: string | null
        externalLink?: string | null
        website?: string | null
        instagram?: string | null
        youtube?: string | null
        tiktok?: string | null
        bandcamp?: string | null
        soundcloud?: string | null
        isVerifiedOrganizer?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        role?: string
        mainInstrument?: string | null
        favoriteTheme?: string | null
        hasRecorded?: string | null
        externalLink?: string | null
        website?: string | null
        instagram?: string | null
        youtube?: string | null
        tiktok?: string | null
        bandcamp?: string | null
        soundcloud?: string | null
        isVerifiedOrganizer?: boolean
    }
}
