import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ConvexClientProvider } from '@/components/convex-client-provider';
import { ClerkProvider } from '@clerk/nextjs';
import Header from '@/components/header';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
    title: 'Split Smart App',
    description:
        'Split Smart is your all-in-one solution for effortless expense management and fair cost splitting',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/logos/logo-s.png" sizes="any" />
            </head>
            <body className={`${inter.className}`} suppressHydrationWarning>
                <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
                    <ConvexClientProvider>
                        <Header />
                        <main className="min-h-screen">
                            <Toaster richColors />

                            {children}
                        </main>
                    </ConvexClientProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
