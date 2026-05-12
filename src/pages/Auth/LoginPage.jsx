import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext'; // Importamos el Hook
import { Link } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    // Traemos la función login de nuestro contexto global
    const { login } = useAuth(); 

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await api.post('/login', { email, password });
            
            // Usamos la función del contexto. ¡Esto actualiza toda la app al instante!
            login(response.data.user, response.data.access_token);
            
            navigate('/dashboard');
        } catch (err) {
            // Un pequeño manejo de errores más específico
            if (err.response?.status === 401) {
                setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
            } else {
                setError('No se pudo conectar con el servidor.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Iniciar Sesión</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="ejemplo@correo.com"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition duration-200 font-semibold"
                    >
                        Ingresar al Sistema
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        ¿No tienes una cuenta?{' '}
                        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                            Solicitar acceso
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;