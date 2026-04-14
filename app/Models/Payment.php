<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'invoice_id', 'received_by', 'amount',
        'payment_date', 'method', 'reference_number', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'amount'       => 'decimal:2',
        ];
    }

    public function invoice()    { return $this->belongsTo(Invoice::class); }
    public function receivedBy() { return $this->belongsTo(User::class, 'received_by'); }
}
