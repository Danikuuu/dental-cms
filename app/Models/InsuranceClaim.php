<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InsuranceClaim extends Model
{
    protected $fillable = [
        'patient_insurance_id', 'invoice_id', 'patient_id',
        'claim_number', 'claim_date', 'claimed_amount', 'approved_amount',
        'rejected_amount', 'status', 'submission_date', 'approval_date',
        'payment_date', 'rejection_reason', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'claim_date'      => 'date',
            'submission_date' => 'date',
            'approval_date'   => 'date',
            'payment_date'    => 'date',
            'claimed_amount'  => 'decimal:2',
            'approved_amount' => 'decimal:2',
            'rejected_amount' => 'decimal:2',
        ];
    }

    public function insurance() { return $this->belongsTo(PatientInsurance::class, 'patient_insurance_id'); }
    public function invoice()   { return $this->belongsTo(Invoice::class); }
    public function patient()   { return $this->belongsTo(Patient::class); }
}
