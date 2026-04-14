<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatientImage extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'patient_id', 'appointment_id', 'uploaded_by',
        'filename', 'original_name', 'type',
        'tooth_number', 'notes', 'date_taken',
        'file_size', 'mime_type',
    ];

    protected $appends = ['url'];

    protected function casts(): array
    {
        return ['date_taken' => 'date'];
    }

    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->filename);
    }

    public function patient()     { return $this->belongsTo(Patient::class); }
    public function uploadedBy()  { return $this->belongsTo(User::class, 'uploaded_by'); }
    public function appointment() { return $this->belongsTo(Appointment::class); }
}
