import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setStatus({ type: 'info', message: 'Procesando...' });

        if (password !== passwordConfirmation) {
            setStatus({ type: 'error', message: 'Las contraseñas no coinciden.' });
            return;
        }

        try {
            // Petición inicial para CSRF
            await api.get('/sanctum/csrf-cookie');
            
            await api.post('/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation
            });

            setStatus({ 
                type: 'success', 
                message: 'Registro exitoso. Serás redirigido al login.' 
            });

            setTimeout(() => navigate('/login'), 2500);

        } catch (err) {
            const errorMsg = err.response?.data?.email 
                ? 'El correo ya está registrado.' 
                : 'Error al registrar la cuenta. Verifica los datos.';
            setStatus({ type: 'error', message: errorMsg });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Crear Cuenta</h2>
                
                {status.message && (
                    <div className={`px-4 py-3 rounded mb-4 text-sm border ${
                        status.type === 'error' ? 'bg-red-100 border-red-400 text-red-700' :
                        status.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' :
                        'bg-blue-100 border-blue-400 text-blue-700'
                    }`}>
                        {status.message}
                    </div>
                )}
                
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: Julio Cruz" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="tu-correo@gmail.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                        <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••" />
                    </div>
                    
                    <button type="submit" disabled={status.type === 'info'} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition duration-200 font-semibold disabled:opacity-50">
                        Registrarse
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                            Iniciar Sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;