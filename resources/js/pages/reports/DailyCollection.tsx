import { PrinterIcon } from '@heroicons/react/24/outline';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';

const fmt = (n: number) =>
    `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const METHOD_LABEL: Record<string, string> = {
    cash: 'Cash',
    gcash: 'GCash',
    maya: 'Maya',
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    bank_transfer: 'Bank Transfer',
    check: 'Check',
};

export default function DailyCollection({
    payments,
    date,
    total,
    breakdown_by_method,
}: any) {
    const [sel, setSel] = useState(date);

    const changeDate = (d: string) => {
        setSel(d);
        router.get(
            '/reports/daily-collection',
            { date: d },
            { preserveState: true },
        );
    };

    const formattedDate = new Date(sel + 'T00:00').toLocaleDateString('en-PH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <AppLayout title="Daily Collection Report">
            <div className="max-w-4xl" id="report-print">
                {/* Controls */}
                <div className="no-print mb-6 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-600">
                            Date:
                        </label>
                        <input
                            type="date"
                            value={sel}
                            onChange={(e) => changeDate(e.target.value)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        <PrinterIcon className="h-4 w-4" /> Print Report
                    </button>
                </div>

                {/* Summary cards */}
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="col-span-2 rounded-xl bg-teal-600 p-4 text-white">
                        <div className="mb-1 text-xs text-teal-100">
                            Total Collection
                        </div>
                        <div className="text-2xl font-bold">{fmt(total)}</div>
                        <div className="mt-1 text-xs text-teal-200">
                            {payments.length} transaction
                            {payments.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                    {Object.entries(breakdown_by_method ?? {}).map(
                        ([method, amount]: any) => (
                            <div
                                key={method}
                                className="rounded-xl border border-slate-200 bg-white p-4"
                            >
                                <div className="mb-1 text-xs text-slate-500">
                                    {METHOD_LABEL[method] ?? method}
                                </div>
                                <div className="text-lg font-bold text-slate-800">
                                    {fmt(amount)}
                                </div>
                            </div>
                        ),
                    )}
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 px-5 py-3.5">
                        <h3 className="text-sm font-semibold text-slate-700">
                            {formattedDate}
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    {[
                                        'Patient',
                                        'Invoice #',
                                        'Method',
                                        'Reference',
                                        'Received By',
                                        'Amount',
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
                                {payments.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-12 text-center text-slate-400"
                                        >
                                            No payments recorded for this date
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((p: any) => (
                                        <tr
                                            key={p.id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {p.invoice?.patient?.last_name},{' '}
                                                {p.invoice?.patient?.first_name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500">
                                                    {p.invoice?.invoice_number}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600 capitalize">
                                                {(p.method ?? '').replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-400">
                                                {p.reference_number || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500">
                                                {p.received_by?.name}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-teal-700">
                                                {fmt(p.amount)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {payments.length > 0 && (
                                <tfoot>
                                    <tr className="border-t-2 border-slate-200 bg-slate-50">
                                        <td
                                            colSpan={5}
                                            className="px-4 py-3 text-right text-sm font-bold text-slate-700"
                                        >
                                            TOTAL
                                        </td>
                                        <td className="px-4 py-3 text-base font-bold text-teal-700">
                                            {fmt(total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
