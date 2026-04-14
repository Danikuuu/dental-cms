<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class TreatmentTimelineEvent extends Model
{
    protected $fillable = [
        'patient_id', 'created_by', 'event_type', 'title',
        'description', 'tooth_number', 'amount',
        'reference_id', 'reference_type', 'event_date',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'amount'     => 'decimal:2',
        ];
    }

    public function patient()   { return $this->belongsTo(Patient::class); }
    public function createdBy() { return $this->belongsTo(User::class, 'created_by'); }

    /**
     * Record a timeline event from anywhere in the app.
     */
    public static function record(
        int $patientId,
        string $eventType,
        string $title,
        ?string $description = null,
        ?string $toothNumber = null,
        ?float $amount = null,
        ?int $referenceId = null,
        ?string $referenceType = null,
        ?string $eventDate = null
    ): self {
        return static::create([
            'patient_id'     => $patientId,
            'created_by'     => Auth::id() ?? 1,
            'event_type'     => $eventType,
            'title'          => $title,
            'description'    => $description,
            'tooth_number'   => $toothNumber,
            'amount'         => $amount,
            'reference_id'   => $referenceId,
            'reference_type' => $referenceType,
            'event_date'     => $eventDate ?? now()->toDateString(),
        ]);
    }
}
