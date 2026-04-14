<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected $fillable = [
        'category_id', 'name', 'sku', 'unit', 'current_stock',
        'minimum_stock', 'reorder_level', 'unit_cost', 'unit_price',
        'supplier', 'supplier_contact', 'expiry_date', 'storage_location',
        'is_active', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'current_stock' => 'decimal:2',
            'minimum_stock' => 'decimal:2',
            'reorder_level' => 'decimal:2',
            'unit_cost'     => 'decimal:2',
            'unit_price'    => 'decimal:2',
            'expiry_date'   => 'date',
            'is_active'     => 'boolean',
        ];
    }

    public function category()     { return $this->belongsTo(InventoryCategory::class, 'category_id'); }
    public function transactions() { return $this->hasMany(InventoryTransaction::class, 'item_id'); }

    public function getLowStockAttribute(): bool
    {
        return (float) $this->current_stock <= (float) $this->reorder_level;
    }

    public function getCriticalStockAttribute(): bool
    {
        return (float) $this->current_stock <= (float) $this->minimum_stock;
    }

    /** Adjust stock and record a transaction */
    public function adjustStock(string $type, float $qty, ?float $unitCost, ?string $notes, ?string $ref, int $userId): InventoryTransaction
    {
        $before = (float) $this->current_stock;
        $after  = match ($type) {
            'stock_in'   => $before + $qty,
            'stock_out'  => $before - $qty,
            'adjustment' => $qty,           // absolute value
            'expired'    => $before - $qty,
            'returned'   => $before + $qty,
            default      => $before,
        };

        $this->update(['current_stock' => max(0, $after)]);

        return $this->transactions()->create([
            'performed_by'     => $userId,
            'type'             => $type,
            'quantity'         => $qty,
            'unit_cost'        => $unitCost ?? $this->unit_cost,
            'stock_before'     => $before,
            'stock_after'      => max(0, $after),
            'reference'        => $ref,
            'notes'            => $notes,
            'transaction_date' => now()->toDateString(),
        ]);
    }
}
