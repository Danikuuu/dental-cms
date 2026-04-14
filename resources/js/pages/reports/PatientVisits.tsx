import AppLayout from '@/layouts/AppLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';

const fmt   = (n: number) => `₱${Number(n).toLocaleString('en-PH',{minimumFractionDigits:2})}`;
const fmtD  = (d: string) => new Date(d+'T00:00').toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});
const STATUS_PILL: Record<string,string> = {
    scheduled:'bg-blue-100 text-blue-700', confirmed:'bg-teal-100 text-teal-700',
    in_progress:'bg-amber-100 text-amber-800', completed:'bg-green-100 text-green-800',
    cancelled:'bg-red-100 text-red-600', no_show:'bg-slate-100 text-slate-500',
};

export default function PatientVisits({ appointments, from, to, summary }: any) {
    const [dateFrom, setDateFrom] = useState(from);
    const [dateTo,   setDateTo]   = useState(to);
    const apply = () => router.get('/reports/patient-visits', { from: dateFrom, to: dateTo }, { preserveState: true });

    return (
        <AppLayout title="Patient Visits Report">
            <div className="max-w-6xl" id="report-print">
                {/* Controls */}
                <div className="flex items-center gap-3 mb-6 flex-wrap no-print">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-slate-600">From</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-slate-600">To</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <button onClick={apply} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">Apply</button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                        <PrinterIcon className="w-4 h-4"/> Print
                    </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                    {[
                        { label:'Total Visits',    value: summary.total,               cls:'bg-teal-600 text-white',    vc:'text-white',    lc:'text-teal-100' },
                        { label:'Completed',       value: summary.completed,           cls:'bg-white border border-slate-200', vc:'text-slate-800', lc:'text-slate-500' },
                        { label:'Cancelled',       value: summary.cancelled,           cls:'bg-white border border-slate-200', vc:'text-slate-800', lc:'text-slate-500' },
                        { label:'No Show',         value: summary.no_show,             cls:'bg-white border border-slate-200', vc:'text-slate-800', lc:'text-slate-500' },
                        { label:'Total Revenue',   value: fmt(summary.total_revenue),  cls:'bg-green-600 text-white',   vc:'text-white',    lc:'text-green-100' },
                    ].map(c => (
                        <div key={c.label} className={`rounded-xl p-4 ${c.cls}`}>
                            <div className={`text-xs mb-1 ${c.lc}`}>{c.label}</div>
                            <div className={`text-xl font-bold ${c.vc}`}>{c.value}</div>
                        </div>
                    ))}
                </div>

                {/* Period label */}
                <div className="mb-3 text-sm text-slate-500">
                    {fmtD(from)} — {fmtD(to)}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {['Date & Time','Patient','Dentist','Chief Complaint','Duration','Status','Billed','Paid'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {appointments.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">No appointments found for this period</td></tr>
                                ) : appointments.map((a: any) => (
                                    <tr key={a.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-slate-800 font-medium">{new Date(a.scheduled_at).toLocaleDateString('en-PH',{month:'short',day:'numeric'})}</div>
                                            <div className="text-slate-400 text-xs">{new Date(a.scheduled_at).toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'})}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link href={`/patients/${a.patient?.id}`} className="font-medium text-slate-800 hover:text-teal-700 text-sm">
                                                {a.patient?.last_name}, {a.patient?.first_name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{a.dentist?.name}</td>
                                        <td className="px-4 py-3 text-slate-600 max-w-xs truncate text-xs">{a.chief_complaint||'—'}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{a.duration_minutes}m</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${STATUS_PILL[a.status]??''}`}>
                                                {a.status.replace('_',' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">
                                            {a.patient_total_billed > 0 ? fmt(a.patient_total_billed) : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-green-700 text-xs font-medium whitespace-nowrap">
                                            {a.patient_total_paid > 0 ? fmt(a.patient_total_paid) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {appointments.length > 0 && (
                                <tfoot>
                                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                                        <td colSpan={6} className="px-4 py-3 text-xs font-bold text-slate-600 text-right">PERIOD TOTALS</td>
                                        <td className="px-4 py-3 text-xs font-bold text-slate-700">
                                            {fmt(appointments.reduce((s: number, a: any) => s + (a.patient_total_billed||0), 0))}
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
