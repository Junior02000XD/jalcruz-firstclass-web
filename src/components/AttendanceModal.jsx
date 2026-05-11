import { useState, useEffect } from 'react';
import api from '../api/axios';

const AttendanceModal = ({ isOpen, onClose, onSave, payrollId, defaultDate }) => {
    const [personId, setPersonId] = useState('');
    const [workAreaId, setWorkAreaId] = useState('');
    const [date, setDate] = useState(defaultDate || '');
    const [amount, setAmount] = useState('');

    const [workers, setWorkers] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setLoadingData(true);
                try {
                    const [workersRes, areasRes] = await Promise.all([
                        api.get('/worker-details'),
                        api.get('/work-areas')
                    ]);
                    setWorkers(workersRes.data);
                    setAreas(areasRes.data);
                    setDate(defaultDate || ''); // Actualizar fecha si cambia la planilla
                    
                    if (workersRes.data.length > 0) setPersonId(workersRes.data[0].person_id);
                    if (areasRes.data.length > 0) setWorkAreaId(areasRes.data[0].id);
                } catch (error) {
                    console.error("Error cargando dependencias:", error);
                } finally {
                    setLoadingData(false);
                }
            };
            fetchData();
        }
    }, [isOpen, defaultDate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            payroll_id: payrollId,
            person_id: personId, 
            work_area_id: workAreaId, 
            date,
            amount: parseFloat(amount)
        });
        setAmount(''); // Limpiamos solo el monto por si quiere seguir registrando al mismo en otra fecha
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-5 tracking-tight">Registrar Jornada</h3>
                
                {loadingData ? (
                    <div className="py-8 text-center text-sm text-gray-500">Cargando trabajadores y áreas...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Trabajador</label>
                            <select 
                                value={personId} 
                                onChange={(e) => setPersonId(e.target.value)} 
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-blue-500"
                                required
                            >
                                {workers.map(w => (
                                    <option key={w.id} value={w.person_id}>
                                        {w.person?.first_name} {w.person?.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Área / Edificio</label>
                            <select 
                                value={workAreaId} 
                                onChange={(e) => setWorkAreaId(e.target.value)} 
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-blue-500"
                                required
                            >
                                {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Fecha</label>
                                <input 
                                    type="date" 
                                    value={date} 
                                    onChange={(e) => setDate(e.target.value)} 
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Monto (Bs.)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={amount} 
                                    onChange={(e) => setAmount(e.target.value)} 
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="Ej: 100.50"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 border border-gray-200">Cancelar</button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm">Guardar Asistencia</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AttendanceModal;