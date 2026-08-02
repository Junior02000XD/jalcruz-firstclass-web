import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { shortDate, CONTEXT_TYPE_META, NEXT_ACTIONS } from '../../lib/crm';
import { Help, Empty } from '../../components/ui/Form';
import MediaGallery from '../../components/MediaGallery';
import ContextEntryModal from '../../components/ContextEntryModal';
import {
    Plus, MessageCircleQuestion, ShieldCheck, Tag, GitBranch, Images,
    Edit2, Trash2, Image as ImageIcon, Music, CalendarClock, MapPin, ArrowRight,
} from 'lucide-react';

// Lo que la IA sabe del instituto. Es la pantalla que usan los dueños, no
// técnicos: cada sección explica en una línea cómo escribir el contenido,
// porque la IA lo usa tal cual queda escrito.
const TABS = [
    { key: 'preguntas', label: 'Preguntas y reglas', icon: MessageCircleQuestion, types: ['pregunta_respuesta', 'regla'] },
    { key: 'multimedia', label: 'Multimedia', icon: Images, types: [] },
    { key: 'promociones', label: 'Promociones', icon: Tag, types: ['promocion'] },
    { key: 'flujos', label: 'Flujos del embudo', icon: GitBranch, types: ['flujo'] },
];

const HELP = {
    preguntas: (
        <>Las <b>preguntas frecuentes</b> son lo que la gente escribe y cómo hay que contestarle;
        las <b>reglas</b> son instrucciones para la IA. Escribí cada respuesta como se la mandarías
        al cliente por WhatsApp: la IA la usa tal cual.</>
    ),
    promociones: (
        <>Lo que la IA puede ofrecer. Poné hasta cuándo vale: <b>pasada esa fecha deja de ofrecerla sola</b>,
        sin que tengas que acordarte de apagarla. Si es de una zona, elegila igual — la IA se lo pregunta
        al cliente antes de ofrecérsela.</>
    ),
    flujos: (
        <>Los caminos de la conversación: en qué momento pedir el nombre, cuándo ofrecer la clase de prueba
        y cuándo pasarle la charla a una persona. Escribí el guion como le hablarías a alguien nuevo que
        entra a atender.</>
    ),
};

const ContentPage = () => {
    const [tab, setTab] = useState('preguntas');
    const [entries, setEntries] = useState([]);
    const [assets, setAssets] = useState([]);
    const [zones, setZones] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, type: 'pregunta_respuesta', editing: null });

    const load = useCallback(async () => {
        try {
            const [e, m, z, u] = await Promise.all([
                api.get('/context-entries'),
                api.get('/media'),
                api.get('/zones'),
                api.get('/users/assignable'),
            ]);
            setEntries(e.data);
            setAssets(m.data);
            setZones(z.data);
            setUsers(u.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    useEffect(() => { load(); }, [load]);

    const save = async (payload) => {
        try {
            if (modal.editing) await api.put(`/context-entries/${modal.editing.id}`, payload);
            else await api.post('/context-entries', payload);
            setModal({ ...modal, open: false, editing: null });
            load();
        } catch (err) {
            alert(err.response?.data?.message || 'No se pudo guardar.');
        }
    };

    const toggleActive = async (entry) => {
        try { await api.patch(`/context-entries/${entry.id}/active`, !entry.active, { headers: { 'Content-Type': 'application/json' } }); load(); }
        catch { alert('No se pudo cambiar el estado.'); }
    };

    const remove = async (entry) => {
        if (!window.confirm(`¿Eliminar "${entry.title}"?`)) return;
        try { await api.delete(`/context-entries/${entry.id}`); load(); }
        catch { alert('No se pudo eliminar.'); }
    };

    const current = TABS.find((t) => t.key === tab);
    const visible = entries.filter((e) => current.types.includes(e.type));

    if (loading) return <div className="text-sm text-gray-500 dark:text-gray-400 mt-10 text-center">Cargando...</div>;

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Contenido de la IA</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Lo que la IA sabe y puede mandar cuando contesta por WhatsApp.
                </p>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
                {TABS.map((t) => (
                    <button
                        key={t.key} onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                            tab === t.key
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        <t.icon size={16} /> {t.label}
                    </button>
                ))}
            </div>

            {tab === 'multimedia' ? (
                <MediaGallery assets={assets} onChanged={load} />
            ) : (
                <>
                    <Help>{HELP[tab]}</Help>

                    <div className="flex flex-wrap gap-2">
                        {current.types.map((type) => (
                            <button
                                key={type}
                                onClick={() => setModal({ open: true, type, editing: null })}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                            >
                                <Plus size={18} /> {CONTEXT_TYPE_META[type].label}
                            </button>
                        ))}
                    </div>

                    {visible.length === 0 ? (
                        <Empty>Todavía no cargaste nada acá.</Empty>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {visible.map((e) => (
                                <EntryCard
                                    key={e.id} entry={e} users={users}
                                    onToggle={() => toggleActive(e)}
                                    onEdit={() => setModal({ open: true, type: e.type, editing: e })}
                                    onRemove={() => remove(e)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            <ContextEntryModal
                isOpen={modal.open}
                onClose={() => setModal({ ...modal, open: false, editing: null })}
                onSave={save}
                type={modal.type}
                editing={modal.editing}
                assets={assets}
                zones={zones}
                users={users}
            />
        </div>
    );
};

const EntryCard = ({ entry, users, onToggle, onEdit, onRemove }) => {
    const expired = entry.valid_until && entry.valid_until < new Date().toISOString().slice(0, 10);
    const handoff = users.find((u) => u.id === entry.handoff_to_user_id);
    const action = NEXT_ACTIONS.find((a) => a.value === entry.next_action);

    return (
        <div className={`bg-white dark:bg-gray-800 border rounded-xl p-4 shadow-sm flex flex-col gap-3 ${
            entry.active ? 'border-gray-200 dark:border-gray-700' : 'border-gray-200 dark:border-gray-700 opacity-60'
        }`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${
                        entry.type === 'regla'
                            ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}>
                        {entry.type === 'regla' ? <ShieldCheck size={18} /> : entry.type === 'promocion' ? <Tag size={18} />
                            : entry.type === 'flujo' ? <GitBranch size={18} /> : <MessageCircleQuestion size={18} />}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight">{entry.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-3 whitespace-pre-line">{entry.content}</p>
                    </div>
                </div>
                <div className="flex gap-1 shrink-0">
                    <button onClick={onEdit} title="Editar" className="p-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 rounded-lg"><Edit2 size={15} /></button>
                    <button onClick={onRemove} title="Eliminar" className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 rounded-lg"><Trash2 size={15} /></button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
                {entry.valid_until && (
                    <Chip tone={expired ? 'red' : 'gray'} icon={CalendarClock}>
                        {expired ? `Venció el ${shortDate(entry.valid_until)}` : `Hasta el ${shortDate(entry.valid_until)}`}
                    </Chip>
                )}
                {entry.restricted_zone?.name && <Chip icon={MapPin}>Sólo {entry.restricted_zone.name}</Chip>}
                {action?.value && <Chip icon={ArrowRight}>{action.label}</Chip>}
                {handoff && <Chip icon={ArrowRight}>Deriva a {handoff.name}</Chip>}
                {(entry.media || []).map((m) => (
                    <Chip key={m.media_asset.id} icon={m.media_asset.type === 'imagen' ? ImageIcon : Music}>
                        {m.media_asset.label}
                    </Chip>
                ))}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3 mt-auto">
                <span className={`text-xs font-bold ${entry.active ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {entry.active ? 'La IA lo está usando' : 'Apagado'}
                </span>
                <button
                    onClick={onToggle} role="switch" aria-checked={entry.active}
                    title={entry.active ? 'Apagar' : 'Encender'}
                    className={`relative w-11 h-6 rounded-full transition-colors ${entry.active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${entry.active ? 'translate-x-5' : ''}`} />
                </button>
            </div>
        </div>
    );
};

const Chip = ({ children, icon: Icon, tone = 'gray' }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-medium ${
        tone === 'red'
            ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
            : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300'
    }`}>
        {Icon && <Icon size={12} />} {children}
    </span>
);

export default ContentPage;
