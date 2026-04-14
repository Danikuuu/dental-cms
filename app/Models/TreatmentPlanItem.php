<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TreatmentPlanItem extends Model
{
    protected $fillable = [
        'treatment_plan_id', 'tooth_number', 'procedure_name',
        'estimated_fee', 'status', 'sequence',
    ];

    protected function casts(): array
    {
        return ['estimated_fee' => 'decimal:2'];
    }

    public function plan() { return $this->belongsTo(TreatmentPlan::class, 'treatment_plan_id'); }
}
