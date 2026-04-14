<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeAttendance extends Model
{
    protected $fillable = [
        'employee_id', 'attendance_date', 'time_in', 'time_out',
        'status', 'hours_worked', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'attendance_date' => 'date',
            'hours_worked'    => 'decimal:2',
        ];
    }

    public function employee() { return $this->belongsTo(Employee::class); }
}
