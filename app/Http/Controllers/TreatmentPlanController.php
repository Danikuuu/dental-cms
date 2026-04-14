<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Patient;
use App\Models\TreatmentPlan;
use App\Models\TreatmentPlanItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TreatmentPlanController extends Controller
{
    public function index(Request $request): Response
    {
        $plans = TreatmentPlan::with(['patient', 'dentist', 'items'])
            ->when($request->patient_id, fn ($q, $id) => $q->where('patient_id', $id))
            ->when($request->status,     fn ($q, $s)  => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('treatment-plans/Index', [
            'plans'    => $plans,
            'filters'  => $request->only(['patient_id', 'status']),
            'patients' => Patient::orderBy('last_name')->get(['id', 'first_name', 'last_name', 'patient_code']),
            'dentists' => User::where('role', 'dentist')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id'              => 'required|exists:patients,id',
            'title'                   => 'required|string|max:200',
            'description'             => 'nullable|string',
            'start_date'              => 'nullable|date',
            'target_completion_date'  => 'nullable|date|after_or_equal:start_date',
            'items'                   => 'nullable|array',
            'items.*.tooth_number'    => 'nullable|string|max:10',
            'items.*.procedure_name'  => 'required_with:items|string|max:200',
            'items.*.estimated_fee'   => 'required_with:items|numeric|min:0',
            'items.*.sequence'        => 'nullable|integer|min:1',
        ]);

        $plan = TreatmentPlan::create([
            ...$validated,
            'dentist_id' => Auth::id(),
            'status'     => 'active',
        ]);

        foreach ($validated['items'] ?? [] as $i => $item) {
            $plan->items()->create([
                'tooth_number'   => $item['tooth_number'] ?? null,
                'procedure_name' => $item['procedure_name'],
                'estimated_fee'  => $item['estimated_fee'],
                'sequence'       => $item['sequence'] ?? ($i + 1),
                'status'         => 'pending',
            ]);
        }

        ActivityLog::record('create_treatment_plan', "Created treatment plan '{$plan->title}' for patient #{$validated['patient_id']}", TreatmentPlan::class, $plan->id);

        return back()->with('success', 'Treatment plan created.');
    }

    public function update(Request $request, TreatmentPlan $plan)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string',
            'status'      => 'required|in:draft,active,completed,cancelled',
            'target_completion_date' => 'nullable|date',
        ]);

        $plan->update($validated);
        ActivityLog::record('update_treatment_plan', "Updated treatment plan #{$plan->id}", TreatmentPlan::class, $plan->id);

        return back()->with('success', 'Treatment plan updated.');
    }

    public function updateItem(Request $request, TreatmentPlan $plan, TreatmentPlanItem $item)
    {
        $validated = $request->validate([
            'status'       => 'required|in:pending,in_progress,completed,skipped',
            'estimated_fee'=> 'nullable|numeric|min:0',
        ]);

        $item->update($validated);

        // Auto-complete plan if all items are done
        $allDone = $plan->items()->whereNotIn('status', ['completed','skipped'])->doesntExist();
        if ($allDone) $plan->update(['status' => 'completed']);

        return back()->with('success', 'Item updated.');
    }

    public function destroy(TreatmentPlan $plan)
    {
        $plan->update(['status' => 'cancelled']);
        return back()->with('success', 'Treatment plan cancelled.');
    }
}
