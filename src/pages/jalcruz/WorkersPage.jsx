import { useState, useEffect } from 'react';
import api from '../../api/axios';
import WorkerModal from '../../components/WorkerModal';
// Importamos solo los iconos necesarios
import { Search, Plus, User, Edit2, Trash2, Mail } from 'lucide-react';

const WorkersPage = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Solo necesitamos el estado para saber a quién editamos
    const [editingWorker, setEditingWorker] = useState(null);

    const fetchWorkers = async () => {
        try {
            const response = await api.get('/worker-details');
            setWorkers(response.data);
        } catch (error) {
            console.error("Error al cargar trabajadores:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let isMounted = true; 
        const loadInitialData = async () => {
            try {
                const response = await api.get('/worker-details');
                if (isMounted) {
                    setWorkers(response.data);
                    setLoading(false);
                }
            } catch {
                if (isMounted) setLoading(false);
            }
        };
        loadInitialData();
        return () => { isMounted = false; };
    }, []);

    const handleSaveWorker = async (workerData) => {
        try {
            // Aseguramos que si CI está vacío, se envíe como null al backend
            const payloadData = {
                ...workerData,
                ci: workerData.ci.trim() === '' ? null : workerData.ci
            };

            if (editingWorker) {
                // Modo Edición
                await api.put(`/people/${editingWorker.person_id}`, {
                    first_name: payloadData.first_name,
                    last_name: payloadData.last_name,
                    ci: payloadData.ci,
                    email: payloadData.email,
                    birth_date: payloadData.birth_date
                });

                await api.put(`/worker-details/${editingWorker.id}`, {
                    reliability: payloadData.reliability
                });
            } else {
                // Modo Creación
                const personRes = await api.post('/people', {
                    first_name: payloadData.first_name,
                    last_name: payloadData.last_name,
                    ci: payloadData.ci,
                    email: payloadData.email,
                    birth_date: payloadData.birth_date
                });

                await api.post('/worker-details', {
                    person_id: personRes.data.id,
                    reliability: payloadData.reliability,
                    notes: 'Creado desde el panel principal'
                });
            }

            fetchWorkers();
            handleCloseModal();
        } catch (error) {
            alert("Error al guardar el trabajador. Revisa si el CI o Email ya existen.");
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar el detalle de trabajador de esta persona?')) {
            try {
                await api.delete(`/worker-details/${id}`);
                fetchWorkers();
            } catch {
                alert("Error al eliminar.");
            }
        }
    };

    const handleOpenEdit = (worker) => {
        setEditingWorker(worker);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingWorker(null);
    };

    // Filtro robusto para manejar nulls
    const filteredWorkers = workers.filter(w => {
        const term = searchTerm.toLowerCase().trim();
        
        // Si el término está vacío, devolvemos todos inmediatamente para ahorrar procesamiento
        if (!term) return true;

        const firstName = w.person?.first_name?.toLowerCase() || '';
        const lastName = w.person?.last_name?.toLowerCase() || '';
        const email = w.person?.email?.toLowerCase() || '';
        
        // Convertimos el CI forzosamente a String para evitar errores si llega como Number
        const ci = String(w.person?.ci || '').toLowerCase(); 

        return firstName.includes(term) || 
               lastName.includes(term) || 
               email.includes(term) ||
               ci.includes(term);
    });

    if (loading) return <div className="text-sm text-gray-500 mt-10 text-center">Cargando base de datos...</div>;

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Trabajadores</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Gestión de personal activo en Jalcruz.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar nombre o CI..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full sm:w-64 shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={16} /> <span className="hidden sm:inline">Nuevo</span>
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50/80 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Información Personal</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Documento (C.I.)</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Confiabilidad</th>
                                {/* Centramos el encabezado de acciones */}
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredWorkers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                        No se encontraron registros.
                                    </td>
                                </tr>
                            ) : (
                                filteredWorkers.map((worker) => (
                                    <tr key={worker.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                    <User size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900">
                                                        {worker.person.first_name} {worker.person.last_name}
                                                    </span>
                                                    {worker.person.email && (
                                                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                            <Mail size={10} /> {worker.person.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-mono text-sm">{worker.person.ci || <span className="text-gray-400 italic">No registrado</span>}</span>
                                                {worker.person.birth_date && (
                                                    <span className="text-xs text-gray-400 mt-0.5">Nac: {worker.person.birth_date.split('T')[0]}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border
                                                ${worker.reliability === 'Alta' || worker.reliability === 'Excelente' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                  worker.reliability === 'Media' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                                  'bg-red-50 text-red-700 border-red-200'}`}>
                                                {worker.reliability}
                                            </span>
                                        </td>
                                        
                                        {/* Aquí aplicamos la solución elegante con botones */}
                                        <td className="px-6 py-3">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button 
                                                    onClick={() => handleOpenEdit(worker)}
                                                    className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors tooltip-trigger"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(worker.id)}
                                                    className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors tooltip-trigger"
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

            <WorkerModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSaveWorker} 
                editingWorker={editingWorker}
            />
        </div>
    );
};

export default WorkersPage;