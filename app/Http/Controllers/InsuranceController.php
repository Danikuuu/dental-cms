<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\InsuranceClaim;
use App\Models\InsuranceProvider;
use App\Models\PatientInsurance;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InsuranceController extends Controller
{
    public function index(Request $request): Response
    {
        $claims = InsuranceClaim::with(['patient', 'insurance.provider', 'invoice'])
            ->when($request->status,  fn ($q, $s) => $q->where('status', $s))
            ->when($request->patient_id, fn ($q, $id) => $q->where('patient_id', $id))
            ->orderByDesc('claim_date')
            ->paginate(20)
            ->withQueryString();

        $providers = InsuranceProvider::where('is_active', true)->orderBy('name')->get();

        $stats = [
            'pending'  => InsuranceClaim::where('status', 'pending')->count(),
            'submitted'=> InsuranceClaim::where('status', 'submitted')->count(),
            'approved' => InsuranceClaim::where('status', 'approved')->count(),
            'total_approved_amount' => (float) InsuranceClaim::where('status', 'approved')->sum('approved_amount'),
        ];

        return Inertia::render('insurance/Index', [
            'claims'    => $claims,
            'providers' => $providers,
            'stats'     => $stats,
            'filters'   => $request->only(['status', 'patient_id']),
        ]);
    }

    public function storeProvider(Request $request)
    {
        $validated = $request->validate([
            'name'                 => 'required|string|max:150',
            'code'                 => 'nullable|string|max:20',
            'contact_number'       => 'nullable|string|max:30',
            'email'                => 'nullable|email|max:100',
            'address'              => 'nullable|string',
            'covered_procedures'   => 'nullable|string',
        ]);

        InsuranceProvider::create($validated);
        return back()->with('success', 'Insurance provider added.');
    }

    public function storePatientInsurance(Request $request)
    {
        $validated = $request->validate([
            'patient_id'     => 'required|exists:patients,id',
            'provider_id'    => 'required|exists:insurance_providers,id',
            'policy_number'  => 'required|string|max:100',
            'member_id'      => 'nullable|string|max:100',
            'group_number'   => 'nullable|string|max:100',
            'effective_date' => 'required|date',
            'expiry_date'    => 'nullable|date|after:effective_date',
            'coverage_limit' => 'required|numeric|min:0',
            'notes'          => 'nullable|string',
        ]);

        PatientInsurance::create($validated);
        ActivityLog::record('add_insurance', "Added insurance for patient #{$validated['patient_id']}: policy {$validated['policy_number']}");

        return back()->with('success', 'Insurance policy added.');
    }

    public function storeClaim(Request $request)
    {
        $validated = $request->validate([
            'patient_insurance_id' => 'required|exists:patient_insurance,id',
            'invoice_id'           => 'required|exists:invoices,id',
            'claim_date'           => 'required|date',
            'claimed_amount'       => 'required|numeric|min:0.01',
            'notes'                => 'nullable|string',
        ]);

        $insurance = PatientInsurance::findOrFail($validated['patient_insurance_id']);

        $claim = InsuranceClaim::create([
            ...$validated,
            'patient_id' => $insurance->patient_id,
            'status'     => 'pending',
        ]);

        ActivityLog::record('create_claim', "Insurance claim filed for patient #{$insurance->patient_id}: ₱{$validated['claimed_amount']}", InsuranceClaim::class, $claim->id);

        return back()->with('success', 'Claim filed.');
    }

    public function updateClaim(Request $request, InsuranceClaim $claim)
    {
        $validated = $request->validate([
            'status'           => 'required|in:pending,submitted,approved,partial,rejected,paid',
            'approved_amount'  => 'nullable|numeric|min:0',
            'rejected_amount'  => 'nullable|numeric|min:0',
            'claim_number'     => 'nullable|string|max:100',
            'submission_date'  => 'nullable|date',
            'approval_date'    => 'nullable|date',
            'payment_date'     => 'nullable|date',
            'rejection_reason' => 'nullable|string',
            'notes'            => 'nullable|string',
        ]);

        $claim->update($validated);

        // Update used_amount on the insurance policy when paid
        if ($validated['status'] === 'paid' && isset($validated['approved_amount'])) {
            $claim->insurance->increment('used_amount', $validated['approved_amount']);
        }

        ActivityLog::record('update_claim', "Claim #{$claim->id} status → {$validated['status']}", InsuranceClaim::class, $claim->id);

        return back()->with('success', 'Claim updated.');
    }
}
