import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Shield, Trash2, UserCog } from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    
    // Roles disponibles en el sistema
    const availableRoles = ['Super Admin', 'HR Admin', 'CRM Admin'];
    const [selectedRoles, setSelectedRoles] = useState([]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUsers = () => {
            api.get('/users')
                .then(response => setUsers(response.data))
                .catch(error => console.error("Error al cargar usuarios:", error))
                .finally(() => setLoading(false));
        };
        fetchUsers();
    }, []);

    const handleOpenRoleModal = (user) => {
        setSelectedUser(user);
        // Extraer los nombres de los roles que ya tiene el usuario
        const userRoleNames = user.roles.map(r => r.name);
        setSelectedRoles(userRoleNames);
        setIsRoleModalOpen(true);
    };

    const handleToggleRole = (roleName) => {
        setSelectedRoles(prev => 
            prev.includes(roleName) 
                ? prev.filter(r => r !== roleName) 
                : [...prev, roleName]
        );
    };

    const handleSaveRoles = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/users/${selectedUser.id}/roles`, { roles: selectedRoles });
            fetchUsers();
            setIsRoleModalOpen(false);
            setSelectedUser(null);
        } catch (error) {
            alert("Error al actualizar roles.");
            console.error(error);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario? Perderá acceso al sistema.')) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
            } catch {
                alert("Error al eliminar usuario.");
            }
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-sm text-gray-500 mt-10 text-center">Cargando usuarios...</div>;

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Control de Usuarios</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Gestión de accesos y permisos del sistema.</p>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o correo..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="bg-gray-50/80 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-1/3">Usuario</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-1/3">Roles Activos</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {user.roles.length === 0 && <span className="text-xs text-gray-400 italic">Sin acceso</span>}
                                        {user.roles.map(role => (
                                            <span key={role.id} className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase
                                                ${role.name === 'Super Admin' ? 'bg-purple-100 text-purple-700' : 
                                                  role.name === 'HR Admin' ? 'bg-blue-100 text-blue-700' : 
                                                  'bg-orange-100 text-orange-700'}`}>
                                                {role.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleOpenRoleModal(user)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 mr-2 transition-all"
                                    >
                                        <Shield size={14} /> Permisos
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Roles */}
            {isRoleModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><UserCog size={20} /></div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Asignar Roles</h3>
                                <p className="text-xs text-gray-500">{selectedUser?.email}</p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSaveRoles} className="space-y-3">
                            {availableRoles.map(role => (
                                <label key={role} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                    <span className="text-sm font-semibold text-gray-700">{role}</span>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedRoles.includes(role)}
                                        onChange={() => handleToggleRole(role)}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                </label>
                            ))}
                            
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl">Cancelar</button>
                                <button type="submit" className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;