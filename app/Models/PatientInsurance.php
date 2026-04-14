<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientInsurance extends Model
{
    protected $table = 'patient_insurance';
    
    protected $fillable = [
        'patient_id', 'provider_id', 'policy_number', 'member_id',
        'group_number', 'effective_date', 'expiry_date',
        'coverage_limit', 'used_amount', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'effective_date' => 'date',
            'expiry_date'    => 'date',
            'coverage_limit' => 'decimal:2',
            'used_amount'    => 'decimal:2',
        ];
    }

    public function getRemainingCoverageAttribute(): float
    {
        return max(0, (float) $this->coverage_limit - (float) $this->used_amount);
    }

    public function patient()  { return $this->belongsTo(Patient::class); }
    public function provider() { return $this->belongsTo(InsuranceProvider::class, 'provider_id'); }
    public function claims()   { return $this->hasMany(InsuranceClaim::class); }
}
