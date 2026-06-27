import { useState, useEffect } from 'react';
import api from '../api/axios';

const WorkAreaModal = ({ isOpen, onClose, onSave, editingArea }) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [cityId, setCityId] = useState('');
    
    const [companies, setCompanies] = useState([]);
    const [cities, setCities] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    // Nuevo estado para mostrar errores si la API falla
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setLoadingData(true);
                setFetchError('');
                try {
                    const [compRes, cityRes] = await Promise.all([
                        api.get('/companies'),
                        api.get('/cities')
                    ]);
                    
                    setCompanies(compRes.data);
                    setCities(cityRes.data);
                    
                    if (editingArea) {
                        setName(editingArea.name);
                        setLocation(editingArea.location || '');
                        setCompanyId(editingArea.company_id);
                        setCityId(editingArea.city_id);
                    } else {
                        setName('');
                        setLocation('');
                        // En lugar de forzar el índice 0, lo dejamos vacío
                        // para forzar al usuario a elegir del menú "Seleccione..."
                        setCompanyId('');
                        setCityId('');
                    }
                } catch (error) {
                    console.error("Error cargando dependencias:", error);
                    setFetchError('No se pudieron cargar las empresas o ciudades.');
                } finally {
                    setLoadingData(false);
                }
            };
            fetchData();
        }
    }, [isOpen, editingArea]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, location, company_id: companyId, city_id: cityId });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 transition-all">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
                    {editingArea ? 'Editar Área de Trabajo' : 'Nueva Área de Trabajo'}
                </h3>
                
                {loadingData ? (
                    <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">Cargando datos del sistema...</div>
                ) : fetchError ? (
                    /* AQUÍ ESTÁ EL ARREGLO: Agregamos el botón de cerrar cuando hay error */
                    <div className="py-8 flex flex-col items-center">
                        <p className="text-sm text-red-500 font-medium mb-6 text-center">{fetchError}</p>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-6 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold rounded-xl transition-all active:scale-95"
                        >
                            Cerrar ventana
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Nombre del Área</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-gray-800 dark:text-gray-100 transition-all" required placeholder="Ej: Condominio La Hacienda" />
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Empresa Cliente</label>
                                <select 
                                    value={companyId} 
                                    onChange={(e) => setCompanyId(e.target.value)} 
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                                    required
                                >
                                    <option value="" disabled>Seleccione...</option>
                                    {companies.length === 0 && <option value="" disabled>No hay empresas registradas</option>}
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Ciudad</label>
                                <select 
                                    value={cityId} 
                                    onChange={(e) => setCityId(e.target.value)} 
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                                    required
                                >
                                    <option value="" disabled>Seleccione...</option>
                                    {cities.length === 0 && <option value="" disabled>No hay ciudades registradas</option>}
                                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Dirección / Ubicación</label>
                            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Ubicación detallada (Opcional)" />
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all">Cancelar</button>
                            <button 
                                type="submit" 
                                className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-50"
                                disabled={companies.length === 0 || cities.length === 0}
                            >
                                {editingArea ? 'Actualizar' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default WorkAreaModal;