import axios from 'axios';

const api = axios.create({
    // Sin fallback a propósito: si falta VITE_API_URL el build ya falló
    // (ver vite.config.js), así que acá siempre llega definida. En desarrollo
    // la trae .env.development.
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Este interceptor añade el token automáticamente a cada petición
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;