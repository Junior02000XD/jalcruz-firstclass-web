import { useState } from 'react';
import Modal from './ui/Modal';
import { Field, inputCls } from './ui/Form';
import { CONTEXT_TYPE_META, NEXT_ACTIONS } from '../lib/crm';
import { Image as ImageIcon, Music, Check } from 'lucide-react';

const buildForm = (editing) => ({
    title: editing?.title || '',
    content: editing?.content || '',
    active: editing?.active ?? true,
    valid_until: editing?.valid_until || '',
    restricted_zone_id: editing?.restricted_zone_id ?? '',
    conditions_text: editing?.conditions_text || '',
    next_action: editing?.next_action || '',
    handoff_to_user_id: editing?.handoff_to_user_id ?? '',
    media_asset_ids: (editing?.media || []).map((m) => m.media_asset.id),
});

// El formulario es un componente aparte y se remonta con `key` cada vez que
// cambia lo que se está editando. Así el estado inicial se calcula una sola vez
// al montar, sin un efecto que lo reinicie en cada apertura.
const EntryForm = ({ type, editing, assets, zones, users, onSave, onClose }) => {
    const [form, setForm] = useState(() => buildForm(editing));
    const [saving, setSaving] = useState(false);
    const meta = CONTEXT_TYPE_META[type];

    const toggleAsset = (id) => setForm((f) => ({
        ...f,
        media_asset_ids: f.media_asset_ids.includes(id)
            ? f.media_asset_ids.filter((x) => x !== id)
            : [...f.media_asset_ids, id],
    }));

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave({
                type,
                title: form.title,
                content: form.content,
                active: form.active,
                valid_until: form.valid_until || null,
                restricted_zone_id: form.restricted_zone_id === '' ? null : Number(form.restricted_zone_id),
                conditions_text: form.conditions_text || null,
                next_action: form.next_action || null,
                handoff_to_user_id: form.handoff_to_user_id === '' ? null : Number(form.handoff_to_user_id),
                media_asset_ids: form.media_asset_ids,
            });
        } finally { setSaving(false); }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <Field label={`${meta.titleLabel} *`} hint={meta.titleHint}>
                <input required value={form.title} placeholder={meta.titlePlaceholder}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
            </Field>

            <Field label={`${meta.contentLabel} *`} hint={meta.contentHint}>
                <textarea required rows={5} value={form.content} placeholder={meta.contentPlaceholder}
                    onChange={(e) => setForm({ ...form, content: e.target.value })} className={inputCls} />
            </Field>

            {type === 'promocion' && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Válida hasta" hint="Pasada esta fecha la IA deja de ofrecerla sola.">
                            <input type="date" value={form.valid_until}
                                onChange={(e) => setForm({ ...form, valid_until: e.target.value })} className={inputCls} />
                        </Field>
                        <Field label="Sólo para una zona" hint="Dejalo vacío si vale para todos.">
                            <select value={form.restricted_zone_id}
                                onChange={(e) => setForm({ ...form, restricted_zone_id: e.target.value })} className={inputCls}>
                                <option value="">Todas las zonas</option>
                                {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                            </select>
                        </Field>
                    </div>
                    <Field label="Condiciones" hint="La letra chica: a quiénes aplica, qué queda afuera.">
                        <textarea rows={2} value={form.conditions_text} placeholder="Sólo para matrículas nuevas."
                            onChange={(e) => setForm({ ...form, conditions_text: e.target.value })} className={inputCls} />
                    </Field>
                </div>
            )}

            {type === 'flujo' && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Qué hace después" hint="El paso siguiente del embudo.">
                        <select value={form.next_action}
                            onChange={(e) => setForm({ ...form, next_action: e.target.value })} className={inputCls}>
                            {NEXT_ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                    </Field>
                    {form.next_action === 'derivar' && (
                        <Field label="Derivar a" hint="Esa persona sigue la conversación a mano.">
                            <select value={form.handoff_to_user_id}
                                onChange={(e) => setForm({ ...form, handoff_to_user_id: e.target.value })} className={inputCls}>
                                <option value="">Elegí a alguien</option>
                                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </Field>
                    )}
                </div>
            )}

            <Field label="Archivos que puede mandar" hint="Opcional. Sólo los que ya subiste en Multimedia.">
                {assets.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500">Todavía no hay archivos subidos.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {assets.map((a) => {
                            const on = form.media_asset_ids.includes(a.id);
                            return (
                                <button
                                    type="button" key={a.id} onClick={() => toggleAsset(a.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                                        on
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                                >
                                    {on ? <Check size={14} /> : a.type === 'imagen' ? <ImageIcon size={14} /> : <Music size={14} />}
                                    {a.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </Field>

            <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                <input type="checkbox" checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 rounded accent-blue-600" />
                Activo — la IA lo usa en sus respuestas
            </label>

            <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl">Cancelar</button>
                <button type="submit" disabled={saving} className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl shadow active:scale-95 transition-all">
                    {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Guardar'}
                </button>
            </div>
        </form>
    );
};

const ContextEntryModal = ({ isOpen, onClose, onSave, type, editing, assets, zones, users }) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${editing ? 'Editar' : 'Nueva'} · ${CONTEXT_TYPE_META[type].label.toLowerCase()}`}
        maxWidth="max-w-2xl"
    >
        <EntryForm
            key={`${type}-${editing?.id ?? 'nueva'}`}
            type={type} editing={editing} assets={assets} zones={zones} users={users}
            onSave={onSave} onClose={onClose}
        />
    </Modal>
);

export default ContextEntryModal;
