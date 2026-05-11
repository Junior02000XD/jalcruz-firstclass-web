import { useState, useEffect } from 'react';
import api from '../../api/axios';
import WorkAreaModal from '../../components/WorkAreaModal';
import { Search, Plus, MoreHorizontal, MapPin, Edit2, Trash2 } from 'lucide-react';

const WorkAreasPage = () => {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Estados para Edición y Dropdown
    const [editingArea, setEditingArea] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const fetchAreas = async () => {
        try {
            const response = await api.get('/work-areas');
            setAreas(response.data);
        } catch (error) {
            console.error("Error al cargar áreas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true; 
        const fetchInitialData = async () => {
            try {
                const response = await api.get('/work-areas');
                if (isMounted) {
                    setAreas(response.data);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error:", error);
                if (isMounted) setLoading(false);
            }
        };
        fetchInitialData();
        return () => { isMounted = false; };
    }, []);

    const handleSaveArea = async (areaData) => {
        try {
            if (editingArea) {
                await api.put(`/work-areas/${editingArea.id}`, areaData);
            } else {
                await api.post('/work-areas', areaData);
            }
            fetchAreas();
            handleCloseModal();
        } catch (error) {
            alert("Error al guardar. Revisa la consola.");
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta área de trabajo?')) {
            try {
                await api.delete(`/work-areas/${id}`);
                fetchAreas();
            } catch (error) {
                alert("Error al eliminar. Es posible que tenga registros asociados.");
                console.error(error);
            }
        }
        setActiveDropdown(null);
    };

    const handleOpenEdit = (area) => {
        setEditingArea(area);
        setIsModalOpen(true);
        setActiveDropdown(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingArea(null);
    };

    const filteredAreas = areas.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-sm text-gray-500 mt-10 text-center">Cargando áreas de trabajo...</div>;

    return (
        <div className="flex flex-col h-full" onClick={() => setActiveDropdown(null)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Áreas de Trabajo</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Ubicaciones y edificios donde se presta servicio.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar área o empresa..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64 shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                        <Plus size={16} /> Nueva Área
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50/80 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-1/3">Nombre del Área</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-1/4">Empresa Cliente</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-1/4">Ubicación</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredAreas.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                        No se encontraron áreas de trabajo.
                                    </td>
                                </tr>
                            ) : (
                                filteredAreas.map((area) => (
                                    <tr key={area.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-3 font-bold text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md">
                                                    <MapPin size={16} />
                                                </div>
                                                {area.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-gray-600 font-medium">
                                            {area.company?.name || '—'}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-medium">{area.city?.name || '—'}</span>
                                                <span className="text-xs text-gray-400">{area.location || 'Sin dirección'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right relative">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(activeDropdown === area.id ? null : area.id);
                                                }}
                                                className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-all"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeDropdown === area.id && (
                                                <div className="absolute right-8 top-10 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-10 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(area); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Edit2 size={14} className="text-gray-400" /> Editar
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(area.id); }}
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

            <WorkAreaModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSaveArea} 
                editingArea={editingArea}
            />
        </div>
    );
};

export default WorkAreasPage;