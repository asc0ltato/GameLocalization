'use client';

import axios from 'axios';
import ReactCountryFlag from "react-country-flag";
import React, {useState, useEffect, useCallback} from 'react';
import api, { Language, TranslationKey, Translation } from '@/lib/api';
import {TranslationCell} from './TranslationCell';
import { AddLanguageForm } from './AddLanguageForm';
import { AddKeyForm } from './AddKeyForm';
import { DeleteLanguage } from './DeleteLanguage';

export function TranslationTable() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [userLanguages, setUserLanguages] = useState<Language[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredKeys, setFilteredKeys] = useState<TranslationKey[]>([]); 
    const [totalCount, setTotalCount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            const tableData = await api.getTableData(page, pageSize);
            const allKeys = tableData?.keys || [];

            if (searchQuery.trim()) {
                const filtered = allKeys.filter((key: TranslationKey) =>
                    key.key.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setFilteredKeys(filtered);
                setTotalCount(filtered.length);
            } else {
                setFilteredKeys(allKeys);
                setTotalCount(tableData?.totalCount || 0);
            }

            setSaveError(null);
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : error instanceof Error
                    ? error.message
                    : 'Unknown error occurred';

            console.error('Data loading error:', error);
            setSaveError(`Failed to load data: ${errorMessage}`);
        }
    }, [page, pageSize, searchQuery]);

    const loadUserLanguages = async () => {
        try {
            const langs = await api.getUserSelectedLanguages();
            setUserLanguages(langs || []);
        } catch (error) {
            console.error('Error loading user languages:', error);
        }
    };

    const handleLanguageAdded = async () => {
        await loadUserLanguages();
        await loadData();
    };

    useEffect(() => {
        const initialize = async () => {
            await loadUserLanguages();
            await loadData();
        };
        void initialize();
    }, [page, pageSize, loadData]);

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleDeleteKey = async (keyId: number) => {
        if (!confirm('Are you sure you want to delete this key and all its translations?')) return;

        setIsSaving(true);
        setSaveError(null);
        try {
            await api.deleteKey(keyId);
            await loadData();
        } catch (error) {
            console.error('Error deleting key:', error);
            setSaveError('Failed to delete key. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleUpdateTranslation = async (keyId: number, languageId: number, value: string) => {
        setIsSaving(true);
        setSaveError(null);
        try {
            await api.updateTranslation(keyId, languageId, value);
            setFilteredKeys(prevKeys => prevKeys.map(key => {
                if (key.id !== keyId) return key;

                const existingTranslation = key.translations?.find((t: Translation) => t.languageId === languageId);

                return {
                    ...key,
                    translations: existingTranslation
                        ? key.translations!.map((t: Translation) =>
                            t.languageId === languageId ? { ...t, value } : t
                        )
                        : [
                            ...(key.translations || []),
                            { languageId, value } as Translation
                        ]
                };
            }));
            
            setFilteredKeys(prev => prev.map(key => {
                if (key.id !== keyId) return key;
                return {
                    ...key,
                    translations: key.translations?.map((t: Translation) =>
                        t.languageId === languageId ? { ...t, value } : t
                    ) || []
                };
            }));
        } catch (error) {
            console.error('Error saving translation:', error);
            setSaveError('Failed to save translation. Please try again.');
            await loadData();
        } finally {
            setIsSaving(false);
        }
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

    return (
        <div className="p-6">
            {saveError && (
                <div className="mb-4 p-3 bg-red-50 rounded-md flex items-start text-red-700">
                    <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{saveError}</span>
                </div>
            )}

            <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by key..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-300"
                    />
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <span>Rows per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="ml-2 border rounded px-2 py-1 text-sm"
                        >
                            {[10, 20, 30, 50].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>

                    <div className="text-sm text-gray-500">
                        <span className="font-medium">{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span>
                    </div>

                    <div className="flex space-x-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-2 py-1 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &lt;
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= Math.ceil(totalCount / pageSize)}
                            className="px-2 py-1 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative overflow-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg"
                 style={{ maxHeight: 'calc(8 * 51.5px)' }}>
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50 sticky top-0 z-20">
                    <tr>
                        <th
                            scope="col"
                            className="sticky left-0 z-30 py-3.5 pl-4 pr-3 text-sm font-semibold text-gray-900 bg-gray-50 sm:pl-6"
                            style={{
                                width: '200px',
                                minWidth: '200px',
                                position: 'sticky',
                                left: 0,
                                top: 0
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        className="mr-2 flex flex-col justify-center items-center"
                                        aria-label="Menu"
                                    >
                                        <span className="w-3 h-0.5 bg-gray-500 mb-1"></span>
                                        <span className="w-3 h-0.5 bg-gray-500 mb-1"></span>
                                        <span className="w-3 h-0.5 bg-gray-500"></span>
                                    </button>
                                    <span>Key</span>
                                </div>
                            </div>
                        </th>
                        {userLanguages.map(lang => (
                            <th key={lang.id} scope="col"
                                className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="flex items-center mb-1">
                                        <ReactCountryFlag
                                            countryCode={getCountryCode(lang.code)}
                                            svg
                                            style={{ width: '1.2em', height: '1.2em', marginRight: '0.3em' }}
                                        />
                                        <span className="relative">
                                            {lang.name}
                                            <span className="absolute -top-2 text-xs text-gray-500 ml-1">
                                                ({lang.code})
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </th>
                        ))}
                        <th scope="col"
                            className="px-5 py-3.5 text-center text-sm font-semibold text-gray-900"
                            style={{ width: '40px' }}>
                            <div className="flex items-center justify-center">
                                <AddLanguageForm onLanguageAddedAction={handleLanguageAdded} />
                                <DeleteLanguage
                                    languages={userLanguages}
                                    onLanguageDeletedAction={async () => {
                                        await loadUserLanguages();
                                        await loadData();
                                    }}
                                />
                            </div>
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredKeys.length > 0 ? (
                        filteredKeys.map((key) => (
                            <tr key={key.id} className="bg-white hover:bg-gray-50">
                                <td className="whitespace-nowrap sticky left-0 z-20 py-4 pl-4 pr-3 text-sm font-mono text-gray-900 bg-white sm:pl-6"
                                    style={{
                                        width: '200px',
                                        minWidth: '200px',
                                        position: 'sticky',
                                        left: 0,
                                        zIndex: 10
                                    }}>
                                    <div className="flex items-center gap-2">
                                        <span className="truncate max-w-[160px]">{key.key}</span>
                                        <button
                                            onClick={() => handleDeleteKey(key.id)}
                                            className="text-gray-400 hover:text-red-500 p-0.5 rounded-full hover:bg-red-50 transition-colors"
                                            title="Delete key"
                                            disabled={isSaving}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-3.5 w-3.5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                                {userLanguages.map(lang => {
                                    const translation = key.translations?.find(t => t.languageId === lang.id);
                                    return (
                                        <td key={`${key.id}-${lang.id}`}
                                            className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                            <TranslationCell
                                                value={translation?.value || '-'}
                                                onSave={(value) => handleUpdateTranslation(key.id, lang.id, value)}
                                                isSaving={isSaving}
                                            />
                                        </td>
                                    );
                                })}
                                <td className="whitespace-nowrap px-1 py-4 text-sm text-gray-500"></td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={userLanguages.length + 2} className="py-4 text-center text-gray-500">
                                No translation keys found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-left">
                <AddKeyForm onKeyAddedAction={loadData} />
            </div>
        </div>
    );
}