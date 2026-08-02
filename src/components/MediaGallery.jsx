import { useState, useRef } from 'react';
import api from '../api/axios';
import Modal from './ui/Modal';
import { Field, inputCls, Help, Empty } from './ui/Form';
import { UploadCloud, Music, Trash2, Edit2, Loader2 } from 'lucide-react';

// Lo que la API acepta (son los formatos que WhatsApp permite enviar).
const ACCEPT = 'image/jpeg,image/png,audio/aac,audio/amr,audio/mpeg,audio/mp4,audio/ogg';

// Galería de fotos y audios que la IA puede mandar por WhatsApp.
// La transcripción es lo importante: es lo único que la IA "lee" del archivo.
const MediaGallery = ({ assets, onChanged }) => {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ label: '', transcript: '' });
    const inputRef = useRef(null);

    const upload = async (files) => {
        setError('');
        setUploading(true);
        try {
            for (const file of files) {
                const data = new FormData();
                data.append('file', file);
                // Etiqueta provisional: el nombre del archivo. Se edita después.
                data.append('label', file.name.replace(/\.[^.]+$/, ''));
                await api.post('/media', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            onChanged();
        } catch (e) {
            setError(e.response?.data?.message || 'No se pudo subir el archivo.');
        } finally {
            setUploading(false);
        }
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length) upload(files);
    };

    const openEdit = (asset) => {
        setEditing(asset);
        setForm({ label: asset.label || '', transcript: asset.transcript || '' });
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/media/${editing.id}`, { label: form.label, transcript: form.transcript || null });
            setEditing(null);
            onChanged();
        } catch { alert('No se pudo guardar.'); }
    };

    const remove = async (asset) => {
        if (!window.confirm(`¿Eliminar "${asset.label}"? También se borra el archivo y deja de estar disponible para la IA.`)) return;
        try { await api.delete(`/media/${asset.id}`); onChanged(); }
        catch { alert('No se pudo eliminar.'); }
    };

    return (
        <div className="flex flex-col gap-4">
            <Help>
                Subí las fotos y audios que la IA puede mandar a los clientes. Después de subir cada uno,
                escribí en <b>“Qué dice o qué muestra”</b> lo que contiene: <b>eso es lo único que la IA lee
                del archivo</b> para decidir cuándo mandarlo. Un audio sin esa descripción no se usa nunca.
            </Help>

            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl py-10 px-4 text-center cursor-pointer transition-colors ${
                    dragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/40'
                }`}
            >
                <input
                    ref={inputRef} type="file" accept={ACCEPT} multiple hidden
                    onChange={(e) => { const f = Array.from(e.target.files || []); if (f.length) upload(f); e.target.value = ''; }}
                />
                {uploading ? (
                    <p className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Loader2 size={18} className="animate-spin" /> Subiendo...
                    </p>
                ) : (
                    <>
                        <UploadCloud size={30} className="mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Arrastrá acá tus fotos o audios
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            o hacé clic para elegirlos · fotos hasta 5 MB, audios hasta 16 MB
                        </p>
                    </>
                )}
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-2.5">{error}</p>}

            {assets.length === 0 ? (
                <Empty>Todavía no subiste ningún archivo.</Empty>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {assets.map((a) => (
                        <div key={a.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm flex flex-col">
                            {a.type === 'imagen' ? (
                                <img src={a.url_r2} alt={a.label} className="w-full h-36 object-cover bg-gray-100 dark:bg-gray-700" />
                            ) : (
                                <div className="h-36 bg-gray-50 dark:bg-gray-700/50 flex flex-col items-center justify-center gap-2 px-4">
                                    <Music size={26} className="text-blue-500" />
                                    <audio controls src={a.url_r2} className="w-full max-w-[220px]" />
                                </div>
                            )}
                            <div className="p-3 flex-1 flex flex-col gap-1.5">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">{a.label}</p>
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={() => openEdit(a)} title="Editar" className="p-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 rounded-lg"><Edit2 size={14} /></button>
                                        <button onClick={() => remove(a)} title="Eliminar" className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 rounded-lg"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                {a.transcript ? (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">{a.transcript}</p>
                                ) : (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                        Falta describir qué dice: la IA no lo va a usar.
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar archivo" maxWidth="max-w-lg">
                <form onSubmit={saveEdit} className="space-y-4">
                    <Field label="Nombre para reconocerlo *" hint="Sólo lo ves vos en esta galería.">
                        <input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className={inputCls} />
                    </Field>
                    <Field
                        label="Qué dice o qué muestra"
                        hint="Escribilo como se lo contarías a alguien que no puede verlo ni escucharlo. Con esto la IA decide cuándo mandarlo."
                    >
                        <textarea
                            rows={4} value={form.transcript}
                            onChange={(e) => setForm({ ...form, transcript: e.target.value })}
                            className={inputCls}
                            placeholder="Ej: Audio de bienvenida: saluda, agradece el mensaje y pregunta para quién es el curso."
                        />
                    </Field>
                    <div className="flex justify-end gap-3 pt-1">
                        <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl">Cancelar</button>
                        <button type="submit" className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow active:scale-95 transition-all">Guardar</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MediaGallery;
