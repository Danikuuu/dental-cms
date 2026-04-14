<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'invoice_number', 'or_number', 'patient_id', 'appointment_id', 'created_by',
        'invoice_date', 'due_date',
        'subtotal', 'discount_amount', 'discount_type', 'discount_percent',
        'tax_amount', 'total_amount', 'amount_paid', 'balance',
        'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'invoice_date'    => 'date',
            'due_date'        => 'date',
            'subtotal'        => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount'      => 'decimal:2',
            'total_amount'    => 'decimal:2',
            'amount_paid'     => 'decimal:2',
            'balance'         => 'decimal:2',
        ];
    }

    public function patient()    { return $this->belongsTo(Patient::class); }
    public function appointment(){ return $this->belongsTo(Appointment::class); }
    public function createdBy()  { return $this->belongsTo(User::class, 'created_by'); }
    public function items()      { return $this->hasMany(InvoiceItem::class); }
    public function payments()   { return $this->hasMany(Payment::class); }

    protected static function booted(): void
    {
        static::creating(function (Invoice $invoice) {
            if (empty($invoice->invoice_number)) {
                $year  = date('Y');
                $count = static::whereYear('created_at', $year)->withTrashed()->count() + 1;
                $invoice->invoice_number = 'INV-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
            }
        });
    }
}
