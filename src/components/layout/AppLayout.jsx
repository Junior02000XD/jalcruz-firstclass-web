import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    Users,
    MapPin,
    FileSpreadsheet,
    LogOut,
    LayoutDashboard,
    Menu,
    X,
    Building,
    GraduationCap,
    UserPlus,
    Megaphone,
    CalendarClock,
    ShoppingCart,
    Package,
    BookUser,
    Sun,
    Moon,
} from "lucide-react";

const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            title={isDark ? "Modo claro" : "Modo oscuro"}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
};

const linkStyle = (active) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm ${
        active ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900"
    }`;

const SectionLabel = ({ children }) => (
    <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 mt-6">{children}</p>
);

const NavLink = ({ to, icon: Icon, children, onClick }) => {
    const location = useLocation();
    const active = location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to));
    return (
        <Link to={to} className={linkStyle(active)} onClick={onClick}>
            <Icon size={18} /> {children}
        </Link>
    );
};

const Sidebar = ({ user, hasRole, onNavigate, onClose, onLogout }) => (
    <>
        <div className="h-14 flex items-center px-6 border-b border-gray-200 dark:border-gray-700 justify-between">
            <span className="font-bold text-lg tracking-tight text-gray-800 dark:text-gray-100">
                Jalcruz<span className="text-blue-600 dark:text-blue-400">.</span>
            </span>
            <button className="md:hidden text-gray-400 dark:text-gray-500 hover:text-gray-700" onClick={onClose}>
                <X size={20} />
            </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <SectionLabel>General</SectionLabel>
            <NavLink to="/dashboard" icon={LayoutDashboard} onClick={onNavigate}>Panel Central</NavLink>
            {hasRole("Super Admin") && (
                <NavLink to="/admin/users" icon={Users} onClick={onNavigate}>Gestión de Usuarios</NavLink>
            )}

            {hasRole("HR Admin") && (
                <>
                    <SectionLabel>Recursos Humanos</SectionLabel>
                    <NavLink to="/jalcruz/trabajadores" icon={Users} onClick={onNavigate}>Trabajadores</NavLink>
                    <NavLink to="/jalcruz/empresas" icon={Building} onClick={onNavigate}>Empresas Clientes</NavLink>
                    <NavLink to="/jalcruz/areas" icon={MapPin} onClick={onNavigate}>Áreas de Trabajo</NavLink>
                    <NavLink to="/jalcruz/planillas" icon={FileSpreadsheet} onClick={onNavigate}>Planillas</NavLink>
                </>
            )}

            {hasRole("CRM Admin") && (
                <>
                    <SectionLabel>First Class · CRM</SectionLabel>
                    <NavLink to="/firstclass" icon={GraduationCap} onClick={onNavigate}>Resumen CRM</NavLink>
                    <NavLink to="/firstclass/prospectos" icon={UserPlus} onClick={onNavigate}>Prospectos</NavLink>
                    <NavLink to="/firstclass/clases" icon={CalendarClock} onClick={onNavigate}>Clases de Prueba</NavLink>
                    <NavLink to="/firstclass/ventas" icon={ShoppingCart} onClick={onNavigate}>Ventas</NavLink>
                    <NavLink to="/firstclass/campanas" icon={Megaphone} onClick={onNavigate}>Campañas</NavLink>
                    <NavLink to="/firstclass/profesores" icon={BookUser} onClick={onNavigate}>Profesores</NavLink>
                    <NavLink to="/firstclass/productos" icon={Package} onClick={onNavigate}>Productos</NavLink>
                </>
            )}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.roles?.[0]}</p>
                </div>
            </div>
            <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors"
            >
                <LogOut size={18} /> Cerrar Sesión
            </button>
        </div>
    </>
);

const AppLayout = () => {
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const sidebarProps = {
        user,
        hasRole,
        onNavigate: () => setMobileOpen(false),
        onClose: () => setMobileOpen(false),
        onLogout: handleLogout,
    };

    return (
        <div className="flex h-screen bg-[#FAFAFA] dark:bg-gray-900">
            {/* SIDEBAR DESKTOP */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col hidden md:flex">
                <Sidebar {...sidebarProps} />
            </aside>

            {/* SIDEBAR MÓVIL (drawer) */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-72 max-w-[80%] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-xl animate-in slide-in-from-left duration-200">
                        <Sidebar {...sidebarProps} />
                    </aside>
                </div>
            )}

            {/* ÁREA PRINCIPAL */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-3">
                    <button className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900" onClick={() => setMobileOpen(true)}>
                        <Menu size={22} />
                    </button>
                    <span className="md:hidden font-bold text-gray-800 dark:text-gray-100">Jalcruz<span className="text-blue-600 dark:text-blue-400">.</span></span>
                    <div className="ml-auto">
                        <ThemeToggle />
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
