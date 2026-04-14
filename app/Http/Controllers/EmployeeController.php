<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeLeave;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $employees = Employee::with('user')
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->search, fn ($q, $s) =>
                $q->where('first_name', 'like', "%$s%")
                  ->orWhere('last_name',  'like', "%$s%")
                  ->orWhere('position',   'like', "%$s%")
            )
            ->orderBy('last_name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('employees/Index', [
            'employees' => $employees,
            'filters'   => $request->only(['status', 'search']),
            'stats' => [
                'active'    => Employee::where('status', 'active')->count(),
                'on_leave'  => Employee::where('status', 'on_leave')->count(),
                'total'     => Employee::count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'position'        => 'required|string|max:100',
            'employment_type' => 'required|in:full_time,part_time,contractual,per_visit',
            'date_hired'      => 'required|date',
            'phone'           => 'nullable|string|max:20',
            'email'           => 'nullable|email|max:100',
            'address'         => 'nullable|string',
            'basic_salary'    => 'required|numeric|min:0',
            'pay_period'      => 'required|in:daily,weekly,bi_monthly,monthly',
            'sss_number'      => 'nullable|string|max:20',
            'philhealth_number'=> 'nullable|string|max:20',
            'pagibig_number'  => 'nullable|string|max:20',
            'tin_number'      => 'nullable|string|max:20',
            'bank_name'       => 'nullable|string|max:100',
            'bank_account'    => 'nullable|string|max:50',
            'emergency_contact_name'  => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'notes'           => 'nullable|string',
        ]);

        $employee = Employee::create($validated);
        ActivityLog::record('create_employee', "Created employee: {$employee->full_name}", Employee::class, $employee->id);

        return back()->with('success', 'Employee added.');
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'position'        => 'required|string|max:100',
            'employment_type' => 'required|in:full_time,part_time,contractual,per_visit',
            'status'          => 'required|in:active,on_leave,terminated,resigned',
            'basic_salary'    => 'required|numeric|min:0',
            'pay_period'      => 'required|in:daily,weekly,bi_monthly,monthly',
            'phone'           => 'nullable|string|max:20',
            'email'           => 'nullable|email|max:100',
            'sss_number'      => 'nullable|string|max:20',
            'philhealth_number'=> 'nullable|string|max:20',
            'pagibig_number'  => 'nullable|string|max:20',
            'tin_number'      => 'nullable|string|max:20',
            'date_terminated' => 'nullable|date',
            'notes'           => 'nullable|string',
        ]);

        $employee->update($validated);
        return back()->with('success', 'Employee updated.');
    }

    public function attendance(Request $request)
    {
        $validated = $request->validate([
            'employee_id'     => 'required|exists:employees,id',
            'attendance_date' => 'required|date',
            'time_in'         => 'nullable|date_format:H:i',
            'time_out'        => 'nullable|date_format:H:i|after:time_in',
            'status'          => 'required|in:present,absent,late,half_day,on_leave,holiday',
            'notes'           => 'nullable|string',
        ]);

        // Calculate hours if both times given
        if (isset($validated['time_in'], $validated['time_out'])) {
            $in  = \Carbon\Carbon::createFromFormat('H:i', $validated['time_in']);
            $out = \Carbon\Carbon::createFromFormat('H:i', $validated['time_out']);
            $validated['hours_worked'] = round($out->diffInMinutes($in) / 60, 2);
        }

        EmployeeAttendance::updateOrCreate(
            ['employee_id' => $validated['employee_id'], 'attendance_date' => $validated['attendance_date']],
            $validated
        );

        return back()->with('success', 'Attendance recorded.');
    }

    public function storeLeave(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'leave_type'  => 'required|in:sick,vacation,emergency,maternity,paternity,unpaid',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'reason'      => 'nullable|string',
        ]);

        $validated['days_count'] = \Carbon\Carbon::parse($validated['start_date'])
            ->diffInWeekdays(\Carbon\Carbon::parse($validated['end_date'])) + 1;

        EmployeeLeave::create($validated);
        return back()->with('success', 'Leave request filed.');
    }

    public function updateLeave(Request $request, EmployeeLeave $leave)
    {
        $request->validate(['status' => 'required|in:pending,approved,rejected,cancelled']);
        $leave->update([
            'status'      => $request->status,
            'approved_by' => $request->status === 'approved' ? Auth::id() : null,
        ]);

        // Update employee status if approved
        if ($request->status === 'approved') {
            $today = now()->toDateString();
            if ($leave->start_date <= $today && $leave->end_date >= $today) {
                $leave->employee->update(['status' => 'on_leave']);
            }
        }

        return back()->with('success', 'Leave request updated.');
    }

    public function show(Employee $employee): Response
    {
        $employee->load('user');
        $attendance = EmployeeAttendance::where('employee_id', $employee->id)
            ->whereBetween('attendance_date', [now()->startOfMonth(), now()->endOfMonth()])
            ->orderBy('attendance_date')
            ->get();
        $leaves = EmployeeLeave::where('employee_id', $employee->id)
            ->orderByDesc('start_date')
            ->limit(10)
            ->get();

        return Inertia::render('employees/Show', [
            'employee'   => $employee,
            'attendance' => $attendance,
            'leaves'     => $leaves,
            'month_stats' => [
                'present'  => $attendance->whereIn('status', ['present', 'late'])->count(),
                'absent'   => $attendance->where('status', 'absent')->count(),
                'late'     => $attendance->where('status', 'late')->count(),
                'on_leave' => $attendance->where('status', 'on_leave')->count(),
                'hours'    => $attendance->sum('hours_worked'),
            ],
        ]);
    }
}
