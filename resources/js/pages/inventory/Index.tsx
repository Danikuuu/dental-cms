import AppLayout from '@/layouts/AppLayout';
import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, XMarkIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

// Inline route helpers — no Wayfinder dependency
const storeItem         = ()           => ({ url: '/inventory',                   method: 'post'   as const });
const updateItem        = (id: number) => ({ url: `/inventory/${id}`,             method: 'put'    as const });
const recordTransaction = (id: number) => ({ url: `/inventory/${id}/transaction`, method: 'post'   as const });
const storeCategory     = ()           => ({ url: '/inventory/categories',        method: 'post'   as const });

const ic = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';
const fmt = (n: number | string) => `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export default function InventoryIndex({ items, categories, stats, filters }: any) {
    const [showAdd,    setShowAdd]    = useState(false);
    const [showTxn,   setShowTxn]    = useState<any>(null);
    const [search,    setSearch]     = useState(filters?.search ?? '');

    const addForm = useForm({
        name: '', category_id: '', sku: '', unit: 'pcs',
        minimum_stock: 0, reorder_level: 0, unit_cost: 0, unit_price: 0,
        supplier: '', supplier_contact: '', expiry_date: '', storage_location: '', notes: '',
    });

    const txnForm = useForm({ type: 'stock_in', quantity: 1, unit_cost: 0, reference: '', notes: '' });

    const handleTxnSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!showTxn) return;
        txnForm.submit(recordTransaction(showTxn.id), {
            onSuccess: () => { txnForm.reset(); setShowTxn(null); },
        });
    };

    return (
        <AppLayout title="Inventory">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {[
                    { label: 'Total Items',  value: stats.total_items,            cls: 'bg-white border border-slate-200' },
                    { label: 'Low Stock',    value: stats.low_stock,              cls: 'bg-amber-50 border border-amber-200 text-amber-800' },
                    { label: 'Critical',     value: stats.critical,               cls: 'bg-red-50 border border-red-200 text-red-700' },
                    { label: 'Total Value',  value: fmt(stats.total_value ?? 0),  cls: 'bg-teal-50 border border-teal-200 text-teal-800' },
                ].map(s => (
                    <div key={s.label} className={`rounded-xl p-4 ${s.cls}`}>
                        <div className="text-xs mb-1 opacity-70">{s.label}</div>
                        <div className="text-xl font-bold">{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="flex gap-2 flex-1">
                    <div className="relative flex-1 max-w-xs">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && router.get('/inventory', { ...filters, search }, { preserveState: true })}
                            placeholder="Search by name or SKU…"
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <select value={filters?.category_id ?? ''}
                        onChange={e => router.get('/inventory', { ...filters, category_id: e.target.value }, { preserveState: true })}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                        <option value="">All Categories</option>
                        {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button
                        onClick={() => router.get('/inventory', { ...filters, low_stock: filters?.low_stock ? '' : '1' }, { preserveState: true })}
                        className={`px-3 py-2 border rounded-lg text-sm whitespace-nowrap ${filters?.low_stock ? 'bg-amber-100 border-amber-300 text-amber-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        Low Stock
                    </button>
                </div>
                <button onClick={() => setShowAdd(v => !v)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                    <PlusIcon className="w-4 h-4" /> Add Item
                </button>
            </div>

            {/* Add form */}
            {showAdd && (
                <div className="bg-white border border-teal-200 rounded-xl p-5 mb-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-700">New Inventory Item</h3>
                        <button onClick={() => setShowAdd(false)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
                    </div>
                    <form onSubmit={e => { e.preventDefault(); addForm.submit(storeItem(), { onSuccess: () => { addForm.reset(); setShowAdd(false); } }); }}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 mb-1 block">Item Name *</label>
                                <input type="text" value={addForm.data.name} required onChange={e => addForm.setData('name', e.target.value)} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Category</label>
                                <select value={addForm.data.category_id} onChange={e => addForm.setData('category_id', e.target.value)} className={ic}>
                                    <option value="">None</option>
                                    {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Unit *</label>
                                <input type="text" value={addForm.data.unit} required onChange={e => addForm.setData('unit', e.target.value)} className={ic} placeholder="pcs, box, ml…" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Unit Cost (₱) *</label>
                                <input type="number" min="0" step="0.01" value={addForm.data.unit_cost} required onChange={e => addForm.setData('unit_cost', Number(e.target.value))} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Reorder Level *</label>
                                <input type="number" min="0" value={addForm.data.reorder_level} required onChange={e => addForm.setData('reorder_level', Number(e.target.value))} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Min Stock *</label>
                                <input type="number" min="0" value={addForm.data.minimum_stock} required onChange={e => addForm.setData('minimum_stock', Number(e.target.value))} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Supplier</label>
                                <input type="text" value={addForm.data.supplier} onChange={e => addForm.setData('supplier', e.target.value)} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Storage Location</label>
                                <input type="text" value={addForm.data.storage_location} onChange={e => addForm.setData('storage_location', e.target.value)} className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Expiry Date</label>
                                <input type="date" value={addForm.data.expiry_date} onChange={e => addForm.setData('expiry_date', e.target.value)} className={ic} />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Cancel</button>
                            <button type="submit" disabled={addForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                {addForm.processing ? 'Adding…' : 'Add Item'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Items table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                {['Item','Category','Stock','Reorder','Unit Cost','Supplier','Status',''].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.data?.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">No items found</td></tr>
                            ) : items.data?.map((item: any) => {
                                const isCritical = Number(item.current_stock) <= Number(item.minimum_stock);
                                const isLow = !isCritical && Number(item.current_stock) <= Number(item.reorder_level);
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800">{item.name}</div>
                                            {item.sku && <div className="text-xs text-slate-400 font-mono">{item.sku}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{item.category?.name || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`font-bold text-sm ${isCritical ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                                                {Number(item.current_stock).toFixed(2)}
                                            </span>
                                            <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                                            {isCritical && <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Critical</span>}
                                            {isLow && <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Low</span>}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{Number(item.reorder_level).toFixed(0)} {item.unit}</td>
                                        <td className="px-4 py-3 text-slate-700">{fmt(item.unit_cost)}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{item.supplier || '—'}</td>
                                        <td className="px-4 py-3">
                                            {item.expiry_date && new Date(item.expiry_date) < new Date() ? (
                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Expired</span>
                                            ) : (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button onClick={() => setShowTxn(item)}
                                                    className="text-xs px-2 py-1 bg-teal-50 text-teal-700 rounded hover:bg-teal-100">
                                                    + Stock
                                                </button>
                                                <Link href={`/inventory/${item.id}/transactions`}
                                                    className="text-xs px-2 py-1 border border-slate-200 text-slate-600 rounded hover:bg-slate-50">
                                                    Log
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {items.links && (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Showing {items.from}–{items.to} of {items.total}</span>
                        <div className="flex gap-1">
                            {items.links.map((l: any, i: number) => (
                                <Link key={i} href={l.url ?? '#'}
                                    className={`px-2.5 py-1 rounded text-xs ${l.active ? 'bg-teal-600 text-white' : 'hover:bg-slate-100'} ${!l.url ? 'opacity-40 pointer-events-none' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: l.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Transaction modal */}
            {showTxn && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-700">Stock Transaction — {showTxn.name}</h3>
                            <button onClick={() => setShowTxn(null)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <div className="text-sm text-slate-500 mb-4">
                            Current stock: <strong className="text-slate-800">{Number(showTxn.current_stock).toFixed(2)} {showTxn.unit}</strong>
                        </div>
                        <form onSubmit={handleTxnSubmit}>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="col-span-2">
                                    <label className="text-xs text-slate-500 mb-1 block">Transaction Type *</label>
                                    <select value={txnForm.data.type} onChange={e => txnForm.setData('type', e.target.value)} className={ic}>
                                        {['stock_in','stock_out','adjustment','expired','returned'].map(t => (
                                            <option key={t} value={t} className="capitalize">{t.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Quantity *</label>
                                    <input type="number" min="0.01" step="0.01" value={txnForm.data.quantity} required onChange={e => txnForm.setData('quantity', Number(e.target.value))} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Unit Cost (₱)</label>
                                    <input type="number" min="0" step="0.01" value={txnForm.data.unit_cost} onChange={e => txnForm.setData('unit_cost', Number(e.target.value))} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Reference</label>
                                    <input type="text" value={txnForm.data.reference} onChange={e => txnForm.setData('reference', e.target.value)} className={ic} placeholder="PO#, etc." />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Notes</label>
                                    <input type="text" value={txnForm.data.notes} onChange={e => txnForm.setData('notes', e.target.value)} className={ic} />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setShowTxn(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Cancel</button>
                                <button type="submit" disabled={txnForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                    {txnForm.processing ? 'Saving…' : 'Record Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}