<?php

namespace App\Http\Middleware;

use App\Models\ClinicSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Shared data available to every Inertia page via usePage().props
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id'             => $request->user()->id,
                    'name'           => $request->user()->name,
                    'email'          => $request->user()->email,
                    'role'           => $request->user()->role,
                    'license_number' => $request->user()->license_number,
                ] : null,
                'can' => $request->user() ? [
                    'manage_users'    => in_array($request->user()->role, ['admin']),
                    'manage_settings' => in_array($request->user()->role, ['admin']),
                    'manage_billing'  => in_array($request->user()->role, ['admin', 'receptionist']),
                    'chart_teeth'     => in_array($request->user()->role, ['admin', 'dentist']),
                    'view_reports'    => in_array($request->user()->role, ['admin', 'dentist']),
                ] : [],
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
            'clinic' => fn () => [
                'name' => ClinicSetting::get('clinic_name', 'Dental Clinic'),
            ],
            'sms_enabled' => fn () => ClinicSetting::get('sms_enabled', 'false') === 'true',
        ];
    }
}
