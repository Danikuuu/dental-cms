<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryTransaction extends Model
{
    protected $fillable = [
        'item_id', 'performed_by', 'type', 'quantity', 'unit_cost',
        'stock_before', 'stock_after', 'reference', 'notes', 'transaction_date',
    ];

    protected function casts(): array
    {
        return [
            'transaction_date' => 'date',
            'quantity'         => 'decimal:2',
            'unit_cost'        => 'decimal:2',
            'stock_before'     => 'decimal:2',
            'stock_after'      => 'decimal:2',
        ];
    }

    public function item()        { return $this->belongsTo(InventoryItem::class, 'item_id'); }
    public function performedBy() { return $this->belongsTo(User::class, 'performed_by'); }
}
