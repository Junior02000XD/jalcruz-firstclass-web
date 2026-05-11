import { useAuth } from "../../context/AuthContext";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
    Users, 
    MapPin, 
    FileSpreadsheet, 
    LogOut, 
    LayoutDashboard,
    Menu,
    Building
} from "lucide-react";

const AppLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Estilo para el link activo en el sidebar
    const linkStyle = (path) => `
        flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm
        ${location.pathname.includes(path) 
            ? "bg-blue-50 text-blue-700" 
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
    `;

    return (
        <div className="flex h-screen bg-[#FAFAFA]"> {/* Fondo muy sutil estilo NocoDB */}
            
            {/* SIDEBAR LATERAL */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
                <div className="h-14 flex items-center px-6 border-b border-gray-200">
                    <span className="font-bold text-lg tracking-tight text-gray-800">
                        Jalcruz<span className="text-blue-600">.</span>
                    </span>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">
                        General
                    </p>
                    <Link to="/dashboard" className={linkStyle("/dashboard")}>
                        <LayoutDashboard size={18} /> Panel Central
                    </Link>

                    <Link to="/admin/users" className={linkStyle("/admin/users")}>
                        <Users size={18} /> Gestión de Usuarios
                    </Link>

                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">
                        Recursos Humanos
                    </p>
                    <Link to="/jalcruz/trabajadores" className={linkStyle("/jalcruz/trabajadores")}>
                        <Users size={18} /> Trabajadores
                    </Link>
                    <Link to="/jalcruz/empresas" className={linkStyle("/jalcruz/empresas")}>
                        <Building size={18} /> Empresas Clientes
                    </Link>
                    <Link to="/jalcruz/areas" className={linkStyle("/jalcruz/areas")}>
                        <MapPin size={18} /> Áreas de Trabajo
                    </Link>
                    <Link to="/jalcruz/planillas" className={linkStyle("/jalcruz/planillas")}>
                        <FileSpreadsheet size={18} /> Planillas
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 px-4 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.roles?.[0]}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={18} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* ÁREA PRINCIPAL */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* HEADER SUPERIOR (Mobile Menu + Breadcrumbs) */}
                <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between md:justify-end">
                    <button className="md:hidden text-gray-500 hover:text-gray-700">
                        <Menu size={20} />
                    </button>
                    {/* Aquí podríamos poner un buscador global estilo Twenty */}
                </header>

                {/* CONTENIDO DINÁMICO */}
                <div className="flex-1 overflow-auto p-6 md:p-8">
                    {/* El componente <Outlet /> es donde React Router inyectará la página actual (WorkersPage, etc.) */}
                    <div className="max-w-7xl mx-auto">
                        <Outlet /> 
                    </div>
                </div>
            </main>

        </div>
    );
};

export default AppLayout;