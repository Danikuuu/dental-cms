<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'patient_code', 'first_name', 'middle_name', 'last_name',
        'date_of_birth', 'sex', 'civil_status',
        'address', 'city', 'province',
        'phone', 'email', 'occupation', 'referred_by', 'philhealth_number',
        'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
        'has_hypertension', 'has_diabetes', 'has_heart_disease', 'has_asthma',
        'has_bleeding_disorder', 'has_thyroid_disorder', 'is_pregnant',
        'has_kidney_disease', 'has_liver_disease',
        'blood_type', 'allergies', 'current_medications', 'past_surgeries', 'medical_notes',
        'last_dental_visit', 'previous_dentist', 'dental_complaints', 'photo_path',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth'      => 'date',
            'last_dental_visit'  => 'date',
            'has_hypertension'   => 'boolean',
            'has_diabetes'       => 'boolean',
            'has_heart_disease'  => 'boolean',
            'has_asthma'         => 'boolean',
            'has_bleeding_disorder' => 'boolean',
            'has_thyroid_disorder'  => 'boolean',
            'is_pregnant'        => 'boolean',
            'has_kidney_disease' => 'boolean',
            'has_liver_disease'  => 'boolean',
        ];
    }

    // Computed attributes
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }

    public function getAgeAttribute(): int
    {
        return $this->date_of_birth->age;
    }

    // Relationships
    public function appointments()      { return $this->hasMany(Appointment::class); }
    public function dentalChartEntries(){ return $this->hasMany(DentalChartEntry::class); }
    public function invoices()          { return $this->hasMany(Invoice::class); }
    public function images()            { return $this->hasMany(PatientImage::class); }
    public function treatmentPlans()    { return $this->hasMany(TreatmentPlan::class); }

    // Auto-generate patient code
    protected static function booted(): void
    {
        static::creating(function (Patient $patient) {
            if (empty($patient->patient_code)) {
                $year  = date('Y');
                $count = static::whereYear('created_at', $year)->count() + 1;
                $patient->patient_code = 'PAT-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
            }
        });
    }
}
