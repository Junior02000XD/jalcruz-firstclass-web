import { useState, useEffect } from 'react';

const CompanyModal = ({ isOpen, onClose, onSave, editingCompany }) => {
    const [name, setName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [nit, setNit] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editingCompany) {
                setName(editingCompany.name);
                setBusinessName(editingCompany.business_name || '');
                setNit(editingCompany.nit || '');
            } else {
                setName('');
                setBusinessName('');
                setNit('');
            }
        }
    }, [isOpen, editingCompany]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, business_name: businessName, nit });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 transition-all">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
                    {editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Nombre Comercial</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-gray-800 dark:text-gray-100 transition-all" required placeholder="Ej: Condominio La Riviera" />
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Razón Social</label>
                        <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Ej: Inversiones La Riviera S.A." />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">NIT</label>
                        <input type="text" value={nit} onChange={(e) => setNit(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Ej: 1029384029" />
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all">Cancelar</button>
                        <button type="submit" className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all">
                            {editingCompany ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanyModal;