import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import PayrollModal from '../../components/PayrollModal';
import { Search, Plus, Calendar, ArrowRight, FileSpreadsheet, Building2, Download, Edit2, Trash2 } from 'lucide-react';

const PayrollsPage = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Estado para saber si estamos editando
    const [editingPayroll, setEditingPayroll] = useState(null);

    const fetchPayrolls = async () => {
        try {
            const response = await api.get('/payrolls');
            setPayrolls(response.data);
        } catch (error) {
            console.error("Error al cargar planillas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const fetchInitialData = async () => {
            try {
                const response = await api.get('/payrolls');
                if (isMounted) {
                    setPayrolls(response.data);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error:", error);
                if (isMounted) setLoading(false);
            }
        };
        fetchInitialData();
        return () => { isMounted = false; };
    }, []);

    const handleSavePayroll = async (payrollData) => {
        try {
            if (editingPayroll) {
                await api.put(`/payrolls/${editingPayroll.id}`, payrollData);
            } else {
                await api.post('/payrolls', payrollData);
            }
            fetchPayrolls();
            handleCloseModal();
        } catch (error) {
            alert("Error al guardar la planilla. Verifica los datos.");
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta planilla? Se borrarán todas las asistencias asociadas.')) {
            try {
                await api.delete(`/payrolls/${id}`);
                fetchPayrolls();
            } catch (error) {
                alert("Error al eliminar.");
                console.error(error);
            }
        }
    };

    const handleOpenEdit = (payroll) => {
        setEditingPayroll(payroll);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPayroll(null);
    };

    const handleExportExcel = async (e, id, code) => {
        e.preventDefault();
        try {
            const response = await api.get(`/payrolls/${id}/export`, {
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Planilla_${code}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Error al descargar el Excel.");
            console.error(error);
        }
    };

    const filteredPayrolls = payrolls.filter(p => 
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-sm text-gray-500 mt-10 text-center">Cargando periodos de planilla...</div>;

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Planillas de Pago</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Control de periodos y asistencia general.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar por código..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64 bg-white shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                        <Plus size={16} /> Crear Periodo
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50/80 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-1/4">Código</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-1/4">Área Asignada</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-1/5">Fechas</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredPayrolls.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <FileSpreadsheet size={32} className="opacity-20 mb-2" />
                                            <p>No hay periodos de planilla registrados.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPayrolls.map((payroll) => (
                                    <tr key={payroll.id} className="hover:bg-blue-50/30 transition-colors group">
                                        
                                        <td className="px-6 py-3 font-bold text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md">
                                                    <FileSpreadsheet size={16} />
                                                </div>
                                                {payroll.code}
                                            </div>
                                        </td>

                                        <td className="px-6 py-3 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={14} className="text-gray-400" />
                                                {payroll.work_area?.name || 'Sin área'}
                                            </div>
                                        </td>

                                        {/* Agrupamos las fechas para que se vea más limpio */}
                                        <td className="px-6 py-3 text-gray-600">
                                            <div className="flex flex-col">
                                                <span className="flex items-center gap-1.5 text-xs text-gray-900 font-medium">
                                                    <Calendar size={12} className="text-blue-500" /> Inicia: {payroll.start_date?.split('T')[0] || 'N/A'}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                                    <Calendar size={12} className="text-gray-400" /> Cierra: {payroll.end_date?.split('T')[0] || 'N/A'}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                
                                                <button 
                                                    onClick={(e) => handleExportExcel(e, payroll.id, payroll.code)}
                                                    className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors tooltip-trigger"
                                                    title="Descargar Excel"
                                                >
                                                    <Download size={16} />
                                                </button>

                                                <Link 
                                                    to={`/jalcruz/planillas/${payroll.id}`}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 hover:border-blue-200 transition-all"
                                                    title="Ver matriz de asistencias"
                                                >
                                                    Matriz <ArrowRight size={14} />
                                                </Link>

                                                <div className="w-px h-5 bg-gray-200 mx-1"></div>

                                                <button 
                                                    onClick={() => handleOpenEdit(payroll)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleDelete(payroll.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PayrollModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSavePayroll} 
                editingPayroll={editingPayroll}
            />
        </div>
    );
};

export default PayrollsPage;