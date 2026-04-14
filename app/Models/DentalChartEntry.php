<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DentalChartEntry extends Model
{
    protected $fillable = [
        'patient_id', 'appointment_id', 'dentist_id',
        'tooth_number', 'surface', 'condition', 'treatment',
        'status', 'chart_type', 'date_recorded', 'notes',
    ];

    protected function casts(): array
    {
        return ['date_recorded' => 'date'];
    }

    public function patient()     { return $this->belongsTo(Patient::class); }
    public function dentist()     { return $this->belongsTo(User::class, 'dentist_id'); }
    public function appointment() { return $this->belongsTo(Appointment::class); }
}
