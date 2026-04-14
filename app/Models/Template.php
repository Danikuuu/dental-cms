<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    protected $fillable = [
        'name', 'type', 'content', 'description',
        'is_active', 'is_default', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active'  => 'boolean',
            'is_default' => 'boolean',
        ];
    }

    public function createdBy() { return $this->belongsTo(User::class, 'created_by'); }
}
