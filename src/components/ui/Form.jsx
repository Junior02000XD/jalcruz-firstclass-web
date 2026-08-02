// Piezas de formulario compartidas por las pantallas del CRM.

export const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

// Etiqueta + ayuda breve. El texto de ayuda es lo que hace usable la pantalla de
// contenido: la IA usa lo que se escribe tal cual, así que conviene explicar
// cómo redactar antes que validar.
export const Field = ({ label, hint, children }) => (
    <div>
        <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</label>
        {hint && <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">{hint}</p>}
        {children}
    </div>
);

export const Help = ({ children }) => (
    <p className="text-sm text-blue-900 dark:text-blue-200 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl px-4 py-3 leading-relaxed">
        {children}
    </p>
);

export const Empty = ({ children }) => (
    <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-14 text-center text-gray-400 dark:text-gray-500 text-sm">
        {children}
    </div>
);
