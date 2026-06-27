import { useState, useEffect } from 'react';
import Select from 'react-select'; // Importamos el buscador

const AttendanceModal = ({ isOpen, onClose, onSave, workers, defaultDate }) => {
    const [personId, setPersonId] = useState('');
    const [date, setDate] = useState('');
    const [status, setStatus] = useState('asistio');
    const [amount, setAmount] = useState('');
    const [extraAmount, setExtraAmount] = useState('');

    useEffect(() => {
        if (isOpen) {
            setDate(defaultDate || '');
            // Ya no forzamos a seleccionar el primero, dejamos que el usuario busque
            setPersonId(''); 
            setStatus('asistio');
            setAmount('');
            setExtraAmount('');
        }
    }, [isOpen, defaultDate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!personId) {
            alert("Por favor, selecciona un trabajador.");
            return;
        }

        // Enviamos el objeto armado a la página principal
        onSave({ 
            person_id: personId, 
            date: date,
            status: status,
            amount: amount === "" ? 0 : parseFloat(amount),
            extra_amount: extraAmount === "" ? 0 : parseFloat(extraAmount)
        });
        
        setAmount('');
        setExtraAmount('');
    };

    if (!isOpen) return null;

    // Formateamos los trabajadores para el react-select
    const workerOptions = workers.map(w => ({
        value: w.person_id,
        label: `${w.person?.first_name} ${w.person?.last_name}`
    }));

    // Encontramos el valor actual seleccionado para que react-select lo muestre
    const selectedWorker = workerOptions.find(opt => opt.value === personId) || null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5 tracking-tight">Añadir Asistencia / Crear Día</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* El z-50 relativo aquí evita que el dropdown del select se esconda detrás de otros divs */}
                    <div className="relative z-50">
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">Trabajador</label>
                        <Select
                            options={workerOptions}
                            value={selectedWorker}
                            placeholder="Buscar por nombre..."
                            noOptionsMessage={() => "No se encontró el trabajador"}
                            onChange={(option) => setPersonId(option ? option.value : '')}
                            isClearable
                            className="text-sm"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderColor: '#e5e7eb',
                                    borderRadius: '0.375rem',
                                    padding: '1px'
                                })
                            }}
                        />
                    </div>

                    <div className="relative z-0">
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">Fecha</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            required
                        />
                    </div>
                    
                    <div className="flex gap-4 relative z-0">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">Estado</label>
                            <select 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)} 
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-500"
                                required
                            >
                                <option value="asistio">Asistió</option>
                                <option value="falto">Faltó</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">Monto (Bs.)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="Ej: 150"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">Transp. (Bs.)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                value={extraAmount} 
                                onChange={(e) => setExtraAmount(e.target.value)} 
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-orange-50/50 focus:outline-none focus:border-orange-500"
                                placeholder="Ej: 10"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AttendanceModal;