import {
    storeProvider,
    storePatientInsurance,
    storeClaim,
    updateClaim,
} from '@/wayfinder/actions/App/Http/Controllers/InsuranceController';
import AppLayout from '@/layouts/AppLayout';
import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { PlusIcon, XMarkIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

const fmt = (n: number | string) => `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
const ic  = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';

const CLAIM_STATUS: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-800',
    submitted: 'bg-blue-100 text-blue-700',
    approved:  'bg-teal-100 text-teal-700',
    partial:   'bg-purple-100 text-purple-700',
    rejected:  'bg-red-100 text-red-600',
    paid:      'bg-green-100 text-green-800',
};

export default function InsuranceIndex({ claims, providers, stats, filters }: any) {
    const [tab, setTab]               = useState<'claims'|'providers'|'add-policy'|'add-claim'>('claims');
    const [editClaim, setEditClaim]   = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');

    const providerForm = useForm({
        name: '', code: '', contact_number: '', email: '', address: '', covered_procedures: '',
    });

    const policyForm = useForm({
        patient_id:     '',
        provider_id:    '',
        policy_number:  '',
        member_id:      '',
        group_number:   '',
        effective_date: new Date().toISOString().split('T')[0],
        expiry_date:    '',
        coverage_limit: 0,
        notes:          '',
    });

    const claimForm = useForm({
        patient_insurance_id: '',
        invoice_id:           '',
        claim_date:           new Date().toISOString().split('T')[0],
        claimed_amount:       0,
        notes:                '',
    });

    const updateForm = useForm({
        status:           '',
        approved_amount:  0,
        rejected_amount:  0,
        claim_number:     '',
        submission_date:  '',
        approval_date:    '',
        payment_date:     '',
        rejection_reason: '',
        notes:            '',
    });

    const openUpdateClaim = (claim: any) => {
        setEditClaim(claim);
        updateForm.setData({
            status:           claim.status,
            approved_amount:  Number(claim.approved_amount) || 0,
            rejected_amount:  Number(claim.rejected_amount) || 0,
            claim_number:     claim.claim_number ?? '',
            submission_date:  claim.submission_date ?? '',
            approval_date:    claim.approval_date ?? '',
            payment_date:     claim.payment_date ?? '',
            rejection_reason: claim.rejection_reason ?? '',
            notes:            claim.notes ?? '',
        });
    };

    return (
        <AppLayout title="Insurance">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {[
                    { label: 'Pending',   value: stats.pending,   cls: 'bg-amber-50 border border-amber-200 text-amber-800' },
                    { label: 'Submitted', value: stats.submitted, cls: 'bg-blue-50 border border-blue-200 text-blue-800' },
                    { label: 'Approved',  value: stats.approved,  cls: 'bg-teal-50 border border-teal-200 text-teal-800' },
                    { label: 'Total Approved', value: fmt(stats.total_approved_amount), cls: 'bg-green-50 border border-green-200 text-green-800' },
                ].map(s => (
                    <div key={s.label} className={`rounded-xl p-4 ${s.cls}`}>
                        <div className="text-xs mb-1 opacity-70">{s.label}</div>
                        <div className="text-xl font-bold">{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-5 overflow-x-auto">
                {(['claims','providers','add-policy','add-claim'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap capitalize
                            ${tab === t ? 'bg-teal-600 text-white shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                        {t.replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* Claims tab */}
            {tab === 'claims' && (
                <div>
                    {/* Filter */}
                    <div className="flex gap-3 mb-4 flex-wrap">
                        <select value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); router.get('/insurance', { ...filters, status: e.target.value }, { preserveState: true }); }}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                            <option value="">All Statuses</option>
                            {Object.keys(CLAIM_STATUS).map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                        </select>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        {['Patient','Provider','Policy #','Claim Date','Claimed','Approved','Status',''].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {claims.data?.length === 0 ? (
                                        <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">No claims found</td></tr>
                                    ) : claims.data?.map((c: any) => (
                                        <tr key={c.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <Link href={`/patients/${c.patient?.id}`} className="font-medium text-slate-800 hover:text-teal-700 text-sm">
                                                    {c.patient?.last_name}, {c.patient?.first_name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 text-xs">{c.insurance?.provider?.name}</td>
                                            <td className="px-4 py-3 text-slate-500 text-xs font-mono">{c.insurance?.policy_number}</td>
                                            <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{c.claim_date}</td>
                                            <td className="px-4 py-3 text-slate-700 font-medium">{fmt(c.claimed_amount)}</td>
                                            <td className="px-4 py-3 text-green-700 font-medium">{c.approved_amount ? fmt(c.approved_amount) : '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${CLAIM_STATUS[c.status] ?? ''}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => openUpdateClaim(c)}
                                                    className="text-xs text-teal-600 hover:underline">Update</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {claims.links && (
                            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <span>Showing {claims.from}–{claims.to} of {claims.total}</span>
                                <div className="flex gap-1">
                                    {claims.links.map((l: any, i: number) => (
                                        <Link key={i} href={l.url ?? '#'}
                                            className={`px-2.5 py-1 rounded text-xs ${l.active ? 'bg-teal-600 text-white' : 'hover:bg-slate-100'} ${!l.url ? 'opacity-40 pointer-events-none' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: l.label }} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Update claim modal */}
            {editClaim && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-700">Update Claim #{editClaim.id}</h3>
                            <button onClick={() => setEditClaim(null)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={e => {
                            e.preventDefault();
                            updateForm.submit(updateClaim(editClaim.id), {
                                onSuccess: () => setEditClaim(null),
                            });
                        }}>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="col-span-2">
                                    <label className="text-xs text-slate-500 mb-1 block">Status *</label>
                                    <select value={updateForm.data.status} onChange={e => updateForm.setData('status', e.target.value)} required className={ic}>
                                        {Object.keys(CLAIM_STATUS).map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Approved Amount (₱)</label>
                                    <input type="number" min="0" step="0.01" value={updateForm.data.approved_amount}
                                        onChange={e => updateForm.setData('approved_amount', Number(e.target.value))} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Claim Number</label>
                                    <input type="text" value={updateForm.data.claim_number}
                                        onChange={e => updateForm.setData('claim_number', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Submission Date</label>
                                    <input type="date" value={updateForm.data.submission_date}
                                        onChange={e => updateForm.setData('submission_date', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Payment Date</label>
                                    <input type="date" value={updateForm.data.payment_date}
                                        onChange={e => updateForm.setData('payment_date', e.target.value)} className={ic} />
                                </div>
                                {updateForm.data.status === 'rejected' && (
                                    <div className="col-span-2">
                                        <label className="text-xs text-slate-500 mb-1 block">Rejection Reason</label>
                                        <input type="text" value={updateForm.data.rejection_reason}
                                            onChange={e => updateForm.setData('rejection_reason', e.target.value)} className={ic} />
                                    </div>
                                )}
                                <div className="col-span-2">
                                    <label className="text-xs text-slate-500 mb-1 block">Notes</label>
                                    <input type="text" value={updateForm.data.notes}
                                        onChange={e => updateForm.setData('notes', e.target.value)} className={ic} />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setEditClaim(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Cancel</button>
                                <button type="submit" disabled={updateForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                    {updateForm.processing ? 'Saving…' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Providers tab */}
            {tab === 'providers' && (
                <div>
                    <div className="bg-white border border-teal-200 rounded-xl p-5 mb-5">
                        <h3 className="font-semibold text-slate-700 mb-4">Add Insurance Provider</h3>
                        <form onSubmit={e => { e.preventDefault(); providerForm.submit(storeProvider(), { onSuccess: () => providerForm.reset() }); }}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                                <div className="col-span-2">
                                    <label className="text-xs text-slate-500 mb-1 block">Provider Name *</label>
                                    <input type="text" value={providerForm.data.name} required onChange={e => providerForm.setData('name', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Code</label>
                                    <input type="text" value={providerForm.data.code} onChange={e => providerForm.setData('code', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Contact</label>
                                    <input type="text" value={providerForm.data.contact_number} onChange={e => providerForm.setData('contact_number', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Email</label>
                                    <input type="email" value={providerForm.data.email} onChange={e => providerForm.setData('email', e.target.value)} className={ic} />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button type="submit" disabled={providerForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                    {providerForm.processing ? 'Saving…' : 'Add Provider'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-700 text-sm">Active Providers ({providers?.length ?? 0})</h3>
                        </div>
                        {providers?.length === 0 ? (
                            <div className="py-10 text-center text-slate-400 text-sm">No providers added yet</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {providers.map((p: any) => (
                                    <div key={p.id} className="px-5 py-4 flex items-start gap-4">
                                        <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                                            <ShieldExclamationIcon className="w-5 h-5 text-teal-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-800 text-sm">{p.name}</div>
                                            {p.code && <div className="text-xs text-slate-400 font-mono">{p.code}</div>}
                                            {p.contact_number && <div className="text-xs text-slate-500 mt-0.5">{p.contact_number}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add policy tab */}
            {tab === 'add-policy' && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="font-semibold text-slate-700 mb-5">Add Patient Insurance Policy</h3>
                    <form onSubmit={e => { e.preventDefault(); policyForm.submit(storePatientInsurance(), { onSuccess: () => policyForm.reset() }); }}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Patient ID *</label>
                                <input type="number" value={policyForm.data.patient_id} required onChange={e => policyForm.setData('patient_id', e.target.value)} className={ic} placeholder="Patient ID" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Provider *</label>
                                <select value={policyForm.data.provider_id} required onChange={e => policyForm.setData('provider_id', e.target.value)} className={ic}>
                                    <option value="">Select provider…</option>
                                    {providers?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Policy Number *</label>
                                <input type="text" value={policyForm.data.policy_number} required onChange={e => policyForm.setData('policy_number', e.target.value)} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Member ID</label>
                                <input type="text" value={policyForm.data.member_id} onChange={e => policyForm.setData('member_id', e.target.value)} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Effective Date *</label>
                                <input type="date" value={policyForm.data.effective_date} required onChange={e => policyForm.setData('effective_date', e.target.value)} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Expiry Date</label>
                                <input type="date" value={policyForm.data.expiry_date} onChange={e => policyForm.setData('expiry_date', e.target.value)} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Coverage Limit (₱) *</label>
                                <input type="number" min="0" step="0.01" value={policyForm.data.coverage_limit} required onChange={e => policyForm.setData('coverage_limit', Number(e.target.value))} className={ic} />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="submit" disabled={policyForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                {policyForm.processing ? 'Saving…' : 'Add Policy'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Add claim tab */}
            {tab === 'add-claim' && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="font-semibold text-slate-700 mb-5">File Insurance Claim</h3>
                    <form onSubmit={e => { e.preventDefault(); claimForm.submit(storeClaim(), { onSuccess: () => { claimForm.reset(); setTab('claims'); } }); }}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Patient Insurance ID *</label>
                                <input type="number" value={claimForm.data.patient_insurance_id} required onChange={e => claimForm.setData('patient_insurance_id', e.target.value)} className={ic} placeholder="Policy ID" />
                                <p className="text-xs text-slate-400 mt-0.5">Found on patient's insurance policy record</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Invoice ID *</label>
                                <input type="number" value={claimForm.data.invoice_id} required onChange={e => claimForm.setData('invoice_id', e.target.value)} className={ic} placeholder="Invoice ID" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Claim Date *</label>
                                <input type="date" value={claimForm.data.claim_date} required onChange={e => claimForm.setData('claim_date', e.target.value)} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Claimed Amount (₱) *</label>
                                <input type="number" min="0.01" step="0.01" value={claimForm.data.claimed_amount} required onChange={e => claimForm.setData('claimed_amount', Number(e.target.value))} className={ic} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 mb-1 block">Notes</label>
                                <input type="text" value={claimForm.data.notes} onChange={e => claimForm.setData('notes', e.target.value)} className={ic} />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="submit" disabled={claimForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                {claimForm.processing ? 'Filing…' : 'File Claim'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AppLayout>
    );
}
