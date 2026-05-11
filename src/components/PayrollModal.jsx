import { useState, useEffect } from 'react';
import api from '../api/axios';

const PayrollModal = ({ isOpen, onClose, onSave }) => {
    const today = new Date();
    // Genera algo como PL-2026-05
    const defaultCode = `PL-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const [code, setCode] = useState(defaultCode);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [workAreaId, setWorkAreaId] = useState('');
    
    const [areas, setAreas] = useState([]);

    useEffect(() => {
        if (isOpen) {
            api.get('/work-areas').then(res => {
                setAreas(res.data);
                if (res.data.length > 0) setWorkAreaId(res.data[0].id);
            });
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            code, 
            start_date: startDate, 
            end_date: endDate,
            work_area_id: workAreaId
        });
        // Reset state
        setCode(defaultCode);
        setStartDate('');
        setEndDate('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 transition-all">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Crear Periodo de Planilla</h3>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Código de Planilla</label>
                        <input 
                            type="text" 
                            value={code} 
                            onChange={(e) => setCode(e.target.value)} 
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-gray-800 transition-all" 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Área de Trabajo Principal</label>
                        <select 
                            value={workAreaId} 
                            onChange={(e) => setWorkAreaId(e.target.value)} 
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                            required
                        >
                            {areas.length === 0 && <option value="" disabled>Cargando áreas...</option>}
                            {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Fecha de Inicio</label>
                            <input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)} 
                                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                required 
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Fecha de Fin</label>
                            <input 
                                type="date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)} 
                                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                required 
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all"
                        >
                            Crear Planilla
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PayrollModal;