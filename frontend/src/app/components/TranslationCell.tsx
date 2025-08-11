'use client';

import React, { useState, useEffect } from 'react';

interface TranslationCellProps {
    value: string;
    onSave: (value: string) => Promise<void>;
    isSaving: boolean;
}

export function TranslationCell({value, onSave, isSaving}: TranslationCellProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const displayValue = value === '' ? '-' : value;

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleFocus = () => {
        setIsEditing(true);
        setInputValue('');
    };

    const handleSave = async () => {
        if (inputValue.trim() === '') {
            setIsEditing(false);
            setInputValue('');
            return;
        }

        setIsProcessing(true);
        try {
            await onSave(inputValue);
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving translation:', error);
            setInputValue(value);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setInputValue(value);
            setIsEditing(false);
        } else if (e.key === 'Enter') {
            await handleSave();
        }
    };

    return isEditing ? (
        <div className="relative">
            <input
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="block w-full rounded-md border-gray-200 shadow-sm sm:text-sm py-1.5 px-2.5 border"
                disabled={isProcessing || isSaving}
                placeholder="Enter translation..."
            />
            {(isProcessing || isSaving) && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-md">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-300"></div>
                </div>
            )}
        </div>
    ) : (
        <div
            onClick={handleFocus}
            className={`py-1.5 px-2.5 rounded-md cursor-text min-h-[36px] flex items-center ${
                isSaving ? 'bg-gray-100 text-gray-2' : 'hover:bg-gray-100'
            } ${displayValue === '-' ? 'text-gray-200' : ''}`}
        >
            {displayValue}
        </div>
    );
}