import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
    Building2, 
    GraduationCap, 
    ArrowRight, 
    Users, 
    FileSpreadsheet, 
    Megaphone, 
    UserPlus 
} from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();

    // Obtenemos solo el primer nombre para el saludo
    const firstName = user?.name?.split(' ')[0] || 'Usuario';

    return (
        <div className="flex flex-col gap-8 h-full max-w-5xl">
            {/* Cabecera del Dashboard */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                    Hola, {firstName} 👋
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Bienvenido al Sistema Central. Selecciona el espacio de trabajo al que deseas acceder.
                </p>
            </div>

            {/* Cuadrícula de Módulos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* ----------------- TARJETA JALCRUZ ----------------- */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Building2 size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Jalcruz</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Módulo de Recursos Humanos</p>
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 flex-1 leading-relaxed">
                        Gestiona el personal, define áreas de trabajo, registra la asistencia diaria y calcula las planillas de pago para los servicios de limpieza.
                    </p>

                    {/* Enlaces Rápidos */}
                    <div className="space-y-3 mb-8">
                        <Link to="/jalcruz/trabajadores" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
                            <Users size={16} className="text-gray-400 dark:text-gray-500" /> Base de Trabajadores
                        </Link>
                        <Link to="/jalcruz/planillas" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
                            <FileSpreadsheet size={16} className="text-gray-400 dark:text-gray-500" /> Gestión de Planillas
                        </Link>
                    </div>

                    <Link 
                        to="/jalcruz/trabajadores" 
                        className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300"
                    >
                        Abrir Espacio de Trabajo <ArrowRight size={16} />
                    </Link>
                </div>

                {/* ----------------- TARJETA FIRST CLASS ----------------- */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                        {/* Usamos el color dorado/amarillo característico de First Class */}
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-lg">
                            <GraduationCap size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">First Class</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Módulo de CRM y Ventas</p>
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 flex-1 leading-relaxed">
                        Administra prospectos, evalúa campañas de marketing, agenda clases de prueba y supervisa la conversión de estudiantes.
                    </p>

                    {/* Enlaces Rápidos */}
                    <div className="space-y-3 mb-8">
                        <Link to="/firstclass/prospectos" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 hover:text-yellow-600 transition-colors">
                            <UserPlus size={16} className="text-gray-400 dark:text-gray-500" /> Seguimiento de Prospectos
                        </Link>
                        <Link to="/firstclass/campanas" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 hover:text-yellow-600 transition-colors">
                            <Megaphone size={16} className="text-gray-400 dark:text-gray-500" /> Analizar Campañas
                        </Link>
                    </div>

                    <Link 
                        to="/firstclass/prospectos" 
                        className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg group-hover:bg-yellow-500 group-hover:text-white group-hover:border-yellow-500 transition-all duration-300"
                    >
                        Abrir Espacio de Trabajo <ArrowRight size={16} />
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;