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

// Contenido que la IA usa para responder. Cada tipo pide cosas distintas y, sobre
// todo, se redacta distinto: estos textos son la única guía que tienen los dueños
// del instituto, porque lo que escriben llega tal cual al prompt.
export const CONTEXT_TYPE_META = {
    pregunta_respuesta: {
        label: 'Pregunta frecuente',
        titleLabel: 'La pregunta del cliente',
        titleHint: 'Escribila como la escribe la gente, no como la diría un folleto.',
        titlePlaceholder: '¿Cuánto cuesta el curso?',
        contentLabel: 'La respuesta',
        contentHint: 'Escribí la respuesta tal cual se la mandarías al cliente por WhatsApp.',
        contentPlaceholder: 'El curso regular cuesta Bs 350 al mes e incluye el material.',
    },
    regla: {
        label: 'Regla',
        titleLabel: 'Nombre de la regla',
        titleHint: 'Un título corto para reconocerla en la lista.',
        titlePlaceholder: 'Nunca prometer descuentos',
        contentLabel: 'Qué debe hacer o evitar la IA',
        contentHint: 'Hablale a la IA en imperativo, como una instrucción.',
        contentPlaceholder: 'No ofrezcas rebajas que no estén cargadas como promoción activa.',
    },
    promocion: {
        label: 'Promoción',
        titleLabel: 'Nombre de la promoción',
        titleHint: '',
        titlePlaceholder: '2x1 de verano',
        contentLabel: 'En qué consiste',
        contentHint: 'Contala como se la contarías a un cliente interesado.',
        contentPlaceholder: 'Trae a un amigo e inscribite: pagan una sola mensualidad los dos.',
    },
    flujo: {
        label: 'Flujo del embudo',
        titleLabel: 'Nombre del paso',
        titleHint: 'Para reconocerlo en la lista.',
        titlePlaceholder: 'Primer contacto sin nombre',
        contentLabel: 'Guion: qué tiene que decir o hacer',
        contentHint: 'Explicá en qué situación aplica y qué debe responder la IA.',
        contentPlaceholder: 'Si todavía no sabés cómo se llama, preguntáselo antes de dar precios.',
    },
};

// Coinciden con el enum NextAction del backend.
export const NEXT_ACTIONS = [
    { value: '', label: 'Ninguna acción especial' },
    { value: 'pedir_nombre', label: 'Pedir el nombre' },
    { value: 'enviar_test_nivel', label: 'Enviar el test de nivel' },
    { value: 'ofrecer_clase_prueba', label: 'Ofrecer una clase de prueba' },
    { value: 'derivar', label: 'Derivar a una persona' },
];

export const statusMeta = (list, value) =>
    list.find((s) => s.value === value) || { value, label: value, color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700', dot: 'bg-gray-400' };

// Formatea montos en bolivianos.
export const money = (n) =>
    `Bs ${Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Normalización local de respaldo: sólo dígitos y 591 adelante si quedan 8 o menos.
// Es la MISMA regla que Services/PhoneNormalizer.cs en la API. Se conserva para
// números que todavía no pasaron por el backend (formularios sin guardar) y para
// respuestas viejas sin normalized_number.
const normalizeLocal = (number) => {
    if (!number) return null;
    const clean = String(number).replace(/\D/g, '');
    if (!clean) return null;
    return clean.length <= 8 ? `591${clean}` : clean;
};

// Construye un enlace de WhatsApp (Bolivia +591).
//
// Acepta un objeto phone de la API o un número suelto. Con el objeto usa
// `normalized_number`, que calcula el backend: así el enlace apunta a la MISMA
// conversación que el agente de WhatsApp busca con GET /prospects/by-phone,
// en vez de depender de que dos implementaciones de la regla no se separen.
export const whatsappLink = (phoneOrNumber) => {
    if (!phoneOrNumber) return null;
    const full = typeof phoneOrNumber === 'object'
        ? phoneOrNumber.normalized_number || normalizeLocal(phoneOrNumber.number)
        : normalizeLocal(phoneOrNumber);
    return full ? `https://wa.me/${full}` : null;
};

// Primer teléfono de una persona, como lo cargaron (para mostrar y buscar).
export const firstPhone = (person) => person?.phones?.[0]?.number || null;

// El objeto phone completo, para quien necesite `normalized_number`.
export const firstPhoneEntry = (person) => person?.phones?.[0] || null;

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
