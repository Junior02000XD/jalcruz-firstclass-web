import axios from 'axios';

const api = axios.create({
    // Usa la variable de entorno, y si no existe (por si acaso), usa localhost
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost/api',
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