// Constantes y helpers compartidos del módulo First Class (CRM).

// Estados del prospecto (coinciden con el enum del backend) + color y etiqueta amigable.
export const PROSPECT_STATUSES = [
    { value: 'nuevo', label: 'Nuevo', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200', dot: 'bg-blue-500' },
    { value: 'contactado', label: 'Contactado', color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200', dot: 'bg-indigo-500' },
    { value: 'clase_prueba_pendiente', label: 'Clase pendiente', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200', dot: 'bg-amber-500' },
    { value: 'inscrito', label: 'Inscrito', color: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200', dot: 'bg-green-500' },
    { value: 'descartado', label: 'Descartado', color: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700', dot: 'bg-gray-400' },
];

export const TRIAL_STATUSES = [
    { value: 'programada', label: 'Programada', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200' },
    { value: 'realizada', label: 'Realizada', color: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200' },
    { value: 'cancelada', label: 'Cancelada', color: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200' },
    { value: 'reprogramada', label: 'Reprogramada', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200' },
];

export const statusMeta = (list, value) =>
    list.find((s) => s.value === value) || { value, label: value, color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700', dot: 'bg-gray-400' };

// Formatea montos en bolivianos.
export const money = (n) =>
    `Bs ${Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Construye un enlace de WhatsApp (Bolivia +591) a partir de un número.
export const whatsappLink = (number) => {
    if (!number) return null;
    const clean = String(number).replace(/\D/g, '');
    if (!clean) return null;
    const full = clean.length <= 8 ? `591${clean}` : clean;
    return `https://wa.me/${full}`;
};

// Devuelve el primer teléfono de una persona (o null).
export const firstPhone = (person) => person?.phones?.[0]?.number || null;

// Fecha corta legible (acepta ISO o yyyy-mm-dd).
export const shortDate = (value) => {
    if (!value) return '—';
    const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
    if (isNaN(d)) return value;
    return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const shortDateTime = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d)) return value;
    return d.toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};
