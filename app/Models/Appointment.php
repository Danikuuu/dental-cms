<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $fillable = [
        'patient_id', 'dentist_id', 'scheduled_at', 'duration_minutes',
        'status', 'chief_complaint', 'notes', 'clinical_notes',
    ];

    protected function casts(): array
    {
        return ['scheduled_at' => 'datetime'];
    }

    public function patient()  { return $this->belongsTo(Patient::class); }
    public function dentist()  { return $this->belongsTo(User::class, 'dentist_id'); }
    public function invoices() { return $this->hasMany(Invoice::class); }
    public function chartEntries() { return $this->hasMany(DentalChartEntry::class); }
    public function images()   { return $this->hasMany(PatientImage::class); }
}
