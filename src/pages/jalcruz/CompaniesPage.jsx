import { useState, useEffect } from 'react';
import api from '../../api/axios';
import CompanyModal from '../../components/CompanyModal';
import { Search, Plus, MoreHorizontal, Building, Edit2, Trash2, Map } from 'lucide-react';
import { Link } from 'react-router-dom';

const CompaniesPage = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [editingCompany, setEditingCompany] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);

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
        setActiveDropdown(null);
    };

    const handleOpenEdit = (company) => {
        setEditingCompany(company);
        setIsModalOpen(true);
        setActiveDropdown(null);
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

    if (loading) return <div className="text-sm text-gray-500 mt-10 text-center">Cargando empresas...</div>;

    return (
        <div className="flex flex-col h-full" onClick={() => setActiveDropdown(null)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Empresas Clientes</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Gestión de condominios y contratistas.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar empresa o NIT..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64 shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                        <Plus size={16} /> Nueva Empresa
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50/80 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-1/3">Nombre Comercial</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-1/3">Razón Social</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-1/4">NIT</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                        No se encontraron empresas.
                                    </td>
                                </tr>
                            ) : (
                                filteredCompanies.map((company) => (
                                    <tr key={company.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-3 font-bold text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md">
                                                    <Building size={16} />
                                                </div>
                                                {company.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-gray-600 font-medium">
                                            {company.business_name || '—'}
                                        </td>
                                        <td className="px-6 py-3 text-gray-600 font-mono text-xs">
                                            {company.nit || '—'}
                                        </td>
                                        <td className="px-6 py-3 text-right relative">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(activeDropdown === company.id ? null : company.id);
                                                }}
                                                className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-all"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            {activeDropdown === company.id && (
                                                <div className="absolute right-8 top-10 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-10 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                    <Link 
                                                        to={`/jalcruz/areas?companyId=${company.id}`}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                                                    >
                                                        <Map size={14} className="text-blue-500" /> Ver Áreas
                                                    </Link>
                                                    <div className="border-t border-gray-100 my-1"></div>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(company); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Edit2 size={14} className="text-gray-400" /> Editar
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(company.id); }}
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