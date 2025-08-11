'use client';

import { useState, useEffect } from 'react';
import ReactCountryFlag from "react-country-flag";
import api from '@/lib/api';

type Language = {
    id: number;
    code: string;
    name: string;
};

const getCountryCode = (languageCode: string) => {
    const map: Record<string, string> = {
        en: 'US',
        ru: 'RU',
        tr: 'TR',
        es: 'ES',
        fr: 'FR',
        de: 'DE',
        zh: 'CN',
        ja: 'JP',
        ar: 'SA',
        it: 'IT',
        pt: 'PT',
    };
    return map[languageCode] || languageCode.toUpperCase();
};

export function LanguageAdminPanel({ isOpen, onCloseAction }: { isOpen: boolean; onCloseAction: () => void }) {
    const [availableLangs, setAvailableLangs] = useState<Language[]>([]);
    const [userLangs, setUserLangs] = useState<Language[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [newLangCode, setNewLangCode] = useState('');
    const [newLangName, setNewLangName] = useState('');

    useEffect(() => {
        if (isOpen) {
            void loadLanguages();
        }
    }, [isOpen]);

    const loadLanguages = async () => {
        setIsLoading(true);
        setError('');
        try {
            const [available, userSelected] = await Promise.all([
                api.getAvailableLanguages(),
                api.getUserSelectedLanguages()
            ]);
            setAvailableLangs(available);
            setUserLangs(userSelected);
        } catch (err) {
            setError('Failed to load languages. Please try again.');
            console.error('Error loading languages:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddLanguage = async (lang: Language) => {
        setIsLoading(true);
        setError('');
        try {
            await api.addUserLanguage(lang.code, lang.name);
            await loadLanguages();
        } catch (err) {
            setError(`Failed to add language: ${lang.name}`);
            console.error('Error adding language:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCustomLanguage = async () => {
        if (!newLangCode || !newLangName) {
            setError('Both language code and name are required');
            return;
        }

        if (newLangCode.length !== 2) {
            setError('Language code must be exactly 2 characters');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await api.addUserLanguage(newLangCode.toLowerCase(), newLangName);
            setNewLangCode('');
            setNewLangName('');
            await loadLanguages();
        } catch (err) {
            setError('Failed to add custom language');
            console.error('Error adding custom language:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteLanguage = async (id: number) => {
        if (!confirm('Are you sure you want to delete this language? All translations will be lost.')) return;

        setIsLoading(true);
        setError('');
        try {
            await api.deleteLanguage(id);
            await loadLanguages();
        } catch (err) {
            setError('Failed to delete language');
            console.error('Error deleting language:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl transform transition-all max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Language Management</h2>
                        <button
                            onClick={onCloseAction}
                            className="text-gray-400 hover:text-gray-500"
                            disabled={isLoading}
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 rounded-md text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Add Custom Language Form */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-medium mb-3">Add Custom Language</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <label htmlFor="langCode" className="block text-sm font-medium text-gray-700 mb-1">
                                    Language Code (2 letters)
                                </label>
                                <input
                                    id="langCode"
                                    type="text"
                                    placeholder="e.g., 'es', 'fr'"
                                    value={newLangCode}
                                    onChange={(e) => setNewLangCode(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                                    maxLength={2}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="langName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Language Name
                                </label>
                                <input
                                    id="langName"
                                    type="text"
                                    placeholder="e.g., 'Español'"
                                    value={newLangName}
                                    onChange={(e) => setNewLangName(e.target.value)}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="self-end">
                                <button
                                    onClick={handleAddCustomLanguage}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                                    disabled={isLoading || !newLangCode || !newLangName || newLangCode.length !== 2}
                                >
                                    {isLoading ? 'Adding...' : 'Add Custom'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium mb-3">Available Languages</h3>
                            {isLoading && availableLangs.length === 0 ? (
                                <div className="flex justify-center p-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {availableLangs.map(lang => (
                                        <div key={lang.code} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center">
                                                <ReactCountryFlag
                                                    countryCode={getCountryCode(lang.code)}
                                                    svg
                                                    style={{ width: '1.5em', height: '1.5em', marginRight: '0.5em' }}
                                                    title={lang.code}
                                                />
                                                <span className="font-medium">{lang.name} ({lang.code})</span>
                                            </div>
                                            <button
                                                onClick={() => handleAddLanguage(lang)}
                                                className="px-3 py-1 text-sm bg-gray-800 text-white rounded hover:bg-gray-700 disabled:bg-gray-400"
                                                disabled={isLoading}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                    {availableLangs.length === 0 && !isLoading && (
                                        <p className="text-gray-500 text-sm">No available languages</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-3">Active Languages</h3>
                            {isLoading && userLangs.length === 0 ? (
                                <div className="flex justify-center p-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {userLangs.map(lang => (
                                        <div key={lang.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center">
                                                <ReactCountryFlag
                                                    countryCode={getCountryCode(lang.code)}
                                                    svg
                                                    style={{ width: '1.5em', height: '1.5em', marginRight: '0.5em' }}
                                                    title={lang.code}
                                                />
                                                <span className="font-medium">{lang.name} ({lang.code})</span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteLanguage(lang.id)}
                                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:bg-red-50 disabled:text-red-300"
                                                disabled={isLoading}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    {userLangs.length === 0 && !isLoading && (
                                        <p className="text-gray-500 text-sm">No active languages</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onCloseAction}
                            className="px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:bg-gray-50"
                            disabled={isLoading}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}