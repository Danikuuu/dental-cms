<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'name', 'category', 'base_fee', 'description',
        'code', 'is_vat_inclusive', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'base_fee'        => 'decimal:2',
            'is_active'       => 'boolean',
            'is_vat_inclusive'=> 'boolean',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
