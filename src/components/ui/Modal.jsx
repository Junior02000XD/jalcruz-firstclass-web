import { X } from 'lucide-react';

// Modal genérico responsivo: en móvil se ancla abajo (hoja deslizable), en desktop centrado.
const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className={`bg-white w-full ${maxWidth} rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-200`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="overflow-y-auto px-6 py-5">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
