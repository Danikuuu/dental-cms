<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\DentalChartEntry;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\PatientImage;
use App\Models\Payment;
use App\Models\TreatmentPlan;
use App\Models\TreatmentTimelineEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TreatmentTimelineController extends Controller
{
    public function show(Patient $patient): Response
    {
        // Build a unified timeline by pulling from all relevant tables
        // and merging into chronological order

        $timeline = collect();

        // Appointments
        Appointment::where('patient_id', $patient->id)
            ->with('dentist')
            ->get()
            ->each(fn ($a) => $timeline->push([
                'id'          => 'appt-' . $a->id,
                'date'        => $a->scheduled_at->toDateString(),
                'time'        => $a->scheduled_at->format('g:i A'),
                'event_type'  => 'appointment',
                'title'       => 'Appointment — ' . ucfirst(str_replace('_', ' ', $a->status)),
                'description' => $a->chief_complaint,
                'meta'        => 'Dr. ' . ($a->dentist->name ?? ''),
                'status'      => $a->status,
                'icon_color'  => match ($a->status) {
                    'completed'  => 'green',
                    'cancelled'  => 'red',
                    'no_show'    => 'slate',
                    default      => 'blue',
                },
            ]));

        // Dental chart entries
        DentalChartEntry::where('patient_id', $patient->id)
            ->with('dentist')
            ->get()
            ->each(fn ($e) => $timeline->push([
                'id'          => 'chart-' . $e->id,
                'date'        => $e->date_recorded->toDateString(),
                'time'        => null,
                'event_type'  => 'chart_entry',
                'title'       => ucfirst($e->condition) . ($e->treatment ? ' → ' . $e->treatment : ''),
                'description' => $e->notes,
                'meta'        => 'Tooth #' . $e->tooth_number . ($e->surface ? ' (' . $e->surface . ')' : '') . ' · Dr. ' . ($e->dentist->name ?? ''),
                'status'      => $e->status,
                'icon_color'  => 'teal',
            ]));

        // Treatment plans
        TreatmentPlan::where('patient_id', $patient->id)
            ->with(['dentist', 'items'])
            ->get()
            ->each(fn ($p) => $timeline->push([
                'id'          => 'plan-' . $p->id,
                'date'        => $p->created_at->toDateString(),
                'time'        => null,
                'event_type'  => 'treatment_plan',
                'title'       => 'Treatment Plan: ' . $p->title,
                'description' => $p->description,
                'meta'        => $p->items->count() . ' procedure(s) · Dr. ' . ($p->dentist->name ?? '') . ' · ' . ucfirst($p->status),
                'status'      => $p->status,
                'icon_color'  => 'purple',
                'amount'      => $p->items->sum('estimated_fee'),
            ]));

        // Invoices
        Invoice::where('patient_id', $patient->id)
            ->get()
            ->each(fn ($inv) => $timeline->push([
                'id'          => 'inv-' . $inv->id,
                'date'        => $inv->invoice_date,
                'time'        => null,
                'event_type'  => 'invoice',
                'title'       => 'Invoice ' . $inv->invoice_number,
                'description' => $inv->or_number ? 'OR #' . $inv->or_number : null,
                'meta'        => 'Total: ₱' . number_format($inv->total_amount, 2) . ' · ' . ucfirst($inv->status),
                'status'      => $inv->status,
                'icon_color'  => $inv->status === 'paid' ? 'green' : ($inv->status === 'overdue' ? 'red' : 'amber'),
                'amount'      => (float) $inv->total_amount,
                'link'        => '/billing/' . $inv->id,
            ]));

        // Payments
        Payment::whereHas('invoice', fn ($q) => $q->where('patient_id', $patient->id))
            ->with(['invoice', 'receivedBy'])
            ->get()
            ->each(fn ($p) => $timeline->push([
                'id'          => 'pay-' . $p->id,
                'date'        => $p->payment_date->toDateString(),
                'time'        => null,
                'event_type'  => 'payment',
                'title'       => 'Payment Received',
                'description' => null,
                'meta'        => '₱' . number_format($p->amount, 2) . ' via ' . str_replace('_', ' ', $p->method) . ($p->reference_number ? ' (Ref: ' . $p->reference_number . ')' : ''),
                'status'      => 'paid',
                'icon_color'  => 'green',
                'amount'      => (float) $p->amount,
            ]));

        // Images
        PatientImage::where('patient_id', $patient->id)
            ->with('uploadedBy')
            ->get()
            ->each(fn ($img) => $timeline->push([
                'id'          => 'img-' . $img->id,
                'date'        => $img->date_taken->toDateString(),
                'time'        => null,
                'event_type'  => 'image_upload',
                'title'       => ucfirst($img->type) . ' Uploaded',
                'description' => $img->notes,
                'meta'        => $img->original_name . ($img->tooth_number ? ' · Tooth #' . $img->tooth_number : '') . ' · by ' . ($img->uploadedBy->name ?? ''),
                'status'      => null,
                'icon_color'  => 'slate',
                'thumb'       => $img->url,
            ]));

        // Sort by date descending, then time
        $sorted = $timeline->sortByDesc(fn ($e) => $e['date'] . ($e['time'] ?? '00:00'))->values();

        // Grouped by year-month for section headers
        $grouped = $sorted->groupBy(fn ($e) => \Carbon\Carbon::parse($e['date'])->format('F Y'))->toArray();

        return Inertia::render('patients/Timeline', [
            'patient'  => $patient->append(['full_name', 'age']),
            'timeline' => $grouped,
            'stats'    => [
                'total_events'       => $sorted->count(),
                'total_appointments' => $sorted->where('event_type', 'appointment')->count(),
                'total_paid'         => (float) $sorted->where('event_type', 'payment')->sum('amount'),
                'first_visit'        => $sorted->where('event_type', 'appointment')->last()['date'] ?? null,
            ],
        ]);
    }

    public function storeNote(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string',
            'event_date'  => 'required|date',
        ]);

        TreatmentTimelineEvent::record(
            $patient->id,
            'note',
            $validated['title'],
            $validated['description'] ?? null,
            null, null, null, null,
            $validated['event_date']
        );

        return back()->with('success', 'Note added to timeline.');
    }
}
