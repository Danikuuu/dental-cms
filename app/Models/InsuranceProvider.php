<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InsuranceProvider extends Model
{
    protected $fillable = [
        'name', 'code', 'contact_number', 'email',
        'address', 'covered_procedures', 'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function patientPolicies() { return $this->hasMany(PatientInsurance::class, 'provider_id'); }
}
