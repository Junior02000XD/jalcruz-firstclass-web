import { useState, useEffect } from 'react';
import api from '../../api/axios';
import WorkerModal from '../../components/WorkerModal';
import { Search, Plus, MoreHorizontal, User, Edit2, Trash2, Mail } from 'lucide-react';

const WorkersPage = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Estados para Edición y Dropdown
    const [editingWorker, setEditingWorker] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);

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
            if (editingWorker) {
                // Modo Edición
                await api.put(`/people/${editingWorker.person_id}`, {
                    first_name: workerData.first_name,
                    last_name: workerData.last_name,
                    ci: workerData.ci,
                    email: workerData.email,
                    birth_date: workerData.birth_date
                });

                await api.put(`/worker-details/${editingWorker.id}`, {
                    reliability: workerData.reliability
                });
            } else {
                // Modo Creación
                const personRes = await api.post('/people', {
                    first_name: workerData.first_name,
                    last_name: workerData.last_name,
                    ci: workerData.ci,
                    email: workerData.email,
                    birth_date: workerData.birth_date
                });

                await api.post('/worker-details', {
                    person_id: personRes.data.id,
                    reliability: workerData.reliability,
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
        setActiveDropdown(null);
    };

    const handleOpenEdit = (worker) => {
        setEditingWorker(worker);
        setIsModalOpen(true);
        setActiveDropdown(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingWorker(null);
    };

    const filteredWorkers = workers.filter(w => 
        w.person?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        w.person?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.person?.ci?.includes(searchTerm)
    );

    if (loading) return <div className="text-sm text-gray-500 mt-10 text-center">Cargando base de datos...</div>;

    return (
        <div className="flex flex-col h-full" onClick={() => setActiveDropdown(null)}>
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
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64 shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                        <Plus size={16} /> Nuevo
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50/80 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-1/3">Información Personal</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-1/4">Documento (C.I.)</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-1/4">Confiabilidad</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Acciones</th>
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
                                                <span className="text-gray-900 font-mono text-sm">{worker.person.ci || '—'}</span>
                                                {worker.person.birth_date && (
                                                    <span className="text-xs text-gray-400 mt-0.5">Nac: {worker.person.birth_date.split('T')[0]}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border
                                                ${worker.reliability === 'Alta' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                  worker.reliability === 'Media' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                                  'bg-red-50 text-red-700 border-red-200'}`}>
                                                {worker.reliability}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right relative">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(activeDropdown === worker.id ? null : worker.id);
                                                }}
                                                className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-all"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            {activeDropdown === worker.id && (
                                                <div className="absolute right-8 top-10 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-10 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(worker); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Edit2 size={14} className="text-gray-400" /> Editar
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(worker.id); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} className="text-red-400" /> Eliminar
                                                    </button>
                                                </div>
                                            )}
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