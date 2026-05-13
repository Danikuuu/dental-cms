import { XMarkIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import {
    storeProvider,
    storePatientInsurance,
    storeClaim,
    updateClaim,
} from '@/wayfinder/actions/App/Http/Controllers/InsuranceController';

const fmt = (n: number | string) =>
    `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
const ic =
    'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';

const CLAIM_STATUS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    submitted: 'bg-blue-100 text-blue-700',
    approved: 'bg-teal-100 text-teal-700',
    partial: 'bg-purple-100 text-purple-700',
    rejected: 'bg-red-100 text-red-600',
    paid: 'bg-green-100 text-green-800',
};

export default function InsuranceIndex({
    claims,
    providers,
    stats,
    filters,
}: any) {
    const [tab, setTab] = useState<
        'claims' | 'providers' | 'add-policy' | 'add-claim'
    >('claims');
    const [editClaim, setEditClaim] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');

    const providerForm = useForm({
        name: '',
        code: '',
        contact_number: '',
        email: '',
        address: '',
        covered_procedures: '',
    });

    const policyForm = useForm({
        patient_id: '',
        provider_id: '',
        policy_number: '',
        member_id: '',
        group_number: '',
        effective_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        coverage_limit: 0,
        notes: '',
    });

    const claimForm = useForm({
        patient_insurance_id: '',
        invoice_id: '',
        claim_date: new Date().toISOString().split('T')[0],
        claimed_amount: 0,
        notes: '',
    });

    const updateForm = useForm({
        status: '',
        approved_amount: 0,
        rejected_amount: 0,
        claim_number: '',
        submission_date: '',
        approval_date: '',
        payment_date: '',
        rejection_reason: '',
        notes: '',
    });

    const openUpdateClaim = (claim: any) => {
        setEditClaim(claim);
        updateForm.setData({
            status: claim.status,
            approved_amount: Number(claim.approved_amount) || 0,
            rejected_amount: Number(claim.rejected_amount) || 0,
            claim_number: claim.claim_number ?? '',
            submission_date: claim.submission_date ?? '',
            approval_date: claim.approval_date ?? '',
            payment_date: claim.payment_date ?? '',
            rejection_reason: claim.rejection_reason ?? '',
            notes: claim.notes ?? '',
        });
    };

    return (
        <AppLayout title="Insurance">
            {/* Stats */}
            <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                    {
                        label: 'Pending',
                        value: stats.pending,
                        cls: 'bg-amber-50 border border-amber-200 text-amber-800',
                    },
                    {
                        label: 'Submitted',
                        value: stats.submitted,
                        cls: 'bg-blue-50 border border-blue-200 text-blue-800',
                    },
                    {
                        label: 'Approved',
                        value: stats.approved,
                        cls: 'bg-teal-50 border border-teal-200 text-teal-800',
                    },
                    {
                        label: 'Total Approved',
                        value: fmt(stats.total_approved_amount),
                        cls: 'bg-green-50 border border-green-200 text-green-800',
                    },
                ].map((s) => (
                    <div key={s.label} className={`rounded-xl p-4 ${s.cls}`}>
                        <div className="mb-1 text-xs opacity-70">{s.label}</div>
                        <div className="text-xl font-bold">{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Tab bar */}
            <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
                {(
                    ['claims', 'providers', 'add-policy', 'add-claim'] as const
                ).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap capitalize transition-all ${tab === t ? 'bg-teal-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                    >
                        {t.replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* Claims tab */}
            {tab === 'claims' && (
                <div>
                    {/* Filter */}
                    <div className="mb-4 flex flex-wrap gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                router.get(
                                    '/insurance',
                                    { ...filters, status: e.target.value },
                                    { preserveState: true },
                                );
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        >
                            <option value="">All Statuses</option>
                            {Object.keys(CLAIM_STATUS).map((s) => (
                                <option
                                    key={s}
                                    value={s}
                                    className="capitalize"
                                >
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        {[
                                            'Patient',
                                            'Provider',
                                            'Policy #',
                                            'Claim Date',
                                            'Claimed',
                                            'Approved',
                                            'Status',
                                            '',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {claims.data?.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-4 py-12 text-center text-slate-400"
                                            >
                                                No claims found
                                            </td>
                                        </tr>
                                    ) : (
                                        claims.data?.map((c: any) => (
                                            <tr
                                                key={c.id}
                                                className="hover:bg-slate-50"
                                            >
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={`/patients/${c.patient?.id}`}
                                                        className="text-sm font-medium text-slate-800 hover:text-teal-700"
                                                    >
                                                        {c.patient?.last_name},{' '}
                                                        {c.patient?.first_name}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-600">
                                                    {
                                                        c.insurance?.provider
                                                            ?.name
                                                    }
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                                    {c.insurance?.policy_number}
                                                </td>
                                                <td className="px-4 py-3 text-xs whitespace-nowrap text-slate-500">
                                                    {c.claim_date}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-slate-700">
                                                    {fmt(c.claimed_amount)}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-green-700">
                                                    {c.approved_amount
                                                        ? fmt(c.approved_amount)
                                                        : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${CLAIM_STATUS[c.status] ?? ''}`}
                                                    >
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() =>
                                                            openUpdateClaim(c)
                                                        }
                                                        className="text-xs text-teal-600 hover:underline"
                                                    >
                                                        Update
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {claims.links && (
                            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                                <span>
                                    Showing {claims.from}–{claims.to} of{' '}
                                    {claims.total}
                                </span>
                                <div className="flex gap-1">
                                    {claims.links.map((l: any, i: number) => (
                                        <Link
                                            key={i}
                                            href={l.url ?? '#'}
                                            className={`rounded px-2.5 py-1 text-xs ${l.active ? 'bg-teal-600 text-white' : 'hover:bg-slate-100'} ${!l.url ? 'pointer-events-none opacity-40' : ''}`}
                                            dangerouslySetInnerHTML={{
                                                __html: l.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Update claim modal */}
            {editClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-700">
                                Update Claim #{editClaim.id}
                            </h3>
                            <button onClick={() => setEditClaim(null)}>
                                <XMarkIcon className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                updateForm.submit(updateClaim(editClaim.id), {
                                    onSuccess: () => setEditClaim(null),
                                });
                            }}
                        >
                            <div className="mb-4 grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Status *
                                    </label>
                                    <select
                                        value={updateForm.data.status}
                                        onChange={(e) =>
                                            updateForm.setData(
                                                'status',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        className={ic}
                                    >
                                        {Object.keys(CLAIM_STATUS).map((s) => (
                                            <option
                                                key={s}
                                                value={s}
                                                className="capitalize"
                                            >
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Approved Amount (₱)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={updateForm.data.approved_amount}
                                        onChange={(e) =>
                                            updateForm.setData(
                                                'approved_amount',
                                                Number(e.target.value),
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Claim Number
                                    </label>
                                    <input
                                        type="text"
                                        value={updateForm.data.claim_number}
                                        onChange={(e) =>
                                            updateForm.setData(
                                                'claim_number',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Submission Date
                                    </label>
                                    <input
                                        type="date"
                                        value={updateForm.data.submission_date}
                                        onChange={(e) =>
                                            updateForm.setData(
                                                'submission_date',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Payment Date
                                    </label>
                                    <input
                                        type="date"
                                        value={updateForm.data.payment_date}
                                        onChange={(e) =>
                                            updateForm.setData(
                                                'payment_date',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                                {updateForm.data.status === 'rejected' && (
                                    <div className="col-span-2">
                                        <label className="mb-1 block text-xs text-slate-500">
                                            Rejection Reason
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                updateForm.data.rejection_reason
                                            }
                                            onChange={(e) =>
                                                updateForm.setData(
                                                    'rejection_reason',
                                                    e.target.value,
                                                )
                                            }
                                            className={ic}
                                        />
                                    </div>
                                )}
                                <div className="col-span-2">
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Notes
                                    </label>
                                    <input
                                        type="text"
                                        value={updateForm.data.notes}
                                        onChange={(e) =>
                                            updateForm.setData(
                                                'notes',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditClaim(null)}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateForm.processing}
                                    className="rounded-lg bg-teal-600 px-5 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                                >
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
                    <div className="mb-5 rounded-xl border border-teal-200 bg-white p-5">
                        <h3 className="mb-4 font-semibold text-slate-700">
                            Add Insurance Provider
                        </h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                providerForm.submit(storeProvider(), {
                                    onSuccess: () => providerForm.reset(),
                                });
                            }}
                        >
                            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <div className="col-span-2">
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Provider Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={providerForm.data.name}
                                        required
                                        onChange={(e) =>
                                            providerForm.setData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Code
                                    </label>
                                    <input
                                        type="text"
                                        value={providerForm.data.code}
                                        onChange={(e) =>
                                            providerForm.setData(
                                                'code',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Contact
                                    </label>
                                    <input
                                        type="text"
                                        value={providerForm.data.contact_number}
                                        onChange={(e) =>
                                            providerForm.setData(
                                                'contact_number',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={providerForm.data.email}
                                        onChange={(e) =>
                                            providerForm.setData(
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="submit"
                                    disabled={providerForm.processing}
                                    className="rounded-lg bg-teal-600 px-5 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                                >
                                    {providerForm.processing
                                        ? 'Saving…'
                                        : 'Add Provider'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-100 px-5 py-3.5">
                            <h3 className="text-sm font-semibold text-slate-700">
                                Active Providers ({providers?.length ?? 0})
                            </h3>
                        </div>
                        {providers?.length === 0 ? (
                            <div className="py-10 text-center text-sm text-slate-400">
                                No providers added yet
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {providers.map((p: any) => (
                                    <div
                                        key={p.id}
                                        className="flex items-start gap-4 px-5 py-4"
                                    >
                                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-teal-100">
                                            <ShieldExclamationIcon className="h-5 w-5 text-teal-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-800">
                                                {p.name}
                                            </div>
                                            {p.code && (
                                                <div className="font-mono text-xs text-slate-400">
                                                    {p.code}
                                                </div>
                                            )}
                                            {p.contact_number && (
                                                <div className="mt-0.5 text-xs text-slate-500">
                                                    {p.contact_number}
                                                </div>
                                            )}
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
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-5 font-semibold text-slate-700">
                        Add Patient Insurance Policy
                    </h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            policyForm.submit(storePatientInsurance(), {
                                onSuccess: () => policyForm.reset(),
                            });
                        }}
                    >
                        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Patient ID *
                                </label>
                                <input
                                    type="number"
                                    value={policyForm.data.patient_id}
                                    required
                                    onChange={(e) =>
                                        policyForm.setData(
                                            'patient_id',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                    placeholder="Patient ID"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Provider *
                                </label>
                                <select
                                    value={policyForm.data.provider_id}
                                    required
                                    onChange={(e) =>
                                        policyForm.setData(
                                            'provider_id',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                >
                                    <option value="">Select provider…</option>
                                    {providers?.map((p: any) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Policy Number *
                                </label>
                                <input
                                    type="text"
                                    value={policyForm.data.policy_number}
                                    required
                                    onChange={(e) =>
                                        policyForm.setData(
                                            'policy_number',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Member ID
                                </label>
                                <input
                                    type="text"
                                    value={policyForm.data.member_id}
                                    onChange={(e) =>
                                        policyForm.setData(
                                            'member_id',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Effective Date *
                                </label>
                                <input
                                    type="date"
                                    value={policyForm.data.effective_date}
                                    required
                                    onChange={(e) =>
                                        policyForm.setData(
                                            'effective_date',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Expiry Date
                                </label>
                                <input
                                    type="date"
                                    value={policyForm.data.expiry_date}
                                    onChange={(e) =>
                                        policyForm.setData(
                                            'expiry_date',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Coverage Limit (₱) *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={policyForm.data.coverage_limit}
                                    required
                                    onChange={(e) =>
                                        policyForm.setData(
                                            'coverage_limit',
                                            Number(e.target.value),
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="submit"
                                disabled={policyForm.processing}
                                className="rounded-lg bg-teal-600 px-5 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                            >
                                {policyForm.processing
                                    ? 'Saving…'
                                    : 'Add Policy'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Add claim tab */}
            {tab === 'add-claim' && (
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-5 font-semibold text-slate-700">
                        File Insurance Claim
                    </h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            claimForm.submit(storeClaim(), {
                                onSuccess: () => {
                                    claimForm.reset();
                                    setTab('claims');
                                },
                            });
                        }}
                    >
                        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Patient Insurance ID *
                                </label>
                                <input
                                    type="number"
                                    value={claimForm.data.patient_insurance_id}
                                    required
                                    onChange={(e) =>
                                        claimForm.setData(
                                            'patient_insurance_id',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                    placeholder="Policy ID"
                                />
                                <p className="mt-0.5 text-xs text-slate-400">
                                    Found on patient's insurance policy record
                                </p>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Invoice ID *
                                </label>
                                <input
                                    type="number"
                                    value={claimForm.data.invoice_id}
                                    required
                                    onChange={(e) =>
                                        claimForm.setData(
                                            'invoice_id',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                    placeholder="Invoice ID"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Claim Date *
                                </label>
                                <input
                                    type="date"
                                    value={claimForm.data.claim_date}
                                    required
                                    onChange={(e) =>
                                        claimForm.setData(
                                            'claim_date',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Claimed Amount (₱) *
                                </label>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={claimForm.data.claimed_amount}
                                    required
                                    onChange={(e) =>
                                        claimForm.setData(
                                            'claimed_amount',
                                            Number(e.target.value),
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs text-slate-500">
                                    Notes
                                </label>
                                <input
                                    type="text"
                                    value={claimForm.data.notes}
                                    onChange={(e) =>
                                        claimForm.setData(
                                            'notes',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="submit"
                                disabled={claimForm.processing}
                                className="rounded-lg bg-teal-600 px-5 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                            >
                                {claimForm.processing
                                    ? 'Filing…'
                                    : 'File Claim'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AppLayout>
    );
}
