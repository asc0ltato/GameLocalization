import '../styles/globals.css'
import { Metadata } from 'next'
import React from "react";

export const metadata: Metadata = {
    title: 'Game Localization',
    description: 'Localization management system',
    icons: {
        icon: [
            { url: '/sheets.svg', sizes: 'any' },
        ],
    },
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
        {children}
        </body>
        </html>
    )
}