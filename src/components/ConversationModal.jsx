import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import Modal from './ui/Modal';
import { shortDateTime } from '../lib/crm';
import { Bot, User, Trash2, Eraser, RefreshCw, Paperclip } from 'lucide-react';

// Visor del historial de un prospecto: lo mismo que lee el agente antes de
// contestar. Sirve para dos cosas distintas:
//
//   · Revisar que lo que se guarda esté bien. Hasta ahora el historial sólo se
//     podía mirar por consola, y es justo el dato del que depende la respuesta.
//   · Limpiar conversaciones que no son de trabajo (familia, amigos) sin borrar
//     el prospecto.
//
// ⚠️ Borrar mensajes NO evita que la IA le conteste a alguien. Eso lo decide
// "quién atiende" (assigned_to_user_id) en la fila del prospecto. Un historial
// vacío sin asignar deja al agente contestando igual, pero a ciegas — que es
// peor. El aviso está también en pantalla, no sólo acá.

const quienEscribio = (m) => {
    if (m.direction === 'entrante') return 'prospecto';
    return m.origin === 'ia' ? 'ia' : 'humano';
};

const ESTILOS = {
    prospecto: {
        fila: 'justify-start',
        burbuja: 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-tl-sm',
        etiqueta: 'El prospecto',
        color: 'text-gray-400 dark:text-gray-500',
    },
    ia: {
        fila: 'justify-end',
        burbuja: 'bg-emerald-500 text-white rounded-2xl rounded-tr-sm',
        etiqueta: 'La IA',
        color: 'text-emerald-600 dark:text-emerald-400',
    },
    humano: {
        fila: 'justify-end',
        burbuja: 'bg-blue-500 text-white rounded-2xl rounded-tr-sm',
        etiqueta: 'Respondido a mano',
        color: 'text-blue-600 dark:text-blue-400',
    },
};

const ConversationModal = ({ prospect, isOpen, onClose, onChanged }) => {
    const [mensajes, setMensajes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [borrando, setBorrando] = useState(null);
    const finRef = useRef(null);

    const prospectId = prospect?.id;

    const cargar = useCallback(async () => {
        if (!prospectId) return;
        setCargando(true);
        setError(null);
        try {
            const { data } = await api.get(`/prospects/${prospectId}/messages`);
            setMensajes(data);
        } catch (e) {
            setError('No se pudo cargar la conversación.');
            console.error(e);
        } finally {
            setCargando(false);
        }
    }, [prospectId]);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga al abrir
    useEffect(() => { if (isOpen) cargar(); }, [isOpen, cargar]);

    // Al abrir se muestra el final, que es lo último hablado. Es el orden en que
    // llega de la API (más viejo primero, como lo lee el modelo).
    useEffect(() => {
        if (!cargando && mensajes.length) finRef.current?.scrollIntoView({ block: 'end' });
    }, [cargando, mensajes.length]);

    const borrarUno = async (id) => {
        if (!window.confirm('¿Borrar este mensaje del historial?')) return;
        setBorrando(id);
        try {
            await api.delete(`/messages/${id}`);
            setMensajes((prev) => prev.filter((m) => m.id !== id));
            onChanged?.();
        } catch (e) {
            alert('No se pudo borrar el mensaje.');
            console.error(e);
        } finally {
            setBorrando(null);
        }
    };

    const borrarTodo = async () => {
        const nombre = `${prospect.person?.first_name || ''} ${prospect.person?.last_name || ''}`.trim() || 'este prospecto';
        // Dos confirmaciones y el nombre adentro: borrar el historial completo no
        // se deshace, y es una acción a un clic de distancia de "ver".
        if (!window.confirm(
            `Se van a borrar los ${mensajes.length} mensajes de ${nombre}.\n\n` +
            'El prospecto NO se borra: quedan su estado, su zona y quién lo atiende.\n' +
            'Lo que se pierde es el historial que la IA lee como contexto.\n\nEsto no se puede deshacer.',
        )) return;
        if (!window.confirm('Confirmá una vez más: ¿borrar toda la conversación?')) return;

        setBorrando('todo');
        try {
            await api.delete(`/prospects/${prospect.id}/messages`);
            setMensajes([]);
            onChanged?.();
        } catch (e) {
            alert('No se pudo borrar la conversación.');
            console.error(e);
        } finally {
            setBorrando(null);
        }
    };

    if (!prospect) return null;

    const nombre = `${prospect.person?.first_name || ''} ${prospect.person?.last_name || ''}`.trim() || 'Sin nombre';
    const atendidaPorPersona = prospect.assigned_to_user_id != null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Conversación · ${nombre}`} maxWidth="max-w-2xl">
            <div className="flex flex-col gap-4">
                {/* Quién atiende: es el dato que de verdad decide si la IA responde. */}
                <div className={`flex items-start gap-2 text-xs rounded-xl px-3 py-2 border ${
                    atendidaPorPersona
                        ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300'
                        : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                }`}>
                    {atendidaPorPersona ? <User size={14} className="mt-0.5 shrink-0" /> : <Bot size={14} className="mt-0.5 shrink-0" />}
                    <span>
                        {atendidaPorPersona
                            ? 'Lo atiende una persona: la IA no le responde a este número.'
                            : 'Lo atiende la IA. Para que deje de responderle, cambiá "quién atiende" en la lista de prospectos — borrar los mensajes no lo impide.'}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {cargando ? 'Cargando…' : `${mensajes.length} mensaje${mensajes.length === 1 ? '' : 's'} guardados`}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={cargar}
                            disabled={cargando}
                            className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                            <RefreshCw size={13} className={cargando ? 'animate-spin' : ''} /> Actualizar
                        </button>
                        {mensajes.length > 0 && (
                            <button
                                onClick={borrarTodo}
                                disabled={borrando === 'todo'}
                                className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                            >
                                <Eraser size={13} /> {borrando === 'todo' ? 'Borrando…' : 'Limpiar historial'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2.5 max-h-[55vh] overflow-y-auto pr-1 -mr-1">
                    {error && <p className="text-sm text-red-600 dark:text-red-400 text-center py-6">{error}</p>}

                    {!error && !cargando && mensajes.length === 0 && (
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
                            Sin mensajes guardados todavía.
                        </p>
                    )}

                    {mensajes.map((m) => {
                        const quien = quienEscribio(m);
                        const est = ESTILOS[quien];
                        const adjunto = m.media_asset_id || m.whatsapp_media_url;
                        return (
                            <div key={m.id} className={`flex ${est.fila} group`}>
                                <div className="max-w-[80%] flex flex-col gap-1">
                                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide ${est.color} ${quien === 'prospecto' ? '' : 'justify-end'}`}>
                                        <span>{est.etiqueta}</span>
                                        <span className="font-normal normal-case tracking-normal text-gray-400 dark:text-gray-500">
                                            {shortDateTime(m.created_at)}
                                        </span>
                                        <button
                                            onClick={() => borrarUno(m.id)}
                                            disabled={borrando === m.id}
                                            title="Borrar este mensaje"
                                            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-gray-400 hover:text-red-500 disabled:opacity-40"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <div className={`px-3.5 py-2 text-sm whitespace-pre-wrap break-words ${est.burbuja}`}>
                                        {m.content || <span className="italic opacity-70">(sin texto)</span>}
                                        {adjunto && (
                                            <span className="flex items-center gap-1 mt-1.5 text-[11px] opacity-80">
                                                <Paperclip size={11} /> con archivo adjunto
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={finRef} />
                </div>
            </div>
        </Modal>
    );
};

export default ConversationModal;
