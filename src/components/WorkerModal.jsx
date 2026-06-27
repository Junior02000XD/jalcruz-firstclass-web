import { useState, useEffect } from 'react';

const WorkerModal = ({ isOpen, onClose, onSave, editingWorker }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [ci, setCi] = useState('');
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [reliability, setReliability] = useState('Alta');

    useEffect(() => {
        if (isOpen) {
            if (editingWorker) {
                setFirstName(editingWorker.person?.first_name || '');
                setLastName(editingWorker.person?.last_name || '');
                setCi(editingWorker.person?.ci || '');
                setEmail(editingWorker.person?.email || '');
                // Cortar la fecha si viene con hora (ej: 1990-01-01T00:00:00)
                setBirthDate(editingWorker.person?.birth_date ? editingWorker.person.birth_date.split('T')[0] : '');
                setReliability(editingWorker.reliability || 'excelente');
            } else {
                setFirstName('');
                setLastName('');
                setCi('');
                setEmail('');
                setBirthDate('');
                setReliability('excelente');
            }
        }
    }, [isOpen, editingWorker]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            first_name: firstName, 
            last_name: lastName, 
            ci: ci, 
            email: email,
            birth_date: birthDate,
            reliability 
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 transition-all">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
                    {editingWorker ? 'Editar Trabajador' : 'Añadir Trabajador Jalcruz'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Nombre</label>
                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Apellido</label>
                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">C.I.</label>
                            <input type="text" value={ci} onChange={(e) => setCi(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Ej: 8932451" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">F. Nacimiento</label>
                            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Correo Electrónico</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="correo@ejemplo.com" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Nivel de Confiabilidad</label>
                        <select value={reliability} onChange={(e) => setReliability(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                            <option value="Excelente">excelente</option>
                            <option value="Alta">bueno</option>
                            <option value="Media">riesgoso</option>
                            <option value="Baja">No Recomendable</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all">Cancelar</button>
                        <button type="submit" className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all">
                            {editingWorker ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WorkerModal;