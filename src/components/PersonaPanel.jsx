import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Modal from './ui/Modal';
import { Field, inputCls, Help, Empty } from './ui/Form';
import { Plus, Edit2, Trash2, Power, Bot, Phone, UserCheck } from 'lucide-react';

// La voz del agente para un número de WhatsApp.
//
// Existía en la API desde la Fase B y no tenía ninguna pantalla: sin esto la
// única forma de configurar el agente era por curl, incluido el interruptor de
// pausa — que es justo lo que conviene tener a mano el día que algo salga mal.
//
// El agente lee esto en cada mensaje (GET /api/agent-context/{phone_number_id}).
// Si no hay una Persona ACTIVA para ese número, ese endpoint responde 404 y n8n
// lo interpreta como "número pausado": el bot no contesta y nadie tiene que
// tocar n8n.

const vacia = { user_id: '', phone_number_id: '', style_guide: '', active: true };

const PersonaPanel = ({ users }) => {
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, editing: null });
    const [form, setForm] = useState(vacia);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            const { data } = await api.get('/personas');
            setPersonas(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial al montar
    useEffect(() => { load(); }, [load]);

    const abrir = (p) => {
        setForm(p
            ? { user_id: p.user_id, phone_number_id: p.phone_number_id, style_guide: p.style_guide, active: p.active }
            : vacia);
        setModal({ open: true, editing: p || null });
    };

    const guardar = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, user_id: Number(form.user_id) };
            if (modal.editing) await api.put(`/personas/${modal.editing.id}`, payload);
            else await api.post('/personas', payload);
            setModal({ open: false, editing: null });
            load();
        } catch (err) {
            // 409 = ya hay otra activa para ese mismo número. El mensaje de la API
            // lo explica mejor que cualquier texto genérico.
            alert(err.response?.data?.message || 'No se pudo guardar.');
        } finally { setSaving(false); }
    };

    const alternar = async (p) => {
        const encender = !p.active;
        if (!encender && !window.confirm(
            `¿Pausar el agente en este número?\n\nDeja de contestar solo. Los mensajes siguen llegando y quedando registrados en el CRM, pero nadie recibe respuesta automática hasta que lo vuelvas a encender.`
        )) return;
        try {
            // El endpoint recibe un booleano pelado, no un objeto.
            await api.patch(`/personas/${p.id}/active`, encender, { headers: { 'Content-Type': 'application/json' } });
            load();
        } catch (err) { alert(err.response?.data?.message || 'No se pudo cambiar.'); }
    };

    const borrar = async (p) => {
        if (!window.confirm('¿Eliminar esta voz? Se pierde la guía de estilo escrita.')) return;
        try { await api.delete(`/personas/${p.id}`); load(); }
        catch { alert('No se pudo eliminar.'); }
    };

    if (loading) return <div className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">Cargando...</div>;

    return (
        <>
            <Help>
                Cómo escribe la IA en cada número de WhatsApp: el tono, el trato y qué nunca decir.
                El interruptor <b>Atendiendo / Pausada</b> es el freno de mano: al pausarla, el bot deja
                de contestar en ese número, pero los mensajes se siguen registrando en el CRM.
            </Help>

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => abrir(null)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                    <Plus size={16} /> Nueva voz
                </button>
            </div>

            {personas.length === 0 ? (
                <Empty>
                    Todavía no hay ninguna voz configurada. Mientras no haya una activa,
                    <b> la IA no contesta en ningún número</b>.
                </Empty>
            ) : (
                <div className="flex flex-col gap-3">
                    {personas.map((p) => (
                        <div
                            key={p.id}
                            className={`bg-white dark:bg-gray-800 border rounded-xl p-4 shadow-sm ${
                                p.active
                                    ? 'border-emerald-200 dark:border-emerald-500/30'
                                    : 'border-gray-200 dark:border-gray-700 opacity-75'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                            p.active
                                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                        }`}>
                                            <Bot size={11} /> {p.active ? 'Atendiendo' : 'Pausada'}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <UserCheck size={12} /> habla como {p.user?.name || `usuario ${p.user_id}`}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs font-mono text-gray-400 dark:text-gray-500">
                                            <Phone size={12} /> {p.phone_number_id}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line line-clamp-4">
                                        {p.style_guide}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        onClick={() => alternar(p)}
                                        title={p.active ? 'Pausar el agente en este número' : 'Volver a atender'}
                                        className={`p-2 rounded-lg border transition-colors ${
                                            p.active
                                                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                                                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Power size={15} />
                                    </button>
                                    <button onClick={() => abrir(p)} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <Edit2 size={15} />
                                    </button>
                                    <button onClick={() => borrar(p)} className="p-2 rounded-lg border border-red-100 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? 'Editar la voz' : 'Nueva voz'}>
                <form onSubmit={guardar} className="space-y-4">
                    <Field
                        label="Habla como *"
                        hint="A quién representa. Es también a quien se le pasa la conversación cuando la IA deriva."
                    >
                        <select required value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className={inputCls}>
                            <option value="">Elegí una persona...</option>
                            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </Field>

                    <Field
                        label="ID del número de WhatsApp *"
                        hint="El Phone Number ID de Meta, no el número. Está en WhatsApp → API Setup."
                    >
                        <input
                            required
                            value={form.phone_number_id}
                            onChange={(e) => setForm({ ...form, phone_number_id: e.target.value })}
                            className={inputCls}
                            inputMode="numeric"
                            placeholder="823617917491618"
                        />
                    </Field>

                    <Field
                        label="Guía de estilo *"
                        hint="Cómo escribe: el trato, el largo de los mensajes, qué nunca decir. La IA la sigue tal cual."
                    >
                        <textarea
                            required
                            rows={14}
                            value={form.style_guide}
                            onChange={(e) => setForm({ ...form, style_guide: e.target.value })}
                            className={`${inputCls} font-mono text-xs leading-relaxed`}
                        />
                    </Field>

                    <label className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-xl cursor-pointer">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Atendiendo
                            <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                                Si la apagás, la IA no contesta en ese número.
                            </span>
                        </span>
                        <input
                            type="checkbox"
                            checked={form.active}
                            onChange={(e) => setForm({ ...form, active: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                        />
                    </label>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button type="button" onClick={() => setModal({ open: false, editing: null })} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl">Cancelar</button>
                        <button type="submit" disabled={saving} className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow">
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default PersonaPanel;
