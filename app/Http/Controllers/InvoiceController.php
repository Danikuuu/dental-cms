<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $invoices = Invoice::with(['patient', 'createdBy'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->search, fn ($q, $s) =>
                $q->where('invoice_number', 'like', "%$s%")
                  ->orWhereHas('patient', fn ($p) =>
                      $p->where('last_name', 'like', "%$s%")
                        ->orWhere('first_name', 'like', "%$s%")
                        ->orWhere('patient_code', 'like', "%$s%")
                  )
            )
            ->orderByDesc('invoice_date')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('billing/Index', [
            'invoices' => $invoices,
            'filters'  => $request->only(['status', 'search']),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('billing/Create', [
            'patients' => Patient::orderBy('last_name')
                ->get(['id', 'first_name', 'last_name', 'patient_code']),
            'services' => Service::active()->orderBy('category')->orderBy('name')->get(),
            'preselected_patient' => $request->patient_id
                ? Patient::find($request->patient_id, ['id', 'first_name', 'last_name', 'patient_code'])
                : null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id'       => 'required|exists:patients,id',
            'appointment_id'   => 'nullable|exists:appointments,id',
            'invoice_date'     => 'required|date',
            'due_date'         => 'nullable|date|after_or_equal:invoice_date',
            'discount_amount'  => 'nullable|numeric|min:0',
            'discount_type'    => 'nullable|string|max:50',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'notes'            => 'nullable|string',
            'items'            => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.unit_price'  => 'required|numeric|min:0',
            'items.*.quantity'    => 'required|integer|min:1',
            'items.*.service_id'  => 'nullable|exists:services,id',
            'items.*.tooth_number'=> 'nullable|string|max:10',
        ]);

        $subtotal       = collect($validated['items'])->sum(fn ($i) => $i['unit_price'] * $i['quantity']);
        $discountAmount = (float) ($validated['discount_amount'] ?? 0);
        $taxAmount      = 0;
        $total          = $subtotal - $discountAmount + $taxAmount;

        $invoice = Invoice::create([
            'patient_id'       => $validated['patient_id'],
            'appointment_id'   => $validated['appointment_id'] ?? null,
            'created_by'       => Auth::id(),
            'invoice_date'     => $validated['invoice_date'],
            'due_date'         => $validated['due_date'] ?? null,
            'subtotal'         => $subtotal,
            'discount_amount'  => $discountAmount,
            'discount_type'    => $validated['discount_type'] ?? null,
            'discount_percent' => $validated['discount_percent'] ?? 0,
            'tax_amount'       => $taxAmount,
            'total_amount'     => $total,
            'amount_paid'      => 0,
            'balance'          => $total,
            'status'           => 'draft',
            'notes'            => $validated['notes'] ?? null,
        ]);

        foreach ($validated['items'] as $item) {
            $invoice->items()->create([
                'service_id'  => $item['service_id'] ?? null,
                'description' => $item['description'],
                'tooth_number'=> $item['tooth_number'] ?? null,
                'quantity'    => $item['quantity'],
                'unit_price'  => $item['unit_price'],
                'line_total'  => $item['unit_price'] * $item['quantity'],
            ]);
        }

        return redirect()->route('invoices.show', $invoice)
            ->with('success', 'Invoice created successfully.');
    }

    public function show(Invoice $invoice): Response
    {
        $invoice->load([
            'patient',
            'items.service',
            'payments.receivedBy',
            'createdBy',
            'appointment',
        ]);

        return Inertia::render('billing/Show', ['invoice' => $invoice]);
    }

    public function recordPayment(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'amount'           => 'required|numeric|min:0.01',
            'payment_date'     => 'required|date',
            'method'           => 'required|in:cash,gcash,maya,credit_card,debit_card,bank_transfer,check',
            'reference_number' => 'nullable|string|max:100',
            'notes'            => 'nullable|string',
        ]);

        Payment::create([
            ...$validated,
            'invoice_id'  => $invoice->id,
            'received_by' => Auth::id(),
        ]);

        $totalPaid = $invoice->payments()->sum('amount');
        $balance   = (float) $invoice->total_amount - (float) $totalPaid;

        $invoice->update([
            'amount_paid' => $totalPaid,
            'balance'     => max(0, $balance),
            'status'      => $balance <= 0 ? 'paid' : 'partial',
        ]);

        return back()->with('success', 'Payment recorded successfully.');
    }

    public function issueOfficialReceipt(Request $request, Invoice $invoice)
    {
        $request->validate([
            'or_number' => 'required|string|max:50|unique:invoices,or_number,'.$invoice->id,
        ]);

        $invoice->update(['or_number' => $request->or_number]);

        \App\Models\ActivityLog::record(
            'issue_or',
            "Issued OR #{$request->or_number} for invoice {$invoice->invoice_number}",
            \App\Models\Invoice::class,
            $invoice->id
        );

        return back()->with('success', 'Official Receipt number assigned.');
    }

}