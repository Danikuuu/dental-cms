<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:150',
            'category'         => 'required|string|max:100',
            'base_fee'         => 'required|numeric|min:0',
            'description'      => 'nullable|string',
            'code'             => 'nullable|string|max:20',
            'is_vat_inclusive' => 'boolean',
        ]);

        Service::create($validated);

        return back()->with('success', 'Service added to catalog.');
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:150',
            'category'         => 'required|string|max:100',
            'base_fee'         => 'required|numeric|min:0',
            'description'      => 'nullable|string',
            'code'             => 'nullable|string|max:20',
            'is_vat_inclusive' => 'boolean',
            'is_active'        => 'boolean',
        ]);

        $service->update($validated);

        return back()->with('success', 'Service updated.');
    }

    public function destroy(Service $service)
    {
        $service->update(['is_active' => false]);
        return back()->with('success', 'Service deactivated.');
    }
}
