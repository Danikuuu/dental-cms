<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id', 'action', 'model_type', 'model_id',
        'description', 'changes', 'ip_address',
    ];

    protected function casts(): array
    {
        return ['changes' => 'array'];
    }

    public function user() { return $this->belongsTo(User::class); }

    /** Convenience helper to record an action from anywhere */
    public static function record(string $action, string $description, ?string $modelType = null, ?int $modelId = null, ?array $changes = null): void
    {
        static::create([
            'user_id'    => Auth::id(),
            'action'     => $action,
            'description'=> $description,
            'model_type' => $modelType,
            'model_id'   => $modelId,
            'changes'    => $changes,
            'ip_address' => request()->ip(),
        ]);
    }
}
