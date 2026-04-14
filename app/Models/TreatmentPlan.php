<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TreatmentPlan extends Model
{
    protected $fillable = [
        'patient_id', 'dentist_id', 'title', 'description',
        'status', 'start_date', 'target_completion_date',
    ];

    protected function casts(): array
    {
        return [
            'start_date'              => 'date',
            'target_completion_date'  => 'date',
        ];
    }

    public function patient() { return $this->belongsTo(Patient::class); }
    public function dentist() { return $this->belongsTo(User::class, 'dentist_id'); }
    public function items()   { return $this->hasMany(TreatmentPlanItem::class); }
}
