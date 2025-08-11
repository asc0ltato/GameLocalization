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
    return map[languageCode] || 'RU';
};

export function DeleteLanguage({
                                   languages,
                                   onLanguageDeletedAction
                               }: {
    languages: Language[];
    onLanguageDeletedAction: () => Promise<void>;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleDelete = async (languageId: number) => {
        setIsDeleting(true);
        setDeletingId(languageId);
        try {
            await api.deleteLanguage(languageId);
            await onLanguageDeletedAction();
            setIsOpen(false);
            
            setTimeout(() => {
                window.location.reload();
            }, 100);
        } catch (error) {
            console.error('Error deleting language:', error);
            alert('Failed to delete language. Please try again.');
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    };

    if (!isMounted) {
        return (
            <div className="relative inline-block text-left ml-2">
                <button
                    type="button"
                    className="inline-flex items-center justify-center text-gray-500 p-1 rounded-full"
                    disabled
                    title="Delete language"
                >
                    <span className="text-lg">−</span>
                </button>
            </div>
        );
    }

    return (
        <div className="relative inline-block text-left ml-2">
            <button
                type="button"
                className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                onClick={() => setIsOpen(!isOpen)}
                disabled={languages.length === 0 || isDeleting}
                title="Delete language"
            >
                <span className="text-lg">−</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-transparent z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                            {languages.map((lang) => (
                                <button
                                    key={lang.id}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (confirm(`Delete language "${lang.name}" (${lang.code})? All translations will be lost.`)) {
                                            await handleDelete(lang.id);
                                        }
                                    }}
                                    disabled={isDeleting && deletingId !== lang.id}
                                >
                                    <ReactCountryFlag
                                        countryCode={getCountryCode(lang.code)}
                                        svg
                                        style={{ width: '1em', height: '1em', marginRight: '0.5em' }}
                                    />
                                    {lang.name} ({lang.code})
                                    {isDeleting && deletingId === lang.id && (
                                        <svg
                                            className="animate-spin ml-2 h-4 w-4 text-gray-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}