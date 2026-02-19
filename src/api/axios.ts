import axios from 'axios';
import { store } from '@/store';
import { logout } from '@/store/reducer/auth';

// Create axios instance
const api = axios.create({
    // baseURL: config.API_URL,
    baseURL: '/api/v3',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Platform': 'web'
    },
    withCredentials: false
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage or wherever you store it
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // get account id from localStorage and add it to the headers
        const accountId = localStorage.getItem('accountId');

        if (token) {
            config.headers["Account"] = accountId;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
// api.interceptors.response.use(
//     (response: AxiosResponse) => response,
//     (error: AxiosError) => {
//         if (error.response?.status === 401) {
//             localStorage.removeItem('token');
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Clear auth state
            store.dispatch(logout());
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;