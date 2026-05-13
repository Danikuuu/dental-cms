import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';

const fmt = (n: number) =>
    `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const TXN_STYLE: Record<string, { cls: string; sign: string }> = {
    stock_in: { cls: 'text-green-700 bg-green-50', sign: '+' },
    stock_out: { cls: 'text-red-600 bg-red-50', sign: '−' },
    adjustment: { cls: 'text-blue-700 bg-blue-50', sign: '~' },
    expired: { cls: 'text-amber-700 bg-amber-50', sign: '×' },
    returned: { cls: 'text-purple-700 bg-purple-50', sign: '↩' },
};

export default function InventoryTransactions({ item, transactions }: any) {
    return (
        <AppLayout title={`${item.name} — Transaction Log`}>
            <div className="max-w-4xl">
                <Link
                    href="/inventory"
                    className="mb-5 flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600"
                >
                    <ArrowLeftIcon className="h-4 w-4" /> Back to Inventory
                </Link>

                {/* Item summary */}
                <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                {item.name}
                            </h2>
                            <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                                {item.category && (
                                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                                        {item.category.name}
                                    </span>
                                )}
                                {item.sku && (
                                    <span className="font-mono text-xs text-slate-400">
                                        {item.sku}
                                    </span>
                                )}
                                {item.supplier && (
                                    <span>Supplier: {item.supplier}</span>
                                )}
                                {item.storage_location && (
                                    <span>📍 {item.storage_location}</span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-slate-800">
                                {Number(item.current_stock).toFixed(2)}{' '}
                                <span className="text-base font-normal text-slate-400">
                                    {item.unit}
                                </span>
                            </div>
                            <div className="mt-0.5 text-xs text-slate-400">
                                Current stock · Value:{' '}
                                {fmt(
                                    Number(item.current_stock) *
                                        Number(item.unit_cost),
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transactions table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 px-5 py-3.5">
                        <h3 className="text-sm font-semibold text-slate-700">
                            Transaction History
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    {[
                                        'Date',
                                        'Type',
                                        'Qty',
                                        'Before',
                                        'After',
                                        'Unit Cost',
                                        'Reference',
                                        'By',
                                        'Notes',
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
                                {transactions.data?.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-4 py-10 text-center text-slate-400"
                                        >
                                            No transactions yet
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.data?.map((t: any) => {
                                        const style = TXN_STYLE[t.type] ?? {
                                            cls: 'bg-slate-100 text-slate-600',
                                            sign: '',
                                        };

                                        return (
                                            <tr
                                                key={t.id}
                                                className="hover:bg-slate-50"
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                                                    {new Date(
                                                        t.transaction_date,
                                                    ).toLocaleDateString(
                                                        'en-PH',
                                                        {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        },
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${style.cls}`}
                                                    >
                                                        {t.type.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </span>
                                                </td>
                                                <td
                                                    className={`px-4 py-3 font-bold ${style.cls.split(' ')[0]}`}
                                                >
                                                    {style.sign}
                                                    {Number(t.quantity).toFixed(
                                                        2,
                                                    )}{' '}
                                                    {item.unit}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-500">
                                                    {Number(
                                                        t.stock_before,
                                                    ).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-xs font-medium text-slate-700">
                                                    {Number(
                                                        t.stock_after,
                                                    ).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-500">
                                                    {t.unit_cost > 0
                                                        ? fmt(t.unit_cost)
                                                        : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-400">
                                                    {t.reference || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-xs whitespace-nowrap text-slate-500">
                                                    {t.performed_by?.name}
                                                </td>
                                                <td className="max-w-32 truncate px-4 py-3 text-xs text-slate-400">
                                                    {t.notes || '—'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {transactions.links && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                            <span>
                                Showing {transactions.from}–{transactions.to} of{' '}
                                {transactions.total}
                            </span>
                            <div className="flex gap-1">
                                {transactions.links.map((l: any, i: number) => (
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
        </AppLayout>
    );
}
