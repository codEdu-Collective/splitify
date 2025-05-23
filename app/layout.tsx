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
                <link rel="icon" href="./public/logos/logo.png" sizes="any" />
            </head>
            <body className={`${inter.className}`}>
                <ClerkProvider>
                    <ConvexClientProvider>
                        <Header />
                        <main className="min-h-screen">
                            {children}
                            <Toaster richColors/>
                            </main>
                    </ConvexClientProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
