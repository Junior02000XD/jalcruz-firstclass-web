import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Shield, Trash2, UserCog, Bot, KeyRound, Copy, Check, Undo2 } from 'lucide-react';

// GET /api/users devuelve los roles como un arreglo de STRINGS
// (`"roles": ["Super Admin"]`, ver UserDto en la API .NET), no como los objetos
// {id, name} que armaba Spatie en el Laravel viejo. Esta pantalla era el último
// resto de ese formato: leía `role.name` sobre un string, así que los chips
// salían vacíos y el modal mandaba `[null]` al guardar —de ahí el 400
// "Roles desconocidos:" en cada intento—. Tratar `roles` como strings sueltos.
const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    // Cuentas de servicio (los bots, hoy el agente de WhatsApp de n8n).
    const [tokenEmitido, setTokenEmitido] = useState(null);   // { user, access_token, expires_at }
    const [copiado, setCopiado] = useState(false);
    const [revertirUser, setRevertirUser] = useState(null);
    const [nuevaClave, setNuevaClave] = useState('');

    // Roles disponibles en el sistema
    const availableRoles = ['Super Admin', 'HR Admin', 'CRM Admin'];
    const [selectedRoles, setSelectedRoles] = useState([]);

    // Encadenada con promesas y no `async/await` a propósito: así los setState
    // quedan dentro de callbacks y el effect puede llamarla sin disparar
    // react-hooks/set-state-in-effect.
    const fetchUsers = () =>
        api.get('/users')
            .then(response => setUsers(response.data))
            .catch(error => console.error("Error al cargar usuarios:", error))
            .finally(() => setLoading(false));

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenRoleModal = (user) => {
        setSelectedUser(user);
        setSelectedRoles([...user.roles]);
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
            // La API manda el motivo en {message} (mismo criterio que RegisterPage).
            alert(error.response?.data?.message || "Error al actualizar roles.");
            console.error(error);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario? Perderá acceso al sistema.')) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
            } catch (error) {
                alert(error.response?.data?.message || "Error al eliminar usuario.");
            }
        }
    };

    // ── Cuentas de servicio ──────────────────────────────────────────────
    // Un bot no es una persona: no inicia sesión, se autentica con un token de
    // larga duración. Convertir una cuenta existente evita tener que borrarla y
    // rehacerla, que se llevaría puestos los prospectos que tenga asignados.

    const handleConvertir = async (user) => {
        const ok = window.confirm(
            `¿Convertir a "${user.name}" en cuenta de servicio?\n\n` +
            `• Deja de poder iniciar sesión en el panel.\n` +
            `• Su contraseña actual se destruye: si la tenías anotada, deja de servir.\n` +
            `• Pasa a autenticarse sólo con un token que emitís desde acá.\n\n` +
            `Es reversible, pero para volver atrás hay que fijarle una contraseña nueva.`
        );
        if (!ok) return;
        try {
            const { data } = await api.post(`/users/${user.id}/service-account`);
            await fetchUsers();
            alert(data.message);
        } catch (error) {
            alert(error.response?.data?.message || 'Error al convertir la cuenta.');
        }
    };

    const handleEmitirToken = async (user) => {
        const ok = window.confirm(
            `¿Emitir un token para "${user.name}"?\n\n` +
            `Se muestra UNA sola vez y no se puede volver a consultar.\n` +
            `Los tokens anteriores de esta cuenta siguen siendo válidos: ` +
            `emitir uno nuevo no invalida al viejo.`
        );
        if (!ok) return;
        try {
            const { data } = await api.post('/service-token', { id: user.id });
            setCopiado(false);
            setTokenEmitido({ user, ...data });
        } catch (error) {
            alert(error.response?.data?.message || 'Error al emitir el token.');
        }
    };

    const handleRevertir = async (e) => {
        e.preventDefault();
        try {
            // axios manda el cuerpo del DELETE en `data`, no como segundo argumento.
            const { data } = await api.delete(`/users/${revertirUser.id}/service-account`, {
                data: { new_password: nuevaClave },
            });
            await fetchUsers();
            setRevertirUser(null);
            setNuevaClave('');
            alert(data.message);
        } catch (error) {
            alert(error.response?.data?.message || 'Error al revertir la cuenta.');
        }
    };

    const copiarToken = async () => {
        try {
            await navigator.clipboard.writeText(tokenEmitido.access_token);
            setCopiado(true);
        } catch {
            // clipboard falla sin HTTPS o sin permiso; el token está a la vista igual.
            alert('No se pudo copiar solo. Seleccionalo del cuadro y copialo a mano.');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-sm text-gray-500 dark:text-gray-400 mt-10 text-center">Cargando usuarios...</div>;

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Control de Usuarios</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestión de accesos y permisos del sistema.</p>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o correo..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden flex-1">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-1/3">Usuario</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-1/3">Roles Activos</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        {user.name}
                                        {user.is_service_account && (
                                            <span
                                                title="Cuenta de servicio: no inicia sesión, se autentica con un token"
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                            >
                                                <Bot size={11} /> Bot
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {user.roles.length === 0 && <span className="text-xs text-gray-400 dark:text-gray-500 italic">Sin acceso</span>}
                                        {user.roles.map(role => (
                                            <span key={role} className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase
                                                ${role === 'Super Admin' ? 'bg-purple-100 text-purple-700' :
                                                  role === 'HR Admin' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' :
                                                  'bg-orange-100 text-orange-700'}`}>
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {user.is_service_account ? (
                                        <>
                                            <button
                                                onClick={() => handleEmitirToken(user)}
                                                title="Emitir un token de larga duración para este bot"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 mr-2 transition-all"
                                            >
                                                <KeyRound size={14} /> Token
                                            </button>
                                            <button
                                                onClick={() => { setRevertirUser(user); setNuevaClave(''); }}
                                                title="Volver a convertirla en cuenta de persona"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 mr-2 transition-all"
                                            >
                                                <Undo2 size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleConvertir(user)}
                                            title="Convertir en cuenta de servicio (bot): deja de iniciar sesión y usa token"
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 mr-2 transition-all"
                                        >
                                            <Bot size={14} /> Hacer bot
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleOpenRoleModal(user)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 mr-2 transition-all"
                                    >
                                        <Shield size={14} /> Permisos
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 border border-red-100 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/30 transition-all"
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
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg"><UserCog size={20} /></div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Asignar Roles</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedUser?.email}</p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSaveRoles} className="space-y-3">
                            {availableRoles.map(role => (
                                <label key={role} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{role}</span>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedRoles.includes(role)}
                                        onChange={() => handleToggleRole(role)}
                                        className="w-4 h-4 text-blue-600 dark:text-blue-400 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                                    />
                                </label>
                            ))}
                            
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl">Cancelar</button>
                                <button type="submit" className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Token recién emitido — se muestra UNA vez */}
            {tokenEmitido && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg"><KeyRound size={20} /></div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Token de servicio</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {tokenEmitido.user.email} · vence el {new Date(tokenEmitido.expires_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                            <p className="text-xs text-amber-800 dark:text-amber-200 font-semibold">
                                Copialo ahora: al cerrar esta ventana no se puede volver a ver.
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                Quien lo tenga entra al CRM con los permisos de esta cuenta, sin contraseña.
                                Para anularlo hay que rotar la clave de firma de la API, y eso cierra la sesión de todos.
                            </p>
                        </div>

                        <textarea
                            readOnly
                            value={tokenEmitido.access_token}
                            onFocus={(e) => e.target.select()}
                            rows={4}
                            className="w-full font-mono text-[11px] leading-relaxed p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 break-all resize-none"
                        />

                        <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                            <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Dónde va, en n8n:</p>
                            <p>Credencial <span className="font-semibold">CRM First Class</span> (HTTP Header Auth)</p>
                            <p>Campo <span className="font-mono">Name</span>: <span className="font-mono">Authorization</span> — ya cargado</p>
                            <p>Campo <span className="font-mono">Value</span>: <span className="font-mono">Bearer </span>+ el token de arriba, con el espacio</p>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={copiarToken}
                                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border transition-all ${
                                    copiado
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                {copiado ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar</>}
                            </button>
                            <button
                                onClick={() => setTokenEmitido(null)}
                                className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                            >
                                Ya lo guardé
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Revertir una cuenta de servicio a cuenta de persona */}
            {revertirUser && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg"><Undo2 size={20} /></div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Volver a cuenta de persona</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{revertirUser.email}</p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                            Hay que fijarle una contraseña nueva: la anterior se destruyó al convertirla en bot.
                            Los tokens ya emitidos <span className="font-semibold">siguen valiendo</span>; para
                            cortarlos, quitale los roles.
                        </p>

                        <form onSubmit={handleRevertir} className="space-y-3">
                            <input
                                type="password"
                                required
                                minLength={8}
                                autoComplete="new-password"
                                value={nuevaClave}
                                onChange={(e) => setNuevaClave(e.target.value)}
                                placeholder="Contraseña nueva (mínimo 8)"
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button type="button" onClick={() => setRevertirUser(null)} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl">Cancelar</button>
                                <button type="submit" className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md">Revertir</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;