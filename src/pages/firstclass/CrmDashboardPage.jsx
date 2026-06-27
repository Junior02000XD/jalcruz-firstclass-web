import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { PROSPECT_STATUSES, statusMeta, money } from '../../lib/crm';
import { UserPlus, ShoppingCart, TrendingUp, Users, ArrowRight, Megaphone } from 'lucide-react';

const CrmDashboardPage = () => {
    const [funnel, setFunnel] = useState([]);
    const [roi, setRoi] = useState([]);
    const [salesCount, setSalesCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [f, r, e] = await Promise.all([
                    api.get('/reports/funnel'),
                    api.get('/reports/marketing-roi'),
                    api.get('/enrollments'),
                ]);
                setFunnel(f.data);
                setRoi(r.data);
                setSalesCount(e.data.length);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        })();
    }, []);

    const countOf = (status) => funnel.find((f) => f.status === status)?.total || 0;
    const totalProspects = funnel.reduce((s, f) => s + f.total, 0);
    const enrolled = countOf('inscrito');
    const conversion = totalProspects > 0 ? Math.round((enrolled / totalProspects) * 100) : 0;
    const maxFunnel = Math.max(1, ...PROSPECT_STATUSES.map((s) => countOf(s.value)));

    if (loading) return <div className="text-sm text-gray-500 dark:text-gray-400 mt-10 text-center">Cargando resumen...</div>;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Resumen First Class</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Embudo de conversión y rendimiento de marketing.</p>
            </div>

            {/* Métricas clave */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Metric icon={Users} label="Prospectos" value={totalProspects} />
                <Metric icon={ShoppingCart} label="Inscritos" value={enrolled} accent />
                <Metric icon={TrendingUp} label="Conversión" value={`${conversion}%`} />
                <Metric icon={ShoppingCart} label="Ventas" value={salesCount} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Embudo */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                    <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Embudo de conversión</h2>
                    <div className="space-y-3">
                        {PROSPECT_STATUSES.map((s) => {
                            const n = countOf(s.value);
                            const meta = statusMeta(PROSPECT_STATUSES, s.value);
                            return (
                                <div key={s.value}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">{s.label}</span>
                                        <span className="text-gray-500 dark:text-gray-400">{n}</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${meta.dot}`} style={{ width: `${(n / maxFunnel) * 100}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {totalProspects === 0 && <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">Aún no hay prospectos registrados.</p>}
                </div>

                {/* ROI por campaña */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                    <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Megaphone size={16} className="text-yellow-500" /> Retorno por campaña</h2>
                    {roi.length === 0 ? (
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">Sin campañas registradas.</p>
                    ) : (
                        <div className="overflow-x-auto -mx-1">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                        <th className="py-1 pr-2">Campaña</th>
                                        <th className="py-1 px-2 text-center">Leads</th>
                                        <th className="py-1 px-2 text-center">Inscr.</th>
                                        <th className="py-1 pl-2 text-right">Costo/inscr.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {roi.map((r, i) => (
                                        <tr key={i}>
                                            <td className="py-2 pr-2 font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[120px]">{r.campaign_name}</td>
                                            <td className="py-2 px-2 text-center text-gray-600 dark:text-gray-300">{r.leads}</td>
                                            <td className="py-2 px-2 text-center font-bold text-green-600 dark:text-green-400">{r.enrolled}</td>
                                            <td className="py-2 pl-2 text-right text-gray-600 dark:text-gray-300">{r.enrolled > 0 ? money(r.cost_per_enrolled) : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Accesos rápidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <QuickLink to="/firstclass/prospectos" icon={UserPlus} title="Registrar prospecto" subtitle="Captura un nuevo cliente potencial" />
                <QuickLink to="/firstclass/ventas" icon={ShoppingCart} title="Registrar venta" subtitle="Convierte un prospecto en inscrito" />
            </div>
        </div>
    );
};

const Metric = ({ icon: Icon, label, value, accent }) => (
    <div className={`rounded-xl border p-4 shadow-sm ${accent ? 'bg-green-50 dark:bg-green-500/10 border-green-100' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
        <Icon size={18} className={accent ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'} />
        <p className={`text-2xl font-bold mt-2 ${accent ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>{value}</p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
);

const QuickLink = ({ to, icon: Icon, title, subtitle }) => (
    <Link to={to} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:border-yellow-300 hover:shadow-md transition-all flex items-center gap-4">
        <div className="p-3 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-lg"><Icon size={22} /></div>
        <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-gray-100">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <ArrowRight size={18} className="text-gray-300 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
    </Link>
);

export default CrmDashboardPage;
