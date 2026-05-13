import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { store as storeInvoice } from '@/wayfinder/actions/App/Http/Controllers/InvoiceController';

const ic =
    'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';
const fmt = (n: number) =>
    `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface LineItem {
    service_id?: number;
    description: string;
    tooth_number: string;
    quantity: number;
    unit_price: number;
}

export default function BillingCreate({
    patients,
    services,
    preselected_patient,
}: any) {
    const blank: LineItem = {
        service_id: undefined,
        description: '',
        tooth_number: '',
        quantity: 1,
        unit_price: 0,
    };
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

    const syncItems = (next: LineItem[]) => {
        setItems(next);
        setData('items', next);
    };

    const addItem = () => syncItems([...items, { ...blank }]);
    const removeItem = (i: number) =>
        syncItems(items.filter((_, idx) => idx !== i));

    const updateItem = (i: number, field: keyof LineItem, value: any) => {
        syncItems(
            items.map((it, idx) =>
                idx === i ? { ...it, [field]: value } : it,
            ),
        );
    };

    const pickService = (i: number, svcId: string) => {
        const svc = services?.find((s: any) => String(s.id) === svcId);

        if (svc) {
            syncItems(
                items.map((it, idx) =>
                    idx === i
                        ? {
                              ...it,
                              service_id: svc.id,
                              description: svc.name,
                              unit_price: Number(svc.base_fee),
                          }
                        : it,
                ),
            );
        }
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
        (acc[s.category] ??= []).push(s);

        return acc;
    }, {});

    return (
        <AppLayout title="Create Invoice">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submit(storeInvoice());
                }}
                className="max-w-5xl space-y-4"
            >
                {/* Top row */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 md:col-span-2">
                        <h3 className="mb-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                            Invoice Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs text-slate-600">
                                    Patient *
                                </label>
                                <select
                                    value={data.patient_id}
                                    onChange={(e) =>
                                        setData('patient_id', e.target.value)
                                    }
                                    required
                                    className={ic}
                                >
                                    <option value="">Select patient…</option>
                                    {patients?.map((p: any) => (
                                        <option key={p.id} value={p.id}>
                                            {p.last_name}, {p.first_name} (
                                            {p.patient_code})
                                        </option>
                                    ))}
                                </select>
                                {errors.patient_id && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.patient_id}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-600">
                                    Invoice Date *
                                </label>
                                <input
                                    type="date"
                                    value={data.invoice_date}
                                    onChange={(e) =>
                                        setData('invoice_date', e.target.value)
                                    }
                                    required
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-600">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={data.due_date}
                                    onChange={(e) =>
                                        setData('due_date', e.target.value)
                                    }
                                    className={ic}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <h3 className="mb-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                            Discount
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-xs text-slate-600">
                                    Type
                                </label>
                                <select
                                    value={data.discount_type}
                                    onChange={(e) =>
                                        setData('discount_type', e.target.value)
                                    }
                                    className={ic}
                                >
                                    <option value="">None</option>
                                    <option value="senior">
                                        Senior Citizen (20%)
                                    </option>
                                    <option value="pwd">PWD (20%)</option>
                                    <option value="promo">Promotion</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-600">
                                    Discount Amount (₱)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.discount_amount}
                                    onChange={(e) =>
                                        setData(
                                            'discount_amount',
                                            Number(e.target.value),
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line items */}
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                        Services / Procedures
                    </h3>

                    {/* Header row */}
                    <div className="mb-2 hidden grid-cols-12 gap-2 px-1 text-xs font-medium tracking-wide text-slate-400 uppercase sm:grid">
                        <div className="col-span-5">Description</div>
                        <div className="col-span-2">Tooth #</div>
                        <div className="col-span-1 text-right">Qty</div>
                        <div className="col-span-2 text-right">Unit Price</div>
                        <div className="col-span-1 text-right">Total</div>
                        <div className="col-span-1" />
                    </div>

                    <div className="space-y-2">
                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                className="grid grid-cols-12 items-start gap-2"
                            >
                                {/* Service picker + description */}
                                <div className="col-span-12 flex gap-1 sm:col-span-5">
                                    <select
                                        onChange={(e) =>
                                            pickService(idx, e.target.value)
                                        }
                                        defaultValue=""
                                        className="w-28 flex-shrink-0 rounded-lg border border-slate-200 px-2 py-2 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                                    >
                                        <option value="">Pick…</option>
                                        {Object.entries(grouped).map(
                                            ([cat, svcs]: any) => (
                                                <optgroup key={cat} label={cat}>
                                                    {svcs.map((s: any) => (
                                                        <option
                                                            key={s.id}
                                                            value={s.id}
                                                        >
                                                            {s.name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ),
                                        )}
                                    </select>
                                    <input
                                        type="text"
                                        value={item.description}
                                        required
                                        placeholder="Description"
                                        onChange={(e) =>
                                            updateItem(
                                                idx,
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        className="flex-1 rounded-lg border border-slate-200 px-2 py-2 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none"
                                    />
                                </div>

                                <div className="col-span-4 sm:col-span-2">
                                    <input
                                        type="text"
                                        value={item.tooth_number}
                                        placeholder="e.g. 46"
                                        onChange={(e) =>
                                            updateItem(
                                                idx,
                                                'tooth_number',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none"
                                    />
                                </div>

                                <div className="col-span-3 sm:col-span-1">
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            updateItem(
                                                idx,
                                                'quantity',
                                                Math.max(
                                                    1,
                                                    parseInt(e.target.value) ||
                                                        1,
                                                ),
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-2 py-2 text-right text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none"
                                    />
                                </div>

                                <div className="col-span-4 sm:col-span-2">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.unit_price}
                                        onChange={(e) =>
                                            updateItem(
                                                idx,
                                                'unit_price',
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-2 py-2 text-right text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none"
                                    />
                                </div>

                                <div className="col-span-4 flex items-center justify-end sm:col-span-1">
                                    <span className="text-sm font-medium text-slate-700">
                                        {fmt(item.quantity * item.unit_price)}
                                    </span>
                                </div>

                                <div className="col-span-1 flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(idx)}
                                        disabled={items.length === 1}
                                        className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addItem}
                        className="mt-3 flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-800"
                    >
                        <PlusIcon className="h-4 w-4" /> Add Item
                    </button>
                </div>

                {/* Notes + Summary */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <label className="mb-1 block text-xs text-slate-500">
                            Notes / Remarks
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={4}
                            placeholder="Additional notes for this invoice…"
                            className={ic + ' resize-none'}
                        />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <h3 className="mb-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                            Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-medium">
                                    {fmt(subtotal)}
                                </span>
                            </div>
                            {Number(data.discount_amount) > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>
                                        Discount{' '}
                                        {data.discount_type
                                            ? `(${data.discount_type})`
                                            : ''}
                                    </span>
                                    <span>
                                        – {fmt(Number(data.discount_amount))}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-800">
                                <span>TOTAL</span>
                                <span>{fmt(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pb-4">
                    <a
                        href="/billing"
                        className="rounded-lg border border-slate-200 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </a>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-teal-600 px-6 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                    >
                        {processing ? 'Creating…' : 'Create Invoice'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
