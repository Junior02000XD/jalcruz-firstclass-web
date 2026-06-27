import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import { PROSPECT_STATUSES, statusMeta, whatsappLink, firstPhone } from '../../lib/crm';
import { Plus, Search, UserPlus, Phone, MessageCircle, Trash2, MapPin, Megaphone } from 'lucide-react';

const emptyForm = { first_name: '', last_name: '', phone: '', origin: '', zone_id: '', campaign_id: '', status: 'nuevo' };

const ProspectsPage = () => {
    const [prospects, setProspects] = useState([]);
    const [zones, setZones] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('todos');
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            const [p, z, c] = await Promise.all([
                api.get('/prospects'),
                api.get('/zones'),
                api.get('/campaigns'),
            ]);
            setProspects(p.data);
            setZones(z.data);
            setCampaigns(c.data);
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

    const changeStatus = async (prospect, status) => {
        try {
            await api.put(`/prospects/${prospect.id}`, {
                person_id: prospect.person_id,
                campaign_id: prospect.campaign_id,
                zone_id: prospect.zone_id,
                origin: prospect.origin,
                address: prospect.address,
                notes: prospect.notes,
                status,
            });
            setProspects((prev) => prev.map((p) => (p.id === prospect.id ? { ...p, status } : p)));
        } catch (e) {
            alert('No se pudo actualizar el estado.');
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

    const PhoneActions = ({ person }) => {
        const number = firstPhone(person);
        if (!number) return <span className="text-gray-300 text-xs">Sin teléfono</span>;
        const wa = whatsappLink(number);
        return (
            <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-gray-700">{number}</span>
                {wa && (
                    <a href={wa} target="_blank" rel="noreferrer" className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg" title="WhatsApp">
                        <MessageCircle size={15} />
                    </a>
                )}
            </div>
        );
    };

    if (loading) return <div className="text-sm text-gray-500 mt-10 text-center">Cargando prospectos...</div>;

    return (
        <div className="flex flex-col gap-5">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Prospectos</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Captura y da seguimiento a tus clientes potenciales.</p>
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
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filter === 'todos' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                    Todos ({prospects.length})
                </button>
                {PROSPECT_STATUSES.map((s) => (
                    <button
                        key={s.value}
                        onClick={() => setFilter(s.value)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filter === s.value ? 'bg-gray-900 text-white border-gray-900' : `bg-white border-gray-200 text-gray-600`}`}
                    >
                        {s.label} ({counts[s.value] || 0})
                    </button>
                ))}
            </div>

            {/* Búsqueda */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    placeholder="Buscar nombre, teléfono u origen..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 shadow-sm"
                />
            </div>

            {visible.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-xl py-16 text-center">
                    <UserPlus className="mx-auto text-gray-300" size={32} />
                    <p className="text-gray-400 text-sm mt-2">No hay prospectos en esta vista.</p>
                </div>
            ) : (
                <>
                    {/* TABLA (desktop) */}
                    <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/80 border-b border-gray-200">
                                <tr>
                                    <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Prospecto</th>
                                    <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Contacto</th>
                                    <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Origen / Zona</th>
                                    <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Estado</th>
                                    <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {visible.map((p) => (
                                    <tr key={p.id} className="hover:bg-yellow-50/30 transition-colors">
                                        <td className="px-5 py-3 font-bold text-gray-900">
                                            {p.person?.first_name} {p.person?.last_name}
                                        </td>
                                        <td className="px-5 py-3"><PhoneActions person={p.person} /></td>
                                        <td className="px-5 py-3 text-gray-600">
                                            <div className="flex flex-col gap-0.5 text-xs">
                                                {p.origin && <span className="flex items-center gap-1"><Megaphone size={11} className="text-gray-400" /> {p.origin}</span>}
                                                {p.zone?.name && <span className="flex items-center gap-1"><MapPin size={11} className="text-gray-400" /> {p.zone.name}</span>}
                                                {!p.origin && !p.zone?.name && <span className="text-gray-300">—</span>}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3"><StatusSelect prospect={p} /></td>
                                        <td className="px-5 py-3">
                                            <div className="flex justify-center">
                                                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg" title="Eliminar">
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
                            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{p.person?.first_name} {p.person?.last_name}</p>
                                        <div className="mt-1"><PhoneActions person={p.person} /></div>
                                    </div>
                                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 bg-red-50 rounded-lg shrink-0">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                                    {p.origin && <span className="flex items-center gap-1"><Megaphone size={11} /> {p.origin}</span>}
                                    {p.zone?.name && <span className="flex items-center gap-1"><MapPin size={11} /> {p.zone.name}</span>}
                                </div>
                                <div className="mt-3"><StatusSelect prospect={p} /></div>
                            </div>
                        ))}
                    </div>
                </>
            )}

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
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
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
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl">Cancelar</button>
                        <button type="submit" disabled={saving} className="px-6 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow active:scale-95 transition-all disabled:opacity-60">
                            {saving ? 'Guardando...' : 'Registrar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500';
const Field = ({ label, children }) => (
    <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</label>
        {children}
    </div>
);

export default ProspectsPage;
