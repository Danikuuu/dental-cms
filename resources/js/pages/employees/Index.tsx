import {
    PlusIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { store as storeEmployee } from '@/wayfinder/actions/App/Http/Controllers/EmployeeController';

const ic =
    'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';
const fmt = (n: number) =>
    `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const STATUS_PILL: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    on_leave: 'bg-amber-100 text-amber-800',
    terminated: 'bg-red-100  text-red-600',
    resigned: 'bg-slate-100 text-slate-600',
};
const EMP_TYPE_LABEL: Record<string, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    contractual: 'Contractual',
    per_visit: 'Per Visit',
};

export default function EmployeesIndex({ employees, filters, stats }: any) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [showAdd, setShowAdd] = useState(false);

    const addForm = useForm({
        first_name: '',
        last_name: '',
        position: '',
        employment_type: 'full_time',
        date_hired: new Date().toISOString().split('T')[0],
        phone: '',
        email: '',
        address: '',
        basic_salary: 0,
        pay_period: 'monthly',
        sss_number: '',
        philhealth_number: '',
        pagibig_number: '',
        tin_number: '',
        bank_name: '',
        bank_account: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        notes: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/employees',
            { ...filters, search },
            { preserveState: true },
        );
    };

    // FIX: use Wayfinder storeEmployee action instead of hardcoded '/employees'
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.submit(storeEmployee(), {
            onSuccess: () => {
                addForm.reset();
                setShowAdd(false);
            },
        });
    };

    return (
        <AppLayout title="Employees">
            {/* Stats */}
            <div className="mb-5 grid grid-cols-3 gap-4">
                {[
                    {
                        label: 'Total Staff',
                        value: stats.total,
                        cls: 'bg-white border border-slate-200',
                    },
                    {
                        label: 'Active',
                        value: stats.active,
                        cls: 'bg-green-50 border border-green-200 text-green-800',
                    },
                    {
                        label: 'On Leave',
                        value: stats.on_leave,
                        cls: 'bg-amber-50 border border-amber-200 text-amber-800',
                    },
                ].map((s) => (
                    <div key={s.label} className={`rounded-xl p-4 ${s.cls}`}>
                        <div className="mb-1 text-xs opacity-70">{s.label}</div>
                        <div className="text-2xl font-bold">{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                    <div className="relative max-w-sm flex-1">
                        <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or position…"
                            className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                    </div>
                    <select
                        value={filters?.status ?? ''}
                        onChange={(e) =>
                            router.get(
                                '/employees',
                                { ...filters, status: e.target.value },
                                { preserveState: true },
                            )
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                        <option value="">All Statuses</option>
                        {['active', 'on_leave', 'terminated', 'resigned'].map(
                            (s) => (
                                <option
                                    key={s}
                                    value={s}
                                    className="capitalize"
                                >
                                    {s.replace('_', ' ')}
                                </option>
                            ),
                        )}
                    </select>
                </form>
                <button
                    onClick={() => setShowAdd((v) => !v)}
                    className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                    <PlusIcon className="h-4 w-4" /> Add Employee
                </button>
            </div>

            {/* Add form */}
            {showAdd && (
                <div className="mb-5 rounded-xl border border-teal-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-700">
                            New Employee
                        </h3>
                        <button onClick={() => setShowAdd(false)}>
                            <XMarkIcon className="h-5 w-5 text-slate-400" />
                        </button>
                    </div>
                    <form onSubmit={handleAddSubmit}>
                        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    value={addForm.data.first_name}
                                    required
                                    onChange={(e) =>
                                        addForm.setData(
                                            'first_name',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    value={addForm.data.last_name}
                                    required
                                    onChange={(e) =>
                                        addForm.setData(
                                            'last_name',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Position *
                                </label>
                                <input
                                    type="text"
                                    value={addForm.data.position}
                                    required
                                    onChange={(e) =>
                                        addForm.setData(
                                            'position',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                    placeholder="e.g. Dental Assistant"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Employment Type *
                                </label>
                                <select
                                    value={addForm.data.employment_type}
                                    onChange={(e) =>
                                        addForm.setData(
                                            'employment_type',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                >
                                    {Object.entries(EMP_TYPE_LABEL).map(
                                        ([v, l]) => (
                                            <option key={v} value={v}>
                                                {l}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Date Hired *
                                </label>
                                <input
                                    type="date"
                                    value={addForm.data.date_hired}
                                    required
                                    onChange={(e) =>
                                        addForm.setData(
                                            'date_hired',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={addForm.data.phone}
                                    onChange={(e) =>
                                        addForm.setData('phone', e.target.value)
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Basic Salary (₱) *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={addForm.data.basic_salary}
                                    required
                                    onChange={(e) =>
                                        addForm.setData(
                                            'basic_salary',
                                            Number(e.target.value),
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Pay Period *
                                </label>
                                <select
                                    value={addForm.data.pay_period}
                                    onChange={(e) =>
                                        addForm.setData(
                                            'pay_period',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                >
                                    {[
                                        'daily',
                                        'weekly',
                                        'bi_monthly',
                                        'monthly',
                                    ].map((p) => (
                                        <option
                                            key={p}
                                            value={p}
                                            className="capitalize"
                                        >
                                            {p.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    SSS Number
                                </label>
                                <input
                                    type="text"
                                    value={addForm.data.sss_number}
                                    onChange={(e) =>
                                        addForm.setData(
                                            'sss_number',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    PhilHealth
                                </label>
                                <input
                                    type="text"
                                    value={addForm.data.philhealth_number}
                                    onChange={(e) =>
                                        addForm.setData(
                                            'philhealth_number',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    Pag-IBIG
                                </label>
                                <input
                                    type="text"
                                    value={addForm.data.pagibig_number}
                                    onChange={(e) =>
                                        addForm.setData(
                                            'pagibig_number',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-slate-500">
                                    TIN
                                </label>
                                <input
                                    type="text"
                                    value={addForm.data.tin_number}
                                    onChange={(e) =>
                                        addForm.setData(
                                            'tin_number',
                                            e.target.value,
                                        )
                                    }
                                    className={ic}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowAdd(false)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={addForm.processing}
                                className="rounded-lg bg-teal-600 px-5 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                            >
                                {addForm.processing
                                    ? 'Adding…'
                                    : 'Add Employee'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Employees table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                {[
                                    'Employee',
                                    'Position',
                                    'Type',
                                    'Date Hired',
                                    'Salary',
                                    'Gov IDs',
                                    'Status',
                                    '',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.data?.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-12 text-center text-slate-400"
                                    >
                                        No employees found
                                    </td>
                                </tr>
                            ) : (
                                employees.data?.map((emp: any) => (
                                    <tr
                                        key={emp.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                                                    {emp.first_name?.[0]}
                                                    {emp.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-800">
                                                        {emp.last_name},{' '}
                                                        {emp.first_name}
                                                    </div>
                                                    <div className="font-mono text-xs text-slate-400">
                                                        {emp.employee_code}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {emp.position}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            {EMP_TYPE_LABEL[
                                                emp.employment_type
                                            ] ?? emp.employment_type}
                                        </td>
                                        <td className="px-4 py-3 text-xs whitespace-nowrap text-slate-500">
                                            {emp.date_hired}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800">
                                                {fmt(emp.basic_salary)}
                                            </div>
                                            <div className="text-xs text-slate-400 capitalize">
                                                {emp.pay_period.replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-0.5 text-xs text-slate-500">
                                                {emp.sss_number && (
                                                    <div>
                                                        SSS: {emp.sss_number}
                                                    </div>
                                                )}
                                                {emp.philhealth_number && (
                                                    <div>
                                                        PH:{' '}
                                                        {emp.philhealth_number}
                                                    </div>
                                                )}
                                                {emp.tin_number && (
                                                    <div>
                                                        TIN: {emp.tin_number}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_PILL[emp.status] ?? ''}`}
                                            >
                                                {emp.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/employees/${emp.id}`}
                                                className="inline-block rounded-lg p-1.5 text-slate-400 hover:bg-teal-50 hover:text-teal-600"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
