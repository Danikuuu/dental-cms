import AppLayout from '@/layouts/AppLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';

const fmt = (n: number) => `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const METHOD_LABEL: Record<string,string> = {
    cash:'Cash', gcash:'GCash', maya:'Maya', credit_card:'Credit Card',
    debit_card:'Debit Card', bank_transfer:'Bank Transfer', check:'Check',
};

export default function DailyCollection({ payments, date, total, breakdown_by_method }: any) {
    const [sel, setSel] = useState(date);

    const changeDate = (d: string) => {
        setSel(d);
        router.get('/reports/daily-collection', { date: d }, { preserveState: true });
    };

    const formattedDate = new Date(sel + 'T00:00').toLocaleDateString('en-PH', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <AppLayout title="Daily Collection Report">
            <div className="max-w-4xl" id="report-print">
                {/* Controls */}
                <div className="flex items-center gap-4 mb-6 flex-wrap no-print">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-600">Date:</label>
                        <input type="date" value={sel} onChange={e => changeDate(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <button onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                        <PrinterIcon className="w-4 h-4" /> Print Report
                    </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="col-span-2 bg-teal-600 rounded-xl p-4 text-white">
                        <div className="text-teal-100 text-xs mb-1">Total Collection</div>
                        <div className="text-2xl font-bold">{fmt(total)}</div>
                        <div className="text-teal-200 text-xs mt-1">{payments.length} transaction{payments.length !== 1 ? 's' : ''}</div>
                    </div>
                    {Object.entries(breakdown_by_method ?? {}).map(([method, amount]: any) => (
                        <div key={method} className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className="text-xs text-slate-500 mb-1">{METHOD_LABEL[method] ?? method}</div>
                            <div className="font-bold text-slate-800 text-lg">{fmt(amount)}</div>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-700 text-sm">{formattedDate}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Patient','Invoice #','Method','Reference','Received By','Amount'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payments.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No payments recorded for this date</td></tr>
                                ) : payments.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-800">
                                            {p.invoice?.patient?.last_name}, {p.invoice?.patient?.first_name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                                                {p.invoice?.invoice_number}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 capitalize text-xs">
                                            {(p.method ?? '').replace('_', ' ')}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 text-xs">{p.reference_number || '—'}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{p.received_by?.name}</td>
                                        <td className="px-4 py-3 font-semibold text-teal-700">{fmt(p.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {payments.length > 0 && (
                                <tfoot>
                                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                                        <td colSpan={5} className="px-4 py-3 text-sm font-bold text-slate-700 text-right">TOTAL</td>
                                        <td className="px-4 py-3 font-bold text-teal-700 text-base">{fmt(total)}</td>
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
