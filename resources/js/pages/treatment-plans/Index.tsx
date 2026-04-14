import {
    store as storePlan,
    update as updatePlan,
    updateItem as updatePlanItem,
} from '@/wayfinder/actions/App/Http/Controllers/TreatmentPlanController';
import AppLayout from '@/layouts/AppLayout';
import { Link, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { PlusIcon, ChevronDownIcon, CheckCircleIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';

const fmt = (n: number) => `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
const ic = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';

const STATUS_PLAN: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-600',
    active:    'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-500',
};
const STATUS_ITEM: Record<string, string> = {
    pending:     'bg-amber-100 text-amber-800',
    in_progress: 'bg-blue-100 text-blue-700',
    completed:   'bg-green-100 text-green-800',
    skipped:     'bg-slate-100 text-slate-500',
};
const STATUS_ITEM_ICON: Record<string, React.ReactNode> = {
    completed:   <CheckCircleIcon className="w-4 h-4 text-green-600" />,
    in_progress: <ClockIcon className="w-4 h-4 text-blue-500" />,
    skipped:     <XMarkIcon className="w-4 h-4 text-slate-400" />,
};

interface PlanItem {
    tooth_number: string;
    procedure_name: string;
    estimated_fee: number;
    sequence: number;
}

function PlanCard({ plan, canEdit }: { plan: any; canEdit: boolean }) {
    const [open, setOpen] = useState(false);
    const total = plan.items?.reduce((s: number, i: any) => s + Number(i.estimated_fee), 0) ?? 0;
    const done  = plan.items?.filter((i: any) => i.status === 'completed').length ?? 0;
    const pct   = plan.items?.length ? Math.round((done / plan.items.length) * 100) : 0;

    // FIX: use Wayfinder typed updatePlanItem action instead of hardcoded router.put URL
    const setItemStatus = (itemId: number, status: string) => {
        router.put(updatePlanItem({ plan: plan.id, item: itemId }).url, { status }, { preserveState: true });
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Plan header */}
            <div className="px-5 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800 text-sm truncate">{plan.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_PLAN[plan.status] ?? ''}`}>
                            {plan.status}
                        </span>
                    </div>
                    <Link href={`/patients/${plan.patient?.id}`}
                        className="text-xs text-teal-600 hover:underline">
                        {plan.patient?.last_name}, {plan.patient?.first_name}
                    </Link>
                    <span className="text-xs text-slate-400 mx-2">·</span>
                    <span className="text-xs text-slate-500">Dr. {plan.dentist?.name}</span>
                    {plan.target_completion_date && (
                        <>
                            <span className="text-xs text-slate-400 mx-2">·</span>
                            <span className="text-xs text-slate-400">Target: {plan.target_completion_date}</span>
                        </>
                    )}
                </div>
                <div className="text-right flex-shrink-0">
                    <div className="font-bold text-slate-800 text-sm">{fmt(total)}</div>
                    <div className="text-xs text-slate-400">{done}/{plan.items?.length ?? 0} done</div>
                </div>
                <button onClick={() => setOpen(v => !v)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg flex-shrink-0">
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Progress bar */}
            {plan.items?.length > 0 && (
                <div className="px-5 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">{pct}%</span>
                    </div>
                </div>
            )}

            {/* Items */}
            {open && (
                <div className="border-t border-slate-100">
                    {plan.items?.length === 0 ? (
                        <div className="px-5 py-6 text-center text-slate-400 text-sm">No procedures added yet</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {plan.items.map((item: any, idx: number) => (
                                <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold flex-shrink-0">
                                        {item.sequence ?? idx + 1}
                                    </div>
                                    {item.tooth_number && (
                                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex-shrink-0">
                                            #{item.tooth_number}
                                        </span>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-800 truncate">{item.procedure_name}</div>
                                    </div>
                                    <div className="text-sm font-medium text-slate-700 flex-shrink-0">{fmt(item.estimated_fee)}</div>
                                    {canEdit ? (
                                        <select
                                            value={item.status}
                                            onChange={e => setItemStatus(item.id, e.target.value)}
                                            className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 flex-shrink-0">
                                            {['pending','in_progress','completed','skipped'].map(s => (
                                                <option key={s} value={s}>{s.replace('_',' ')}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize flex items-center gap-1 ${STATUS_ITEM[item.status] ?? ''}`}>
                                            {STATUS_ITEM_ICON[item.status]}
                                            {item.status.replace('_',' ')}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Plan total row */}
                    {plan.items?.length > 0 && (
                        <div className="flex justify-end px-5 py-3 bg-slate-50 border-t border-slate-100">
                            <span className="text-xs text-slate-500 mr-3">Estimated Total</span>
                            <span className="text-sm font-bold text-slate-800">{fmt(total)}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const BLANK_ITEM: PlanItem = { tooth_number: '', procedure_name: '', estimated_fee: 0, sequence: 1 };

export default function TreatmentPlansIndex({ plans, patients, dentists, filters }: any) {
    const { auth } = usePage().props as any;
    const canEdit = auth?.can?.chart_teeth;
    const [showForm, setShowForm] = useState(false);
    const [items, setItems] = useState<PlanItem[]>([{ ...BLANK_ITEM }]);

    const { data, setData, submit, processing, reset } = useForm({
        patient_id:             '',
        title:                  '',
        description:            '',
        start_date:             new Date().toISOString().split('T')[0],
        target_completion_date: '',
        items:                  [{ ...BLANK_ITEM }] as PlanItem[],
    });

    const syncItems = (next: PlanItem[]) => { setItems(next); setData('items', next); };
    const addItem   = () => syncItems([...items, { ...BLANK_ITEM, sequence: items.length + 1 }]);
    const removeItem= (i: number) => syncItems(items.filter((_, idx) => idx !== i));
    const updateItem= (i: number, f: keyof PlanItem, v: any) =>
        syncItems(items.map((it, idx) => idx === i ? { ...it, [f]: v } : it));

    const totalEst = items.reduce((s, i) => s + Number(i.estimated_fee), 0);

    // FIX: use Wayfinder storePlan action instead of hardcoded '/treatment-plans'
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(storePlan(), { onSuccess: () => { reset(); setItems([{ ...BLANK_ITEM }]); setShowForm(false); } });
    };

    return (
        <AppLayout title="Treatment Plans">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="flex gap-2">
                    <select value={filters?.status ?? ''}
                        onChange={e => router.get('/treatment-plans', { ...filters, status: e.target.value }, { preserveState: true })}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">All Statuses</option>
                        {['draft','active','completed','cancelled'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                    <select value={filters?.patient_id ?? ''}
                        onChange={e => router.get('/treatment-plans', { ...filters, patient_id: e.target.value }, { preserveState: true })}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">All Patients</option>
                        {patients?.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.last_name}, {p.first_name}</option>
                        ))}
                    </select>
                </div>
                {canEdit && (
                    <button onClick={() => setShowForm(v => !v)}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                        <PlusIcon className="w-4 h-4" /> New Plan
                    </button>
                )}
            </div>

            {/* Create form */}
            {showForm && (
                <div className="bg-white rounded-xl border border-teal-200 p-5 mb-5">
                    <h3 className="font-semibold text-slate-700 mb-4">New Treatment Plan</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 mb-1 block">Patient *</label>
                                <select value={data.patient_id} onChange={e => setData('patient_id', e.target.value)} required className={ic}>
                                    <option value="">Select patient…</option>
                                    {patients?.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.last_name}, {p.first_name} ({p.patient_code})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 mb-1 block">Plan Title *</label>
                                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} required
                                    placeholder="e.g. Full Mouth Rehabilitation" className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Start Date</label>
                                <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Target Completion</label>
                                <input type="date" value={data.target_completion_date} onChange={e => setData('target_completion_date', e.target.value)} className={ic} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 mb-1 block">Notes</label>
                                <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className={ic} />
                            </div>
                        </div>

                        {/* Procedure items */}
                        <div className="mb-4">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Procedures</div>
                            <div className="space-y-2">
                                {items.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-1">
                                            <input type="number" value={item.sequence} min="1"
                                                onChange={e => updateItem(idx, 'sequence', parseInt(e.target.value)||1)}
                                                className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-teal-500" />
                                        </div>
                                        <div className="col-span-1">
                                            <input type="text" value={item.tooth_number} placeholder="#"
                                                onChange={e => updateItem(idx, 'tooth_number', e.target.value)}
                                                className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-teal-500" />
                                        </div>
                                        <div className="col-span-6">
                                            <input type="text" value={item.procedure_name} placeholder="Procedure name" required
                                                onChange={e => updateItem(idx, 'procedure_name', e.target.value)}
                                                className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500" />
                                        </div>
                                        <div className="col-span-3">
                                            <input type="number" value={item.estimated_fee} min="0" step="0.01" placeholder="Fee"
                                                onChange={e => updateItem(idx, 'estimated_fee', parseFloat(e.target.value)||0)}
                                                className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg text-right focus:outline-none focus:ring-1 focus:ring-teal-500" />
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <button type="button" onClick={() => removeItem(idx)} disabled={items.length === 1}
                                                className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30">
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <button type="button" onClick={addItem}
                                    className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-800 font-medium">
                                    <PlusIcon className="w-4 h-4" /> Add Procedure
                                </button>
                                <span className="text-sm font-bold text-slate-700">
                                    Est. Total: {fmt(totalEst)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setShowForm(false)}
                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Cancel</button>
                            <button type="submit" disabled={processing}
                                className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
                                {processing ? 'Creating…' : 'Create Plan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Plans list */}
            {plans.data?.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 text-slate-400">
                    <ClockIcon className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm">No treatment plans found</p>
                    {canEdit && <button onClick={() => setShowForm(true)} className="mt-2 text-teal-600 text-sm hover:underline">Create one →</button>}
                </div>
            ) : (
                <div className="space-y-3">
                    {plans.data?.map((plan: any) => (
                        <PlanCard key={plan.id} plan={plan} canEdit={canEdit} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {plans.links && plans.total > plans.per_page && (
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>Showing {plans.from}–{plans.to} of {plans.total}</span>
                    <div className="flex gap-1">
                        {plans.links.map((l: any, i: number) => (
                            <Link key={i} href={l.url ?? '#'}
                                className={`px-2.5 py-1 rounded text-xs ${l.active ? 'bg-teal-600 text-white' : 'hover:bg-slate-100'} ${!l.url ? 'opacity-40 pointer-events-none' : ''}`}
                                dangerouslySetInnerHTML={{ __html: l.label }} />
                        ))}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
