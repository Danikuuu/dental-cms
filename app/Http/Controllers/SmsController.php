<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Appointment;
use App\Models\SmsReminder;
use App\Models\ClinicSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class SmsController extends Controller
{
    public function index(Request $request): Response
    {
        $reminders = SmsReminder::with(['patient', 'appointment'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->date,   fn ($q, $d) => $q->whereDate('scheduled_at', $d))
            ->orderByDesc('scheduled_at')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('sms/Index', [
            'reminders' => $reminders,
            'filters'   => $request->only(['status', 'date']),
            'stats'     => [
                'pending' => SmsReminder::where('status', 'pending')->count(),
                'sent'    => SmsReminder::where('status', 'sent')->count(),
                'failed'  => SmsReminder::where('status', 'failed')->count(),
                'today'   => SmsReminder::whereDate('created_at', today())->count(),
            ],
            'settings'  => [
                'provider'    => ClinicSetting::get('sms_provider', 'semaphore'),
                'api_key'     => ClinicSetting::get('sms_api_key') ? '••••••••' : null,
                'sender_name' => ClinicSetting::get('sms_sender_name', 'DENTAL'),
                'enabled'     => ClinicSetting::get('sms_enabled', 'false') === 'true',
                'has_api_key' => (bool) ClinicSetting::get('sms_api_key'),
            ],
        ]);
    }

    /**
     * Simple ON/OFF toggle — admin only.
     * Called via POST /sms/toggle from the big switch on the SMS page.
     */
    public function toggle(Request $request)
    {
        $current = ClinicSetting::get('sms_enabled', 'false') === 'true';
        $new     = ! $current;

        ClinicSetting::set('sms_enabled', $new ? 'true' : 'false', 'sms');

        $state = $new ? 'ENABLED' : 'DISABLED';
        ActivityLog::record('sms_toggle', "SMS sending {$state} by " . Auth::user()->name);

        return back()->with('success', "SMS sending is now {$state}.");
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'patient_id'     => 'required|exists:patients,id',
            'phone_number'   => 'required|string|max:20',
            'message'        => 'required|string|max:160',
            'type'           => 'required|in:appointment_reminder,follow_up,custom',
            'appointment_id' => 'nullable|exists:appointments,id',
            'scheduled_at'   => 'nullable|date',
        ]);

        $reminder = SmsReminder::create([
            ...$validated,
            'status'       => 'pending',
            'scheduled_at' => $validated['scheduled_at'] ?? now(),
        ]);

        if (! isset($validated['scheduled_at']) || $validated['scheduled_at'] <= now()->toDateTimeString()) {
            $this->dispatchSms($reminder);
        }

        ActivityLog::record('send_sms', "SMS queued for patient #{$validated['patient_id']}: {$validated['type']}");

        $label = $reminder->status === 'sent' ? 'sent' : ($reminder->status === 'failed' ? 'failed — check SMS settings' : 'scheduled');
        return back()->with($reminder->status === 'failed' ? 'error' : 'success', "SMS {$label}.");
    }

    public function bulkReminders(Request $request)
    {
        $validated = $request->validate([
            'date'             => 'required|date',
            'hours_before'     => 'required|integer|in:1,2,3,6,12,24',
            'message_template' => 'required|string|max:160',
        ]);

        $appointments = Appointment::with('patient')
            ->whereDate('scheduled_at', $validated['date'])
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->get();

        $sent = 0; $skipped = 0;

        foreach ($appointments as $appt) {
            if (! $appt->patient?->phone) { $skipped++; continue; }

            $message = str_replace(
                ['{{patient_name}}', '{{time}}', '{{date}}', '{{clinic_name}}'],
                [
                    $appt->patient->first_name,
                    $appt->scheduled_at->format('g:i A'),
                    $appt->scheduled_at->format('M j, Y'),
                    ClinicSetting::get('clinic_name', 'Dental Clinic'),
                ],
                $validated['message_template']
            );

            $reminder = SmsReminder::create([
                'appointment_id' => $appt->id,
                'patient_id'     => $appt->patient_id,
                'phone_number'   => $appt->patient->phone,
                'message'        => $message,
                'type'           => 'appointment_reminder',
                'status'         => 'pending',
                'scheduled_at'   => $appt->scheduled_at->subHours($validated['hours_before']),
            ]);

            $this->dispatchSms($reminder);
            $sent++;
        }

        ActivityLog::record('bulk_sms', "Bulk SMS for {$validated['date']}: {$sent} sent, {$skipped} skipped (no phone)");

        $msg = "{$sent} SMS reminder(s) sent for {$validated['date']}.";
        if ($skipped) $msg .= " {$skipped} patient(s) skipped (no phone number on file).";
        return back()->with('success', $msg);
    }

    public function cancel(SmsReminder $reminder)
    {
        if ($reminder->status === 'pending') {
            $reminder->update(['status' => 'cancelled']);
            ActivityLog::record('cancel_sms', "Cancelled SMS reminder #{$reminder->id}");
        }
        return back()->with('success', 'Reminder cancelled.');
    }

    public function saveSettings(Request $request)
    {
        $validated = $request->validate([
            'sms_provider'    => 'required|in:semaphore,globe_labs,infobip,manual',
            'sms_api_key'     => 'nullable|string|max:200',
            'sms_sender_name' => 'nullable|string|max:11',
            'sms_enabled'     => 'boolean',
        ]);

        // Don't overwrite the real key if the masked placeholder was sent
        if (isset($validated['sms_api_key']) && $validated['sms_api_key'] === '••••••••') {
            unset($validated['sms_api_key']);
        }

        foreach ($validated as $key => $value) {
            // Store booleans as string 'true'/'false' for ClinicSetting
            $stored = is_bool($value) ? ($value ? 'true' : 'false') : $value;
            ClinicSetting::set($key, $stored, 'sms');
        }

        $state = ($validated['sms_enabled'] ?? false) ? 'ENABLED' : 'DISABLED';
        ActivityLog::record('sms_settings', "SMS settings updated. Sending: {$state}");

        return back()->with('success', 'SMS settings saved.');
    }

    // ── Private helpers ─────────────────────────────────────────────────────

    private function dispatchSms(SmsReminder $reminder): void
    {
        $enabled = ClinicSetting::get('sms_enabled', 'false') === 'true';
        $apiKey  = ClinicSetting::get('sms_api_key');

        // SMS is disabled — queue the message but do NOT send it
        if (! $enabled) {
            // Leave status as 'pending' — makes it clear it was not sent
            $reminder->update([
                'status'        => 'pending',
                'error_message' => 'SMS sending is disabled. Enable it in SMS Settings.',
            ]);
            return;
        }

        // No API key configured — fail gracefully
        if (! $apiKey) {
            $reminder->update([
                'status'        => 'failed',
                'error_message' => 'No SMS API key configured. Please add one in SMS Settings.',
            ]);
            return;
        }

        $provider = ClinicSetting::get('sms_provider', 'semaphore');

        try {
            match ($provider) {
                'semaphore'  => $this->sendViaSemaphore($reminder, $apiKey),
                'globe_labs' => $this->sendViaGlobeLabs($reminder, $apiKey),
                default      => $reminder->update([
                    'status'        => 'failed',
                    'error_message' => "Provider '{$provider}' is not yet configured.",
                ]),
            };
        } catch (\Exception $e) {
            $reminder->update([
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }
    }

    private function sendViaSemaphore(SmsReminder $reminder, string $apiKey): void
    {
        $response = Http::asForm()->post('https://api.semaphore.co/api/v4/messages', [
            'apikey'     => $apiKey,
            'number'     => $reminder->phone_number,
            'message'    => $reminder->message,
            'sendername' => ClinicSetting::get('sms_sender_name', 'DENTAL'),
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $reminder->update([
                'status'     => 'sent',
                'sent_at'    => now(),
                'message_id' => $data[0]['message_id'] ?? null,
                'error_message' => null,
            ]);
        } else {
            $reminder->update([
                'status'        => 'failed',
                'error_message' => 'Semaphore error: ' . $response->status() . ' — ' . substr($response->body(), 0, 200),
            ]);
        }
    }

    private function sendViaGlobeLabs(SmsReminder $reminder, string $apiKey): void
    {
        // Globe Labs SMS API (access_token based)
        $response = Http::post('https://devapi.globelabs.com.ph/smsmessaging/v1/outbound/messages', [
            'access_token'  => $apiKey,
            'outboundSMSMessageRequest' => [
                'clientCorrelator'        => (string) $reminder->id,
                'senderAddress'           => ClinicSetting::get('sms_sender_name', 'DENTAL'),
                'outboundSMSTextMessage'  => ['message' => $reminder->message],
                'address'                 => ['tel:+63' . ltrim($reminder->phone_number, '0')],
            ],
        ]);

        if ($response->successful()) {
            $reminder->update(['status' => 'sent', 'sent_at' => now(), 'error_message' => null]);
        } else {
            $reminder->update(['status' => 'failed', 'error_message' => 'Globe Labs error: ' . substr($response->body(), 0, 200)]);
        }
    }
}
