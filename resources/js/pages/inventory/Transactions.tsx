import AppLayout from '@/layouts/AppLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const fmt = (n: number) => `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const TXN_STYLE: Record<string, { cls: string; sign: string }> = {
    stock_in:   { cls: 'text-green-700 bg-green-50',   sign: '+' },
    stock_out:  { cls: 'text-red-600 bg-red-50',       sign: '−' },
    adjustment: { cls: 'text-blue-700 bg-blue-50',     sign: '~' },
    expired:    { cls: 'text-amber-700 bg-amber-50',   sign: '×' },
    returned:   { cls: 'text-purple-700 bg-purple-50', sign: '↩' },
};

export default function InventoryTransactions({ item, transactions }: any) {
    return (
        <AppLayout title={`${item.name} — Transaction Log`}>
            <div className="max-w-4xl">
                <Link href="/inventory" className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-5">
                    <ArrowLeftIcon className="w-4 h-4"/> Back to Inventory
                </Link>

                {/* Item summary */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">{item.name}</h2>
                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                {item.category && <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{item.category.name}</span>}
                                {item.sku && <span className="font-mono text-xs text-slate-400">{item.sku}</span>}
                                {item.supplier && <span>Supplier: {item.supplier}</span>}
                                {item.storage_location && <span>📍 {item.storage_location}</span>}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-slate-800">{Number(item.current_stock).toFixed(2)} <span className="text-base text-slate-400 font-normal">{item.unit}</span></div>
                            <div className="text-xs text-slate-400 mt-0.5">Current stock · Value: {fmt(Number(item.current_stock) * Number(item.unit_cost))}</div>
                        </div>
                    </div>
                </div>

                {/* Transactions table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-700 text-sm">Transaction History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Date','Type','Qty','Before','After','Unit Cost','Reference','By','Notes'].map(h=>(
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.data?.length===0 ? (
                                    <tr><td colSpan={9} className="px-4 py-10 text-center text-slate-400">No transactions yet</td></tr>
                                ) : transactions.data?.map((t: any) => {
                                    const style = TXN_STYLE[t.type] ?? { cls:'bg-slate-100 text-slate-600', sign:'' };
                                    return (
                                        <tr key={t.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                                                {new Date(t.transaction_date).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${style.cls}`}>
                                                    {t.type.replace('_',' ')}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-3 font-bold ${style.cls.split(' ')[0]}`}>
                                                {style.sign}{Number(t.quantity).toFixed(2)} {item.unit}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-xs">{Number(t.stock_before).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-slate-700 font-medium text-xs">{Number(t.stock_after).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-slate-500 text-xs">{t.unit_cost>0?fmt(t.unit_cost):'—'}</td>
                                            <td className="px-4 py-3 text-slate-400 text-xs">{t.reference||'—'}</td>
                                            <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{t.performed_by?.name}</td>
                                            <td className="px-4 py-3 text-slate-400 text-xs max-w-32 truncate">{t.notes||'—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {transactions.links && (
                        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span>Showing {transactions.from}–{transactions.to} of {transactions.total}</span>
                            <div className="flex gap-1">
                                {transactions.links.map((l: any, i: number) => (
                                    <Link key={i} href={l.url??'#'}
                                        className={`px-2.5 py-1 rounded text-xs ${l.active?'bg-teal-600 text-white':'hover:bg-slate-100'} ${!l.url?'opacity-40 pointer-events-none':''}`}
                                        dangerouslySetInnerHTML={{__html:l.label}} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
