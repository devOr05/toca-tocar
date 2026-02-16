import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster as SonnerToaster } from 'sonner';
import { Toaster as HotToaster } from 'react-hot-toast';
import OnboardingGuard from "@/components/OnboardingGuard";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toca Tocar | Jazz Jam Organizer",
  description: "Organiza tu jam de jazz en tiempo real. Intención, ensamble y música.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Toca Tocar | Jazz Jam Organizer",
    description: "Organiza tu jam de jazz en tiempo real.",
    url: "https://toca-tocar.vercel.app",
    siteName: "Toca Tocar",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toca Tocar | Jazz Jam Organizer",
    description: "Organiza tu jam de jazz en tiempo real.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          <OnboardingGuard>
            {children}
          </OnboardingGuard>
          <SonnerToaster richColors position="top-center" />
          <HotToaster position="top-center" reverseOrder={false} />
        </Providers>
      </body>
    </html>
  );
}
