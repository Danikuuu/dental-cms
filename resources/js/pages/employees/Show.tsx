import {
    update as updateEmployee,
    attendance as recordAttendance,
    storeLeave,
    updateLeave,
} from '@/wayfinder/actions/App/Http/Controllers/EmployeeController';
import AppLayout from '@/layouts/AppLayout';
import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeftIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ic = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';
const fmt = (n: number | string) => `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const STATUS_PILL: Record<string, string> = {
    active:     'bg-green-100 text-green-800',
    on_leave:   'bg-amber-100 text-amber-800',
    terminated: 'bg-red-100 text-red-600',
    resigned:   'bg-slate-100 text-slate-600',
};
const ATTEND_PILL: Record<string, string> = {
    present:  'bg-green-100 text-green-800',
    absent:   'bg-red-100 text-red-600',
    late:     'bg-amber-100 text-amber-800',
    half_day: 'bg-blue-100 text-blue-700',
    on_leave: 'bg-purple-100 text-purple-700',
    holiday:  'bg-slate-100 text-slate-500',
};
const LEAVE_PILL: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-800',
    approved:  'bg-green-100 text-green-800',
    rejected:  'bg-red-100 text-red-600',
    cancelled: 'bg-slate-100 text-slate-500',
};

export default function EmployeeShow({ employee, attendance, leaves, month_stats }: any) {
    const [tab, setTab]           = useState<'overview'|'attendance'|'leaves'>('overview');
    const [showEdit, setShowEdit]  = useState(false);
    const [showAttend, setShowAttend] = useState(false);
    const [showLeave, setShowLeave]   = useState(false);

    const editForm = useForm({
        first_name:       employee.first_name,
        last_name:        employee.last_name,
        position:         employee.position,
        employment_type:  employee.employment_type,
        status:           employee.status,
        basic_salary:     employee.basic_salary,
        pay_period:       employee.pay_period,
        phone:            employee.phone ?? '',
        email:            employee.email ?? '',
        sss_number:       employee.sss_number ?? '',
        philhealth_number:employee.philhealth_number ?? '',
        pagibig_number:   employee.pagibig_number ?? '',
        tin_number:       employee.tin_number ?? '',
        date_terminated:  employee.date_terminated ?? '',
        notes:            employee.notes ?? '',
    });

    const attendForm = useForm({
        employee_id:     employee.id,
        attendance_date: new Date().toISOString().split('T')[0],
        time_in:         '08:00',
        time_out:        '17:00',
        status:          'present',
        notes:           '',
    });

    const leaveForm = useForm({
        employee_id: employee.id,
        leave_type:  'sick',
        start_date:  new Date().toISOString().split('T')[0],
        end_date:    new Date().toISOString().split('T')[0],
        reason:      '',
    });

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.submit(updateEmployee(employee.id), {
            onSuccess: () => setShowEdit(false),
        });
    };

    const handleAttendSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        attendForm.submit(recordAttendance(), {
            onSuccess: () => { attendForm.reset(); setShowAttend(false); },
        });
    };

    const handleLeaveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        leaveForm.submit(storeLeave(), {
            onSuccess: () => { leaveForm.reset(); setShowLeave(false); },
        });
    };

    return (
        <AppLayout title={`${employee.first_name} ${employee.last_name}`}>
            <div className="max-w-5xl">
                {/* Back */}
                <Link href="/employees" className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-5">
                    <ArrowLeftIcon className="w-4 h-4" /> Back to Employees
                </Link>

                {/* Header card */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-lg font-bold flex-shrink-0">
                            {employee.first_name?.[0]}{employee.last_name?.[0]}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div>
                                    <h1 className="text-lg font-bold text-slate-800">{employee.last_name}, {employee.first_name}</h1>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{employee.employee_code}</span>
                                        <span className="text-sm text-slate-500">{employee.position}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${STATUS_PILL[employee.status] ?? ''}`}>
                                            {employee.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setShowEdit(v => !v)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                                    <PencilIcon className="w-4 h-4" /> Edit
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Month stats */}
                    <div className="grid grid-cols-5 gap-3 mt-5 pt-5 border-t border-slate-100">
                        {[
                            { label: 'Present',  value: month_stats.present,  cls: 'text-green-700' },
                            { label: 'Absent',   value: month_stats.absent,   cls: 'text-red-600' },
                            { label: 'Late',     value: month_stats.late,     cls: 'text-amber-700' },
                            { label: 'On Leave', value: month_stats.on_leave, cls: 'text-purple-700' },
                            { label: 'Hrs Worked', value: Number(month_stats.hours).toFixed(1), cls: 'text-slate-800' },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <div className={`text-xl font-bold ${s.cls}`}>{s.value}</div>
                                <div className="text-xs text-slate-400">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Edit form */}
                {showEdit && (
                    <div className="bg-white border border-teal-200 rounded-xl p-5 mb-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-700">Edit Employee</h3>
                            <button onClick={() => setShowEdit(false)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">First Name *</label>
                                    <input type="text" value={editForm.data.first_name} required onChange={e => editForm.setData('first_name', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Last Name *</label>
                                    <input type="text" value={editForm.data.last_name} required onChange={e => editForm.setData('last_name', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Position *</label>
                                    <input type="text" value={editForm.data.position} required onChange={e => editForm.setData('position', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Status *</label>
                                    <select value={editForm.data.status} onChange={e => editForm.setData('status', e.target.value)} className={ic}>
                                        {['active','on_leave','terminated','resigned'].map(s => (
                                            <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Basic Salary *</label>
                                    <input type="number" min="0" value={editForm.data.basic_salary} required onChange={e => editForm.setData('basic_salary', Number(e.target.value))} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Pay Period *</label>
                                    <select value={editForm.data.pay_period} onChange={e => editForm.setData('pay_period', e.target.value)} className={ic}>
                                        {['daily','weekly','bi_monthly','monthly'].map(p => <option key={p} value={p} className="capitalize">{p.replace('_', ' ')}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Phone</label>
                                    <input type="tel" value={editForm.data.phone} onChange={e => editForm.setData('phone', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Email</label>
                                    <input type="email" value={editForm.data.email} onChange={e => editForm.setData('email', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">SSS #</label>
                                    <input type="text" value={editForm.data.sss_number} onChange={e => editForm.setData('sss_number', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">PhilHealth #</label>
                                    <input type="text" value={editForm.data.philhealth_number} onChange={e => editForm.setData('philhealth_number', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Pag-IBIG #</label>
                                    <input type="text" value={editForm.data.pagibig_number} onChange={e => editForm.setData('pagibig_number', e.target.value)} className={ic} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">TIN #</label>
                                    <input type="text" value={editForm.data.tin_number} onChange={e => editForm.setData('tin_number', e.target.value)} className={ic} />
                                </div>
                                {(editForm.data.status === 'terminated' || editForm.data.status === 'resigned') && (
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Date Terminated</label>
                                        <input type="date" value={editForm.data.date_terminated} onChange={e => editForm.setData('date_terminated', e.target.value)} className={ic} />
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Cancel</button>
                                <button type="submit" disabled={editForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                    {editForm.processing ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-4">
                    {(['overview', 'attendance', 'leaves'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-teal-600 text-white shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Overview tab */}
                {tab === 'overview' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Employment</div>
                                <dl className="space-y-2 text-sm">
                                    {[
                                        ['Employee Code', employee.employee_code],
                                        ['Position', employee.position],
                                        ['Type', employee.employment_type?.replace('_', ' ')],
                                        ['Date Hired', employee.date_hired],
                                        ['Basic Salary', fmt(employee.basic_salary)],
                                        ['Pay Period', employee.pay_period?.replace('_', ' ')],
                                        ['Bank', employee.bank_name ? `${employee.bank_name} — ${employee.bank_account}` : null],
                                    ].filter(([, v]) => v).map(([k, v]) => (
                                        <div key={k as string} className="flex gap-3">
                                            <dt className="text-slate-400 w-28 flex-shrink-0 text-xs pt-0.5 capitalize">{k}</dt>
                                            <dd className="text-slate-700 capitalize">{v as string}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Government IDs</div>
                                <dl className="space-y-2 text-sm">
                                    {[
                                        ['SSS', employee.sss_number],
                                        ['PhilHealth', employee.philhealth_number],
                                        ['Pag-IBIG', employee.pagibig_number],
                                        ['TIN', employee.tin_number],
                                    ].filter(([, v]) => v).map(([k, v]) => (
                                        <div key={k as string} className="flex gap-3">
                                            <dt className="text-slate-400 w-28 flex-shrink-0 text-xs pt-0.5">{k}</dt>
                                            <dd className="text-slate-700 font-mono text-xs">{v as string}</dd>
                                        </div>
                                    ))}
                                </dl>
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 mt-6">Contact</div>
                                <dl className="space-y-2 text-sm">
                                    {[['Phone', employee.phone], ['Email', employee.email]].filter(([, v]) => v).map(([k, v]) => (
                                        <div key={k as string} className="flex gap-3">
                                            <dt className="text-slate-400 w-28 flex-shrink-0 text-xs pt-0.5">{k}</dt>
                                            <dd className="text-slate-700">{v as string}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        </div>
                    </div>
                )}

                {/* Attendance tab */}
                {tab === 'attendance' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setShowAttend(v => !v)}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                                + Log Attendance
                            </button>
                        </div>

                        {showAttend && (
                            <div className="bg-white border border-teal-200 rounded-xl p-5 mb-4">
                                <h3 className="font-semibold text-slate-700 mb-4">Log Attendance</h3>
                                <form onSubmit={handleAttendSubmit}>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Date *</label>
                                            <input type="date" value={attendForm.data.attendance_date} required
                                                onChange={e => attendForm.setData('attendance_date', e.target.value)} className={ic} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Status *</label>
                                            <select value={attendForm.data.status} onChange={e => attendForm.setData('status', e.target.value)} className={ic}>
                                                {['present','absent','late','half_day','on_leave','holiday'].map(s => (
                                                    <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Time In</label>
                                            <input type="time" value={attendForm.data.time_in}
                                                onChange={e => attendForm.setData('time_in', e.target.value)} className={ic} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Time Out</label>
                                            <input type="time" value={attendForm.data.time_out}
                                                onChange={e => attendForm.setData('time_out', e.target.value)} className={ic} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs text-slate-500 mb-1 block">Notes</label>
                                            <input type="text" value={attendForm.data.notes}
                                                onChange={e => attendForm.setData('notes', e.target.value)} className={ic} />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <button type="button" onClick={() => setShowAttend(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Cancel</button>
                                        <button type="submit" disabled={attendForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                            {attendForm.processing ? 'Saving…' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-100">
                                <h3 className="font-semibold text-slate-700 text-sm">
                                    {new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })} — Attendance
                                </h3>
                            </div>
                            {attendance?.length === 0 ? (
                                <div className="py-10 text-center text-slate-400 text-sm">No attendance records for this month</div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            {['Date','Status','Time In','Time Out','Hours','Notes'].map(h => (
                                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {attendance?.map((a: any) => (
                                            <tr key={a.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{a.attendance_date}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${ATTEND_PILL[a.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                        {a.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 text-xs">{a.time_in || '—'}</td>
                                                <td className="px-4 py-3 text-slate-500 text-xs">{a.time_out || '—'}</td>
                                                <td className="px-4 py-3 text-slate-600 text-xs">{a.hours_worked ? `${Number(a.hours_worked).toFixed(1)}h` : '—'}</td>
                                                <td className="px-4 py-3 text-slate-400 text-xs max-w-xs truncate">{a.notes || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Leaves tab */}
                {tab === 'leaves' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setShowLeave(v => !v)}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                                + File Leave
                            </button>
                        </div>

                        {showLeave && (
                            <div className="bg-white border border-teal-200 rounded-xl p-5 mb-4">
                                <h3 className="font-semibold text-slate-700 mb-4">File Leave Request</h3>
                                <form onSubmit={handleLeaveSubmit}>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Leave Type *</label>
                                            <select value={leaveForm.data.leave_type} onChange={e => leaveForm.setData('leave_type', e.target.value)} className={ic}>
                                                {['sick','vacation','emergency','maternity','paternity','unpaid'].map(t => (
                                                    <option key={t} value={t} className="capitalize">{t}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Start Date *</label>
                                            <input type="date" value={leaveForm.data.start_date} required
                                                onChange={e => leaveForm.setData('start_date', e.target.value)} className={ic} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">End Date *</label>
                                            <input type="date" value={leaveForm.data.end_date} required
                                                onChange={e => leaveForm.setData('end_date', e.target.value)} className={ic} />
                                        </div>
                                        <div className="col-span-3">
                                            <label className="text-xs text-slate-500 mb-1 block">Reason</label>
                                            <input type="text" value={leaveForm.data.reason}
                                                onChange={e => leaveForm.setData('reason', e.target.value)} className={ic} />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <button type="button" onClick={() => setShowLeave(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Cancel</button>
                                        <button type="submit" disabled={leaveForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                            {leaveForm.processing ? 'Filing…' : 'File Leave'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-100">
                                <h3 className="font-semibold text-slate-700 text-sm">Leave History</h3>
                            </div>
                            {leaves?.length === 0 ? (
                                <div className="py-10 text-center text-slate-400 text-sm">No leave requests on file</div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            {['Type','Start','End','Days','Reason','Status',''].map(h => (
                                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {leaves?.map((l: any) => (
                                            <tr key={l.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 text-slate-700 capitalize text-xs">{l.leave_type}</td>
                                                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{l.start_date}</td>
                                                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{l.end_date}</td>
                                                <td className="px-4 py-3 text-slate-600 text-xs">{l.days_count}</td>
                                                <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">{l.reason || '—'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${LEAVE_PILL[l.status] ?? ''}`}>
                                                        {l.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {l.status === 'pending' && (
                                                        <div className="flex gap-1">
                                                            <button onClick={() => router.put(updateLeave(l.id).url, { status: 'approved' }, { preserveState: true })}
                                                                className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100">Approve</button>
                                                            <button onClick={() => router.put(updateLeave(l.id).url, { status: 'rejected' }, { preserveState: true })}
                                                                className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">Reject</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
