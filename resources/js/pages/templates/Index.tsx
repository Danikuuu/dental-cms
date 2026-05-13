import {
    PlusIcon,
    DocumentTextIcon,
    PrinterIcon,
    PencilIcon,
} from '@heroicons/react/24/outline';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';

// Inline route helpers — no Wayfinder dependency
const storeTemplate = () => ({ url: '/templates', method: 'post' as const });
const updateTemplate = (id: number) => ({
    url: `/templates/${id}`,
    method: 'put' as const,
});

const TYPES = [
    { v: 'prescription', l: 'Prescription' },
    { v: 'dental_certificate', l: 'Dental Certificate' },
    { v: 'consent_form', l: 'Consent Form' },
    { v: 'referral_letter', l: 'Referral Letter' },
    { v: 'medical_certificate', l: 'Medical Certificate' },
    { v: 'treatment_plan', l: 'Treatment Plan' },
    { v: 'custom', l: 'Custom' },
];

const PLACEHOLDERS = [
    '{{patient_name}}',
    '{{patient_age}}',
    '{{patient_address}}',
    '{{patient_phone}}',
    '{{date}}',
    '{{dentist_name}}',
    '{{dentist_license}}',
    '{{clinic_name}}',
    '{{clinic_address}}',
    '{{clinic_phone}}',
];

const SAMPLE: Record<string, string> = {
    '{{patient_name}}': 'Juan Dela Cruz',
    '{{patient_age}}': '35',
    '{{patient_address}}': '123 Rizal St., Quezon City',
    '{{patient_phone}}': '09171234567',
    '{{date}}': new Date().toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }),
    '{{dentist_name}}': 'Dr. Maria Santos',
    '{{dentist_license}}': 'PRC-0123456',
    '{{clinic_name}}': 'Santos Dental Clinic',
    '{{clinic_address}}': '123 Dental St., Quezon City, Metro Manila',
    '{{clinic_phone}}': '(02) 8123-4567',
};

function fillSample(html: string) {
    return Object.entries(SAMPLE).reduce(
        (s, [k, v]) => s.replaceAll(k, v),
        html,
    );
}

function TemplateForm({
    data,
    setData,
    processing,
    onCancel,
    onSubmit,
    submitLabel,
}: {
    data: any;
    setData: (key: string, value: any) => void;
    processing: boolean;
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
}) {
    const ic =
        'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';

    return (
        <form onSubmit={onSubmit}>
            <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-xs text-slate-600">
                        Name *
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        className={ic}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-slate-600">
                        Type
                    </label>
                    <select
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        className={ic}
                    >
                        {TYPES.map((t) => (
                            <option key={t.v} value={t.v}>
                                {t.l}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="mb-1 block text-xs text-slate-600">
                        Description
                    </label>
                    <input
                        type="text"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        className={ic}
                    />
                </div>
            </div>

            <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs text-slate-600">
                        Content (HTML) *
                    </label>
                    <div className="text-xs text-slate-400">
                        Click placeholder to insert:
                    </div>
                </div>
                <div className="mb-2 flex flex-wrap gap-1">
                    {PLACEHOLDERS.map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setData('content', data.content + p)}
                            className="rounded border border-teal-100 bg-teal-50 px-2 py-0.5 font-mono text-xs text-teal-700 hover:bg-teal-100"
                        >
                            {p}
                        </button>
                    ))}
                </div>
                <textarea
                    value={data.content}
                    onChange={(e) => setData('content', e.target.value)}
                    required
                    rows={18}
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
            </div>

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-teal-600 px-5 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                >
                    {processing ? 'Saving…' : submitLabel}
                </button>
            </div>
        </form>
    );
}

export default function TemplatesIndex({ templates }: any) {
    const [view, setView] = useState<'list' | 'create' | 'edit' | 'preview'>(
        'list',
    );
    const [selected, setSelected] = useState<any>(null);
    const [preview, setPreview] = useState('');

    const { data, setData, submit, processing, reset } = useForm({
        name: '',
        type: 'prescription',
        content: '',
        description: '',
    });

    const openCreate = () => {
        reset();
        setView('create');
        setSelected(null);
    };

    const openEdit = (t: any) => {
        setData({
            name: t.name,
            type: t.type,
            content: t.content,
            description: t.description ?? '',
        });
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
        submit(storeTemplate(), {
            onSuccess: () => {
                reset();
                setView('list');
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selected) {
            return;
        }

        submit(updateTemplate(selected.id), {
            onSuccess: () => {
                reset();
                setView('list');
            },
        });
    };

    const printPreview = () => {
        const w = window.open('', '_blank');

        if (!w) {
            return;
        }

        w.document.write(
            `<!DOCTYPE html><html><head><title>${selected?.name ?? 'Print'}</title><style>body{margin:0;padding:0;font-family:serif;}</style></head><body>${preview}</body></html>`,
        );
        w.document.close();
        w.focus();
        setTimeout(() => {
            w.print();
            w.close();
        }, 300);
    };

    return (
        <AppLayout title="Templates & Forms">
            <div className="max-w-5xl">
                {/* List view */}
                {view === 'list' && (
                    <div>
                        <div className="mb-4 flex justify-end">
                            <button
                                onClick={openCreate}
                                className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                            >
                                <PlusIcon className="h-4 w-4" /> New Template
                            </button>
                        </div>

                        {templates?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-slate-400">
                                <DocumentTextIcon className="mb-3 h-12 w-12 opacity-30" />
                                <p className="text-sm">No templates yet</p>
                                <button
                                    onClick={openCreate}
                                    className="mt-2 text-sm text-teal-600 hover:underline"
                                >
                                    Create your first template →
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {templates.map((t: any) => (
                                    <div
                                        key={t.id}
                                        className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
                                    >
                                        <div className="mb-2 flex items-start justify-between gap-2">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-800">
                                                    {t.name}
                                                </div>
                                                <span className="mt-1 inline-block rounded bg-teal-50 px-2 py-0.5 text-xs text-teal-700 capitalize">
                                                    {t.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {t.is_default && (
                                                <span className="flex-shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        {t.description && (
                                            <p className="mb-3 text-xs text-slate-400">
                                                {t.description}
                                            </p>
                                        )}
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                onClick={() => openPreview(t)}
                                                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                                            >
                                                <PrinterIcon className="h-3.5 w-3.5" />{' '}
                                                Preview & Print
                                            </button>
                                            <button
                                                onClick={() => openEdit(t)}
                                                className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                                            >
                                                <PencilIcon className="h-3.5 w-3.5" />{' '}
                                                Edit
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
                    <div className="rounded-xl border border-slate-200 bg-white p-6">
                        <h3 className="mb-5 font-semibold text-slate-700">
                            New Template
                        </h3>
                        <TemplateForm
                            data={data}
                            setData={setData}
                            processing={processing}
                            onCancel={() => setView('list')}
                            onSubmit={submitCreate}
                            submitLabel="Save Template"
                        />
                    </div>
                )}

                {/* Edit */}
                {view === 'edit' && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6">
                        <h3 className="mb-5 font-semibold text-slate-700">
                            Edit — {selected?.name}
                        </h3>
                        <TemplateForm
                            data={data}
                            setData={setData}
                            processing={processing}
                            onCancel={() => setView('list')}
                            onSubmit={submitEdit}
                            submitLabel="Update Template"
                        />
                    </div>
                )}

                {/* Preview */}
                {view === 'preview' && (
                    <div>
                        <div className="no-print mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-700">
                                    {selected?.name}
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    Preview with sample data
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setView('list')}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={printPreview}
                                    className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
                                >
                                    <PrinterIcon className="h-4 w-4" /> Print /
                                    Save PDF
                                </button>
                            </div>
                        </div>
                        <div className="no-print mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
                            Showing sample data. When printing from a patient
                            record the placeholders are replaced with real data.
                        </div>
                        <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
                            <div
                                dangerouslySetInnerHTML={{ __html: preview }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
