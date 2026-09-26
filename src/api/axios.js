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

// Token vencido (a las 12 h) o revocado: sin esto, cada pantalla recibía 401,
// mostraba su estado vacío y la sesión seguía "abierta". Se limpia y se vuelve
// al login. El propio /login se excluye: ahí un 401 es "credenciales
// incorrectas" y lo muestra el formulario.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        if (error.response?.status === 401 && !url.endsWith('/login') && localStorage.getItem('token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') window.location.assign('/login');
        }
        return Promise.reject(error);
    },
);

export default api;