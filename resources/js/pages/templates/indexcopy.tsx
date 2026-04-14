import AppLayout from '@/layouts/AppLayout';
import { useForm } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
import {
    PlusIcon, DocumentTextIcon, PrinterIcon, PencilIcon,
    Bars3Icon, TrashIcon, EyeIcon, ChevronUpIcon, ChevronDownIcon,
} from '@heroicons/react/24/outline';

const storeTemplate   = ()           => ({ url: '/templates',       method: 'post'   as const });
const updateTemplate  = (id: number) => ({ url: `/templates/${id}`, method: 'put'    as const });

const TYPES = [
    { v: 'prescription',       l: 'Prescription' },
    { v: 'dental_certificate', l: 'Dental Certificate' },
    { v: 'consent_form',       l: 'Consent Form' },
    { v: 'referral_letter',    l: 'Referral Letter' },
    { v: 'medical_certificate',l: 'Medical Certificate' },
    { v: 'treatment_plan',     l: 'Treatment Plan' },
    { v: 'custom',             l: 'Custom' },
];

const PLACEHOLDERS = [
    '{{patient_name}}','{{patient_age}}','{{patient_address}}','{{patient_phone}}',
    '{{date}}','{{dentist_name}}','{{dentist_license}}',
    '{{clinic_name}}','{{clinic_address}}','{{clinic_phone}}',
];

const SAMPLE: Record<string, string> = {
    '{{patient_name}}':    'Juan Dela Cruz',
    '{{patient_age}}':     '35',
    '{{patient_address}}': '123 Rizal St., Quezon City',
    '{{patient_phone}}':   '09171234567',
    '{{date}}':            new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }),
    '{{dentist_name}}':    'Dr. Maria Santos',
    '{{dentist_license}}': 'PRC-0123456',
    '{{clinic_name}}':     'Santos Dental Clinic',
    '{{clinic_address}}':  '123 Dental St., Quezon City, Metro Manila',
    '{{clinic_phone}}':    '(02) 8123-4567',
};

function fillSample(html: string) {
    return Object.entries(SAMPLE).reduce((s, [k, v]) => s.replaceAll(k, v), html);
}

// ── Block system ─────────────────────────────────────────────────────────────

type Block = { id: string; label: string; html: string };

const PALETTE_BLOCKS: Omit<Block, 'id'>[] = [
    { label: 'Clinic Header',    html: `<div style="text-align:center;border-bottom:2px solid #333;padding-bottom:16px;margin-bottom:24px"><h2 style="margin:0">{{clinic_name}}</h2><p style="margin:4px 0;font-size:13px">{{clinic_address}} | {{clinic_phone}}</p><p style="margin:4px 0;font-size:13px">{{dentist_name}} | PRC Lic. No. {{dentist_license}}</p></div>` },
    { label: 'Patient Info Row', html: `<div style="margin-bottom:20px"><strong>Patient:</strong> {{patient_name}} &nbsp;&nbsp; <strong>Age:</strong> {{patient_age}}<br><strong>Date:</strong> {{date}}</div>` },
    { label: 'Rx Box',           html: `<div style="border:1px solid #ccc;padding:16px;min-height:120px;margin-bottom:20px"><p style="font-size:18px;font-weight:bold;margin-top:0">Rx</p><p style="color:#666;font-style:italic">[Write medications here]</p></div>` },
    { label: 'Signature Line',   html: `<div style="margin-top:60px;text-align:right"><div style="display:inline-block;border-top:1px solid #333;padding-top:4px;min-width:200px;text-align:center">{{dentist_name}}<br><span style="font-size:12px">Signature over Printed Name</span></div></div>` },
    { label: 'Certificate Body', html: `<p style="margin-top:32px;text-align:left;line-height:2">This is to certify that <strong>{{patient_name}}</strong>, {{patient_age}} years old, has been examined and found to be <strong>DENTALLY FIT</strong> as of <strong>{{date}}</strong>.</p>` },
    { label: 'Consent Paragraph',html: `<p>I, <strong>{{patient_name}}</strong>, hereby give my consent to {{dentist_name}} and staff of {{clinic_name}} to perform the necessary dental procedures as discussed.</p>` },
    { label: 'Patient Signature',html: `<div style="margin-top:40px;display:flex;justify-content:space-between"><div style="min-width:200px;border-top:1px solid #333;text-align:center;padding-top:4px">Patient Signature</div><div style="min-width:140px;border-top:1px solid #333;text-align:center;padding-top:4px">Date: {{date}}</div></div>` },
    { label: 'Divider',          html: `<hr style="margin:24px 0;border:none;border-top:1px solid #ddd">` },
    { label: 'Spacer',           html: `<div style="height:32px"></div>` },
    { label: 'Custom HTML',      html: `<div>[Custom content here]</div>` },
];

function uid() { return Math.random().toString(36).slice(2, 9); }

function htmlToBlocks(html: string): Block[] {
    // Try splitting on top-level div/p/hr tags as a best-effort parse
    // Wrap each matched segment as its own block
    const segments = html.match(/<(div|p|hr|h[1-6])[^>]*>[\s\S]*?<\/\1>|<hr[^>]*\/?>/gi);
    if (!segments || segments.length === 0) {
        return [{ id: uid(), label: 'Content', html }];
    }
    return segments.map((seg, i) => ({ id: uid(), label: `Block ${i + 1}`, html: seg }));
}

function blocksToHtml(blocks: Block[]): string {
    return blocks.map(b => b.html).join('\n');
}

// ── Drag-and-drop block editor ────────────────────────────────────────────────

function BlockEditor({ blocks, onChange }: { blocks: Block[]; onChange: (b: Block[]) => void }) {
    const [editingId, setEditingId]   = useState<string | null>(null);
    const [editHtml,  setEditHtml]    = useState('');
    const dragIdx                     = useRef<number | null>(null);
    const dragOverIdx                 = useRef<number | null>(null);

    const addFromPalette = (tpl: Omit<Block, 'id'>) => {
        onChange([...blocks, { ...tpl, id: uid() }]);
    };

    const removeBlock = (id: string) => onChange(blocks.filter(b => b.id !== id));

    const moveBlock = (from: number, to: number) => {
        const next = [...blocks];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        onChange(next);
    };

    const startEdit = (b: Block) => { setEditingId(b.id); setEditHtml(b.html); };

    const saveEdit = () => {
        onChange(blocks.map(b => b.id === editingId ? { ...b, html: editHtml } : b));
        setEditingId(null);
    };

    const insertPlaceholder = (p: string) => setEditHtml(h => h + p);

    const onDragStart = (i: number) => { dragIdx.current = i; };
    const onDragOver  = (e: React.DragEvent, i: number) => { e.preventDefault(); dragOverIdx.current = i; };
    const onDrop      = () => {
        if (dragIdx.current !== null && dragOverIdx.current !== null && dragIdx.current !== dragOverIdx.current) {
            moveBlock(dragIdx.current, dragOverIdx.current);
        }
        dragIdx.current = dragOverIdx.current = null;
    };

    return (
        <div className="flex gap-4 h-full">
            {/* Palette */}
            <div className="w-48 flex-shrink-0">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Blocks</div>
                <div className="flex flex-col gap-1.5">
                    {PALETTE_BLOCKS.map(tpl => (
                        <button key={tpl.label} type="button"
                            onClick={() => addFromPalette(tpl)}
                            className="text-left text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-1.5">
                            <PlusIcon className="w-3 h-3 flex-shrink-0 text-slate-400" />
                            {tpl.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Canvas — drag to reorder</div>

                {blocks.length === 0 && (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl h-40 flex items-center justify-center text-slate-400 text-sm">
                        Click a block from the left to add it here
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {blocks.map((block, i) => (
                        <div key={block.id}
                            draggable
                            onDragStart={() => onDragStart(i)}
                            onDragOver={e => onDragOver(e, i)}
                            onDrop={onDrop}
                            className="group border border-slate-200 rounded-lg bg-white overflow-hidden hover:border-teal-300 transition-colors cursor-grab active:cursor-grabbing">

                            {/* Block toolbar */}
                            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Bars3Icon className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-xs font-medium text-slate-600">{block.label}</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => i > 0 && moveBlock(i, i - 1)}
                                        disabled={i === 0}
                                        className="p-0.5 rounded hover:bg-slate-200 disabled:opacity-30">
                                        <ChevronUpIcon className="w-3.5 h-3.5 text-slate-500" />
                                    </button>
                                    <button type="button" onClick={() => i < blocks.length - 1 && moveBlock(i, i + 1)}
                                        disabled={i === blocks.length - 1}
                                        className="p-0.5 rounded hover:bg-slate-200 disabled:opacity-30">
                                        <ChevronDownIcon className="w-3.5 h-3.5 text-slate-500" />
                                    </button>
                                    <button type="button" onClick={() => startEdit(block)}
                                        className="p-0.5 rounded hover:bg-teal-100 text-teal-600">
                                        <PencilIcon className="w-3.5 h-3.5" />
                                    </button>
                                    <button type="button" onClick={() => removeBlock(block.id)}
                                        className="p-0.5 rounded hover:bg-red-100 text-red-500">
                                        <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Block preview */}
                            {editingId === block.id ? (
                                <div className="p-3">
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {PLACEHOLDERS.map(p => (
                                            <button key={p} type="button" onClick={() => insertPlaceholder(p)}
                                                className="text-xs px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded font-mono hover:bg-teal-100 border border-teal-100">
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                    <textarea value={editHtml} onChange={e => setEditHtml(e.target.value)}
                                        rows={6}
                                        className="w-full px-2 py-1.5 text-xs font-mono border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y" />
                                    <div className="flex gap-2 mt-2 justify-end">
                                        <button type="button" onClick={() => setEditingId(null)}
                                            className="text-xs px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50">
                                            Cancel
                                        </button>
                                        <button type="button" onClick={saveEdit}
                                            className="text-xs px-3 py-1.5 bg-teal-600 text-white rounded hover:bg-teal-700">
                                            Save Block
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="px-3 py-2 text-xs text-slate-400 font-mono truncate max-h-10 overflow-hidden leading-5">
                                    {block.html.replace(/<[^>]+>/g, ' ').trim().slice(0, 120)}…
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Live preview */}
            <div className="w-72 flex-shrink-0">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <EyeIcon className="w-3.5 h-3.5" /> Live Preview
                </div>
                <div className="border border-slate-200 rounded-xl bg-white overflow-auto max-h-[600px] p-4 text-sm shadow-inner">
                    <div dangerouslySetInnerHTML={{ __html: fillSample(blocksToHtml(blocks)) }} />
                    {blocks.length === 0 && (
                        <p className="text-slate-300 text-xs text-center mt-8">Preview appears here</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TemplatesIndex({ templates }: any) {
    const [view,     setView]     = useState<'list' | 'create' | 'edit' | 'preview'>('list');
    const [selected, setSelected] = useState<any>(null);
    const [preview,  setPreview]  = useState('');
    const [blocks,   setBlocks]   = useState<Block[]>([]);

    const { data, setData, submit, processing, reset } = useForm({
        name: '', type: 'prescription', content: '', description: '',
    });

    const openCreate = () => {
        reset();
        setBlocks([]);
        setSelected(null);
        setView('create');
    };

    const openEdit = (t: any) => {
        setData({ name: t.name, type: t.type, content: t.content, description: t.description ?? '' });
        setBlocks(htmlToBlocks(t.content));
        setSelected(t);
        setView('edit');
    };

    const openPreview = (t: any) => {
        setSelected(t);
        setPreview(fillSample(t.content));
        setView('preview');
    };

    // Sync blocks → content field whenever blocks change
    const handleBlocksChange = (next: Block[]) => {
        setBlocks(next);
        setData('content', blocksToHtml(next));
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setData('content', blocksToHtml(blocks));
        submit(storeTemplate(), { onSuccess: () => { reset(); setBlocks([]); setView('list'); } });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        setData('content', blocksToHtml(blocks));
        submit(updateTemplate(selected.id), { onSuccess: () => { reset(); setBlocks([]); setView('list'); } });
    };

    const printPreview = () => {
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<!DOCTYPE html><html><head><title>${selected?.name ?? 'Print'}</title><style>body{margin:0;padding:32px;font-family:serif;max-width:600px;margin:auto;}</style></head><body>${preview}</body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => { w.print(); w.close(); }, 300);
    };

    const ic = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';

    const FormHeader = ({ title, onSubmit, submitLabel }: { title: string; onSubmit: (e: React.FormEvent) => void; submitLabel: string }) => (
        <form onSubmit={onSubmit}>
            {/* Meta fields */}
            <div className="grid grid-cols-3 gap-3 mb-5 p-5 bg-white border border-slate-200 rounded-xl">
                <div>
                    <label className="text-xs text-slate-500 mb-1 block">Template Name *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required className={ic} />
                </div>
                <div>
                    <label className="text-xs text-slate-500 mb-1 block">Type</label>
                    <select value={data.type} onChange={e => setData('type', e.target.value)} className={ic}>
                        {TYPES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-500 mb-1 block">Description</label>
                    <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className={ic} />
                </div>
            </div>

            {/* Drag-and-drop builder */}
            <div className="mb-5">
                <BlockEditor blocks={blocks} onChange={handleBlocksChange} />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setView('list')}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                    Cancel
                </button>
                <button type="submit" disabled={processing}
                    className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                    {processing ? 'Saving…' : submitLabel}
                </button>
            </div>
        </form>
    );

    return (
        <AppLayout title="Templates & Forms">
            <div className="max-w-7xl">

                {/* List */}
                {view === 'list' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button onClick={openCreate}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                                <PlusIcon className="w-4 h-4" /> New Template
                            </button>
                        </div>

                        {templates?.length === 0 ? (
                            <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 text-slate-400">
                                <DocumentTextIcon className="w-12 h-12 mb-3 opacity-30" />
                                <p className="text-sm">No templates yet</p>
                                <button onClick={openCreate} className="mt-2 text-teal-600 text-sm hover:underline">Create your first template →</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {templates.map((t: any) => (
                                    <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div>
                                                <div className="font-semibold text-slate-800 text-sm">{t.name}</div>
                                                <span className="inline-block mt-1 text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded capitalize">
                                                    {t.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {t.is_default && (
                                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded flex-shrink-0">Default</span>
                                            )}
                                        </div>
                                        {t.description && <p className="text-xs text-slate-400 mb-3">{t.description}</p>}
                                        <div className="flex gap-2 mt-3">
                                            <button onClick={() => openPreview(t)}
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-700 text-xs rounded-lg hover:bg-slate-100">
                                                <PrinterIcon className="w-3.5 h-3.5" /> Preview & Print
                                            </button>
                                            <button onClick={() => openEdit(t)}
                                                className="flex items-center justify-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-50">
                                                <PencilIcon className="w-3.5 h-3.5" /> Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Create */}
                {view === 'create' && (
                    <div>
                        <h3 className="font-semibold text-slate-700 mb-4">New Template</h3>
                        <FormHeader title="New Template" onSubmit={submitCreate} submitLabel="Save Template" />
                    </div>
                )}

                {/* Edit */}
                {view === 'edit' && (
                    <div>
                        <h3 className="font-semibold text-slate-700 mb-4">Edit — {selected?.name}</h3>
                        <FormHeader title="Edit Template" onSubmit={submitEdit} submitLabel="Update Template" />
                    </div>
                )}

                {/* Preview */}
                {view === 'preview' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-slate-700">{selected?.name}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Preview with sample data</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setView('list')}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                                    ← Back
                                </button>
                                <button onClick={printPreview}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">
                                    <PrinterIcon className="w-4 h-4" /> Print / Save PDF
                                </button>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-4 py-2 rounded-lg mb-4">
                            Showing sample data. When printing from a patient record the placeholders are replaced with real data.
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 overflow-auto p-8 max-w-2xl">
                            <div dangerouslySetInnerHTML={{ __html: preview }} />
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}