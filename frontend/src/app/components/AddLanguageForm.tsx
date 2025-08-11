'use client';

import React, { useState, useEffect } from 'react';
import api, { Language } from '@/lib/api';

export function AddLanguageForm({ onLanguageAddedAction }: { onLanguageAddedAction: () => Promise<void> }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState<Language | null>(null);
    const [availableLangs, setAvailableLangs] = useState<Language[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadAvailableLanguages()
            .catch(err => console.error('Error loading languages:', err));
    }, []);
    
    const loadAvailableLanguages = async () => {
        setIsLoading(true);
        setError('');
        try {
            console.log('Fetching available languages...');
            const allLangs = await api.getAvailableLanguages();
            console.log('Received languages:', allLangs);
            setAvailableLangs(allLangs);
            if (allLangs.length > 0) {
                setSelectedLang(allLangs[0]);
            }
        } catch (err) {
            console.error('Error loading languages:', err);
            setError('Failed to load available languages');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLang) return;

        setIsLoading(true);
        try {
            await api.addUserLanguage(selectedLang.code, selectedLang.name);
            setIsOpen(false);
            await onLanguageAddedAction();
            await loadAvailableLanguages();
        } catch (err) {
            setError('Failed to add language');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`text-gray-800 hover:text-gray-100 text-xl ${
                    isOpen ? 'pointer-events-none opacity-50' : ''
                }`}
            >
                +
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-md w-full mx-4">
                        <div className="p-6 relative">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Language</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 rounded-md flex items-start text-red-700">
                                    <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            {isLoading ? (
                                <div className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md border bg-gray-100">
                                    Loading languages...
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-6">
                                        <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Language
                                        </label>
                                        {availableLangs.length > 0 ? (
                                            <select
                                                id="language-select"
                                                value={selectedLang?.code || ''}
                                                onChange={(e) => {
                                                    const lang = availableLangs.find(l => l.code === e.target.value);
                                                    setSelectedLang(lang || null);
                                                }}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md border"
                                                required
                                            >
                                                {availableLangs.map(lang => (
                                                    <option key={lang.code} value={lang.code}>
                                                        {lang.name} ({lang.code.toUpperCase()})
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="text-center py-4 border border-gray-200 rounded-md bg-gray-50">
                                                <p className="text-sm text-gray-500">All available languages have been added</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                        <button
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:col-start-1 sm:text-sm transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!selectedLang || isLoading || availableLangs.length === 0}
                                            className={`mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:col-start-2 sm:text-sm transition-colors ${
                                                !selectedLang || isLoading || availableLangs.length === 0
                                                    ? 'bg-gray-300 cursor-not-allowed'
                                                    : 'bg-gray-800 hover:bg-gray-900 focus:ring-gray-500'
                                            }`}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}