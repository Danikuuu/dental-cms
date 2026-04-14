import AppLayout from '@/layouts/AppLayout';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { PlusIcon, DocumentTextIcon, PrinterIcon, PencilIcon } from '@heroicons/react/24/outline';

// Inline route helpers — no Wayfinder dependency
const storeTemplate   = ()           => ({ url: '/templates',        method: 'post'   as const });
const updateTemplate  = (id: number) => ({ url: `/templates/${id}`,  method: 'put'    as const });
const destroyTemplate = (id: number) => ({ url: `/templates/${id}`,  method: 'delete' as const });

const TYPES = [
    { v: 'prescription',      l: 'Prescription' },
    { v: 'dental_certificate',l: 'Dental Certificate' },
    { v: 'consent_form',      l: 'Consent Form' },
    { v: 'referral_letter',   l: 'Referral Letter' },
    { v: 'medical_certificate',l:'Medical Certificate' },
    { v: 'treatment_plan',    l: 'Treatment Plan' },
    { v: 'custom',            l: 'Custom' },
];

const PLACEHOLDERS = [
    '{{patient_name}}','{{patient_age}}','{{patient_address}}','{{patient_phone}}',
    '{{date}}','{{dentist_name}}','{{dentist_license}}',
    '{{clinic_name}}','{{clinic_address}}','{{clinic_phone}}',
];

const SAMPLE: Record<string,string> = {
    '{{patient_name}}':    'Juan Dela Cruz',
    '{{patient_age}}':     '35',
    '{{patient_address}}': '123 Rizal St., Quezon City',
    '{{patient_phone}}':   '09171234567',
    '{{date}}':            new Date().toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'}),
    '{{dentist_name}}':    'Dr. Maria Santos',
    '{{dentist_license}}': 'PRC-0123456',
    '{{clinic_name}}':     'Santos Dental Clinic',
    '{{clinic_address}}':  '123 Dental St., Quezon City, Metro Manila',
    '{{clinic_phone}}':    '(02) 8123-4567',
};

function fillSample(html: string) {
    return Object.entries(SAMPLE).reduce((s,[k,v]) => s.replaceAll(k,v), html);
}

export default function TemplatesIndex({ templates }: any) {
    const [view,      setView]      = useState<'list'|'create'|'edit'|'preview'>('list');
    const [selected,  setSelected]  = useState<any>(null);
    const [preview,   setPreview]   = useState('');

    const { data, setData, submit, processing, reset } = useForm({
        name: '', type: 'prescription', content: '', description: '',
    });

    const openCreate = () => {
        reset();
        setView('create');
        setSelected(null);
    };

    const openEdit = (t: any) => {
        setData({ name: t.name, type: t.type, content: t.content, description: t.description ?? '' });
        setSelected(t);
        setView('edit');
    };

    const openPreview = (t: any) => {
        setSelected(t);
        setPreview(fillSample(t.content));
        setView('preview');
    };

    // FIX: use Wayfinder typed actions instead of hardcoded URL strings
    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        submit(storeTemplate(), { onSuccess: () => { reset(); setView('list'); } });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        submit(updateTemplate(selected.id), { onSuccess: () => { reset(); setView('list'); } });
    };

    const printPreview = () => {
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<!DOCTYPE html><html><head><title>${selected?.name ?? 'Print'}</title><style>body{margin:0;padding:0;font-family:serif;}</style></head><body>${preview}</body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => { w.print(); w.close(); }, 300);
    };

    const ic = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';

    const Form = ({ onSubmit, submitLabel }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string }) => (
        <form onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-xs text-slate-600 mb-1 block">Name *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required className={ic} />
                </div>
                <div>
                    <label className="text-xs text-slate-600 mb-1 block">Type</label>
                    <select value={data.type} onChange={e => setData('type', e.target.value)} className={ic}>
                        {TYPES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="text-xs text-slate-600 mb-1 block">Description</label>
                    <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className={ic} />
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-slate-600">Content (HTML) *</label>
                    <div className="text-xs text-slate-400">Click placeholder to insert:</div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                    {PLACEHOLDERS.map(p => (
                        <button key={p} type="button"
                            onClick={() => setData('content', data.content + p)}
                            className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 rounded font-mono hover:bg-teal-100 border border-teal-100">
                            {p}
                        </button>
                    ))}
                </div>
                <textarea value={data.content} onChange={e => setData('content', e.target.value)} required
                    rows={18}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
            </div>

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
            <div className="max-w-5xl">
                {/* List view */}
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
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-700 mb-5">New Template</h3>
                        <Form onSubmit={submitCreate} submitLabel="Save Template" />
                    </div>
                )}

                {/* Edit */}
                {view === 'edit' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-700 mb-5">Edit — {selected?.name}</h3>
                        <Form onSubmit={submitEdit} submitLabel="Update Template" />
                    </div>
                )}

                {/* Preview */}
                {view === 'preview' && (
                    <div>
                        <div className="flex items-center justify-between mb-4 no-print">
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
                        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-4 py-2 rounded-lg mb-4 no-print">
                            Showing sample data. When printing from a patient record the placeholders are replaced with real data.
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 overflow-auto">
                            <div dangerouslySetInnerHTML={{ __html: preview }} />
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}