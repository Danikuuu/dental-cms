<?php

namespace App\Http\Controllers;

use App\Models\ClinicSetting;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('settings/Index', [
            'clinic'   => ClinicSetting::allAsArray(),
            'services' => Service::orderBy('category')->orderBy('name')->get(),
            'users'    => User::orderBy('name')->get(['id', 'name', 'email', 'role', 'phone', 'license_number']),
        ]);
    }

    public function updateClinic(Request $request)
    {
        $validated = $request->validate([
            'clinic_name'    => 'required|string|max:150',
            'clinic_address' => 'nullable|string|max:255',
            'clinic_phone'   => 'nullable|string|max:30',
            'clinic_email'   => 'nullable|email|max:100',
            'clinic_tin'     => 'nullable|string|max:30',
            'vat_registered' => 'boolean',
            'vat_percent'    => 'nullable|numeric|min:0|max:100',
            'receipt_footer' => 'nullable|string|max:500',
        ]);

        foreach ($validated as $key => $value) {
            ClinicSetting::set($key, $value, str_contains($key, 'vat') ? 'billing' : 'general');
        }

        return back()->with('success', 'Clinic settings saved.');
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:100',
            'email'          => 'required|email|unique:users,email',
            'password'       => 'required|string|min:8',
            'role'           => 'required|in:admin,dentist,staff,receptionist',
            'phone'          => 'nullable|string|max:20',
            'license_number' => 'nullable|string|max:50',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        User::create($validated);

        return back()->with('success', 'Staff account created.');
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:100',
            'role'           => 'required|in:admin,dentist,staff,receptionist',
            'phone'          => 'nullable|string|max:20',
            'license_number' => 'nullable|string|max:50',
        ]);

        if ($request->filled('password')) {
            $request->validate(['password' => 'string|min:8']);
            $validated['password'] = Hash::make($request->password);
        }

        $user->update($validated);

        return back()->with('success', 'Staff account updated.');
    }
}
