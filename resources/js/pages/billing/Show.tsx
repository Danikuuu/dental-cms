import {
    ArrowLeftIcon,
    PlusIcon,
    PrinterIcon,
} from '@heroicons/react/24/outline';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import {
    recordPayment as recordPaymentAction,
    issueOfficialReceipt as issueOrAction,
} from '@/wayfinder/actions/App/Http/Controllers/InvoiceController';

const fmt = (n: number | string) =>
    `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    sent: 'bg-blue-100 text-blue-700',
    partial: 'bg-amber-100 text-amber-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-400',
};

const METHOD_LABEL: Record<string, string> = {
    cash: 'Cash',
    gcash: 'GCash',
    maya: 'Maya',
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    bank_transfer: 'Bank Transfer',
    check: 'Check',
};

export default function BillingShow({ invoice }: any) {
    const { auth } = usePage().props as any;
    const canManageBilling = auth?.can?.manage_billing;

    const [showPayment, setShowPayment] = useState(false);
    const [showOrForm, setShowOrForm] = useState(false);

    const payForm = useForm({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        method: 'cash',
        reference_number: '',
        notes: '',
    });

    const orForm = useForm({ or_number: '' });

    const ic =
        'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        payForm.submit(recordPaymentAction(invoice.id), {
            onSuccess: () => {
                payForm.reset();
                setShowPayment(false);
            },
        });
    };

    const handleOrSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        orForm.submit(issueOrAction(invoice.id), {
            onSuccess: () => {
                orForm.reset();
                setShowOrForm(false);
            },
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
                <div className="print-hidden mb-5 flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/billing"
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600"
                    >
                        <ArrowLeftIcon className="h-4 w-4" /> Back to Billing
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                        >
                            <PrinterIcon className="h-4 w-4" /> Print
                        </button>
                        {canManageBilling &&
                            invoice.status !== 'paid' &&
                            invoice.status !== 'cancelled' && (
                                <button
                                    onClick={() => setShowPayment((v) => !v)}
                                    className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                                >
                                    <PlusIcon className="h-4 w-4" /> Record
                                    Payment
                                </button>
                            )}
                        {canManageBilling &&
                            !invoice.or_number &&
                            invoice.status === 'paid' && (
                                <button
                                    onClick={() => setShowOrForm((v) => !v)}
                                    className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                                >
                                    Issue OR
                                </button>
                            )}
                    </div>
                </div>

                {/* Payment form */}
                {showPayment && (
                    <div className="print-hidden mb-5 rounded-xl border border-teal-200 bg-white p-5">
                        <h3 className="mb-4 font-semibold text-slate-700">
                            Record Payment
                        </h3>
                        <form onSubmit={handlePayment}>
                            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Amount (₱) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={Number(invoice.balance)}
                                        value={payForm.data.amount}
                                        onChange={(e) =>
                                            payForm.setData(
                                                'amount',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        className={ic}
                                        placeholder={`Max: ${fmt(invoice.balance)}`}
                                    />
                                    {payForm.errors.amount && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {payForm.errors.amount}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={payForm.data.payment_date}
                                        onChange={(e) =>
                                            payForm.setData(
                                                'payment_date',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        className={ic}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Method *
                                    </label>
                                    <select
                                        value={payForm.data.method}
                                        onChange={(e) =>
                                            payForm.setData(
                                                'method',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    >
                                        {Object.entries(METHOD_LABEL).map(
                                            ([v, l]) => (
                                                <option key={v} value={v}>
                                                    {l}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Reference #
                                    </label>
                                    <input
                                        type="text"
                                        value={payForm.data.reference_number}
                                        onChange={(e) =>
                                            payForm.setData(
                                                'reference_number',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                        placeholder="e.g. GCash ref"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="mb-1 block text-xs text-slate-500">
                                        Notes
                                    </label>
                                    <input
                                        type="text"
                                        value={payForm.data.notes}
                                        onChange={(e) =>
                                            payForm.setData(
                                                'notes',
                                                e.target.value,
                                            )
                                        }
                                        className={ic}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPayment(false)}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={payForm.processing}
                                    className="rounded-lg bg-teal-600 px-5 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                                >
                                    {payForm.processing
                                        ? 'Saving…'
                                        : 'Save Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* OR form */}
                {showOrForm && (
                    <div className="print-hidden mb-5 rounded-xl border border-slate-200 bg-white p-5">
                        <h3 className="mb-3 font-semibold text-slate-700">
                            Issue Official Receipt
                        </h3>
                        <form
                            onSubmit={handleOrSubmit}
                            className="flex items-end gap-3"
                        >
                            <div className="flex-1">
                                <label className="mb-1 block text-xs text-slate-500">
                                    OR Number *
                                </label>
                                <input
                                    type="text"
                                    value={orForm.data.or_number}
                                    onChange={(e) =>
                                        orForm.setData(
                                            'or_number',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    className={ic}
                                    placeholder="e.g. OR-2024-001"
                                />
                                {orForm.errors.or_number && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {orForm.errors.or_number}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowOrForm(false)}
                                className="mb-0.5 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={orForm.processing}
                                className="mb-0.5 rounded-lg bg-slate-800 px-5 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
                            >
                                {orForm.processing ? 'Saving…' : 'Issue'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Invoice header */}
                <div className="print-hidden mb-4 rounded-xl border border-slate-200 bg-white p-6">
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="mb-1 flex items-center gap-3">
                                <span className="font-mono text-xl font-bold text-slate-800">
                                    {invoice.invoice_number}
                                </span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS[invoice.status] ?? ''}`}
                                >
                                    {invoice.status}
                                </span>
                            </div>
                            {invoice.or_number && (
                                <div className="text-xs text-slate-400">
                                    OR #{invoice.or_number}
                                </div>
                            )}
                        </div>
                        <div className="text-right text-sm text-slate-500">
                            <div>
                                Date:{' '}
                                <span className="font-medium text-slate-700">
                                    {invoice.invoice_date}
                                </span>
                            </div>
                            {invoice.due_date && (
                                <div>
                                    Due:{' '}
                                    <span className="font-medium text-slate-700">
                                        {invoice.due_date}
                                    </span>
                                </div>
                            )}
                            <div className="mt-1 text-xs text-slate-400">
                                Created by: {invoice.created_by?.name}
                            </div>
                        </div>
                    </div>

                    {/* Patient info */}
                    <div className="mb-6 rounded-lg bg-slate-50 p-4">
                        <div className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                            Patient
                        </div>
                        <Link
                            href={`/patients/${invoice.patient?.id}`}
                            className="font-semibold text-slate-800 hover:text-teal-700"
                        >
                            {invoice.patient?.last_name},{' '}
                            {invoice.patient?.first_name}
                        </Link>
                        <div className="mt-0.5 font-mono text-xs text-slate-400">
                            {invoice.patient?.patient_code}
                        </div>
                        {invoice.patient?.phone && (
                            <div className="mt-0.5 text-xs text-slate-500">
                                {invoice.patient.phone}
                            </div>
                        )}
                    </div>

                    {/* Line items */}
                    <table className="mb-6 w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200">
                                {[
                                    'Description',
                                    'Tooth #',
                                    'Qty',
                                    'Unit Price',
                                    'Total',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className={`py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase ${h === 'Description' ? 'text-left' : 'text-right'}`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoice.items?.map((item: any) => (
                                <tr key={item.id}>
                                    <td className="py-3 text-slate-700">
                                        {item.description}
                                        {item.service?.name &&
                                            item.service.name !==
                                                item.description && (
                                                <div className="text-xs text-slate-400">
                                                    {item.service.name}
                                                </div>
                                            )}
                                    </td>
                                    <td className="py-3 text-right text-xs text-slate-500">
                                        {item.tooth_number || '—'}
                                    </td>
                                    <td className="py-3 text-right text-slate-500">
                                        {item.quantity}
                                    </td>
                                    <td className="py-3 text-right text-slate-600">
                                        {fmt(item.unit_price)}
                                    </td>
                                    <td className="py-3 text-right font-medium text-slate-800">
                                        {fmt(item.line_total)}
                                    </td>
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
                                    <span>
                                        Discount{' '}
                                        {invoice.discount_type
                                            ? `(${invoice.discount_type})`
                                            : ''}
                                    </span>
                                    <span>
                                        – {fmt(invoice.discount_amount)}
                                    </span>
                                </div>
                            )}
                            {Number(invoice.tax_amount) > 0 && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Tax</span>
                                    <span>{fmt(invoice.tax_amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-800">
                                <span>Total</span>
                                <span>{fmt(invoice.total_amount)}</span>
                            </div>
                            <div className="flex justify-between text-green-700">
                                <span>Paid</span>
                                <span>{fmt(invoice.amount_paid)}</span>
                            </div>
                            <div
                                className={`flex justify-between text-base font-bold ${Number(invoice.balance) > 0 ? 'text-red-600' : 'text-slate-400'}`}
                            >
                                <span>Balance</span>
                                <span>{fmt(invoice.balance)}</span>
                            </div>
                        </div>
                    </div>

                    {invoice.notes && (
                        <div className="mt-6 border-t border-slate-100 pt-4">
                            <div className="mb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                                Notes
                            </div>
                            <p className="text-sm text-slate-600">
                                {invoice.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Payment history */}
                {invoice.payments?.length > 0 && (
                    <div className="print-hidden overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-100 px-5 py-3.5">
                            <h3 className="text-sm font-semibold text-slate-700">
                                Payment History
                            </h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    {[
                                        'Date',
                                        'Method',
                                        'Reference',
                                        'Received By',
                                        'Amount',
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
                                {invoice.payments.map((p: any) => (
                                    <tr
                                        key={p.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                                            {p.payment_date}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-600 capitalize">
                                            {METHOD_LABEL[p.method] ?? p.method}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-400">
                                            {p.reference_number || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            {p.received_by?.name}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-teal-700">
                                            {fmt(p.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Print-only receipt */}
                <div className="receipt-print hidden">
                    <div className="text-center">
                        <div className="text-[14px] font-bold tracking-wide">
                            OFFICIAL RECEIPT
                        </div>
                        <div className="font-semibold">DENTAL CMS CLINIC</div>
                        <div className="receipt-muted">
                            Date: {invoice.invoice_date}
                        </div>
                    </div>

                    <div className="receipt-line" />

                    <div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Invoice No.</span>
                            <span>{invoice.invoice_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">OR No.</span>
                            <span>{invoice.or_number || 'Pending'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Cashier</span>
                            <span>{invoice.created_by?.name || 'System'}</span>
                        </div>
                        <div className="mt-2">
                            <span className="font-semibold">Patient:</span>{' '}
                            {invoice.patient?.last_name},{' '}
                            {invoice.patient?.first_name}
                        </div>
                        {invoice.patient?.patient_code && (
                            <div className="receipt-muted">
                                Patient Code: {invoice.patient.patient_code}
                            </div>
                        )}
                    </div>

                    <div className="receipt-line" />

                    <table className="receipt-table w-full">
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
                                    <td className="text-right">
                                        {item.quantity}
                                    </td>
                                    <td className="text-right">
                                        {fmt(item.unit_price)}
                                    </td>
                                    <td className="text-right">
                                        {fmt(item.line_total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="receipt-line" />

                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{fmt(invoice.subtotal)}</span>
                        </div>
                        {Number(invoice.discount_amount) > 0 && (
                            <div className="flex justify-between">
                                <span>Discount</span>
                                <span>- {fmt(invoice.discount_amount)}</span>
                            </div>
                        )}
                        {Number(invoice.tax_amount) > 0 && (
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>{fmt(invoice.tax_amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-[12px] font-bold">
                            <span>TOTAL</span>
                            <span>{fmt(invoice.total_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Paid</span>
                            <span>{fmt(invoice.amount_paid)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Balance</span>
                            <span>{fmt(invoice.balance)}</span>
                        </div>
                    </div>

                    {invoice.payments?.length > 0 && (
                        <>
                            <div className="receipt-line" />
                            <div className="mb-1 font-semibold">Payments</div>
                            {invoice.payments.map((p: any) => (
                                <div
                                    key={p.id}
                                    className="flex justify-between text-[10px]"
                                >
                                    <span>
                                        {p.payment_date} -{' '}
                                        {METHOD_LABEL[p.method] ?? p.method}
                                    </span>
                                    <span>{fmt(p.amount)}</span>
                                </div>
                            ))}
                        </>
                    )}

                    <div className="receipt-line" />
                    <div className="text-center">
                        <div>Thank you for choosing our clinic.</div>
                        <div className="receipt-muted">
                            Please keep this receipt for your records.
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
