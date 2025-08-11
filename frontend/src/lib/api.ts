import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NODE_ENV === 'production'
        ? '/api'
        : 'http://gamelocalization_api:8080/api',
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });
        return Promise.reject(error);
    }
);

export interface Language {
    id: number;
    code: string;
    name: string;
}

export interface Translation {
    id: number;
    value: string;
    languageId: number;
    translationKeyId: number;
}

export interface TranslationKey {
    id: number;
    key: string;
    translations?: Translation[];
}

export interface TableDataResponse {
    keys: TranslationKey[];
    languages: Language[];
    totalCount: number;
}

export interface AddKeyRequest {
    key: string;
}

export interface AddLanguageRequest {
    code: string;
    name: string;
}

export interface UpdateTranslationRequest {
    value: string;
}

const api = {
    getUserSelectedLanguages: async (): Promise<Language[]> => {
        const response = await apiClient.get<Language[]>('/languages');
        return response.data;
    },

    getAvailableLanguages: async (): Promise<Language[]> => {
        const response = await apiClient.get<Language[]>('/languages/available');
        return response.data;
    },

    addUserLanguage: async (languageCode: string, languageName: string): Promise<void> => {
        await apiClient.post('/languages', {
            code: languageCode,
            name: languageName
        });
    },
    
    getTableData: async (page: number, pageSize: number): Promise<TableDataResponse> => {
        try {
            const response = await apiClient.get('/translations/table', {
                params: { page, pageSize },
            });
            return response.data;
        } catch (error) {
            console.error('Detailed table data error:', error);
            throw new Error('Failed to fetch table data');
        }
    },

    updateTranslation: async (keyId: number, languageId: number, value: string): Promise<void> => {
        console.log('Sending update:', { keyId, languageId, value });
        try {
            const response = await apiClient.put(`/translations/${keyId}/${languageId}`, { value });
            console.log('Update successful:', response.data);
        } catch (error) {
            console.error('Update failed:', error);
            throw error;
        }
    },
    
    addKey: async (data: AddKeyRequest): Promise<TranslationKey> => {
        const response = await apiClient.post<TranslationKey>('/translations/keys', data);
        return response.data;
    },

    deleteKey: async (keyId: number): Promise<void> => {
        await apiClient.delete(`/translations/keys/${keyId}`);
    },

    deleteLanguage: async (languageId: number): Promise<void> => {
        await apiClient.delete(`languages/${languageId}`);
    },
};

export default api;