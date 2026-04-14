import { store as storeEmployee } from '@/wayfinder/actions/App/Http/Controllers/EmployeeController';
import AppLayout from '@/layouts/AppLayout';
import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ic = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';
const fmt = (n: number) => `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const STATUS_PILL: Record<string,string> = {
    active:      'bg-green-100 text-green-800',
    on_leave:    'bg-amber-100 text-amber-800',
    terminated:  'bg-red-100  text-red-600',
    resigned:    'bg-slate-100 text-slate-600',
};
const EMP_TYPE_LABEL: Record<string,string> = {
    full_time:   'Full-time',
    part_time:   'Part-time',
    contractual: 'Contractual',
    per_visit:   'Per Visit',
};

export default function EmployeesIndex({ employees, filters, stats }: any) {
    const [search,   setSearch]   = useState(filters?.search ?? '');
    const [showAdd,  setShowAdd]  = useState(false);

    const addForm = useForm({
        first_name: '', last_name: '', position: '', employment_type: 'full_time',
        date_hired: new Date().toISOString().split('T')[0], phone: '', email: '', address: '',
        basic_salary: 0, pay_period: 'monthly',
        sss_number: '', philhealth_number: '', pagibig_number: '', tin_number: '',
        bank_name: '', bank_account: '',
        emergency_contact_name: '', emergency_contact_phone: '', notes: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/employees', { ...filters, search }, { preserveState: true });
    };

    // FIX: use Wayfinder storeEmployee action instead of hardcoded '/employees'
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.submit(storeEmployee(), {
            onSuccess: () => { addForm.reset(); setShowAdd(false); },
        });
    };

    return (
        <AppLayout title="Employees">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                    { label: 'Total Staff',  value: stats.total,    cls: 'bg-white border border-slate-200' },
                    { label: 'Active',       value: stats.active,   cls: 'bg-green-50 border border-green-200 text-green-800' },
                    { label: 'On Leave',     value: stats.on_leave, cls: 'bg-amber-50 border border-amber-200 text-amber-800' },
                ].map(s => (
                    <div key={s.label} className={`rounded-xl p-4 ${s.cls}`}>
                        <div className="text-xs mb-1 opacity-70">{s.label}</div>
                        <div className="text-2xl font-bold">{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or position…"
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
                    </div>
                    <select value={filters?.status??''} onChange={e => router.get('/employees',{...filters,status:e.target.value},{preserveState:true})}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                        <option value="">All Statuses</option>
                        {['active','on_leave','terminated','resigned'].map(s=><option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>)}
                    </select>
                </form>
                <button onClick={() => setShowAdd(v=>!v)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                    <PlusIcon className="w-4 h-4"/> Add Employee
                </button>
            </div>

            {/* Add form */}
            {showAdd && (
                <div className="bg-white border border-teal-200 rounded-xl p-5 mb-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-700">New Employee</h3>
                        <button onClick={() => setShowAdd(false)}><XMarkIcon className="w-5 h-5 text-slate-400"/></button>
                    </div>
                    <form onSubmit={handleAddSubmit}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">First Name *</label>
                                <input type="text" value={addForm.data.first_name} required onChange={e => addForm.setData('first_name', e.target.value)} className={ic}/>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Last Name *</label>
                                <input type="text" value={addForm.data.last_name} required onChange={e => addForm.setData('last_name', e.target.value)} className={ic}/>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Position *</label>
                                <input type="text" value={addForm.data.position} required onChange={e => addForm.setData('position', e.target.value)} className={ic} placeholder="e.g. Dental Assistant"/>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Employment Type *</label>
                                <select value={addForm.data.employment_type} onChange={e => addForm.setData('employment_type', e.target.value)} className={ic}>
                                    {Object.entries(EMP_TYPE_LABEL).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Date Hired *</label>
                                <input type="date" value={addForm.data.date_hired} required onChange={e => addForm.setData('date_hired', e.target.value)} className={ic}/>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Phone</label>
                                <input type="tel" value={addForm.data.phone} onChange={e => addForm.setData('phone', e.target.value)} className={ic}/>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Basic Salary (₱) *</label>
                                <input type="number" min="0" value={addForm.data.basic_salary} required onChange={e => addForm.setData('basic_salary', Number(e.target.value))} className={ic}/>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Pay Period *</label>
                                <select value={addForm.data.pay_period} onChange={e => addForm.setData('pay_period', e.target.value)} className={ic}>
                                    {['daily','weekly','bi_monthly','monthly'].map(p=><option key={p} value={p} className="capitalize">{p.replace('_',' ')}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">SSS Number</label>
                                <input type="text" value={addForm.data.sss_number} onChange={e => addForm.setData('sss_number', e.target.value)} className={ic}/>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">PhilHealth</label>
                                <input type="text" value={addForm.data.philhealth_number} onChange={e => addForm.setData('philhealth_number', e.target.value)} className={ic}/>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Pag-IBIG</label>
                                <input type="text" value={addForm.data.pagibig_number} onChange={e => addForm.setData('pagibig_number', e.target.value)} className={ic}/>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">TIN</label>
                                <input type="text" value={addForm.data.tin_number} onChange={e => addForm.setData('tin_number', e.target.value)} className={ic}/>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Cancel</button>
                            <button type="submit" disabled={addForm.processing} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                                {addForm.processing?'Adding…':'Add Employee'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Employees table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                {['Employee','Position','Type','Date Hired','Salary','Gov IDs','Status',''].map(h=>(
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.data?.length===0 ? (
                                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">No employees found</td></tr>
                            ) : employees.data?.map((emp: any)=>(
                                <tr key={emp.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold flex-shrink-0">
                                                {emp.first_name?.[0]}{emp.last_name?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-800">{emp.last_name}, {emp.first_name}</div>
                                                <div className="text-xs text-slate-400 font-mono">{emp.employee_code}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 text-sm">{emp.position}</td>
                                    <td className="px-4 py-3 text-slate-500 text-xs">{EMP_TYPE_LABEL[emp.employment_type]??emp.employment_type}</td>
                                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{emp.date_hired}</td>
                                    <td className="px-4 py-3">
                                        <div className="text-slate-800 font-medium">{fmt(emp.basic_salary)}</div>
                                        <div className="text-xs text-slate-400 capitalize">{emp.pay_period.replace('_',' ')}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-xs text-slate-500 space-y-0.5">
                                            {emp.sss_number && <div>SSS: {emp.sss_number}</div>}
                                            {emp.philhealth_number && <div>PH: {emp.philhealth_number}</div>}
                                            {emp.tin_number && <div>TIN: {emp.tin_number}</div>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${STATUS_PILL[emp.status]??''}`}>
                                            {emp.status.replace('_',' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={`/employees/${emp.id}`} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg inline-block">
                                            <EyeIcon className="w-4 h-4"/>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
