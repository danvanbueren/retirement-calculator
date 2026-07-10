import React from 'react';
import ThemeModeProvider from '@/context/ThemeModeProvider';
import {StorageProvider} from "@/context/StorageContext";

export const metadata = {
    title: 'Retirement Calculator',
    description: 'US Military Pay and Retirement Calculator',
    icons: {
        icon: [
            { url: '/icon/icon0.svg', type: 'image/svg+xml' },
            { url: '/icon/icon1.png', type: 'image/png' },
        ],
        shortcut: '/icon/favicon.ico',
        apple: '/icon/apple-icon.png',
    },
    manifest: '/icon/manifest.json',
    appleWebApp: {
        title: 'Retirement Calculator',
    },
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
