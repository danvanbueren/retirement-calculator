import packageJson from '../package.json'
import React from 'react'
import ThemeModeProvider from '@/context/ThemeModeProvider'
import { StorageProvider } from "@/context/StorageContext"
import { Analytics } from "@vercel/analytics/next"

const PROJECT_NAME = packageJson.name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export const metadata = {
    title: PROJECT_NAME,
    description: `${PROJECT_NAME} - US Military Pay and Retirement Calculator`,
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
        title: PROJECT_NAME,
    },
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <ThemeModeProvider>
                    <StorageProvider>
                        {children}
                    </StorageProvider>
                    <Analytics />
                </ThemeModeProvider>
            </body>
        </html>
    )
}
