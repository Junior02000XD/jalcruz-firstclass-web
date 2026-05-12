import { useState, useEffect, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft, Calendar, CheckCircle2, Loader2, Plus, Download } from 'lucide-react';
// IMPORTAMOS EL MODAL EXTERNO
import AttendanceModal from '../../components/AttendanceModal';

const PayrollDetailsPage = () => {
    const { id } = useParams();
    const [payroll, setPayroll] = useState(null);
    const [workers, setWorkers] = useState([]);
    const [attendances, setAttendances] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [savingCells, setSavingCells] = useState({});

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [allWorkersForModal, setAllWorkersForModal] = useState([]);

    useEffect(() => {
        const fetchPayrollData = async () => {
            try {
                const [payrollRes, allWorkersRes] = await Promise.all([
                    api.get(`/payrolls/${id}`),
                    api.get('/worker-details') 
                ]);

                setPayroll(payrollRes.data.payroll);
                setWorkers(payrollRes.data.active_workers); 
                
                const formattedAttendances = payrollRes.data.attendances.map(a => ({
                    ...a,
                    date: typeof a.date === 'string' ? a.date.split('T')[0] : a.date
                }));
                setAttendances(formattedAttendances);
                setAllWorkersForModal(allWorkersRes.data);

            } catch (error) {
                console.error("Error cargando vista:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayrollData();
    }, [id]);

    const days = [...new Set(attendances.map(a => a.date))].sort();

    const getAttendanceRecord = (workerId, date) => {
        return attendances.find(a => a.person_id === parseInt(workerId) && a.date === date);
    };

    const handleFieldChange = async (workerId, date, field, value) => {
        const record = getAttendanceRecord(workerId, date);

        let finalValue = value;
        if (field === 'amount' || field === 'extra_amount') {
            finalValue = value === "" ? 0 : parseFloat(value);
        }

        if (record && record[field] === finalValue) return;

        const cellKey = `${workerId}-${date}`;
        setSavingCells(prev => ({ ...prev, [cellKey]: true }));

        const payload = {
            payroll_id: parseInt(id),
            person_id: workerId,
            date: date,
            did_eat: record ? record.did_eat : false,
            amount: record ? record.amount : 0,
            extra_amount: record ? record.extra_amount : 0, 
            is_paid: record ? record.is_paid : false,
            status: record ? record.status : 'asistio',
            [field]: finalValue 
        };

        try {
            if (record) {
                const res = await api.put(`/attendances/${record.id}`, payload);
                const updatedRecord = { ...res.data.data, date: res.data.data.date.split('T')[0] };
                setAttendances(prev => prev.map(a => a.id === record.id ? updatedRecord : a));
            } else {
                const res = await api.post('/attendances', payload);
                const newRecord = { ...res.data.data, date: res.data.data.date.split('T')[0] };
                setAttendances(prev => [...prev, newRecord]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSavingCells(prev => ({ ...prev, [cellKey]: false }));
        }
    };

    // Esta función ahora recibe un objeto "formData" desde el AttendanceModal
    const handleAddManual = async (formData) => {
        if (getAttendanceRecord(formData.person_id, formData.date)) {
            alert("Este trabajador ya tiene un registro en esta fecha.");
            return;
        }

        const payload = {
            payroll_id: parseInt(id),
            person_id: parseInt(formData.person_id),
            date: formData.date,
            did_eat: false,
            amount: formData.amount,
            extra_amount: formData.extra_amount, 
            is_paid: false,
            status: formData.status 
        };

        try {
            const res = await api.post('/attendances', payload);
            const newRecord = { ...res.data.data, date: res.data.data.date.split('T')[0] };
            
            setAttendances(prev => [...prev, newRecord]);

            setWorkers(prevWorkers => {
                const exists = prevWorkers.some(w => w.person_id === parseInt(formData.person_id));
                if (!exists) {
                    const newWorkerToDisplay = allWorkersForModal.find(w => w.person_id === parseInt(formData.person_id));
                    return [...prevWorkers, newWorkerToDisplay];
                }
                return prevWorkers;
            });
            
            setIsAddModalOpen(false);
        } catch (err) {
            alert("Error al crear. Verifica consola.");
            console.error(err);
        }
    };

    const handleDeleteRecord = async (recordId, workerId, date) => {
        if (!window.confirm('¿Estás seguro de eliminar el registro de este trabajador en esta fecha?')) {
            return;
        }

        const cellKey = `${workerId}-${date}`;
        setSavingCells(prev => ({ ...prev, [cellKey]: true }));

        try {
            await api.delete(`/attendances/${recordId}`);
            
            // Si se eliminó correctamente, actualizamos el estado quitando ese registro
            setAttendances(prev => prev.filter(a => a.id !== recordId));
        } catch (error) {
            console.error("Error eliminando registro:", error);
            alert("Hubo un error al intentar eliminar la asistencia.");
        } finally {
            setSavingCells(prev => ({ ...prev, [cellKey]: false }));
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await api.get(`/payrolls/${id}/export`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Planilla_${payroll?.code}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Error al descargar el Excel.");
            console.error(error);
        }
    };

    if (loading) return <div className="text-sm text-gray-500 mt-10 text-center">Cargando datos...</div>;

    const grandTotal = attendances.reduce((sum, a) => sum + parseFloat(a.amount || 0) + parseFloat(a.extra_amount || 0), 0);

    return (
        <div className="flex flex-col h-[calc(100vh-80px)]">
            <div className="mb-4 flex-none">
                <Link to="/jalcruz/planillas" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-2">
                    <ArrowLeft size={16} /> Volver
                </Link>
                
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Registro General: {payroll?.code}</h1>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar size={14} /> {payroll?.start_date?.split('T')[0]} al {payroll?.end_date?.split('T')[0]}
                        </p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button 
                            onClick={handleExportExcel}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
                        >
                            <Download size={16} /> Exportar a Excel
                        </button>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
                        >
                            <Plus size={16} /> Añadir Día / Asistencia
                        </button>
                        <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                            <span className="text-sm font-semibold text-green-700 mr-2">Total Planilla:</span>
                            <span className="text-xl font-bold text-green-900">Bs. {grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-1 overflow-hidden flex flex-col relative">
                <div className="bg-blue-50/50 border-b border-gray-200 px-4 py-2 flex items-center gap-2 text-xs text-blue-700 flex-none">
                    <CheckCircle2 size={14} className="text-blue-500" />
                    Las celdas se guardan automáticamente. Si una columna de fecha no existe, usa el botón "Añadir Día".
                </div>

                <div className="overflow-auto flex-1 excel-scrollbar">
                    {days.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400 p-10">
                            Aún no hay asistencias en esta planilla. Añade una para generar las columnas.
                        </div>
                    ) : (
                        <table className="w-max text-left border-collapse whitespace-nowrap">
                            <thead className="sticky top-0 z-20 bg-gray-50 shadow-sm">
                                <tr>
                                    <th rowSpan={2} className="sticky left-0 z-30 bg-gray-100 px-4 py-3 text-xs font-semibold text-gray-700 uppercase border-r-2 border-b border-gray-300 min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        Trabajador
                                    </th>
                                    {days.map(date => (
                                        <th key={date} colSpan={5} className="text-center px-2 py-2 text-xs font-bold text-gray-700 uppercase border-r-2 border-b border-gray-300 bg-gray-100">
                                            {date.split('-')[2]} / {date.split('-')[1]}
                                        </th>
                                    ))}
                                    <th rowSpan={2} className="sticky right-0 z-30 bg-gray-100 px-4 py-3 text-xs font-bold text-gray-800 uppercase border-l-2 border-b border-gray-300 min-w-[120px] shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] text-right">
                                        Total (Bs)
                                    </th>
                                </tr>
                                
                                <tr>
                                    {days.map(date => (
                                        <Fragment key={`sub-${date}`}>
                                            <th className="px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase border-r border-b min-w-[110px] bg-white text-center">Estado</th>
                                            <th className="px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase border-r border-b min-w-[90px] bg-white text-center">Monto</th>
                                            <th className="px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase border-r border-b min-w-[80px] bg-white text-center" title="Pasajes / Transporte">Transp.</th>
                                            <th className="px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase border-r border-b min-w-[70px] bg-white text-center">Comida</th>
                                            <th className="px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase border-r-2 border-b border-gray-300 min-w-[70px] bg-white text-center">Pagado</th>
                                        </Fragment>
                                    ))}
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-gray-100">
                                {workers.map(worker => {
                                    const workerAttendances = attendances.filter(a => a.person_id === worker.person_id);
                                    const workerTotal = workerAttendances.reduce((sum, a) => sum + parseFloat(a.amount || 0) + parseFloat(a.extra_amount || 0), 0);

                                    return (
                                        <tr key={worker.id} className="hover:bg-blue-50/10 group">
                                            <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 px-4 py-2 border-r-2 border-gray-300 font-medium text-sm text-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[200px]">
                                                {worker.person.first_name} {worker.person.last_name}
                                            </td>
                                            
                                            {days.map(date => {
                                                const record = getAttendanceRecord(worker.person_id, date);
                                                const cellKey = `${worker.person_id}-${date}`;
                                                const isSaving = savingCells[cellKey];

                                                return (
                                                    <Fragment key={`${worker.id}-${date}`}>
                                                        <td className="p-0 border-r border-gray-200 relative min-w-[110px]">
                                                            <select 
                                                                // CAMBIO IMPORTANTE: Usar 'value' en lugar de 'defaultValue' para poder controlarlo
                                                                value={record?.status || ""}
                                                                onChange={(e) => {
                                                                    if (e.target.value === 'delete') {
                                                                        handleDeleteRecord(record.id, worker.person_id, date);
                                                                    } else {
                                                                        handleFieldChange(worker.person_id, date, 'status', e.target.value);
                                                                    }
                                                                }}
                                                                className={`w-full h-full min-h-[2.5rem] px-1 text-xs outline-none text-center appearance-none cursor-pointer
                                                                    ${record ? 'bg-green-50/20 text-gray-800 font-medium' : 'bg-transparent text-gray-400 hover:bg-gray-50'}`}
                                                            >
                                                                {/* Si no hay registro, mostramos el guion por defecto */}
                                                                {!record && <option value="" disabled>-</option>}
                                                                
                                                                <option value="asistio">Asistió</option>
                                                                <option value="falto">Faltó</option>
                                                                
                                                                {/* NUEVO: Si el registro existe, damos la opción de eliminarlo */}
                                                                {record && (
                                                                    <option value="delete" className="text-red-600 font-bold">
                                                                        ❌ Eliminar
                                                                    </option>
                                                                )}
                                                            </select>
                                                        </td>
                                                        <td className="p-0 border-r border-gray-200 relative min-w-[90px]">
                                                            <input 
                                                                type="number"
                                                                step="0.1"
                                                                defaultValue={record?.amount ?? ''}
                                                                onBlur={(e) => handleFieldChange(worker.person_id, date, 'amount', e.target.value)}
                                                                className={`w-full h-full min-h-[2.5rem] px-2 text-center text-sm outline-none font-medium
                                                                    ${record?.amount > 0 ? 'text-gray-900 bg-green-50/20' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
                                                            />
                                                        </td>
                                                        <td className="p-0 border-r border-gray-200 relative min-w-[80px]">
                                                            <input 
                                                                type="number"
                                                                step="0.1"
                                                                placeholder="0"
                                                                defaultValue={record?.extra_amount ?? ''}
                                                                onBlur={(e) => handleFieldChange(worker.person_id, date, 'extra_amount', e.target.value)}
                                                                className="w-full h-full min-h-[2.5rem] px-2 text-center text-sm outline-none font-medium text-orange-700 bg-orange-50/30 hover:bg-orange-50"
                                                                title="Transporte / Gastos Extra"
                                                            />
                                                        </td>
                                                        <td className="p-0 border-r border-gray-200 text-center bg-gray-50/30 min-w-[70px]">
                                                            <input type="checkbox" defaultChecked={record?.did_eat || false} onChange={(e) => handleFieldChange(worker.person_id, date, 'did_eat', e.target.checked)} className="w-4 h-4 cursor-pointer mt-1" />
                                                        </td>
                                                        <td className="p-0 border-r-2 border-gray-300 text-center relative bg-gray-50/30 min-w-[70px]">
                                                            {isSaving && <Loader2 size={12} className="absolute top-1 right-1 animate-spin text-blue-500" />}
                                                            <input type="checkbox" defaultChecked={record?.is_paid || false} onChange={(e) => handleFieldChange(worker.person_id, date, 'is_paid', e.target.checked)} className="w-4 h-4 cursor-pointer mt-1" />
                                                        </td>
                                                    </Fragment>
                                                );
                                            })}
                                            
                                            <td className="sticky right-0 z-10 bg-gray-50 px-4 py-2 border-l-2 border-gray-300 text-right font-bold text-sm text-green-700 min-w-[120px]">
                                                {workerTotal.toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* AQUÍ LLAMAMOS AL COMPONENTE EXTERNO */}
            <AttendanceModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddManual}
                workers={allWorkersForModal}
            />
            
        </div>
    );
};

export default PayrollDetailsPage;