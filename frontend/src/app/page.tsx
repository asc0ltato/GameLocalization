'use client';

import { useState } from 'react';
import { TranslationTable } from './components/TranslationTable';
import { LanguageAdminPanel } from './components/LanguageAdminPanel';

export default function DashboardPage() {
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm">
                <div className="px-20 py-6">
                    <div className="flex justify-between items-center max-w-full mx-auto">
                        <h1 className="text-2xl font-semibold text-gray-900">Game Localization</h1>
                        <button
                            onClick={() => setIsAdminPanelOpen(true)}
                            className="text-gray-500 hover:text-gray-700"
                            title="Language settings"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <main className="lg:px-8 py-8 flex-grow">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4">
                        <TranslationTable />
                    </div>
                </div>
            </main>

            <LanguageAdminPanel
                isOpen={isAdminPanelOpen}
                onCloseAction={() => setIsAdminPanelOpen(false)}
            />
            
            <footer className="bg-white border-t border-gray-200 py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} Game Localization. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}