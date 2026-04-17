import {
    recordPayment as recordPaymentAction,
    issueOfficialReceipt as issueOrAction,
} from '@/wayfinder/actions/App/Http/Controllers/InvoiceController';
import AppLayout from '@/layouts/AppLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeftIcon, PlusIcon, PrinterIcon } from '@heroicons/react/24/outline';

const fmt = (n: number | string) =>
    `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-600',
    sent:      'bg-blue-100 text-blue-700',
    partial:   'bg-amber-100 text-amber-800',
    paid:      'bg-green-100 text-green-800',
    overdue:   'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-400',
};

const METHOD_LABEL: Record<string, string> = {
    cash: 'Cash', gcash: 'GCash', maya: 'Maya',
    credit_card: 'Credit Card', debit_card: 'Debit Card',
    bank_transfer: 'Bank Transfer', check: 'Check',
};

export default function BillingShow({ invoice }: any) {
    const { auth } = usePage().props as any;
    const canManageBilling = auth?.can?.manage_billing;

    const [showPayment, setShowPayment] = useState(false);
    const [showOrForm,  setShowOrForm]  = useState(false);

    const payForm = useForm({
        amount:           '',
        payment_date:     new Date().toISOString().split('T')[0],
        method:           'cash',
        reference_number: '',
        notes:            '',
    });

    const orForm = useForm({ or_number: '' });

    const ic = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        payForm.submit(recordPaymentAction(invoice.id), {
            onSuccess: () => { payForm.reset(); setShowPayment(false); },
        });
    };

    const handleOrSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        orForm.submit(issueOrAction(invoice.id), {
            onSuccess: () => { orForm.reset(); setShowOrForm(false); },
        });
    };

    return (
        <AppLayout title={`Invoice ${invoice.invoice_number}`}>
            <style>{`
                @media print {
                    @page { size: 80mm auto; margin: 8mm; }
                    body { background: #fff !important; }
                    .print-hidden { display: none !important; }
                    .receipt-print {
                        display: block !important;
                        width: 72mm;
                        margin: 0 auto;
                        color: #111827;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                        font-size: 11px;
                        line-height: 1.35;
                    }
                    .receipt-line { border-top: 1px dashed #9ca3af; margin: 8px 0; }
                    .receipt-table th, .receipt-table td { padding: 2px 0; vertical-align: top; }
                    .receipt-muted { color: #4b5563; }
                }
            `}</style>
            <div className="max-w-4xl">
                {/* Back + Actions */}
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3 print-hidden">
                    <Link href="/billing" className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600">
                        <ArrowLeftIcon className="w-4 h-4" /> Back to Billing
                    </Link>
                    <div className="flex items-center gap-2">
                        <button onClick={() => window.print()}
                            className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                            <PrinterIcon className="w-4 h-4" /> Print
                        </button>
                        {canManageBilling && invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                            <button onClick={() => setShowPayment(v => !v)}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                                <PlusIcon className="w-4 h-4" /> Record Payment
                            </button>
                        )}
                        {canManageBilling && !invoice.or_number && invoice.status === 'paid' && (
                            <button onClick={() => setShowOrForm(v => !v)}
                                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700">
                                Issue OR
                            </button>
                        )}
                    </div>
                </div>

                {/* Payment form */}
                {showPayment && (
                    <div className="bg-white border border-teal-200 rounded-xl p-5 mb-5 print-hidden">
                        <h3 className="font-semibold text-slate-700 mb-4">Record Payment</h3>
                        <form onSubmit={handlePayment}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Amount (₱) *</label>
                                    <input type="number" step="0.01" min="0.01"
                                        max={Number(invoice.balance)}
                                        value={payForm.data.amount}
                                        onChange={e => payForm.setData('amount', e.target.value)}
                                        required className={ic}
                                        placeholder={`Max: ${fmt(invoice.balance)}`} />
                                    {payForm.errors.amount && <p className="text-red-500 text-xs mt-1">{payForm.errors.amount}</p>}
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Date *</label>
                                    <input type="date" value={payForm.data.payment_date}
                                        onChange={e => payForm.setData('payment_date', e.target.value)}
                                        required className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Method *</label>
                                    <select value={payForm.data.method}
                                        onChange={e => payForm.setData('method', e.target.value)} className={ic}>
                                        {Object.entries(METHOD_LABEL).map(([v, l]) => (
                                            <option key={v} value={v}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Reference #</label>
                                    <input type="text" value={payForm.data.reference_number}
                                        onChange={e => payForm.setData('reference_number', e.target.value)}
                                        className={ic} placeholder="e.g. GCash ref" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-slate-500 mb-1 block">Notes</label>
                                    <input type="text" value={payForm.data.notes}
                                        onChange={e => payForm.setData('notes', e.target.value)}
                                        className={ic} />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setShowPayment(false)}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Cancel</button>
                                <button type="submit" disabled={payForm.processing}
                                    className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                    {payForm.processing ? 'Saving…' : 'Save Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* OR form */}
                {showOrForm && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5 print-hidden">
                        <h3 className="font-semibold text-slate-700 mb-3">Issue Official Receipt</h3>
                        <form onSubmit={handleOrSubmit} className="flex gap-3 items-end">
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 mb-1 block">OR Number *</label>
                                <input type="text" value={orForm.data.or_number}
                                    onChange={e => orForm.setData('or_number', e.target.value)}
                                    required className={ic} placeholder="e.g. OR-2024-001" />
                                {orForm.errors.or_number && <p className="text-red-500 text-xs mt-1">{orForm.errors.or_number}</p>}
                            </div>
                            <button type="button" onClick={() => setShowOrForm(false)}
                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 mb-0.5">Cancel</button>
                            <button type="submit" disabled={orForm.processing}
                                className="px-5 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50 mb-0.5">
                                {orForm.processing ? 'Saving…' : 'Issue'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Invoice header */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4 print-hidden">
                    <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-xl font-bold text-slate-800 font-mono">{invoice.invoice_number}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${STATUS[invoice.status] ?? ''}`}>
                                    {invoice.status}
                                </span>
                            </div>
                            {invoice.or_number && (
                                <div className="text-xs text-slate-400">OR #{invoice.or_number}</div>
                            )}
                        </div>
                        <div className="text-right text-sm text-slate-500">
                            <div>Date: <span className="font-medium text-slate-700">{invoice.invoice_date}</span></div>
                            {invoice.due_date && <div>Due: <span className="font-medium text-slate-700">{invoice.due_date}</span></div>}
                            <div className="text-xs text-slate-400 mt-1">Created by: {invoice.created_by?.name}</div>
                        </div>
                    </div>

                    {/* Patient info */}
                    <div className="bg-slate-50 rounded-lg p-4 mb-6">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Patient</div>
                        <Link href={`/patients/${invoice.patient?.id}`}
                            className="font-semibold text-slate-800 hover:text-teal-700">
                            {invoice.patient?.last_name}, {invoice.patient?.first_name}
                        </Link>
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">{invoice.patient?.patient_code}</div>
                        {invoice.patient?.phone && <div className="text-xs text-slate-500 mt-0.5">{invoice.patient.phone}</div>}
                    </div>

                    {/* Line items */}
                    <table className="w-full text-sm mb-6">
                        <thead>
                            <tr className="border-b border-slate-200">
                                {['Description', 'Tooth #', 'Qty', 'Unit Price', 'Total'].map(h => (
                                    <th key={h} className={`py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide ${h === 'Description' ? 'text-left' : 'text-right'}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoice.items?.map((item: any) => (
                                <tr key={item.id}>
                                    <td className="py-3 text-slate-700">
                                        {item.description}
                                        {item.service?.name && item.service.name !== item.description && (
                                            <div className="text-xs text-slate-400">{item.service.name}</div>
                                        )}
                                    </td>
                                    <td className="py-3 text-right text-slate-500 text-xs">{item.tooth_number || '—'}</td>
                                    <td className="py-3 text-right text-slate-500">{item.quantity}</td>
                                    <td className="py-3 text-right text-slate-600">{fmt(item.unit_price)}</td>
                                    <td className="py-3 text-right font-medium text-slate-800">{fmt(item.line_total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>{fmt(invoice.subtotal)}</span>
                            </div>
                            {Number(invoice.discount_amount) > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>Discount {invoice.discount_type ? `(${invoice.discount_type})` : ''}</span>
                                    <span>– {fmt(invoice.discount_amount)}</span>
                                </div>
                            )}
                            {Number(invoice.tax_amount) > 0 && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Tax</span>
                                    <span>{fmt(invoice.tax_amount)}</span>
                                </div>
                            )}
                            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800 text-base">
                                <span>Total</span>
                                <span>{fmt(invoice.total_amount)}</span>
                            </div>
                            <div className="flex justify-between text-green-700">
                                <span>Paid</span>
                                <span>{fmt(invoice.amount_paid)}</span>
                            </div>
                            <div className={`flex justify-between font-bold text-base ${Number(invoice.balance) > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                <span>Balance</span>
                                <span>{fmt(invoice.balance)}</span>
                            </div>
                        </div>
                    </div>

                    {invoice.notes && (
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Notes</div>
                            <p className="text-sm text-slate-600">{invoice.notes}</p>
                        </div>
                    )}
                </div>

                {/* Payment history */}
                {invoice.payments?.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden print-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-700 text-sm">Payment History</h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Date','Method','Reference','Received By','Amount'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoice.payments.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{p.payment_date}</td>
                                        <td className="px-4 py-3 text-slate-600 capitalize text-xs">{METHOD_LABEL[p.method] ?? p.method}</td>
                                        <td className="px-4 py-3 text-slate-400 text-xs">{p.reference_number || '—'}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{p.received_by?.name}</td>
                                        <td className="px-4 py-3 font-semibold text-teal-700">{fmt(p.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Print-only receipt */}
                <div className="hidden receipt-print">
                    <div className="text-center">
                        <div className="font-bold text-[14px] tracking-wide">OFFICIAL RECEIPT</div>
                        <div className="font-semibold">DENTAL CMS CLINIC</div>
                        <div className="receipt-muted">Date: {invoice.invoice_date}</div>
                    </div>

                    <div className="receipt-line" />

                    <div>
                        <div className="flex justify-between"><span className="font-semibold">Invoice No.</span><span>{invoice.invoice_number}</span></div>
                        <div className="flex justify-between"><span className="font-semibold">OR No.</span><span>{invoice.or_number || 'Pending'}</span></div>
                        <div className="flex justify-between"><span className="font-semibold">Cashier</span><span>{invoice.created_by?.name || 'System'}</span></div>
                        <div className="mt-2"><span className="font-semibold">Patient:</span> {invoice.patient?.last_name}, {invoice.patient?.first_name}</div>
                        {invoice.patient?.patient_code && <div className="receipt-muted">Patient Code: {invoice.patient.patient_code}</div>}
                    </div>

                    <div className="receipt-line" />

                    <table className="w-full receipt-table">
                        <thead>
                            <tr className="font-semibold">
                                <th className="text-left">Description</th>
                                <th className="text-right">Qty</th>
                                <th className="text-right">Price</th>
                                <th className="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items?.map((item: any) => (
                                <tr key={item.id}>
                                    <td>{item.description}</td>
                                    <td className="text-right">{item.quantity}</td>
                                    <td className="text-right">{fmt(item.unit_price)}</td>
                                    <td className="text-right">{fmt(item.line_total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="receipt-line" />

                    <div className="space-y-1">
                        <div className="flex justify-between"><span>Subtotal</span><span>{fmt(invoice.subtotal)}</span></div>
                        {Number(invoice.discount_amount) > 0 && (
                            <div className="flex justify-between"><span>Discount</span><span>- {fmt(invoice.discount_amount)}</span></div>
                        )}
                        {Number(invoice.tax_amount) > 0 && (
                            <div className="flex justify-between"><span>Tax</span><span>{fmt(invoice.tax_amount)}</span></div>
                        )}
                        <div className="flex justify-between font-bold text-[12px]"><span>TOTAL</span><span>{fmt(invoice.total_amount)}</span></div>
                        <div className="flex justify-between"><span>Paid</span><span>{fmt(invoice.amount_paid)}</span></div>
                        <div className="flex justify-between font-bold"><span>Balance</span><span>{fmt(invoice.balance)}</span></div>
                    </div>

                    {invoice.payments?.length > 0 && (
                        <>
                            <div className="receipt-line" />
                            <div className="font-semibold mb-1">Payments</div>
                            {invoice.payments.map((p: any) => (
                                <div key={p.id} className="flex justify-between text-[10px]">
                                    <span>{p.payment_date} - {METHOD_LABEL[p.method] ?? p.method}</span>
                                    <span>{fmt(p.amount)}</span>
                                </div>
                            ))}
                        </>
                    )}

                    <div className="receipt-line" />
                    <div className="text-center">
                        <div>Thank you for choosing our clinic.</div>
                        <div className="receipt-muted">Please keep this receipt for your records.</div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
