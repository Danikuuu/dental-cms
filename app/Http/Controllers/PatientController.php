<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(Request $request): Response
    {
        $patients = Patient::query()
            ->when($request->search, fn ($q, $s) =>
                $q->where('first_name', 'like', "%$s%")
                  ->orWhere('last_name',  'like', "%$s%")
                  ->orWhere('patient_code', 'like', "%$s%")
                  ->orWhere('phone',      'like', "%$s%")
            )
            ->orderBy('last_name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('patients/Index', [
            'patients' => $patients,
            'filters'  => $request->only('search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('patients/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name'   => 'required|string|max:100',
            'middle_name'  => 'nullable|string|max:100',
            'last_name'    => 'required|string|max:100',
            'date_of_birth'=> 'required|date',
            'sex'          => 'required|in:Male,Female',
            'civil_status' => 'nullable|in:Single,Married,Widowed,Separated',
            'address'      => 'nullable|string|max:255',
            'city'         => 'nullable|string|max:100',
            'province'     => 'nullable|string|max:100',
            'phone'        => 'nullable|string|max:20',
            'email'        => 'nullable|email|max:100',
            'occupation'   => 'nullable|string|max:100',
            'referred_by'  => 'nullable|string|max:100',
            'philhealth_number' => 'nullable|string|max:20',
            'emergency_contact_name'     => 'nullable|string|max:100',
            'emergency_contact_phone'    => 'nullable|string|max:20',
            'emergency_contact_relation' => 'nullable|string|max:50',
            'blood_type'         => 'nullable|string|max:5',
            'allergies'          => 'nullable|string',
            'current_medications'=> 'nullable|string',
            'past_surgeries'     => 'nullable|string',
            'medical_notes'      => 'nullable|string',
            'has_hypertension'   => 'boolean',
            'has_diabetes'       => 'boolean',
            'has_heart_disease'  => 'boolean',
            'has_asthma'         => 'boolean',
            'has_bleeding_disorder'  => 'boolean',
            'has_thyroid_disorder'   => 'boolean',
            'is_pregnant'        => 'boolean',
            'has_kidney_disease' => 'boolean',
            'has_liver_disease'  => 'boolean',
            'last_dental_visit'  => 'nullable|date',
            'previous_dentist'   => 'nullable|string|max:100',
            'dental_complaints'  => 'nullable|string',
        ]);

        $patient = Patient::create($validated);

        return redirect()->route('patients.show', $patient)
            ->with('success', 'Patient record created successfully.');
    }

    public function show(Patient $patient): Response
    {
        $patient->load([
            'appointments.dentist',
            'dentalChartEntries.dentist',
            'invoices',
            'treatmentPlans.items',
            'images',
        ]);

        return Inertia::render('patients/Show', [
            'patient' => $patient->append(['full_name', 'age']),
        ]);
    }

    public function edit(Patient $patient): Response
    {
        return Inertia::render('patients/Edit', [
            'patient' => $patient->append(['full_name', 'age']),
        ]);
    }

    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'first_name'   => 'required|string|max:100',
            'middle_name'  => 'nullable|string|max:100',
            'last_name'    => 'required|string|max:100',
            'date_of_birth'=> 'required|date',
            'sex'          => 'required|in:Male,Female',
            'civil_status' => 'nullable|in:Single,Married,Widowed,Separated',
            'address'      => 'nullable|string|max:255',
            'city'         => 'nullable|string|max:100',
            'province'     => 'nullable|string|max:100',
            'phone'        => 'nullable|string|max:20',
            'email'        => 'nullable|email|max:100',
            'occupation'   => 'nullable|string|max:100',
            'referred_by'  => 'nullable|string|max:100',
            'philhealth_number' => 'nullable|string|max:20',
            'emergency_contact_name'     => 'nullable|string|max:100',
            'emergency_contact_phone'    => 'nullable|string|max:20',
            'emergency_contact_relation' => 'nullable|string|max:50',
            'blood_type'         => 'nullable|string|max:5',
            'allergies'          => 'nullable|string',
            'current_medications'=> 'nullable|string',
            'past_surgeries'     => 'nullable|string',
            'medical_notes'      => 'nullable|string',
            'has_hypertension'   => 'boolean',
            'has_diabetes'       => 'boolean',
            'has_heart_disease'  => 'boolean',
            'has_asthma'         => 'boolean',
            'has_bleeding_disorder'  => 'boolean',
            'has_thyroid_disorder'   => 'boolean',
            'is_pregnant'        => 'boolean',
            'has_kidney_disease' => 'boolean',
            'has_liver_disease'  => 'boolean',
            'last_dental_visit'  => 'nullable|date',
            'previous_dentist'   => 'nullable|string|max:100',
            'dental_complaints'  => 'nullable|string',
        ]);

        $patient->update($validated);

        return redirect()->route('patients.show', $patient)
            ->with('success', 'Patient record updated successfully.');
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();
        return redirect()->route('patients.index')
            ->with('success', 'Patient record deleted.');
    }
}
