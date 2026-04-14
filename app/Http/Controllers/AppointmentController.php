<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function index(Request $request): Response
    {
        $appointments = Appointment::with(['patient', 'dentist'])
            ->when($request->date,      fn ($q, $d)  => $q->whereDate('scheduled_at', $d))
            ->when($request->status,    fn ($q, $s)  => $q->where('status', $s))
            ->when($request->dentist_id,fn ($q, $id) => $q->where('dentist_id', $id))
            ->orderBy('scheduled_at')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('appointments/Index', [
            'appointments' => $appointments,
            'dentists'     => User::where('role', 'dentist')->get(['id', 'name']),
            'filters'      => $request->only(['date', 'status', 'dentist_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id'       => 'required|exists:patients,id',
            'dentist_id'       => 'required|exists:users,id',
            'scheduled_at'     => 'required|date',
            'duration_minutes' => 'required|integer|min:15|max:240',
            'chief_complaint'  => 'nullable|string|max:500',
            'notes'            => 'nullable|string',
        ]);

        Appointment::create($validated);

        return back()->with('success', 'Appointment scheduled successfully.');
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'status'         => 'required|in:scheduled,confirmed,in_progress,completed,cancelled,no_show',
            'clinical_notes' => 'nullable|string',
            'notes'          => 'nullable|string',
        ]);

        $appointment->update($validated);

        return back()->with('success', 'Appointment updated.');
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->update(['status' => 'cancelled']);
        return back()->with('success', 'Appointment cancelled.');
    }
}
