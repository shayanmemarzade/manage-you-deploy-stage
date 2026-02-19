import api from '../axios';

export const apiService = {
    get: async (endpoint: string, params = {}) => {
        const response = await api.get(endpoint, { params });
        return response.data;
    },

    post: async (endpoint: string, data = {}) => {
        const response = await api.post(endpoint, data);
        return response.data;
    },

    put: async (endpoint: string, data = {}) => {
        const response = await api.put(endpoint, data);
        return response.data;
    },

    delete: async (endpoint: string) => {
        const response = await api.delete(endpoint);
        return response.data;
    },

    postMultipart: async (url: string, data: FormData) => {
        const response = await api.post(url, data, { // Awaits the promise here
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};