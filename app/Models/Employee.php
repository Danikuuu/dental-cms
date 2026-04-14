<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'employee_code', 'first_name', 'last_name', 'position',
        'employment_type', 'date_hired', 'date_terminated', 'status',
        'phone', 'email', 'address',
        'sss_number', 'philhealth_number', 'pagibig_number', 'tin_number',
        'basic_salary', 'pay_period', 'bank_name', 'bank_account',
        'emergency_contact_name', 'emergency_contact_phone', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_hired'       => 'date',
            'date_terminated'  => 'date',
            'basic_salary'     => 'decimal:2',
        ];
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function user()       { return $this->belongsTo(User::class); }
    public function attendance() { return $this->hasMany(EmployeeAttendance::class); }
    public function leaves()     { return $this->hasMany(EmployeeLeave::class); }

    protected static function booted(): void
    {
        static::creating(function (Employee $emp) {
            if (empty($emp->employee_code)) {
                $year  = date('Y');
                $count = static::withTrashed()->whereYear('created_at', $year)->count() + 1;
                $emp->employee_code = 'EMP-' . $year . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);
            }
        });
    }
}
