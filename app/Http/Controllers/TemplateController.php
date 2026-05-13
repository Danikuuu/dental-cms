<?php

namespace App\Http\Controllers;

use App\Models\ClinicSetting;
use App\Models\Patient;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Purifier;

class TemplateController extends Controller
{
    private function sanitizeTemplateHtml(string $html): string
    {
        // Strip scripts/event-handlers and other unsafe HTML while preserving printable formatting.
        return Purifier::clean($html);
    }

    public function index(): Response
    {
        return Inertia::render('templates/Index', [
            'templates' => Template::with('createdBy')
                ->where('is_active', true)
                ->orderBy('type')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:prescription,dental_certificate,consent_form,referral_letter,medical_certificate,treatment_plan,custom',
            'content' => 'required|string',
            'description' => 'nullable|string|max:255',
        ]);

        $validated['content'] = $this->sanitizeTemplateHtml($validated['content']);
        $validated['created_by'] = Auth::id();

        Template::create($validated);

        return back()->with('success', 'Template saved.');
    }

    public function update(Request $request, Template $template)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'content' => 'required|string',
            'description' => 'nullable|string|max:255',
        ]);

        $validated['content'] = $this->sanitizeTemplateHtml($validated['content']);
        $template->update($validated);

        return back()->with('success', 'Template updated.');
    }

    public function destroy(Template $template)
    {
        $template->update(['is_active' => false]);

        return back()->with('success', 'Template removed.');
    }

    /**
     * Render a template with patient data substituted in.
     */
    public function render(Request $request, Template $template)
    {
        $request->validate(['patient_id' => 'required|exists:patients,id']);

        $patient = Patient::findOrFail($request->patient_id)->append(['full_name', 'age']);
        $dentist = Auth::user();

        $replacements = [
            '{{patient_name}}' => $patient->full_name,
            '{{patient_age}}' => $patient->age,
            '{{patient_address}}' => trim("{$patient->address}, {$patient->city}, {$patient->province}", ', '),
            '{{patient_phone}}' => $patient->phone ?? '',
            '{{patient_email}}' => $patient->email ?? '',
            '{{date}}' => now()->format('F d, Y'),
            '{{dentist_name}}' => 'Dr. '.$dentist->name,
            '{{dentist_license}}' => $dentist->license_number ?? '',
            '{{clinic_name}}' => ClinicSetting::get('clinic_name', 'Dental Clinic'),
            '{{clinic_address}}' => ClinicSetting::get('clinic_address', ''),
            '{{clinic_phone}}' => ClinicSetting::get('clinic_phone', ''),
        ];

        $content = str_replace(
            array_keys($replacements),
            array_values($replacements),
            $template->content
        );

        $content = $this->sanitizeTemplateHtml($content);

        return response()->json(['rendered_content' => $content]);
    }
}
