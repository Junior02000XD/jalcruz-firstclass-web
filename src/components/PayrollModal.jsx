import { useState, useEffect } from 'react';
import api from '../api/axios';

const PayrollModal = ({ isOpen, onClose, onSave, editingPayroll }) => {
    const today = new Date();
    const defaultCode = `PL-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const [code, setCode] = useState(defaultCode);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [workAreaId, setWorkAreaId] = useState('');
    
    const [areas, setAreas] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLoadingData(true);
            setFetchError('');
            
            api.get('/work-areas')
                .then(res => {
                    setAreas(res.data);
                    
                    if (editingPayroll) {
                        setCode(editingPayroll.code);
                        setStartDate(editingPayroll.start_date?.split('T')[0] || '');
                        setEndDate(editingPayroll.end_date?.split('T')[0] || '');
                        setWorkAreaId(editingPayroll.work_area_id);
                    } else {
                        setCode(defaultCode);
                        setStartDate('');
                        setEndDate('');
                        if (res.data.length > 0) setWorkAreaId('');
                    }
                })
                .catch(err => {
                    console.error("Error cargando áreas:", err);
                    setFetchError("No se pudieron cargar las áreas de trabajo.");
                })
                .finally(() => setLoadingData(false));
        }
    }, [isOpen, editingPayroll]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            code, // El backend lo reescribe al crear, pero al editar es seguro enviarlo
            start_date: startDate, 
            end_date: endDate,
            work_area_id: workAreaId
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 transition-all">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
                    {editingPayroll ? 'Editar Periodo de Planilla' : 'Crear Periodo de Planilla'}
                </h3>
                
                {loadingData ? (
                    <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">Cargando datos...</div>
                ) : fetchError ? (
                    <div className="py-8 flex flex-col items-center">
                        <p className="text-sm text-red-500 font-medium mb-6 text-center">{fetchError}</p>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-6 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold rounded-xl transition-all"
                        >
                            Cerrar ventana
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                                Código / Nombre de Planilla
                            </label>
                            <input 
                                type="text" 
                                value={code} 
                                onChange={(e) => setCode(e.target.value)} 
                                // ELIMINAMOS EL disabled={!!editingPayroll} para poder editarlo
                                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold transition-all text-gray-800 dark:text-gray-100" 
                                required 
                            />
                        </div>
                        
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                                Área de Trabajo Principal
                            </label>
                            <select 
                                value={workAreaId} 
                                onChange={(e) => setWorkAreaId(e.target.value)} 
                                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                required
                            >
                                <option value="" disabled>Seleccione un área...</option>
                                {areas.length === 0 && <option value="" disabled>No hay áreas registradas</option>}
                                {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Fecha de Inicio</label>
                                <input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)} 
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                    required 
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Fecha de Fin</label>
                                <input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)} 
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-50"
                                disabled={areas.length === 0}
                            >
                                {editingPayroll ? 'Actualizar' : 'Crear Planilla'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PayrollModal;