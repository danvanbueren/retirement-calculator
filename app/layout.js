import React from 'react';
import ThemeModeProvider from '@/context/ThemeModeProvider';
import {StorageProvider} from "@/context/StorageContext";

export const metadata = {
    title: 'Retirement Calculator',
    description: 'US Military Pay and Retirement Calculator',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <ThemeModeProvider>
                    <StorageProvider>
                        {children}
                    </StorageProvider>
                </ThemeModeProvider>
            </body>
        </html>
    );
}
