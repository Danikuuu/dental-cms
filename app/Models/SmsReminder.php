<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsReminder extends Model
{
    protected $fillable = [
        'appointment_id', 'patient_id', 'phone_number', 'message',
        'status', 'type', 'scheduled_at', 'sent_at', 'error_message',
        'provider', 'message_id',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'sent_at'      => 'datetime',
        ];
    }

    public function appointment() { return $this->belongsTo(Appointment::class); }
    public function patient()     { return $this->belongsTo(Patient::class); }

    /** Pending reminders due to be sent now */
    public function scopeDue($query)
    {
        return $query->where('status', 'pending')
                     ->where('scheduled_at', '<=', now());
    }
}
