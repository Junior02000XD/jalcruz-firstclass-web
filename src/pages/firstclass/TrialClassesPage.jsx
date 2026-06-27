import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import { TRIAL_STATUSES, statusMeta, shortDateTime } from '../../lib/crm';
import { Plus, CalendarClock, Edit2, Trash2, Check, X } from 'lucide-react';

const empty = { prospect_id: '', teacher_id: '', schedule: '', status: 'programada', attendance_bool: false };

const TrialClassesPage = () => {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [prospects, setProspects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);

    const load = useCallback(async () => {
        try {
            const [t, te, p] = await Promise.all([
                api.get('/trial-classes'), api.get('/teachers'), api.get('/prospects'),
            ]);
            setClasses(t.data);
            setTeachers(te.data);
            setProspects(p.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    useEffect(() => { load(); }, [load]);

    const open = (c = null) => {
        setEditing(c);
        setForm(c ? {
            prospect_id: c.prospect_id, teacher_id: c.teacher_id || '',
            schedule: c.schedule ? c.schedule.slice(0, 16) : '',
            status: c.status, attendance_bool: c.attendance_bool,
        } : empty);
        setIsOpen(true);
    };

    const save = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                prospect_id: Number(form.prospect_id),
                teacher_id: form.teacher_id || null,
                schedule: form.schedule,
                status: form.status,
                attendance_bool: form.attendance_bool,
            };
            if (editing) await api.put(`/trial-classes/${editing.id}`, payload);
            else await api.post('/trial-classes', payload);
            setIsOpen(false);
            load();
        } catch { alert('No se pudo guardar la clase.'); }
    };

    const remove = async (id) => {
        if (!window.confirm('¿Eliminar clase de prueba?')) return;
        try { await api.delete(`/trial-classes/${id}`); load(); } catch { alert('Error al eliminar.'); }
    };

    const prospectName = (c) => c.prospect?.person ? `${c.prospect.person.first_name} ${c.prospect.person.last_name || ''}`.trim() : `Prospecto #${c.prospect_id}`;

    if (loading) return <div className="text-sm text-gray-500 dark:text-gray-400 mt-10 text-center">Cargando...</div>;

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Clases de Prueba</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Agenda y seguimiento de las clases demostrativas.</p>
                </div>
                <button onClick={() => open()} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-all">
                    <Plus size={18} /> <span className="hidden sm:inline">Agendar</span>
                </button>
            </div>

            {classes.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-16 text-center text-gray-400 dark:text-gray-500 text-sm">
                    <CalendarClock className="mx-auto text-gray-300 mb-2" size={32} />
                    Aún no hay clases agendadas.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {classes.map((c) => {
                        const meta = statusMeta(TRIAL_STATUSES, c.status);
                        return (
                            <div key={c.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="p-2.5 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-lg shrink-0 hidden sm:block"><CalendarClock size={20} /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-gray-100">{prospectName(c)}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {shortDateTime(c.schedule)} · Prof: {c.teacher?.name || '—'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${meta.color}`}>{meta.label}</span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${c.attendance_bool ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                        {c.attendance_bool ? <Check size={12} /> : <X size={12} />} Asistió
                                    </span>
                                    <button onClick={() => open(c)} className="p-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/30 rounded-lg"><Edit2 size={15} /></button>
                                    <button onClick={() => remove(c.id)} className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/30 rounded-lg"><Trash2 size={15} /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Editar clase' : 'Agendar clase de prueba'}>
                <form onSubmit={save} className="space-y-4">
                    <Field label="Prospecto *">
                        <select required value={form.prospect_id} onChange={(e) => setForm({ ...form, prospect_id: e.target.value })} className={cls}>
                            <option value="">— Selecciona —</option>
                            {prospects.map((p) => <option key={p.id} value={p.id}>{p.person?.first_name} {p.person?.last_name}</option>)}
                        </select>
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Profesor">
                            <select value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })} className={cls}>
                                <option value="">— Sin asignar —</option>
                                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Estado">
                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={cls}>
                                {TRIAL_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </Field>
                    </div>
                    <Field label="Fecha y hora *">
                        <input required type="datetime-local" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className={cls} />
                    </Field>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <input type="checkbox" checked={form.attendance_bool} onChange={(e) => setForm({ ...form, attendance_bool: e.target.checked })} className="w-4 h-4 accent-yellow-500" />
                        El prospecto asistió
                    </label>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl">Cancelar</button>
                        <button type="submit" className="px-6 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow active:scale-95 transition-all">{editing ? 'Actualizar' : 'Agendar'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const cls = 'w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20';
const Field = ({ label, children }) => (
    <div><label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{label}</label>{children}</div>
);

export default TrialClassesPage;
