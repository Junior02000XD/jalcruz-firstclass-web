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

// Falló la carga inicial de una pantalla. Antes el catch sólo hacía console.error
// y la pantalla mostraba su estado vacío ("No hay prospectos…"): un error de red
// se veía igual que un CRM sin datos.
export const LoadError = ({ error }) => (
    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl py-10 px-4 text-center text-sm text-red-700 dark:text-red-300 mt-6">
        <p className="font-semibold">No se pudieron cargar los datos.</p>
        <p className="mt-1 text-red-600/80 dark:text-red-300/80">
            {error?.response?.data?.message || 'Revisá la conexión e intentá de nuevo.'}
        </p>
        <button onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold">
            Reintentar
        </button>
    </div>
);
