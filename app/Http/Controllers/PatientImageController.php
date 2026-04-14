<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\PatientImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PatientImageController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'patient_id'     => 'required|exists:patients,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'image'          => 'required|file|mimes:jpg,jpeg,png,gif,webp,bmp|max:20480',
            'type'           => 'required|in:xray,intraoral,extraoral,document,other',
            'tooth_number'   => 'nullable|string|max:10',
            'notes'          => 'nullable|string',
            'date_taken'     => 'required|date',
        ]);

        $file = $request->file('image');
        $path = $file->store("patients/{$request->patient_id}/images", 'public');

        PatientImage::create([
            'patient_id'     => $request->patient_id,
            'appointment_id' => $request->appointment_id,
            'uploaded_by'    => Auth::id(),
            'filename'       => $path,
            'original_name'  => $file->getClientOriginalName(),
            'type'           => $request->type,
            'tooth_number'   => $request->tooth_number,
            'notes'          => $request->notes,
            'date_taken'     => $request->date_taken,
            'file_size'      => $file->getSize(),
            'mime_type'      => $file->getMimeType(),
        ]);

        return back()->with('success', 'Image uploaded successfully.');
    }

    public function destroy(PatientImage $image)
    {
        Storage::disk('public')->delete($image->filename);
        $image->delete();
        return back()->with('success', 'Image deleted.');
    }
}
