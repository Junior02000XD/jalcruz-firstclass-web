import { useState, useEffect } from 'react';

// Fíjate que ahora recibe "workers" como prop desde la página principal
const AttendanceModal = ({ isOpen, onClose, onSave, workers, defaultDate }) => {
    const [personId, setPersonId] = useState('');
    const [date, setDate] = useState('');
    
    // Nuevos campos
    const [status, setStatus] = useState('asistio');
    const [amount, setAmount] = useState('');
    const [extraAmount, setExtraAmount] = useState('');

    useEffect(() => {
        if (isOpen) {
            setDate(defaultDate || '');
            if (workers && workers.length > 0) {
                setPersonId(workers[0].person_id);
            }
            // Resetear el resto
            setStatus('asistio');
            setAmount('');
            setExtraAmount('');
        }
    }, [isOpen, defaultDate, workers]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            person_id: personId, 
            date: date,
            status: status,
            amount: amount === "" ? 0 : parseFloat(amount),
            extra_amount: extraAmount === "" ? 0 : parseFloat(extraAmount)
        });
        
        // Limpiamos montos por si se queda abierto para registrar a otro
        setAmount('');
        setExtraAmount('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-100 animate-in fade-in zoom-in duration-200">
                <h3 className="text-lg font-bold text-gray-900 mb-5 tracking-tight">Añadir Asistencia / Crear Día</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Trabajador</label>
                        <select 
                            value={personId} 
                            onChange={(e) => setPersonId(e.target.value)} 
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-blue-500"
                            required
                        >
                            <option value="" disabled>Selecciona un trabajador...</option>
                            {workers.map(w => (
                                <option key={w.id} value={w.person_id}>
                                    {w.person?.first_name} {w.person?.last_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Fecha</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            required
                        />
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Estado</label>
                            <select 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)} 
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-blue-500"
                                required
                            >
                                <option value="asistio">Asistió</option>
                                <option value="falto">Faltó</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Monto (Bs.)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="Ej: 150"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Transp. (Bs.)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                value={extraAmount} 
                                onChange={(e) => setExtraAmount(e.target.value)} 
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-orange-50/50 focus:outline-none focus:border-orange-500"
                                placeholder="Ej: 10"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 border border-gray-200"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
                        >
                            Guardar Asistencia
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AttendanceModal;