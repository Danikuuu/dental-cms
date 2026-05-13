import { PrinterIcon } from '@heroicons/react/24/outline';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';

const fmt = (n: number) =>
    `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
const fmtD = (d: string) =>
    new Date(d + 'T00:00').toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
const STATUS_PILL: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-teal-100 text-teal-700',
    in_progress: 'bg-amber-100 text-amber-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-600',
    no_show: 'bg-slate-100 text-slate-500',
};

export default function PatientVisits({
    appointments,
    from,
    to,
    summary,
}: any) {
    const [dateFrom, setDateFrom] = useState(from);
    const [dateTo, setDateTo] = useState(to);
    const apply = () =>
        router.get(
            '/reports/patient-visits',
            { from: dateFrom, to: dateTo },
            { preserveState: true },
        );

    return (
        <AppLayout title="Patient Visits Report">
            <div className="max-w-6xl" id="report-print">
                {/* Controls */}
                <div className="no-print mb-6 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-slate-600">
                            From
                        </label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-slate-600">
                            To
                        </label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={apply}
                        className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
                    >
                        Apply
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        <PrinterIcon className="h-4 w-4" /> Print
                    </button>
                </div>

                {/* Summary cards */}
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {[
                        {
                            label: 'Total Visits',
                            value: summary.total,
                            cls: 'bg-teal-600 text-white',
                            vc: 'text-white',
                            lc: 'text-teal-100',
                        },
                        {
                            label: 'Completed',
                            value: summary.completed,
                            cls: 'bg-white border border-slate-200',
                            vc: 'text-slate-800',
                            lc: 'text-slate-500',
                        },
                        {
                            label: 'Cancelled',
                            value: summary.cancelled,
                            cls: 'bg-white border border-slate-200',
                            vc: 'text-slate-800',
                            lc: 'text-slate-500',
                        },
                        {
                            label: 'No Show',
                            value: summary.no_show,
                            cls: 'bg-white border border-slate-200',
                            vc: 'text-slate-800',
                            lc: 'text-slate-500',
                        },
                        {
                            label: 'Total Revenue',
                            value: fmt(summary.total_revenue),
                            cls: 'bg-green-600 text-white',
                            vc: 'text-white',
                            lc: 'text-green-100',
                        },
                    ].map((c) => (
                        <div
                            key={c.label}
                            className={`rounded-xl p-4 ${c.cls}`}
                        >
                            <div className={`mb-1 text-xs ${c.lc}`}>
                                {c.label}
                            </div>
                            <div className={`text-xl font-bold ${c.vc}`}>
                                {c.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Period label */}
                <div className="mb-3 text-sm text-slate-500">
                    {fmtD(from)} — {fmtD(to)}
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    {[
                                        'Date & Time',
                                        'Patient',
                                        'Dentist',
                                        'Chief Complaint',
                                        'Duration',
                                        'Status',
                                        'Billed',
                                        'Paid',
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
                                {appointments.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-12 text-center text-slate-400"
                                        >
                                            No appointments found for this
                                            period
                                        </td>
                                    </tr>
                                ) : (
                                    appointments.map((a: any) => (
                                        <tr
                                            key={a.id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="font-medium text-slate-800">
                                                    {new Date(
                                                        a.scheduled_at,
                                                    ).toLocaleDateString(
                                                        'en-PH',
                                                        {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {new Date(
                                                        a.scheduled_at,
                                                    ).toLocaleTimeString(
                                                        'en-PH',
                                                        {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        },
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/patients/${a.patient?.id}`}
                                                    className="text-sm font-medium text-slate-800 hover:text-teal-700"
                                                >
                                                    {a.patient?.last_name},{' '}
                                                    {a.patient?.first_name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-xs whitespace-nowrap text-slate-500">
                                                {a.dentist?.name}
                                            </td>
                                            <td className="max-w-xs truncate px-4 py-3 text-xs text-slate-600">
                                                {a.chief_complaint || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs whitespace-nowrap text-slate-500">
                                                {a.duration_minutes}m
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_PILL[a.status] ?? ''}`}
                                                >
                                                    {a.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs whitespace-nowrap text-slate-600">
                                                {a.patient_total_billed > 0
                                                    ? fmt(
                                                          a.patient_total_billed,
                                                      )
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-medium whitespace-nowrap text-green-700">
                                                {a.patient_total_paid > 0
                                                    ? fmt(a.patient_total_paid)
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {appointments.length > 0 && (
                                <tfoot>
                                    <tr className="border-t-2 border-slate-200 bg-slate-50">
                                        <td
                                            colSpan={6}
                                            className="px-4 py-3 text-right text-xs font-bold text-slate-600"
                                        >
                                            PERIOD TOTALS
                                        </td>
                                        <td className="px-4 py-3 text-xs font-bold text-slate-700">
                                            {fmt(
                                                appointments.reduce(
                                                    (s: number, a: any) =>
                                                        s +
                                                        (a.patient_total_billed ||
                                                            0),
                                                    0,
                                                ),
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-bold text-green-700">
                                            {fmt(summary.total_revenue)}
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
