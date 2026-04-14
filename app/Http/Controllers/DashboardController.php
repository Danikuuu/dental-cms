<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today     = now()->toDateString();
        $thisMonth = now()->startOfMonth()->toDateString();
        $monthEnd  = now()->endOfMonth()->toDateString();

        return Inertia::render('dashboard/Index', [
            'stats' => [
                'patients_total'       => Patient::count(),
                'appointments_today'   => Appointment::whereDate('scheduled_at', $today)->count(),
                'appointments_pending' => Appointment::whereDate('scheduled_at', $today)
                                            ->where('status', 'scheduled')->count(),
                'collection_today'     => (float) Payment::whereDate('payment_date', $today)->sum('amount'),
                'collection_month'     => (float) Payment::whereBetween('payment_date', [$thisMonth, $monthEnd])->sum('amount'),
                'invoices_pending'     => Invoice::whereIn('status', ['draft', 'partial'])->count(),
            ],
            'today_appointments' => Appointment::with(['patient', 'dentist'])
                ->whereDate('scheduled_at', $today)
                ->orderBy('scheduled_at')
                ->get(),
            'recent_patients' => Patient::orderByDesc('created_at')
                ->limit(5)
                ->get(['id', 'patient_code', 'first_name', 'last_name', 'phone', 'created_at']),
            'monthly_collections' => Payment::selectRaw(
                    "DATE_FORMAT(payment_date, '%Y-%m') as month, SUM(amount) as total"
                )
                ->where('payment_date', '>=', now()->subMonths(6)->startOfMonth()->toDateString())
                ->groupBy('month')
                ->orderBy('month')
                ->get(),
        ]);
    }
}
