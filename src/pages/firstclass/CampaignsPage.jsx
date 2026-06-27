import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import { money, shortDate } from '../../lib/crm';
import { Plus, Megaphone, Edit2, Trash2, TrendingUp } from 'lucide-react';

const empty = { name: '', type: '', budget: '', execution_date: '', url: '', description: '' };

const CampaignsPage = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [roi, setRoi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);

    const load = useCallback(async () => {
        try {
            const [c, r] = await Promise.all([api.get('/campaigns'), api.get('/reports/marketing-roi')]);
            setCampaigns(c.data);
            setRoi(r.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    useEffect(() => { load(); }, [load]);

    const roiFor = (name) => roi.find((r) => r.campaign_name === name);

    const open = (c = null) => {
        setEditing(c);
        setForm(c ? {
            name: c.name || '', type: c.type || '', budget: c.budget ?? '',
            execution_date: c.execution_date ? c.execution_date.slice(0, 10) : '',
            url: c.url || '', description: c.description || '',
        } : empty);
        setIsOpen(true);
    };

    const save = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: form.name,
                type: form.type || null,
                budget: form.budget === '' ? null : Number(form.budget),
                execution_date: form.execution_date || null,
                url: form.url || null,
                description: form.description || null,
            };
            if (editing) await api.put(`/campaigns/${editing.id}`, payload);
            else await api.post('/campaigns', payload);
            setIsOpen(false);
            load();
        } catch { alert('No se pudo guardar la campaña.'); }
    };

    const remove = async (id) => {
        if (!window.confirm('¿Eliminar campaña?')) return;
        try { await api.delete(`/campaigns/${id}`); load(); } catch { alert('Error al eliminar.'); }
    };

    if (loading) return <div className="text-sm text-gray-500 mt-10 text-center">Cargando...</div>;

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campañas</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Inversión en marketing y su retorno (prospectos / inscritos).</p>
                </div>
                <button onClick={() => open()} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-all">
                    <Plus size={18} /> <span className="hidden sm:inline">Nueva</span>
                </button>
            </div>

            {campaigns.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-xl py-16 text-center text-gray-400 text-sm">Aún no hay campañas.</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {campaigns.map((c) => {
                        const r = roiFor(c.name);
                        return (
                            <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-lg shrink-0"><Megaphone size={20} /></div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{c.name}</p>
                                            <p className="text-xs text-gray-500">{c.type || 'Sin tipo'} · {shortDate(c.execution_date)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={() => open(c)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"><Edit2 size={15} /></button>
                                        <button onClick={() => remove(c.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"><Trash2 size={15} /></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                                    <Stat label="Presupuesto" value={money(c.budget)} />
                                    <Stat label="Leads" value={r?.leads ?? 0} />
                                    <Stat label="Inscritos" value={r?.enrolled ?? 0} accent />
                                    <Stat label="Conversión" value={r?.conversion_rate ?? '0%'} />
                                </div>
                                {r && r.enrolled > 0 && (
                                    <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                                        <TrendingUp size={12} className="text-green-600" /> Costo por inscrito: <b className="text-gray-700">{money(r.cost_per_enrolled)}</b>
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Editar campaña' : 'Nueva campaña'}>
                <form onSubmit={save} className="space-y-4">
                    <Field label="Nombre *"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={cls} /></Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Tipo"><input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={cls} placeholder="Facebook Ads" /></Field>
                        <Field label="Presupuesto (Bs)"><input type="number" step="0.01" min="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={cls} inputMode="decimal" /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Fecha"><input type="date" value={form.execution_date} onChange={(e) => setForm({ ...form, execution_date: e.target.value })} className={cls} /></Field>
                        <Field label="URL"><input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={cls} placeholder="https://..." /></Field>
                    </div>
                    <Field label="Descripción"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={cls} /></Field>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl">Cancelar</button>
                        <button type="submit" className="px-6 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow active:scale-95 transition-all">{editing ? 'Actualizar' : 'Guardar'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const cls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20';
const Field = ({ label, children }) => (
    <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</label>{children}</div>
);
const Stat = ({ label, value, accent }) => (
    <div className={`rounded-lg py-2 ${accent ? 'bg-green-50' : 'bg-gray-50'}`}>
        <p className={`text-sm font-bold ${accent ? 'text-green-700' : 'text-gray-800'}`}>{value}</p>
        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
    </div>
);

export default CampaignsPage;
