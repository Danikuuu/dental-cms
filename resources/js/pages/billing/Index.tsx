import AppLayout from '@/layouts/AppLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const STATUS: Record<string,string> = {
    draft:'bg-slate-100 text-slate-600', sent:'bg-blue-100 text-blue-700',
    partial:'bg-amber-100 text-amber-800', paid:'bg-green-100 text-green-800',
    overdue:'bg-red-100 text-red-700', cancelled:'bg-slate-100 text-slate-400',
};
const fmt = (n: number) => `₱${Number(n).toLocaleString('en-PH',{minimumFractionDigits:2})}`;

export default function BillingIndex({ invoices, filters }: any) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');

    return (
        <AppLayout title="Billing & Invoices">
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="flex gap-2 flex-1">
                    <div className="relative flex-1 max-w-xs">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key==='Enter' && router.get('/billing',{search,status},{preserveState:true})}
                            placeholder="Invoice # or patient name…"
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <select value={status} onChange={e => { setStatus(e.target.value); router.get('/billing',{search,status:e.target.value},{preserveState:true}); }}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">All Statuses</option>
                        {['draft','sent','partial','paid','overdue','cancelled'].map(s=><option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                </div>
                <Link href="/billing/create" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                    <PlusIcon className="w-4 h-4" /> New Invoice
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                {['Invoice #','Patient','Date','Total','Paid','Balance','Status',''].map(h=>(
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoices.data?.length===0 ? (
                                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">No invoices found</td></tr>
                            ) : invoices.data?.map((inv: any) => (
                                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{inv.invoice_number}</span>
                                        {inv.or_number && <div className="text-xs text-slate-400 mt-0.5">OR: {inv.or_number}</div>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={`/patients/${inv.patient?.id}`} className="font-medium text-slate-800 hover:text-teal-700">
                                            {inv.patient?.last_name}, {inv.patient?.first_name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{inv.invoice_date}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{fmt(inv.total_amount)}</td>
                                    <td className="px-4 py-3 text-green-700">{fmt(inv.amount_paid)}</td>
                                    <td className={`px-4 py-3 font-medium ${Number(inv.balance)>0?'text-red-600':'text-slate-400'}`}>{fmt(inv.balance)}</td>
                                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${STATUS[inv.status]??''}`}>{inv.status}</span></td>
                                    <td className="px-4 py-3"><Link href={`/billing/${inv.id}`} className="text-teal-600 hover:underline text-xs">View</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {invoices.links && (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Showing {invoices.from}–{invoices.to} of {invoices.total}</span>
                        <div className="flex gap-1">
                            {invoices.links.map((l: any, i: number) => (
                                <Link key={i} href={l.url??'#'}
                                    className={`px-2.5 py-1 rounded text-xs ${l.active?'bg-teal-600 text-white':'hover:bg-slate-100'} ${!l.url?'opacity-40 pointer-events-none':''}`}
                                    dangerouslySetInnerHTML={{__html:l.label}} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
