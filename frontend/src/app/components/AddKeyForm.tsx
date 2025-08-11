'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

export function AddKeyForm({ onKeyAddedAction }: { onKeyAddedAction: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [key, setKey] = useState('');
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!key.trim()) {
            setError('Key cannot be empty');
            return;
        }

        if (!/^ui_[a-zA-Z]+$/.test(key)) {
            setError('Key must start with "ui_" followed by letters');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.addKey({ key: key.trim() });
            setIsOpen(false);
            setKey('');
            onKeyAddedAction();
        } catch (err) {
            let errorMessage = 'Failed to add key';

            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { title?: string, message?: string } } };
                errorMessage = axiosError.response?.data?.title ||
                    axiosError.response?.data?.message ||
                    errorMessage;
            }
            else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            console.error('Error adding key:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-150"
            >
                + Add
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 transition-opacity">
                    <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Add Translation Key</h3>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        setError('');
                                    }}
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

                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label htmlFor="translation-key" className="block text-sm font-medium text-gray-700 mb-1">
                                        Translation Key
                                        <span className="text-gray-500 text-xs font-normal ml-1">(e.g. &quot;ui_Play&quot;)</span>
                                    </label>
                                    <input
                                        id="translation-key"
                                        type="text"
                                        value={key}
                                        onChange={(e) => setKey(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                                        required
                                        pattern="^ui_[a-zA-Z]+$"
                                        title="Use dot notation like &quot;ui_Play&quot; (lowercase only)"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Lowercase with dot notation (e.g. &quot;ui_Play&quot;)</p>
                                </div>
                                
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsOpen(false);
                                            setError('');
                                        }}
                                        disabled={isSubmitting}
                                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:col-start-1 sm:text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:col-start-2 sm:text-sm transition-colors ${
                                            isSubmitting
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gray-800 hover:bg-gray-900 focus:ring-gray-500'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center">
                                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                              </svg>
                                              Adding...
                                            </span>
                                        ) : 'Add Key'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}