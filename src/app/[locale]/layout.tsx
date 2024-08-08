import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import "@/app/ui/globals.css";
import {Poppins} from "next/font/google";
import React from "react";
import {Toaster} from "@/app/ui/shadcn/toaster";
import {TooltipProvider} from "@/app/ui/shadcn/tooltip";
import Header from "@/app/ui/Header";
import ThemeWrapper from "@/app/components/ThemeWrapper";
import dynamic from 'next/dynamic';

const DynamicSessionProvider = dynamic(
    () => import('@/app/contexts/SessionContext').then(mod => mod.SessionProvider),
    {ssr: false}
);

const poppins = Poppins({
    weight: ['400', '700'],
    subsets: ['latin'],
    display: 'swap'
});

export default async function LocaleLayout({
                                               children,
                                               params: {locale}
                                           }: {
    children: React.ReactNode
    params: { locale: string }
}) {
    const messages = await getMessages();
    return (
        <html lang={locale}>
        <body className={poppins.className}>
        <ThemeWrapper>
            <NextIntlClientProvider messages={messages}>
                <Toaster/>
                <TooltipProvider>
                    <DynamicSessionProvider>
                        <main className="min-h-screen max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                            <Header/>
                            {children}
                        </main>
                    </DynamicSessionProvider>
                </TooltipProvider>
            </NextIntlClientProvider>
        </ThemeWrapper>

        </body>
        </html>
    );
}