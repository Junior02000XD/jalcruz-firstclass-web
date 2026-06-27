import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import { money, shortDate } from '../../lib/crm';
import { Plus, ShoppingCart, Trash2, Receipt, Wallet } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);
const empty = () => ({ prospect_id: '', product_id: '', enrollment_date: today(), receipt_number: '', commission: '' });

const SalesPage = () => {
    const [sales, setSales] = useState([]);
    const [prospects, setProspects] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState(empty());

    const load = useCallback(async () => {
        try {
            const [s, p, pr] = await Promise.all([
                api.get('/enrollments'), api.get('/prospects'), api.get('/products'),
            ]);
            setSales(s.data);
            setProspects(p.data);
            setProducts(pr.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    useEffect(() => { load(); }, [load]);

    const save = async (e) => {
        e.preventDefault();
        try {
            await api.post('/enrollments', {
                prospect_id: Number(form.prospect_id),
                product_id: Number(form.product_id),
                enrollment_date: form.enrollment_date,
                receipt_number: form.receipt_number || null,
                commission: form.commission === '' ? 0 : Number(form.commission),
            });
            setForm(empty());
            setIsOpen(false);
            load();
        } catch { alert('No se pudo registrar la venta.'); }
    };

    const remove = async (id) => {
        if (!window.confirm('¿Eliminar esta venta?')) return;
        try { await api.delete(`/enrollments/${id}`); load(); } catch { alert('Error al eliminar.'); }
    };

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.product?.price || 0), 0);
    const totalCommission = sales.reduce((sum, s) => sum + Number(s.commission || 0), 0);

    const saleName = (s) => s.prospect?.person ? `${s.prospect.person.first_name} ${s.prospect.person.last_name || ''}`.trim() : `Prospecto #${s.prospect_id}`;

    if (loading) return <div className="text-sm text-gray-500 dark:text-gray-400 mt-10 text-center">Cargando...</div>;

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Ventas</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Inscripciones registradas. Al registrar una venta el prospecto pasa a “inscrito”.</p>
                </div>
                <button onClick={() => setIsOpen(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-all">
                    <Plus size={18} /> <span className="hidden sm:inline">Registrar venta</span>
                </button>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-3">
                <Summary icon={ShoppingCart} label="Ventas" value={sales.length} />
                <Summary icon={Wallet} label="Ingresos" value={money(totalRevenue)} accent />
                <Summary icon={Receipt} label="Comisiones" value={money(totalCommission)} />
            </div>

            {sales.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-16 text-center text-gray-400 dark:text-gray-500 text-sm">Aún no hay ventas registradas.</div>
            ) : (
                <>
                    {/* Tabla desktop */}
                    <div className="hidden md:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    {['Cliente', 'Producto', 'Fecha', 'Recibo', 'Comisión', ''].map((h) => (
                                        <th key={h} className="px-5 py-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                                {sales.map((s) => (
                                    <tr key={s.id} className="hover:bg-yellow-50/30">
                                        <td className="px-5 py-3 font-bold text-gray-900 dark:text-gray-100">{saleName(s)}</td>
                                        <td className="px-5 py-3 text-gray-700 dark:text-gray-200">{s.product?.name} <span className="text-yellow-700 dark:text-yellow-400 font-semibold">{s.product?.price != null ? `· ${money(s.product.price)}` : ''}</span></td>
                                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{shortDate(s.enrollment_date)}</td>
                                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{s.receipt_number || '—'}</td>
                                        <td className="px-5 py-3 text-gray-700 dark:text-gray-200">{money(s.commission)}</td>
                                        <td className="px-5 py-3 text-right">
                                            <button onClick={() => remove(s.id)} className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/30 rounded-lg"><Trash2 size={15} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Cards móvil */}
                    <div className="md:hidden flex flex-col gap-3">
                        {sales.map((s) => (
                            <div key={s.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{saleName(s)}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.product?.name} · {shortDate(s.enrollment_date)}</p>
                                    </div>
                                    <button onClick={() => remove(s.id)} className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg shrink-0"><Trash2 size={15} /></button>
                                </div>
                                <div className="flex justify-between mt-3 text-xs">
                                    <span className="text-gray-500 dark:text-gray-400">Recibo: <b className="font-mono">{s.receipt_number || '—'}</b></span>
                                    <span className="text-gray-500 dark:text-gray-400">Comisión: <b className="text-gray-700 dark:text-gray-200">{money(s.commission)}</b></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Registrar venta">
                <form onSubmit={save} className="space-y-4">
                    <Field label="Cliente (prospecto) *">
                        <select required value={form.prospect_id} onChange={(e) => setForm({ ...form, prospect_id: e.target.value })} className={cls}>
                            <option value="">— Selecciona —</option>
                            {prospects.map((p) => <option key={p.id} value={p.id}>{p.person?.first_name} {p.person?.last_name}</option>)}
                        </select>
                    </Field>
                    <Field label="Producto *">
                        <select required value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} className={cls}>
                            <option value="">— Selecciona —</option>
                            {products.map((p) => <option key={p.id} value={p.id}>{p.name}{p.price != null ? ` (${money(p.price)})` : ''}</option>)}
                        </select>
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Fecha *"><input required type="date" value={form.enrollment_date} onChange={(e) => setForm({ ...form, enrollment_date: e.target.value })} className={cls} /></Field>
                        <Field label="N° de recibo"><input value={form.receipt_number} onChange={(e) => setForm({ ...form, receipt_number: e.target.value })} className={cls} placeholder="R-0001" /></Field>
                    </div>
                    <Field label="Comisión (Bs)">
                        <input type="number" step="0.01" min="0" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} className={cls} placeholder="0" inputMode="decimal" />
                    </Field>
                    {products.length === 0 && <p className="text-xs text-amber-600">Primero crea un producto en la sección Productos.</p>}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl">Cancelar</button>
                        <button type="submit" className="px-6 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow active:scale-95 transition-all">Registrar venta</button>
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
const Summary = ({ icon: Icon, label, value, accent }) => (
    <div className={`rounded-xl border p-4 ${accent ? 'bg-green-50 dark:bg-green-500/10 border-green-100' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'} shadow-sm`}>
        <Icon size={18} className={accent ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'} />
        <p className={`text-lg font-bold mt-2 ${accent ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>{value}</p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
);

export default SalesPage;
