import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import { Plus, BookUser, Edit2, Trash2 } from 'lucide-react';

const TeachersPage = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', specialty: '' });

    const load = useCallback(async () => {
        try { setTeachers((await api.get('/teachers')).data); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    useEffect(() => { load(); }, [load]);

    const open = (t = null) => {
        setEditing(t);
        setForm({ name: t?.name || '', specialty: t?.specialty || '' });
        setIsOpen(true);
    };

    const save = async (e) => {
        e.preventDefault();
        try {
            const payload = { name: form.name, specialty: form.specialty || null };
            if (editing) await api.put(`/teachers/${editing.id}`, payload);
            else await api.post('/teachers', payload);
            setIsOpen(false);
            load();
        } catch { alert('No se pudo guardar el profesor.'); }
    };

    const remove = async (id) => {
        if (!window.confirm('¿Eliminar profesor?')) return;
        try { await api.delete(`/teachers/${id}`); load(); } catch { alert('Error al eliminar.'); }
    };

    if (loading) return <div className="text-sm text-gray-500 dark:text-gray-400 mt-10 text-center">Cargando...</div>;

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Profesores</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Quienes imparten las clases de prueba.</p>
                </div>
                <button onClick={() => open()} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-all">
                    <Plus size={18} /> <span className="hidden sm:inline">Nuevo</span>
                </button>
            </div>

            {teachers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-16 text-center text-gray-400 dark:text-gray-500 text-sm">Aún no hay profesores.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teachers.map((t) => (
                        <div key={t.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm flex items-center gap-3">
                            <div className="p-2.5 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-lg"><BookUser size={20} /></div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{t.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{t.specialty || 'Sin especialidad'}</p>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => open(t)} className="p-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/30 rounded-lg"><Edit2 size={15} /></button>
                                <button onClick={() => remove(t.id)} className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/30 rounded-lg"><Trash2 size={15} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Editar profesor' : 'Nuevo profesor'}>
                <form onSubmit={save} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Nombre *</label>
                        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Especialidad</label>
                        <input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20" placeholder="Inglés, música..." />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl">Cancelar</button>
                        <button type="submit" className="px-6 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow active:scale-95 transition-all">{editing ? 'Actualizar' : 'Guardar'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TeachersPage;
