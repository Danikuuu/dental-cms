<?php

namespace App\Http\Controllers;

use App\Models\DentalChartEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DentalChartController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id'     => 'required|exists:patients,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'tooth_number'   => 'required|string|max:10',
            'surface'        => 'nullable|string|max:20',
            'condition'      => 'required|string|max:100',
            'treatment'      => 'nullable|string|max:100',
            'status'         => 'required|in:existing,planned,completed',
            'chart_type'     => 'required|in:adult,pedo',
            'date_recorded'  => 'required|date',
            'notes'          => 'nullable|string',
        ]);

        $validated['dentist_id'] = Auth::id();

        DentalChartEntry::create($validated);

        return back()->with('success', 'Chart entry saved.');
    }

    public function destroy(DentalChartEntry $entry)
    {
        $entry->delete();
        return back()->with('success', 'Chart entry removed.');
    }
}
