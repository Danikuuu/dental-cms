<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeLeave extends Model
{
    protected $fillable = [
        'employee_id', 'approved_by', 'leave_type',
        'start_date', 'end_date', 'days_count',
        'reason', 'status',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
        ];
    }

    public function employee()   { return $this->belongsTo(Employee::class); }
    public function approvedBy() { return $this->belongsTo(User::class, 'approved_by'); }
}
