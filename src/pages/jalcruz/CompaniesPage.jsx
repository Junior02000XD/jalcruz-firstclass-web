import { useState, useEffect } from 'react';
import api from '../../api/axios';
import CompanyModal from '../../components/CompanyModal';
// Actualizamos las importaciones de Lucide para solo traer lo que necesitamos
import { Search, Plus, Building, Edit2, Trash2, Map } from 'lucide-react';
import { Link } from 'react-router-dom';

const CompaniesPage = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Solo necesitamos este estado, eliminamos activeDropdown
    const [editingCompany, setEditingCompany] = useState(null);

    const fetchCompanies = async () => {
        try {
            const response = await api.get('/companies');
            setCompanies(response.data);
        } catch (error) {
            console.error("Error al cargar empresas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true; 
        const fetchInitialData = async () => {
            try {
                const response = await api.get('/companies');
                if (isMounted) {
                    setCompanies(response.data);
                    setLoading(false);
                }
            } catch {
                if (isMounted) setLoading(false);
            }
        };
        fetchInitialData();
        return () => { isMounted = false; };
    }, []);

    const handleSaveCompany = async (data) => {
        try {
            if (editingCompany) {
                await api.put(`/companies/${editingCompany.id}`, data);
            } else {
                await api.post('/companies', data);
            }
            fetchCompanies();
            handleCloseModal();
        } catch (error) {
            alert("Error al guardar la empresa.");
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro? Las áreas asociadas podrían perder la referencia.')) {
            try {
                await api.delete(`/companies/${id}`);
                fetchCompanies();
            } catch {
                alert("Error al eliminar.");
            }
        }
    };

    const handleOpenEdit = (company) => {
        setEditingCompany(company);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCompany(null);
    };

    const filteredCompanies = companies.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.business_name && c.business_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.nit && c.nit.includes(searchTerm))
    );

    if (loading) return <div className="text-sm text-gray-500 dark:text-gray-400 mt-10 text-center">Cargando empresas...</div>;

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Empresas Clientes</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestión de condominios y contratistas.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar empresa o NIT..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full sm:w-64 shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={16} /> <span className="hidden sm:inline">Nueva Empresa</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-1/3">Nombre Comercial</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-1/3">Razón Social</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-1/4">NIT</th>
                                {/* Centramos el encabezado de acciones */}
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                            {filteredCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                                        No se encontraron empresas.
                                    </td>
                                </tr>
                            ) : (
                                filteredCompanies.map((company) => (
                                    <tr key={company.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-3 font-bold text-gray-900 dark:text-gray-100">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-md">
                                                    <Building size={16} />
                                                </div>
                                                {company.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-gray-600 dark:text-gray-300 font-medium">
                                            {company.business_name || '—'}
                                        </td>
                                        <td className="px-6 py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">
                                            {company.nit || '—'}
                                        </td>
                                        
                                        {/* Implementación de los botones de acción limpios */}
                                        <td className="px-6 py-3">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                
                                                {/* Botón Ver Áreas */}
                                                <Link 
                                                    to={`/jalcruz/areas?companyId=${company.id}`}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/30 font-bold rounded-lg transition-colors"
                                                    title="Ver áreas asociadas"
                                                >
                                                    <Map size={14} /> <span className="text-[11px] uppercase tracking-wider">Áreas</span>
                                                </Link>

                                                <div className="w-px h-5 bg-gray-200 mx-1"></div> {/* Separador visual */}

                                                {/* Botón Editar */}
                                                <button 
                                                    onClick={() => handleOpenEdit(company)}
                                                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
                                                    title="Editar empresa"
                                                >
                                                    <Edit2 size={16} />
                                                </button>

                                                {/* Botón Eliminar */}
                                                <button 
                                                    onClick={() => handleDelete(company.id)}
                                                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                                                    title="Eliminar empresa"
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

            <CompanyModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSaveCompany} 
                editingCompany={editingCompany}
            />
        </div>
    );
};

export default CompaniesPage;