import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';

const STATUS: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    sent: 'bg-blue-100 text-blue-700',
    partial: 'bg-amber-100 text-amber-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-400',
};
const fmt = (n: number) =>
    `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export default function BillingIndex({ invoices, filters }: any) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');

    return (
        <AppLayout title="Billing & Invoices">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 gap-2">
                    <div className="relative max-w-xs flex-1">
                        <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' &&
                                router.get(
                                    '/billing',
                                    { search, status },
                                    { preserveState: true },
                                )
                            }
                            placeholder="Invoice # or patient name…"
                            className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            router.get(
                                '/billing',
                                { search, status: e.target.value },
                                { preserveState: true },
                            );
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                        <option value="">All Statuses</option>
                        {[
                            'draft',
                            'sent',
                            'partial',
                            'paid',
                            'overdue',
                            'cancelled',
                        ].map((s) => (
                            <option key={s} value={s} className="capitalize">
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
                <Link
                    href="/billing/create"
                    className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                    <PlusIcon className="h-4 w-4" /> New Invoice
                </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                {[
                                    'Invoice #',
                                    'Patient',
                                    'Date',
                                    'Total',
                                    'Paid',
                                    'Balance',
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
                            {invoices.data?.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-12 text-center text-slate-400"
                                    >
                                        No invoices found
                                    </td>
                                </tr>
                            ) : (
                                invoices.data?.map((inv: any) => (
                                    <tr
                                        key={inv.id}
                                        className="transition-colors hover:bg-slate-50"
                                    >
                                        <td className="px-4 py-3">
                                            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                                                {inv.invoice_number}
                                            </span>
                                            {inv.or_number && (
                                                <div className="mt-0.5 text-xs text-slate-400">
                                                    OR: {inv.or_number}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/patients/${inv.patient?.id}`}
                                                className="font-medium text-slate-800 hover:text-teal-700"
                                            >
                                                {inv.patient?.last_name},{' '}
                                                {inv.patient?.first_name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-xs whitespace-nowrap text-slate-500">
                                            {inv.invoice_date}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-800">
                                            {fmt(inv.total_amount)}
                                        </td>
                                        <td className="px-4 py-3 text-green-700">
                                            {fmt(inv.amount_paid)}
                                        </td>
                                        <td
                                            className={`px-4 py-3 font-medium ${Number(inv.balance) > 0 ? 'text-red-600' : 'text-slate-400'}`}
                                        >
                                            {fmt(inv.balance)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS[inv.status] ?? ''}`}
                                            >
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/billing/${inv.id}`}
                                                className="text-xs text-teal-600 hover:underline"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {invoices.links && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                        <span>
                            Showing {invoices.from}–{invoices.to} of{' '}
                            {invoices.total}
                        </span>
                        <div className="flex gap-1">
                            {invoices.links.map((l: any, i: number) => (
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
        </AppLayout>
    );
}
