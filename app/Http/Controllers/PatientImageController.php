<?php

namespace App\Http\Controllers;

use App\Models\PatientImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PatientImageController extends Controller
{
    private const ALLOWED_ROLES = ['admin', 'dentist', 'receptionist', 'staff'];

    public function store(Request $request)
    {
        abort_unless($request->user() && in_array($request->user()->role, self::ALLOWED_ROLES, true), 403);

        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'image' => 'required|file|mimes:jpg,jpeg,png,gif,webp,bmp|max:20480',
            'type' => 'required|in:xray,intraoral,extraoral,document,other',
            'tooth_number' => 'nullable|string|max:10',
            'notes' => 'nullable|string',
            'date_taken' => 'required|date',
        ]);

        $file = $request->file('image');
        $path = $file->store("patient-images/{$request->patient_id}", 'local');

        PatientImage::create([
            'patient_id' => $request->patient_id,
            'appointment_id' => $request->appointment_id,
            'uploaded_by' => Auth::id(),
            'filename' => $path,
            'original_name' => $file->getClientOriginalName(),
            'type' => $request->type,
            'tooth_number' => $request->tooth_number,
            'notes' => $request->notes,
            'date_taken' => $request->date_taken,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        return back()->with('success', 'Image uploaded successfully.');
    }

    public function show(Request $request, PatientImage $image)
    {
        abort_unless($request->user() && in_array($request->user()->role, self::ALLOWED_ROLES, true), 403);

        // Support both legacy public disk paths and new local/private paths
        $disk = str_starts_with((string) $image->filename, 'patients/') ? 'public' : 'local';

        abort_unless(Storage::disk($disk)->exists($image->filename), 404);

        return Storage::disk($disk)->response(
            $image->filename,
            $image->original_name ?: basename($image->filename),
            [
                'Content-Type' => $image->mime_type ?: 'application/octet-stream',
                'X-Content-Type-Options' => 'nosniff',
            ]
        );
    }

    public function destroy(PatientImage $image)
    {
        abort_unless(request()->user() && in_array(request()->user()->role, self::ALLOWED_ROLES, true), 403);

        $disk = str_starts_with((string) $image->filename, 'patients/') ? 'public' : 'local';
        Storage::disk($disk)->delete($image->filename);
        $image->delete();

        return back()->with('success', 'Image deleted.');
    }
}
