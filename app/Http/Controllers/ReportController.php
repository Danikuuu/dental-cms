<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function dailyCollection(Request $request): Response
    {
        $date = $request->date ?? now()->toDateString();

        $payments = Payment::with(['invoice.patient', 'receivedBy'])
            ->whereDate('payment_date', $date)
            ->orderBy('created_at')
            ->get();

        return Inertia::render('reports/DailyCollection', [
            'payments'            => $payments,
            'date'                => $date,
            'total'               => (float) $payments->sum('amount'),
            'breakdown_by_method' => $payments->groupBy('method')
                ->map(fn ($g) => (float) $g->sum('amount')),
        ]);
    }

    public function patientVisits(Request $request): Response
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $appointments = Appointment::with(['patient', 'dentist'])
            ->whereBetween('scheduled_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->orderByDesc('scheduled_at')
            ->get();

        // Per-patient spending: total invoices paid in this period
        $patientIds = $appointments->pluck('patient_id')->unique()->values();

        $spending = Invoice::whereIn('patient_id', $patientIds)
            ->whereBetween('invoice_date', [$from, $to])
            ->selectRaw('patient_id, SUM(total_amount) as total_billed, SUM(amount_paid) as total_paid')
            ->groupBy('patient_id')
            ->get()
            ->keyBy('patient_id');

        // Attach spending to each appointment
        $withSpending = $appointments->map(function ($a) use ($spending) {
            $s = $spending->get($a->patient_id);
            return array_merge($a->toArray(), [
                'patient_total_billed' => $s ? (float)$s->total_billed : 0,
                'patient_total_paid'   => $s ? (float)$s->total_paid   : 0,
            ]);
        });

        return Inertia::render('reports/PatientVisits', [
            'appointments' => $withSpending,
            'from'         => $from,
            'to'           => $to,
            'summary' => [
                'total'          => $appointments->count(),
                'completed'      => $appointments->where('status', 'completed')->count(),
                'cancelled'      => $appointments->where('status', 'cancelled')->count(),
                'no_show'        => $appointments->where('status', 'no_show')->count(),
                'total_revenue'  => (float) $spending->sum('total_paid'),
            ],
        ]);
    }
}
