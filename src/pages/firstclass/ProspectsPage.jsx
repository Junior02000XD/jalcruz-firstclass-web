import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import { PROSPECT_STATUSES, statusMeta, whatsappLink, firstPhone, firstPhoneEntry } from '../../lib/crm';
import { Plus, Search, UserPlus, Phone, MessageCircle, Trash2, MapPin, Megaphone, Bot, UserCheck, MessagesSquare } from 'lucide-react';
import ConversationModal from '../../components/ConversationModal';

const emptyForm = { first_name: '', last_name: '', phone: '', origin: '', zone_id: '', campaign_id: '', status: 'nuevo' };

const ProspectsPage = () => {
    const [prospects, setProspects] = useState([]);
    const [zones, setZones] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    // Personas del CRM a las que se le puede pasar una conversación.
    const [assignables, setAssignables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('todos');
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    // Prospecto cuya conversación se está mirando. null = visor cerrado.
    const [verConversacion, setVerConversacion] = useState(null);

    const load = useCallback(async () => {
        try {
            const [p, z, c, a] = await Promise.all([
                api.get('/prospects'),
                api.get('/zones'),
                api.get('/campaigns'),
                api.get('/users/assignable'),
            ]);
            setProspects(p.data);
            setZones(z.data);
            setCampaigns(c.data);
            setAssignables(a.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    useEffect(() => { load(); }, [load]);

    const handleQuickSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/prospects/quick', {
                first_name: form.first_name,
                last_name: form.last_name || null,
                phone: form.phone || null,
                origin: form.origin || null,
                zone_id: form.zone_id || null,
                campaign_id: form.campaign_id || null,
                status: form.status,
            });
            setForm(emptyForm);
            setIsOpen(false);
            load();
        } catch (err) {
            alert('No se pudo registrar el prospecto.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // PATCH y no PUT: el PUT pisa con null todo campo que el payload no traiga,
    // y acá no se mandaba entity_id — cambiar el estado desde el panel lo borraba.
    // El endpoint de estado existe justamente para esto.
    const changeStatus = async (prospect, status) => {
        try {
            await api.patch(`/prospects/${prospect.id}/status`, { status });
            setProspects((prev) => prev.map((p) => (p.id === prospect.id ? { ...p, status } : p)));
        } catch (e) {
            alert(e.response?.data?.message || 'No se pudo actualizar el estado.');
            console.error(e);
        }
    };

    // Quién atiende la conversación. null = la IA.
    //
    // Esto ES la lista negra del agente de WhatsApp: mientras el prospecto tenga
    // una persona asignada, el bot NO le responde nunca. Es el mismo campo que se
    // marca solo cuando alguien contesta a mano desde su celular; acá se puede
    // poner y sacar a propósito, por ejemplo para un proveedor o un conocido que
    // no hay que atender con respuestas automáticas.
    const changeAssignment = async (prospect, value) => {
        const assigned_to_user_id = value === '' ? null : Number(value);
        try {
            await api.patch(`/prospects/${prospect.id}/assignment`, { assigned_to_user_id });
            setProspects((prev) => prev.map((p) => (p.id === prospect.id ? { ...p, assigned_to_user_id } : p)));
        } catch (e) {
            alert(e.response?.data?.message || 'No se pudo cambiar quién atiende.');
            console.error(e);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este prospecto?')) return;
        try {
            await api.delete(`/prospects/${id}`);
            setProspects((prev) => prev.filter((p) => p.id !== id));
        } catch { alert('Error al eliminar.'); }
    };

    const counts = PROSPECT_STATUSES.reduce((acc, s) => {
        acc[s.value] = prospects.filter((p) => p.status === s.value).length;
        return acc;
    }, {});

    const visible = prospects.filter((p) => {
        if (filter !== 'todos' && p.status !== filter) return false;
        const term = search.toLowerCase().trim();
        if (!term) return true;
        const name = `${p.person?.first_name || ''} ${p.person?.last_name || ''}`.toLowerCase();
        const phone = firstPhone(p.person) || '';
        return name.includes(term) || phone.includes(term) || (p.origin || '').toLowerCase().includes(term);
    });

    const StatusSelect = ({ prospect }) => (
        <select
            value={prospect.status}
            onChange={(e) => changeStatus(prospect, e.target.value)}
            className={`text-xs font-bold border rounded-lg px-2 py-1 focus:outline-none cursor-pointer ${statusMeta(PROSPECT_STATUSES, prospect.status).color}`}
        >
            {PROSPECT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
    );

    const AttendedBy = ({ prospect }) => {
        const asignado = prospect.assigned_to_user_id != null;
        return (
            <div className="flex items-center gap-1.5">
                {asignado
                    ? <UserCheck size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    : <Bot size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
                <select
                    value={prospect.assigned_to_user_id ?? ''}
                    onChange={(e) => changeAssignment(prospect, e.target.value)}
                    title={asignado
                        ? 'Lo atiende una persona: el bot no le responde'
                        : 'Lo atiende la IA automáticamente'}
                    className={`text-xs font-bold border rounded-lg px-2 py-1 focus:outline-none cursor-pointer ${
                        asignado
                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30'
                            : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                    }`}
                >
                    <option value="">La atiende la IA</option>
                    {assignables.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>
        );
    };

    const PhoneActions = ({ person }) => {
        const phone = firstPhoneEntry(person);
        const number = phone?.number;
        if (!number) return <span className="text-gray-300 text-xs">Sin teléfono</span>;
        // Se pasa el objeto, no el string: así el enlace usa el normalized_number de la API.
        const wa = whatsappLink(phone);
        return (
            <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-gray-700 dark:text-gray-200">{number}</span>
                {wa && (
                    <a href={wa} target="_blank" rel="noreferrer" className="p-1.5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 rounded-lg" title="WhatsApp">
                        <MessageCircle size={15} />
                    </a>
                )}
            </div>
        );
    };

    if (loading) return <div className="text-sm text-gray-500 dark:text-gray-400 mt-10 text-center">Cargando prospectos...</div>;

    return (
        <div className="flex flex-col gap-5">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Prospectos</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Captura y da seguimiento a tus clientes potenciales.</p>
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                    <Plus size={18} /> Nuevo prospecto
                </button>
            </div>

            {/* Filtros por estado (chips, scroll horizontal en móvil) */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                <button
                    onClick={() => setFilter('todos')}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filter === 'todos' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}
                >
                    Todos ({prospects.length})
                </button>
                {PROSPECT_STATUSES.map((s) => (
                    <button
                        key={s.value}
                        onClick={() => setFilter(s.value)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filter === s.value ? 'bg-gray-900 text-white border-gray-900' : `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300`}`}
                    >
                        {s.label} ({counts[s.value] || 0})
                    </button>
                ))}
            </div>

            {/* Búsqueda */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                <input
                    type="text"
                    placeholder="Buscar nombre, teléfono u origen..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 shadow-sm"
                />
            </div>

            {visible.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-16 text-center">
                    <UserPlus className="mx-auto text-gray-300" size={32} />
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">No hay prospectos en esta vista.</p>
                </div>
            ) : (
                <>
                    {/* TABLA (desktop) */}
                    <div className="hidden md:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-5 py-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Prospecto</th>
                                    <th className="px-5 py-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Contacto</th>
                                    <th className="px-5 py-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Origen / Zona</th>
                                    <th className="px-5 py-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Estado</th>
                                    <th className="px-5 py-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Atiende</th>
                                    <th className="px-5 py-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                                {visible.map((p) => (
                                    <tr key={p.id} className="hover:bg-yellow-50/30 transition-colors">
                                        <td className="px-5 py-3 font-bold text-gray-900 dark:text-gray-100">
                                            {p.person?.first_name} {p.person?.last_name}
                                        </td>
                                        <td className="px-5 py-3"><PhoneActions person={p.person} /></td>
                                        <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                                            <div className="flex flex-col gap-0.5 text-xs">
                                                {p.origin && <span className="flex items-center gap-1"><Megaphone size={11} className="text-gray-400 dark:text-gray-500" /> {p.origin}</span>}
                                                {p.zone?.name && <span className="flex items-center gap-1"><MapPin size={11} className="text-gray-400 dark:text-gray-500" /> {p.zone.name}</span>}
                                                {!p.origin && !p.zone?.name && <span className="text-gray-300">—</span>}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3"><StatusSelect prospect={p} /></td>
                                        <td className="px-5 py-3"><AttendedBy prospect={p} /></td>
                                        <td className="px-5 py-3">
                                            <div className="flex justify-center gap-1.5">
                                                <button onClick={() => setVerConversacion(p)} className="p-1.5 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg" title="Ver conversación">
                                                    <MessagesSquare size={15} />
                                                </button>
                                                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/30 rounded-lg" title="Eliminar">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* TARJETAS (móvil) */}
                    <div className="md:hidden flex flex-col gap-3">
                        {visible.map((p) => (
                            <div key={p.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{p.person?.first_name} {p.person?.last_name}</p>
                                        <div className="mt-1"><PhoneActions person={p.person} /></div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button onClick={() => setVerConversacion(p)} className="p-1.5 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg" title="Ver conversación">
                                            <MessagesSquare size={15} />
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500 dark:text-gray-400">
                                    {p.origin && <span className="flex items-center gap-1"><Megaphone size={11} /> {p.origin}</span>}
                                    {p.zone?.name && <span className="flex items-center gap-1"><MapPin size={11} /> {p.zone.name}</span>}
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <StatusSelect prospect={p} />
                                    <AttendedBy prospect={p} />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* VISOR DE CONVERSACIÓN — lo mismo que lee la IA antes de contestar */}
            <ConversationModal
                prospect={verConversacion}
                isOpen={verConversacion !== null}
                onClose={() => setVerConversacion(null)}
            />

            {/* MODAL ALTA RÁPIDA */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nuevo prospecto">
                <form onSubmit={handleQuickSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Nombre *">
                            <input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className={inputCls} placeholder="Ej: María" />
                        </Field>
                        <Field label="Apellido">
                            <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className={inputCls} placeholder="Ej: López" />
                        </Field>
                    </div>
                    <Field label="Teléfono / WhatsApp">
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={15} />
                            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`${inputCls} pl-9`} placeholder="Ej: 77712345" inputMode="tel" />
                        </div>
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Origen">
                            <input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className={inputCls} placeholder="Facebook, referido..." />
                        </Field>
                        <Field label="Zona">
                            <select value={form.zone_id} onChange={(e) => setForm({ ...form, zone_id: e.target.value })} className={inputCls}>
                                <option value="">— Sin zona —</option>
                                {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                            </select>
                        </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Campaña">
                            <select value={form.campaign_id} onChange={(e) => setForm({ ...form, campaign_id: e.target.value })} className={inputCls}>
                                <option value="">— Ninguna —</option>
                                {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Estado">
                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                                {PROSPECT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </Field>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl">Cancelar</button>
                        <button type="submit" disabled={saving} className="px-6 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow active:scale-95 transition-all disabled:opacity-60">
                            {saving ? 'Guardando...' : 'Registrar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500';
const Field = ({ label, children }) => (
    <div>
        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{label}</label>
        {children}
    </div>
);

export default ProspectsPage;
