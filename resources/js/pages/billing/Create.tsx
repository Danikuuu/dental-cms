import { store as storeInvoice } from '@/wayfinder/actions/App/Http/Controllers/InvoiceController';
import AppLayout from '@/layouts/AppLayout';
import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const ic = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';
const fmt = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface LineItem {
    service_id?: number;
    description: string;
    tooth_number: string;
    quantity: number;
    unit_price: number;
}

export default function BillingCreate({ patients, services, preselected_patient }: any) {
    const blank: LineItem = { service_id: undefined, description: '', tooth_number: '', quantity: 1, unit_price: 0 };
    const [items, setItems] = useState<LineItem[]>([{ ...blank }]);

    const { data, setData, submit, processing, errors } = useForm({
        patient_id: preselected_patient?.id ?? '',
        appointment_id: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        discount_amount: 0,
        discount_type: '',
        notes: '',
        items: [{ ...blank }] as LineItem[],
    });

    const syncItems = (next: LineItem[]) => { setItems(next); setData('items', next); };

    const addItem = () => syncItems([...items, { ...blank }]);
    const removeItem = (i: number) => syncItems(items.filter((_, idx) => idx !== i));

    const updateItem = (i: number, field: keyof LineItem, value: any) => {
        syncItems(items.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
    };

    const pickService = (i: number, svcId: string) => {
        const svc = services?.find((s: any) => String(s.id) === svcId);
        if (svc) syncItems(items.map((it, idx) => idx === i
            ? { ...it, service_id: svc.id, description: svc.name, unit_price: Number(svc.base_fee) }
            : it));
    };

    // Compute subtotal from items state (not from stale closure)
    const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);

    // FIX: include subtotal in dependency array so the auto-discount always uses the current subtotal.
    useEffect(() => {
        if (data.discount_type === 'senior' || data.discount_type === 'pwd') {
            setData('discount_amount', +(subtotal * 0.2).toFixed(2));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.discount_type, subtotal]);

    const total = subtotal - Number(data.discount_amount);

    const grouped = (services ?? []).reduce((acc: any, s: any) => {
        (acc[s.category] ??= []).push(s); return acc;
    }, {});

    return (
        <AppLayout title="Create Invoice">
            <form onSubmit={e => { e.preventDefault(); submit(storeInvoice()); }} className="max-w-5xl space-y-4">

                {/* Top row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Invoice Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs text-slate-600 mb-1 block">Patient *</label>
                                <select value={data.patient_id} onChange={e => setData('patient_id', e.target.value)} required className={ic}>
                                    <option value="">Select patient…</option>
                                    {patients?.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.last_name}, {p.first_name} ({p.patient_code})</option>
                                    ))}
                                </select>
                                {errors.patient_id && <p className="text-red-500 text-xs mt-1">{errors.patient_id}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-slate-600 mb-1 block">Invoice Date *</label>
                                <input type="date" value={data.invoice_date} onChange={e => setData('invoice_date', e.target.value)} required className={ic} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-600 mb-1 block">Due Date</label>
                                <input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} className={ic} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Discount</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-600 mb-1 block">Type</label>
                                <select value={data.discount_type} onChange={e => setData('discount_type', e.target.value)} className={ic}>
                                    <option value="">None</option>
                                    <option value="senior">Senior Citizen (20%)</option>
                                    <option value="pwd">PWD (20%)</option>
                                    <option value="promo">Promotion</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-600 mb-1 block">Discount Amount (₱)</label>
                                <input type="number" min="0" step="0.01" value={data.discount_amount}
                                    onChange={e => setData('discount_amount', Number(e.target.value))} className={ic} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line items */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Services / Procedures</h3>

                    {/* Header row */}
                    <div className="hidden sm:grid grid-cols-12 gap-2 mb-2 text-xs font-medium text-slate-400 uppercase tracking-wide px-1">
                        <div className="col-span-5">Description</div>
                        <div className="col-span-2">Tooth #</div>
                        <div className="col-span-1 text-right">Qty</div>
                        <div className="col-span-2 text-right">Unit Price</div>
                        <div className="col-span-1 text-right">Total</div>
                        <div className="col-span-1" />
                    </div>

                    <div className="space-y-2">
                        {items.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                                {/* Service picker + description */}
                                <div className="col-span-12 sm:col-span-5 flex gap-1">
                                    <select onChange={e => pickService(idx, e.target.value)} defaultValue=""
                                        className="w-28 flex-shrink-0 px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500">
                                        <option value="">Pick…</option>
                                        {Object.entries(grouped).map(([cat, svcs]: any) => (
                                            <optgroup key={cat} label={cat}>
                                                {svcs.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </optgroup>
                                        ))}
                                    </select>
                                    <input type="text" value={item.description} required placeholder="Description"
                                        onChange={e => updateItem(idx, 'description', e.target.value)}
                                        className="flex-1 px-2 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500" />
                                </div>

                                <div className="col-span-4 sm:col-span-2">
                                    <input type="text" value={item.tooth_number} placeholder="e.g. 46"
                                        onChange={e => updateItem(idx, 'tooth_number', e.target.value)}
                                        className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500" />
                                </div>

                                <div className="col-span-3 sm:col-span-1">
                                    <input type="number" min="1" value={item.quantity}
                                        onChange={e => updateItem(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-right" />
                                </div>

                                <div className="col-span-4 sm:col-span-2">
                                    <input type="number" min="0" step="0.01" value={item.unit_price}
                                        onChange={e => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                                        className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-right" />
                                </div>

                                <div className="col-span-4 sm:col-span-1 flex items-center justify-end">
                                    <span className="text-sm font-medium text-slate-700">{fmt(item.quantity * item.unit_price)}</span>
                                </div>

                                <div className="col-span-1 flex items-center justify-center">
                                    <button type="button" onClick={() => removeItem(idx)} disabled={items.length === 1}
                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button type="button" onClick={addItem}
                        className="mt-3 flex items-center gap-1 text-sm text-teal-600 hover:text-teal-800 font-medium">
                        <PlusIcon className="w-4 h-4" /> Add Item
                    </button>
                </div>

                {/* Notes + Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <label className="text-xs text-slate-500 mb-1 block">Notes / Remarks</label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={4}
                            placeholder="Additional notes for this invoice…"
                            className={ic + ' resize-none'} />
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span><span className="font-medium">{fmt(subtotal)}</span>
                            </div>
                            {Number(data.discount_amount) > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>Discount {data.discount_type ? `(${data.discount_type})` : ''}</span>
                                    <span>– {fmt(Number(data.discount_amount))}</span>
                                </div>
                            )}
                            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800 text-base">
                                <span>TOTAL</span><span>{fmt(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 justify-end pb-4">
                    <a href="/billing" className="px-5 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</a>
                    <button type="submit" disabled={processing}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
                        {processing ? 'Creating…' : 'Create Invoice'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
